from __future__ import annotations

from fastapi import APIRouter, Depends

from app.db.supabase import create_supabase_client
from app.services.mna_document_service import (
    MnaDocumentService,
    MnaRoadmapPhase,
    SupabaseMnaDocumentRepository,
)


router = APIRouter(prefix="/mna-documents", tags=["mna-documents"])
_supabase_client = create_supabase_client()
_repository = (
    SupabaseMnaDocumentRepository(_supabase_client) if _supabase_client else None
)


def get_mna_document_service() -> MnaDocumentService:
    return MnaDocumentService(repository=_repository)


@router.get("", response_model=list[MnaRoadmapPhase])
async def list_mna_documents(
    service: MnaDocumentService = Depends(get_mna_document_service),
) -> list[MnaRoadmapPhase]:
    return await service.list_phases()
