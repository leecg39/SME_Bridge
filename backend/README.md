# 승계브릿지 Backend

FastAPI backend for the 승계브릿지 MVP. The consultation service stores requests and can hand them off to Patasos/Paperclip as issues.

## Run

```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

## Supabase Database

The M&A document library uses Supabase when these values are present. Without
them, the API serves bundled fallback templates.

```bash
SUPABASE_URL=https://xldqjgamukgjurutgxwj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

Implemented endpoints:

- `GET /api/v1/mna-documents` returns the 5 M&A roadmap phases and the
  downloadable document templates needed for each phase.
- `POST /api/v1/consultations` accepts consultation requests and can hand them
  off to Patasos when configured.

## Patasos Environment

```bash
PATASOS_BASE_URL=https://paperclip-829m.srv1607352.hstgr.cloud
PATASOS_COMPANY_ID=...
PATASOS_TRIAGE_AGENT_ID=...
PATASOS_SERVICE_EMAIL=...
PATASOS_SERVICE_PASSWORD=...
```

When these values are missing, consultation requests are still accepted and marked `not_requested` for Patasos sync.
