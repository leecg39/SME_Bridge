import asyncio
import json
from collections import Counter

import httpx
import pytest

from app.integrations.patasos import PatasosClient, PatasosSettings
from app.services.consultation_service import (
    ConsentRequiredError,
    ConsultationCreate,
    ConsultationService,
    InMemoryConsultationRepository,
)


def run(coro):
    return asyncio.run(coro)


def consultation_payload(**overrides):
    payload = {
        "company_id": "company-1",
        "company_name": "동양정밀",
        "requester_name": "김영호",
        "requester_phone": "010-1234-5678",
        "requester_email": "ceo@example.com",
        "consultation_type": "tax",
        "title": "양도세 전략 상담",
        "description": "매각 전에 세금 구조를 검토하고 싶습니다.",
        "privacy_consent": True,
        "external_transfer_consent": True,
        "share_sensitive_files": False,
        "snapshot_json": {
            "valuation": {
                "range_low": 3500000000,
                "range_high": 5200000000,
                "source_file_url": "https://storage.example.com/private/statement.pdf",
            },
            "tax": {"best_scenario": "gift_special", "saving_amount": 420000000},
            "raw_financial_statements": [
                {"year": 2024, "file_url": "https://signed.example.com/raw.pdf"}
            ],
        },
    }
    payload.update(overrides)
    return ConsultationCreate(**payload)


def patasos_settings():
    return PatasosSettings(
        base_url="https://paperclip.test",
        company_id="patasos-company",
        triage_agent_id="agent-tax",
        service_email="service@example.com",
        service_password="secret",
    )


def test_consultation_requires_privacy_and_external_transfer_consent():
    service = ConsultationService(
        repository=InMemoryConsultationRepository(),
        patasos_client=None,
    )

    with pytest.raises(ConsentRequiredError):
        run(
            service.create_consultation(
                consultation_payload(privacy_consent=False),
                sync_to_patasos=False,
            )
        )

    with pytest.raises(ConsentRequiredError):
        run(
            service.create_consultation(
                consultation_payload(external_transfer_consent=False),
                sync_to_patasos=False,
            )
        )


def test_consultation_snapshot_removes_sensitive_file_fields():
    service = ConsultationService(
        repository=InMemoryConsultationRepository(),
        patasos_client=None,
    )

    consultation = run(
        service.create_consultation(
            consultation_payload(),
            sync_to_patasos=False,
        )
    )

    snapshot_text = json.dumps(consultation.snapshot_json, ensure_ascii=False)
    assert "source_file_url" not in snapshot_text
    assert "file_url" not in snapshot_text
    assert "signed.example.com" not in snapshot_text
    assert "raw_financial_statements" not in snapshot_text
    assert consultation.snapshot_json["valuation"]["range_low"] == 3500000000


def test_patasos_client_reauthenticates_once_after_unauthorized_issue_create():
    calls = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append((request.method, request.url.path))
        if request.url.path == "/api/auth/sign-in/email":
            return httpx.Response(200, json={"ok": True})
        if request.url.path == "/api/companies/patasos-company/issues":
            issue_attempts = sum(path.endswith("/issues") for _, path in calls)
            if issue_attempts == 1:
                return httpx.Response(401, json={"error": "Unauthorized"})
            return httpx.Response(
                200,
                json={
                    "id": "issue-1",
                    "identifier": "PAT-123",
                    "title": "created",
                },
            )
        return httpx.Response(404, json={"error": "not found"})

    client = PatasosClient(
        settings=patasos_settings(),
        transport=httpx.MockTransport(handler),
    )

    issue = run(
        client.create_issue(
            title="[승계브릿지 상담] 동양정밀 - 세무",
            description="요약",
            idempotency_key="consultation-1",
        )
    )

    assert issue.issue_id == "issue-1"
    assert Counter(path for _, path in calls)["/api/auth/sign-in/email"] == 2
    assert Counter(path for _, path in calls)["/api/companies/patasos-company/issues"] == 2


def test_patasos_failure_keeps_consultation_and_marks_sync_failed():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == "/api/auth/sign-in/email":
            return httpx.Response(200, json={"ok": True})
        return httpx.Response(500, json={"error": "paperclip down"})

    repository = InMemoryConsultationRepository()
    service = ConsultationService(
        repository=repository,
        patasos_client=PatasosClient(
            settings=patasos_settings(),
            transport=httpx.MockTransport(handler),
        ),
    )

    consultation = run(
        service.create_consultation(
            consultation_payload(),
            sync_to_patasos=False,
        )
    )
    synced = run(service.sync_to_patasos(consultation.id))

    assert synced.id == consultation.id
    assert synced.patasos_sync_status == "failed"
    assert "paperclip down" in (synced.patasos_sync_error or "")


def test_patasos_retry_is_idempotent_after_successful_issue_creation():
    issue_posts = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal issue_posts
        if request.url.path == "/api/auth/sign-in/email":
            return httpx.Response(200, json={"ok": True})
        if request.url.path == "/api/companies/patasos-company/issues":
            issue_posts += 1
            assert request.headers["Idempotency-Key"].startswith("consultation:")
            return httpx.Response(
                200,
                json={
                    "id": "issue-stable",
                    "identifier": "PAT-555",
                    "title": "created",
                },
            )
        return httpx.Response(404)

    repository = InMemoryConsultationRepository()
    service = ConsultationService(
        repository=repository,
        patasos_client=PatasosClient(
            settings=patasos_settings(),
            transport=httpx.MockTransport(handler),
        ),
    )

    consultation = run(
        service.create_consultation(
            consultation_payload(),
            sync_to_patasos=False,
        )
    )
    first = run(service.sync_to_patasos(consultation.id))
    second = run(service.sync_to_patasos(consultation.id))

    assert first.patasos_issue_id == "issue-stable"
    assert second.patasos_issue_id == "issue-stable"
    assert issue_posts == 1
