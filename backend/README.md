# 승계브릿지 Backend

FastAPI backend for the 승계브릿지 MVP. The consultation service stores requests and can hand them off to Patasos/Paperclip as issues.

## Run

```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

## Patasos Environment

```bash
PATASOS_BASE_URL=https://paperclip-829m.srv1607352.hstgr.cloud
PATASOS_COMPANY_ID=...
PATASOS_TRIAGE_AGENT_ID=...
PATASOS_SERVICE_EMAIL=...
PATASOS_SERVICE_PASSWORD=...
```

When these values are missing, consultation requests are still accepted and marked `not_requested` for Patasos sync.
