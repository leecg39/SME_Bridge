# 승계브릿지 — Harness Surgical Scope Spec

## Mode
**surgical-1round**: Build-Eval 1회전. 기존 코드 최대한 보존, 4개 핵심 플로우만 동작 검증/보강.

## Context
- 프로젝트: 승계브릿지 (기업승계형 M&A 플랫폼, 60대+ CEO 타겟)
- 스택: Next.js 16 (App Router, Turbopack) + FastAPI + Supabase
- dev 서버: http://localhost:3000 (3000 포트 — 기본 5173 아님)
- ChatMock LLM 프록시: http://127.0.0.1:8000 (반드시 살아있어야 Vision 경로 작동)

## Recent Critical Fix
직전 커밋 `d8c8d4d` — Vision LLM 연도-데이터 매핑 버그 수정.
Builder는 이 커밋의 로직을 **건드리면 안 됨**. 특히:
- `frontend/src/app/api/v1/financial-statements/analyze/route.ts` 의 `alignRawColumnsToDetectedYears`
- `extractYears`, `extractColumnOrderedYears`
- `parseFinancialText` 의 dedup 로직
- `next.config.ts` 의 `serverExternalPackages`
- `frontend/src/stores/valuation.ts` 의 v6 store

## Core Flows to Verify
1. **Auth**: 회원가입 → 로그인 → 대시보드
2. **Valuation** (최우선): PDF 업로드 → AI 추출 → 연도-데이터 매핑 정확 → EBITDA → 예상가치
3. **Tax**: 양도세/상속/증여 시나리오 계산
4. **Roadmap**: 단계별 체크리스트 + 템플릿 다운로드

## Builder 책임
1. `npm run build` / `npm run type-check` / `npm run lint` 전부 통과
2. `npx vitest run src/__tests__/app/api/financial-statements-analyze-route.test.ts` 6/6 통과 확인
3. 4개 플로우 각각의 라우트 파일 존재 + 서버 렌더 확인 (curl 또는 dev 서버 로그)
4. 발견된 BLOCKING 이슈만 최소 수정. 발견되지 않은 기존 코드 변경 금지.
5. 작업 완료 후 `docs/harness/builder-report.md` 작성

## Evaluator 책임
1. Playwright MCP로 `http://localhost:3000` 접속
2. rubric.json 의 각 체크리스트 항목을 실제 클릭 테스트로 검증
3. 각 기준별 1-10점 채점 + 증거 스크린샷
4. 특히 **Data Accuracy 기준**: valuation 플로우의 연도-데이터 매핑을 실제 PDF 업로드로 확인
5. 작업 완료 후 `docs/harness/eval-report.md` 작성

## Pass 조건
- 모든 criteria ≥ threshold
- Data Accuracy 기준 ≥ 9 (이게 메인 포커스)
- Regression Safety 기준 ≥ 9
