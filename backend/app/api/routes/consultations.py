from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.integrations.patasos import PatasosClient, PatasosSettings
from app.services.consultation_service import (
    ConsentRequiredError,
    ConsultationCreate,
    ConsultationNotFoundError,
    ConsultationRecord,
    ConsultationService,
    InMemoryConsultationRepository,
)


router = APIRouter(prefix="/consultations", tags=["consultations"])
_repository = InMemoryConsultationRepository()
_patasos_settings = PatasosSettings.from_env()
_patasos_client = PatasosClient(_patasos_settings) if _patasos_settings else None


def get_consultation_service() -> ConsultationService:
    return ConsultationService(
        repository=_repository,
        patasos_client=_patasos_client,
    )


@router.post("", response_model=ConsultationRecord, status_code=201)
async def create_consultation(
    payload: ConsultationCreate,
    background_tasks: BackgroundTasks,
    service: ConsultationService = Depends(get_consultation_service),
) -> ConsultationRecord:
    try:
        record = await service.create_consultation(payload, sync_to_patasos=False)
    except ConsentRequiredError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if record.patasos_sync_status == "pending":
        background_tasks.add_task(service.sync_to_patasos, record.id)
    return record


@router.get("", response_model=list[ConsultationRecord])
async def list_consultations(
    service: ConsultationService = Depends(get_consultation_service),
) -> list[ConsultationRecord]:
    return await service.repository.list()


@router.get("/{consultation_id}", response_model=ConsultationRecord)
async def get_consultation(
    consultation_id: str,
    service: ConsultationService = Depends(get_consultation_service),
) -> ConsultationRecord:
    try:
        return await service.repository.get(consultation_id)
    except ConsultationNotFoundError as exc:
        raise HTTPException(status_code=404, detail="상담 요청을 찾을 수 없습니다.") from exc


@router.post("/{consultation_id}/retry-patasos", response_model=ConsultationRecord)
async def retry_patasos(
    consultation_id: str,
    service: ConsultationService = Depends(get_consultation_service),
) -> ConsultationRecord:
    try:
        return await service.sync_to_patasos(consultation_id)
    except ConsultationNotFoundError as exc:
        raise HTTPException(status_code=404, detail="상담 요청을 찾을 수 없습니다.") from exc
