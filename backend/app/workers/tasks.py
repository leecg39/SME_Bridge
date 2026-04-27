from __future__ import annotations

from app.workers.celery_app import celery_app


@celery_app.task(name="consultations.sync_to_patasos")
def sync_consultation_to_patasos(consultation_id: str) -> str:
    # FastAPI BackgroundTasks handle MVP dispatch. This task reserves the
    # production Celery contract for Redis-backed async delivery.
    return consultation_id
