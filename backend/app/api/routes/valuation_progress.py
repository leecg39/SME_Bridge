from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter(prefix="/valuation-progress", tags=["valuation-progress"])
_stored_result: dict[str, Any] | None = None


class ValuationProgressPayload(BaseModel):
    result: dict[str, Any] | None = Field(default=None)


@router.get("", response_model=ValuationProgressPayload)
async def get_valuation_progress() -> ValuationProgressPayload:
    return ValuationProgressPayload(result=_stored_result)


@router.put("", response_model=ValuationProgressPayload)
async def save_valuation_progress(
    payload: ValuationProgressPayload,
) -> ValuationProgressPayload:
    global _stored_result
    _stored_result = payload.result
    return ValuationProgressPayload(result=_stored_result)
