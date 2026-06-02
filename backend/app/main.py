from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.consultations import router as consultations_router
from app.api.routes.mna_documents import router as mna_documents_router
from app.api.routes.valuation_progress import router as valuation_progress_router


app = FastAPI(title="승계브릿지 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consultations_router, prefix="/api/v1")
app.include_router(mna_documents_router, prefix="/api/v1")
app.include_router(valuation_progress_router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
