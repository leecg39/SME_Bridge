from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
from uuid import uuid4

from pydantic import BaseModel, EmailStr, Field

from app.integrations.patasos import PatasosClient, PatasosError


ConsultationType = Literal["tax", "legal", "valuation", "mna", "general"]
SyncStatus = Literal["not_requested", "pending", "sent", "failed"]


class ConsentRequiredError(ValueError):
    pass


class ConsultationNotFoundError(KeyError):
    pass


class ConsultationCreate(BaseModel):
    company_id: str = Field(min_length=1)
    company_name: str = Field(min_length=1)
    requester_name: str = Field(min_length=1)
    requester_phone: str = Field(min_length=7)
    requester_email: EmailStr
    consultation_type: ConsultationType
    title: str = Field(min_length=1)
    description: str = Field(min_length=10)
    privacy_consent: bool
    external_transfer_consent: bool
    share_sensitive_files: bool = False
    snapshot_json: Dict[str, Any] = Field(default_factory=dict)


class ConsultationRecord(BaseModel):
    id: str
    company_id: str
    company_name: str
    requester_name: str
    requester_phone: str
    requester_email: EmailStr
    consultation_type: ConsultationType
    title: str
    description: str
    status: str = "pending"
    privacy_consent: bool
    external_transfer_consent: bool
    share_sensitive_files: bool
    sensitive_files_consented_at: Optional[datetime]
    snapshot_json: Dict[str, Any]
    patasos_sync_status: SyncStatus
    patasos_issue_id: Optional[str] = None
    patasos_issue_identifier: Optional[str] = None
    patasos_issue_url: Optional[str] = None
    patasos_synced_at: Optional[datetime] = None
    patasos_sync_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class InMemoryConsultationRepository:
    def __init__(self) -> None:
        self._items: Dict[str, ConsultationRecord] = {}

    async def add(self, record: ConsultationRecord) -> ConsultationRecord:
        self._items[record.id] = record
        return record

    async def get(self, consultation_id: str) -> ConsultationRecord:
        try:
            return self._items[consultation_id]
        except KeyError as exc:
            raise ConsultationNotFoundError(consultation_id) from exc

    async def list(self) -> List[ConsultationRecord]:
        return sorted(self._items.values(), key=lambda item: item.created_at, reverse=True)

    async def update(
        self,
        consultation_id: str,
        **changes: Any,
    ) -> ConsultationRecord:
        existing = await self.get(consultation_id)
        updated = existing.model_copy(
            update={
                **changes,
                "updated_at": datetime.now(timezone.utc),
            }
        )
        self._items[consultation_id] = updated
        return updated


class ConsultationService:
    _SENSITIVE_KEYS = {
        "file_url",
        "fileUrl",
        "source_file_url",
        "sourceFileUrl",
        "signed_url",
        "signedUrl",
        "raw_financial_statements",
        "rawFinancialStatements",
        "attachments",
        "documents",
    }

    _TYPE_LABELS = {
        "tax": "세무",
        "legal": "법률",
        "valuation": "가치평가",
        "mna": "M&A 자문",
        "general": "종합",
    }

    def __init__(
        self,
        *,
        repository: InMemoryConsultationRepository,
        patasos_client: Optional[PatasosClient],
    ) -> None:
        self.repository = repository
        self.patasos_client = patasos_client

    async def create_consultation(
        self,
        payload: ConsultationCreate,
        *,
        sync_to_patasos: bool = True,
    ) -> ConsultationRecord:
        if not payload.privacy_consent:
            raise ConsentRequiredError("개인정보 수집 및 이용 동의가 필요합니다.")
        if not payload.external_transfer_consent:
            raise ConsentRequiredError("Patasos 외부 전달 동의가 필요합니다.")

        now = datetime.now(timezone.utc)
        record = ConsultationRecord(
            id=str(uuid4()),
            company_id=payload.company_id,
            company_name=payload.company_name,
            requester_name=payload.requester_name,
            requester_phone=payload.requester_phone,
            requester_email=payload.requester_email,
            consultation_type=payload.consultation_type,
            title=payload.title,
            description=payload.description,
            status="pending",
            privacy_consent=payload.privacy_consent,
            external_transfer_consent=payload.external_transfer_consent,
            share_sensitive_files=payload.share_sensitive_files,
            sensitive_files_consented_at=now if payload.share_sensitive_files else None,
            snapshot_json=self._sanitize_snapshot(payload.snapshot_json),
            patasos_sync_status="pending" if self.patasos_client else "not_requested",
            created_at=now,
            updated_at=now,
        )
        await self.repository.add(record)
        if sync_to_patasos and self.patasos_client:
            return await self.sync_to_patasos(record.id)
        return record

    async def sync_to_patasos(self, consultation_id: str) -> ConsultationRecord:
        record = await self.repository.get(consultation_id)
        if record.patasos_sync_status == "sent" and record.patasos_issue_id:
            return record
        if not self.patasos_client:
            return await self.repository.update(
                consultation_id,
                patasos_sync_status="not_requested",
                patasos_sync_error="Patasos environment is not configured.",
            )

        await self.repository.update(
            consultation_id,
            patasos_sync_status="pending",
            patasos_sync_error=None,
        )

        try:
            issue = await self.patasos_client.create_issue(
                title=self._issue_title(record),
                description=self._issue_description(record),
                idempotency_key=f"consultation:{record.id}",
            )
        except PatasosError as exc:
            return await self.repository.update(
                consultation_id,
                patasos_sync_status="failed",
                patasos_sync_error=str(exc),
            )

        return await self.repository.update(
            consultation_id,
            patasos_sync_status="sent",
            patasos_issue_id=issue.issue_id,
            patasos_issue_identifier=issue.identifier,
            patasos_issue_url=issue.url,
            patasos_synced_at=datetime.now(timezone.utc),
            patasos_sync_error=None,
        )

    def _issue_title(self, record: ConsultationRecord) -> str:
        type_label = self._TYPE_LABELS[record.consultation_type]
        return f"[승계브릿지 상담] {record.company_name} - {type_label}"

    def _issue_description(self, record: ConsultationRecord) -> str:
        type_label = self._TYPE_LABELS[record.consultation_type]
        snapshot = json.dumps(record.snapshot_json, ensure_ascii=False, indent=2)
        return "\n".join(
            [
                "## 상담 요청",
                f"- 내부 요청 ID: {record.id}",
                f"- 상담 유형: {type_label}",
                f"- 기업명: {record.company_name}",
                f"- 요청자: {record.requester_name}",
                f"- 연락처: {record.requester_phone}",
                f"- 이메일: {record.requester_email}",
                f"- 민감 파일 공유 동의: {'예' if record.share_sensitive_files else '아니오'}",
                "",
                "## 문의 내용",
                record.description,
                "",
                "## 승계브릿지 진행상황 요약",
                snapshot,
                "",
                "> 재무제표 원본 파일과 서명 URL은 자동 전달하지 않았습니다.",
            ]
        )

    def _sanitize_snapshot(self, value: Any) -> Any:
        if isinstance(value, dict):
            sanitized: Dict[str, Any] = {}
            for key, nested in value.items():
                if key in self._SENSITIVE_KEYS or "url" in key.lower():
                    continue
                sanitized[key] = self._sanitize_snapshot(nested)
            return sanitized
        if isinstance(value, list):
            return [self._sanitize_snapshot(item) for item in value]
        return value
