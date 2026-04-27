# 승계브릿지

중소기업 기업승계형 M&A MVP입니다. 핵심 흐름은 기업가치 산정, 세금 시뮬레이션, 매각 로드맵, 전문가 상담 요청이며 상담 요청은 Patasos/Paperclip 이슈로 전달할 수 있습니다.

## Structure

- `frontend/` - Next.js App Router UI
- `backend/` - FastAPI API and Patasos handoff service
- `supabase/` - PostgreSQL schema and RLS migration
- `planning/` - PRD/TRD/user flow/design/task docs

## Local Run

Backend:

```bash
cd backend
uvicorn app.main:app --reload --port 8001
```

Frontend:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001 npm run dev
```

Open `http://localhost:3000`.

## Patasos Handoff

Set these in the backend environment to create issues in Patasos:

```bash
PATASOS_BASE_URL=https://paperclip-829m.srv1607352.hstgr.cloud
PATASOS_COMPANY_ID=
PATASOS_TRIAGE_AGENT_ID=
PATASOS_SERVICE_EMAIL=
PATASOS_SERVICE_PASSWORD=
```

When credentials are not configured, consultations are accepted locally and marked `not_requested`.
