# 02. 기술 요구사항 정의서 (Technical Requirements Document)

**프로젝트명:** 승계브릿지 - 기업승계형 M&A 플랫폼
**문서 버전:** v1.0
**작성일:** 2026-03-26
**상태:** Draft

---

## 목차

1. [문서 개요](#1-문서-개요)
2. [권장 기술 스택](#2-권장-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [핵심 기능 기술 명세](#4-핵심-기능-기술-명세)
5. [API 설계 개요](#5-api-설계-개요)
6. [데이터 모델 개요](#6-데이터-모델-개요)
7. [보안 요구사항](#7-보안-요구사항)
8. [배포 전략](#8-배포-전략)
9. [성능 요구사항](#9-성능-요구사항)
10. [개발 단계 계획](#10-개발-단계-계획)

---

## 1. 문서 개요

### 1.1 목적

본 문서는 "승계브릿지" 플랫폼의 기술적 요구사항을 정의한다. 기업승계형 M&A를 준비하는 중소/중견기업 CEO(40~60대)를 대상으로, 재무제표 분석부터 기업가치 산정, 세금 시뮬레이션, 단계별 로드맵 관리까지 M&A 프로세스 전반을 지원하는 웹 애플리케이션의 설계 및 구현 방향을 제시한다.

### 1.2 대상 독자

- 프론트엔드/백엔드 개발자
- DevOps 엔지니어
- 프로젝트 매니저
- QA 엔지니어

### 1.3 용어 정의

| 용어 | 설명 |
|------|------|
| EBITDA | Earnings Before Interest, Taxes, Depreciation and Amortization (이자/세금/감가상각 전 영업이익) |
| 정상화 EBITDA | 사적 비용, 가족 급여 등 비정상적 지출을 제거한 조정 EBITDA |
| 멀티플 | 기업가치 산정 시 사용하는 배수 (예: EV/EBITDA = 8x) |
| PMI | Post-Merger Integration, 인수 후 통합 |
| RLS | Row Level Security, Supabase의 행 단위 접근 제어 |

### 1.4 참조 문서

| 문서 | 경로 |
|------|------|
| NotebookLM 분석 노트 | `notebooklm-note-m-a-2026-03-25.md` |
| M&A 워크플로우 설계 | `가업승계 M&A 워크플로우 설계.md` |

---

## 2. 권장 기술 스택

### 2.1 기술 스택 총괄표

| 계층 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **Frontend** | Next.js | 15.x | SSR/SSG, SEO 최적화, App Router |
| | TypeScript | 5.x | 타입 안전성 |
| | Tailwind CSS | 4.x | 유틸리티 기반 스타일링 |
| | shadcn/ui | latest | 접근성 보장 UI 컴포넌트 |
| | Zustand | 5.x | 클라이언트 상태 관리 |
| | TanStack Query | 5.x | 서버 상태 관리 및 캐싱 |
| | React Hook Form + Zod | latest | 폼 관리 및 스키마 검증 |
| | Recharts | 2.x | 재무 데이터 시각화 차트 |
| **Backend** | Python | 3.14+ | 서버 사이드 언어 |
| | FastAPI | 0.115+ | REST API 프레임워크 |
| | Pydantic | 2.x | 요청/응답 검증 및 직렬화 |
| | SQLAlchemy | 2.0+ | 비동기 ORM |
| | Alembic | 1.x | 데이터베이스 마이그레이션 |
| | asyncpg | 0.30+ | PostgreSQL 비동기 드라이버 |
| | Celery + Redis | 5.x | 비동기 작업 큐 (PDF 파싱 등) |
| **Database** | Supabase (PostgreSQL) | 15+ | 관계형 데이터베이스 |
| | Supabase Auth | - | 사용자 인증/인가 |
| | Supabase Storage | - | 파일 저장소 (재무제표 PDF/Excel) |
| | Supabase Realtime | - | 실시간 알림 (칸반보드 업데이트) |
| **AI/ML** | OpenAI GPT-4o | latest | 재무제표 텍스트 추출 및 구조화 |
| | Anthropic Claude | latest | 복잡한 재무 분석 보조 |
| | Tesseract OCR | 5.x | 스캔 PDF OCR 처리 (fallback) |
| | pdfplumber / openpyxl | latest | PDF/Excel 파싱 라이브러리 |
| **Infra** | Vercel | - | 프론트엔드 배포 (Edge Network) |
| | Google Cloud Run | - | 백엔드 컨테이너 배포 |
| | Docker | latest | 컨테이너화 |
| | GitHub Actions | - | CI/CD 파이프라인 |
| **Monitoring** | Sentry | latest | 에러 추적 |
| | Posthog | latest | 사용자 행동 분석 |

### 2.2 Decision Log (기술 선정 근거)

#### DL-001: Frontend - Next.js 선정

| 항목 | 내용 |
|------|------|
| **결정** | Next.js 15 (App Router) |
| **대안** | Nuxt.js, Remix, SvelteKit |
| **근거** | (1) SSR/SSG로 SEO 최적화 필수 - 타겟 사용자(CEO)가 검색으로 유입될 가능성 높음 (2) React 생태계의 풍부한 차트/폼 라이브러리 활용 (3) Vercel 배포와 최적 통합 (4) Server Components로 초기 로딩 성능 향상 |
| **리스크** | App Router의 러닝커브, 복잡한 캐싱 전략 필요 |

#### DL-002: Backend - FastAPI 선정

| 항목 | 내용 |
|------|------|
| **결정** | FastAPI (Python 3.14+) |
| **대안** | Django REST Framework, NestJS, Go Fiber |
| **근거** | (1) Python의 AI/ML 라이브러리 생태계 직접 활용 (pandas, numpy 등 재무 계산) (2) 자동 OpenAPI 문서 생성으로 프론트엔드 협업 효율화 (3) async/await 네이티브 지원으로 I/O 바운드 작업(OCR, 외부 API) 성능 확보 (4) Pydantic v2로 요청/응답 검증 자동화 |
| **리스크** | Python GIL로 인한 CPU 바운드 작업 한계 - Celery로 분산 처리 |

#### DL-003: Database - Supabase 선정

| 항목 | 내용 |
|------|------|
| **결정** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **대안** | AWS RDS + Cognito + S3, Firebase, PlanetScale |
| **근거** | (1) PostgreSQL 기반으로 복잡한 재무 쿼리 및 JSON 연산 지원 (2) Auth/Storage/Realtime 통합으로 초기 개발 속도 극대화 (3) RLS(Row Level Security)로 멀티테넌트 데이터 격리 (4) 셀프호스팅 가능하여 향후 규제 대응(데이터 주권) 유연 (5) 합리적인 가격 정책 (스타트업 단계 적합) |
| **리스크** | Supabase 의존도 - 추상화 계층으로 마이그레이션 용이성 확보 |

#### DL-004: AI 파이프라인 - 멀티모델 전략

| 항목 | 내용 |
|------|------|
| **결정** | OpenAI GPT-4o (주) + Tesseract OCR (보조) |
| **대안** | Google Document AI, AWS Textract, 자체 모델 |
| **근거** | (1) GPT-4o Vision으로 PDF 이미지에서 직접 재무 수치 추출 가능 (2) 구조화된 JSON 출력으로 후처리 최소화 (3) Tesseract는 오프라인 fallback 및 비용 절감 용도 (4) 한국어 재무제표 특화 프롬프트로 정확도 향상 |
| **리스크** | API 비용 증가 - 캐싱/배치 처리로 최적화, 환각(hallucination) 방지를 위한 검증 레이어 필수 |

#### DL-005: 배포 - Vercel + Cloud Run

| 항목 | 내용 |
|------|------|
| **결정** | Frontend: Vercel / Backend: Google Cloud Run |
| **대안** | Railway, Fly.io, AWS ECS |
| **근거** | (1) Vercel은 Next.js 최적 배포 환경 (Edge Functions, ISR 지원) (2) Cloud Run은 컨테이너 기반 오토스케일링으로 비용 효율적 (요청 시에만 과금) (3) 한국 리전(asia-northeast3) 지원으로 저지연 (4) Cloud Run의 최대 실행 시간 60분으로 장시간 PDF 처리 대응 |
| **리스크** | Cold start 지연 - min-instances=1 설정으로 완화 |

---

## 3. 시스템 아키텍처

### 3.1 전체 아키텍처 다이어그램

```
+------------------------------------------------------------------+
|                        Client (Browser)                           |
|                   Next.js 15 (App Router)                         |
|  +------------------+  +------------------+  +-----------------+  |
|  | SSR Pages        |  | Client Components|  | Service Worker  |  |
|  | (SEO 최적화)      |  | (인터랙션)        |  | (오프라인 캐시) |  |
|  +------------------+  +------------------+  +-----------------+  |
+-------------------------------+----------------------------------+
                                |
                          HTTPS / REST API
                                |
+-------------------------------v----------------------------------+
|                     Vercel Edge Network                           |
|              (CDN, Edge Middleware, Rate Limiting)                |
+-------------------------------+----------------------------------+
                                |
                    API Gateway (인증 토큰 검증)
                                |
+-------------------------------v----------------------------------+
|                    FastAPI Application                            |
|                   (Google Cloud Run)                              |
|                                                                   |
|  +-------------+  +-------------+  +-------------+               |
|  | Auth        |  | Valuation   |  | Tax         |               |
|  | Module      |  | Engine      |  | Simulator   |               |
|  +-------------+  +-------------+  +-------------+               |
|  +-------------+  +-------------+  +-------------+               |
|  | Financial   |  | Roadmap     |  | Expert      |               |
|  | Parser      |  | Manager     |  | Consultation|               |
|  +-------------+  +-------------+  +-------------+               |
|                                                                   |
|  +-----------------------------------------------------------+   |
|  |          Background Worker (Celery + Redis)                |   |
|  |   PDF 파싱 / OCR 처리 / AI 추출 / 이메일 발송              |   |
|  +-----------------------------------------------------------+   |
+------+------------+------------+------------+---------+----------+
       |            |            |            |         |
       v            v            v            v         v
+----------+  +-----------+  +--------+  +-------+  +--------+
| Supabase |  | Supabase  |  |Supabase|  | Redis |  | OpenAI |
| PostgreSQL|  | Auth      |  |Storage |  | Cache |  | API    |
| (데이터)  |  | (인증)     |  |(파일)  |  | (큐)  |  | (AI)   |
+----------+  +-----------+  +--------+  +-------+  +--------+
```

### 3.2 계층별 책임 분리

| 계층 | 책임 | 기술 |
|------|------|------|
| **Presentation** | SSR 렌더링, SEO, 사용자 인터랙션, 폼 검증 | Next.js, React, Tailwind |
| **API Gateway** | 인증 토큰 검증, Rate Limiting, CORS | FastAPI Middleware |
| **Application** | 비즈니스 로직, 데이터 변환, 검증 | FastAPI Router + Service Layer |
| **Domain** | 핵심 도메인 로직 (가치산정, 세금계산, EBITDA 정상화) | Pure Python Classes |
| **Infrastructure** | 데이터 영속화, 외부 서비스 통신 | SQLAlchemy, Supabase Client, OpenAI SDK |
| **Background** | 장시간 비동기 작업 (PDF 파싱, AI 추출, 이메일) | Celery + Redis |

### 3.3 모듈 구조

```
backend/
  app/
    api/
      routes/
        auth.py              # 인증 관련 라우트
        companies.py         # 기업 정보 CRUD
        financials.py        # 재무제표 업로드/파싱
        valuation.py         # 기업가치 산정
        tax_simulation.py    # 세금 시뮬레이션
        roadmap.py           # 칸반보드 로드맵
        consultation.py      # 전문가 상담 요청
      deps.py                # 공통 의존성 (DB 세션, 현재 사용자)
    core/
      config.py              # 환경 설정
      security.py            # JWT, 암호화 유틸
      exceptions.py          # 커스텀 예외 정의
    domain/
      valuation/
        ebitda_normalizer.py # EBITDA 정상화 알고리즘
        multiple_engine.py   # 멀티플 기반 가치산정
        multiple_db.py       # 업종별 멀티플 데이터
      tax/
        inheritance_tax.py   # 상속세 계산기
        capital_gains_tax.py # 양도소득세 계산기
        gift_tax_special.py  # 증여세 과세특례 계산기
        hybrid_strategy.py   # 하이브리드 전략 시뮬레이터
      financial/
        pdf_parser.py        # PDF 파싱 로직
        excel_parser.py      # Excel 파싱 로직
        ai_extractor.py      # AI 기반 재무 수치 추출
        ocr_processor.py     # OCR 처리
    models/
      user.py
      company.py
      financial_statement.py
      valuation_result.py
      tax_simulation.py
      roadmap.py
      consultation.py
    schemas/
      auth.py
      company.py
      financial.py
      valuation.py
      tax.py
      roadmap.py
      consultation.py
    services/
      auth_service.py
      company_service.py
      financial_service.py
      valuation_service.py
      tax_service.py
      roadmap_service.py
      consultation_service.py
    workers/
      tasks.py               # Celery 태스크 정의
      celery_app.py          # Celery 앱 설정
    main.py                  # FastAPI 앱 진입점
  alembic/
    versions/                # 마이그레이션 파일
  tests/
    api/
    domain/
    services/
  pyproject.toml
  Dockerfile
```

### 3.4 인증 흐름 (Supabase Auth 연동)

```
사용자 ──> Next.js ──> Supabase Auth (로그인/회원가입)
                            │
                      JWT Access Token 발급
                            │
사용자 ──> Next.js ──> FastAPI (Authorization: Bearer <token>)
                            │
                      Supabase JWT 검증
                      (supabase.auth.get_user())
                            │
                      요청 처리 + RLS 적용
```

1. 사용자가 Next.js에서 Supabase Auth SDK로 로그인 (이메일/비밀번호 또는 소셜 로그인)
2. Supabase가 JWT 토큰 발급
3. Next.js가 모든 API 요청 헤더에 JWT 토큰 포함
4. FastAPI 미들웨어에서 Supabase SDK로 토큰 검증 및 사용자 정보 추출
5. PostgreSQL 쿼리 시 RLS 정책이 자동으로 사용자 데이터 격리

---

## 4. 핵심 기능 기술 명세

### 4.1 재무제표 파싱 (Financial Statement Parser)

#### 4.1.1 개요

사용자가 업로드한 PDF 또는 Excel 형태의 재무제표에서 AI(OCR/LLM)를 활용하여 핵심 재무 수치를 자동으로 추출하고 구조화한다.

#### 4.1.2 처리 파이프라인

```
파일 업로드 ──> 파일 유형 판별 ──> 파싱 분기
                                    │
                    ┌───────────────┼───────────────┐
                    v               v               v
              텍스트 PDF        스캔 PDF          Excel
              (pdfplumber)     (OCR+LLM)       (openpyxl)
                    │               │               │
                    v               v               v
              텍스트 추출       이미지 변환         셀 데이터
                    │          + Tesseract OCR      추출
                    │               │               │
                    └───────┬───────┘               │
                            v                       │
                    GPT-4o 구조화 추출               │
                    (프롬프트 엔지니어링)              │
                            │                       │
                            v                       v
                    +-----------------------------------+
                    |  재무 데이터 정규화 및 검증        |
                    |  (Pydantic 스키마 검증)           |
                    +-----------------------------------+
                                    │
                                    v
                          DB 저장 + 사용자 검토 요청
```

#### 4.1.3 추출 대상 재무 항목

```python
# @SPEC docs/planning/02-trd.md#재무제표-파싱
class ExtractedFinancials(BaseModel):
    """재무제표에서 추출할 핵심 항목"""
    fiscal_year: int

    # 손익계산서
    revenue: Decimal                    # 매출액
    cost_of_goods_sold: Decimal         # 매출원가
    gross_profit: Decimal               # 매출총이익
    selling_admin_expenses: Decimal     # 판매비와관리비
    operating_income: Decimal           # 영업이익
    interest_expense: Decimal           # 이자비용
    depreciation: Decimal               # 감가상각비
    amortization: Decimal               # 무형자산상각비
    net_income: Decimal                 # 당기순이익

    # 재무상태표
    total_assets: Decimal               # 자산총계
    total_liabilities: Decimal          # 부채총계
    total_equity: Decimal               # 자본총계
    cash_and_equivalents: Decimal       # 현금및현금성자산
    short_term_borrowings: Decimal      # 단기차입금
    long_term_borrowings: Decimal       # 장기차입금

    # 현금흐름표
    operating_cash_flow: Decimal        # 영업활동현금흐름
    investing_cash_flow: Decimal        # 투자활동현금흐름
    financing_cash_flow: Decimal        # 재무활동현금흐름

    # 부가 정보
    employee_count: int | None          # 직원 수
    executive_compensation: Decimal | None  # 임원 보수 총액
```

#### 4.1.4 AI 추출 프롬프트 설계 원칙

- **구조화된 출력**: JSON 형식으로 출력 강제 (OpenAI Structured Output 활용)
- **한국어 특화**: 한국 재무제표 표준 계정과목명 매핑 테이블 내장
- **검증 규칙**: 자산 = 부채 + 자본 등 회계 항등식 자동 검증
- **신뢰도 점수**: 각 항목별 추출 신뢰도(0~1) 반환하여 사용자 검토 대상 표시
- **멀티턴 보정**: 신뢰도 낮은 항목은 추가 프롬프트로 재추출

#### 4.1.5 파일 처리 제약사항

| 항목 | 제한 |
|------|------|
| 최대 파일 크기 | 50MB |
| 지원 형식 | PDF, XLSX, XLS, CSV |
| 최대 페이지 수 (PDF) | 100페이지 |
| 처리 타임아웃 | 5분 (Celery 태스크) |
| 동시 처리 건수 | 사용자당 3건 |

---

### 4.2 EBITDA 정상화 로직 (EBITDA Normalization)

#### 4.2.1 개요

한국 중소기업 특유의 사적 비용/가족 급여 등 비정상적 지출을 식별하고 제거하여, 인수자 관점에서 합리적인 정상화 EBITDA를 산출한다.

#### 4.2.2 정상화 조정 항목 분류

```python
class NormalizationCategory(str, Enum):
    """EBITDA 정상화 조정 항목 분류"""

    # 사적 비용 (오너 관련)
    OWNER_PERSONAL_EXPENSE = "owner_personal"      # 오너 개인 비용
    FAMILY_SALARY = "family_salary"                 # 가족 급여 (실근무 대비 초과분)
    OWNER_VEHICLE = "owner_vehicle"                 # 오너 개인용 차량 비용
    OWNER_INSURANCE = "owner_insurance"             # 오너 개인 보험료

    # 비경상적 수익/비용
    ONE_TIME_REVENUE = "one_time_revenue"           # 일회성 수익
    ONE_TIME_EXPENSE = "one_time_expense"           # 일회성 비용 (소송, 재해 등)
    RELATED_PARTY_TRANSACTION = "related_party"     # 특수관계인 거래

    # 시장 기준 보정
    MARKET_RATE_RENT = "market_rent"                # 시가 대비 임대료 차이
    MARKET_RATE_SALARY = "market_salary"            # 시장 급여 대비 오너 급여 조정

    # 회계 정책 차이
    DEPRECIATION_ADJUSTMENT = "depreciation_adj"    # 감가상각 정책 조정
    INVENTORY_ADJUSTMENT = "inventory_adj"          # 재고 평가 방법 차이
```

#### 4.2.3 정상화 알고리즘

```
원본 EBITDA
  (+) 사적 비용 가산 (오너 개인 비용, 초과 가족 급여)
  (-) 오너 시장 급여 차감 (전문경영인 기준 급여로 대체)
  (+) 비경상 비용 가산 (일회성 비용, 소송비 등)
  (-) 비경상 수익 차감 (일회성 수익, 보조금 등)
  (+/-) 특수관계 거래 조정 (시가 기준 보정)
  (+/-) 회계 정책 차이 보정
  ────────────────────────
  = 정상화 EBITDA (Normalized EBITDA)
```

#### 4.2.4 사용자 인터페이스 연동

- 각 조정 항목을 카드 형태로 표시하여 사용자가 개별적으로 ON/OFF 가능
- AI가 재무제표에서 의심 항목을 자동 감지하고 제안 (사용자 확인 필수)
- 조정 전/후 EBITDA를 실시간 비교 차트로 표시
- 조정 근거를 텍스트로 입력/저장하여 향후 실사 대응 자료로 활용

---

### 4.3 기업가치 산정 엔진 (Valuation Engine)

#### 4.3.1 지원 밸류에이션 방법론

| 방법론 | 산식 | 적용 대상 |
|--------|------|-----------|
| **EV/EBITDA 멀티플** | 기업가치 = 정상화 EBITDA x 업종 멀티플 | 모든 기업 (주력 방법) |
| **P/E 멀티플** | 주가 = 순이익 x P/E 비율 | 수익성 안정 기업 |
| **P/S 멀티플** | 기업가치 = 매출 x P/S 비율 | 고성장 / 적자 기업 |
| **EV/Revenue** | 기업가치 = 매출 x EV/Revenue | 초기 단계 기업 |
| **순자산가치법** | 기업가치 = 조정 순자산 | 자산 중심 기업 |

#### 4.3.2 업종별 멀티플 데이터베이스

```python
class IndustryMultiple(BaseModel):
    """업종별 멀티플 데이터"""

    ksic_code: str              # 한국표준산업분류 코드
    industry_name: str          # 업종명
    sub_industry: str | None    # 세부 업종

    ev_ebitda_low: float        # EV/EBITDA 하한
    ev_ebitda_mid: float        # EV/EBITDA 중간값
    ev_ebitda_high: float       # EV/EBITDA 상한

    pe_ratio_low: float         # P/E 하한
    pe_ratio_mid: float         # P/E 중간값
    pe_ratio_high: float        # P/E 상한

    ps_ratio: float | None      # P/S 비율
    ev_revenue: float | None    # EV/Revenue

    data_source: str            # 데이터 출처
    last_updated: date          # 최종 갱신일
    sample_count: int           # 표본 기업 수
```

멀티플 데이터 출처:
- 한국거래소(KRX) 상장기업 재무 데이터
- KISVALUE (한국신용평가) 비상장기업 거래 데이터
- Aswath Damodaran 글로벌 멀티플 데이터
- 중소기업 M&A 실거래 사례 데이터

#### 4.3.3 산정 결과 출력

```python
class ValuationResult(BaseModel):
    """기업가치 산정 결과"""

    company_id: UUID
    valuation_date: date

    # EBITDA 기반 산정
    normalized_ebitda: Decimal
    applied_multiple: float
    enterprise_value: Decimal       # 기업가치 (EV)
    net_debt: Decimal               # 순차입금
    equity_value: Decimal           # 주주가치 = EV - 순차입금

    # 범위 산정 (3단계)
    equity_value_low: Decimal       # 보수적 시나리오
    equity_value_mid: Decimal       # 기본 시나리오
    equity_value_high: Decimal      # 낙관적 시나리오

    # 비교 지표
    ev_to_ebitda_implied: float
    ev_to_revenue_implied: float
    price_to_earnings_implied: float

    # 메타데이터
    methodology: str
    assumptions: list[str]          # 주요 가정 사항
    caveats: list[str]              # 유의 사항
```

---

### 4.4 세금 시뮬레이션 엔진 (Tax Simulation Engine)

#### 4.4.1 지원 세금 시나리오

| 시나리오 | 설명 | 관련 세법 |
|----------|------|-----------|
| **상속세** | 사망 시 기업 주식 상속에 따른 세금 | 상속세 및 증여세법 |
| **양도소득세** | 제3자에게 주식 매각 시 세금 | 소득세법, 법인세법 |
| **증여세 과세특례** | 가업승계 증여세 과세특례 적용 시 | 조세특례제한법 제30조의6 |
| **하이브리드 전략** | 증여특례 후 매각 병행 전략 | 복합 시나리오 |

#### 4.4.2 상속세 계산 로직

```
과세가액 산정:
  총상속재산가액 (주식 평가액 포함)
  + 사전증여재산 가산 (10년 이내)
  - 비과세 및 공제
  - 채무/장례비/공과금
  ────────────────
  = 상속세 과세가액

공제 적용:
  - 기초공제: 2억원
  - 인적공제: 자녀 1인당 5천만원
  - 배우자공제: 최소 5억 ~ 최대 30억
  - 가업상속공제: 최대 600억 (10년 이상 경영 시)
  - 금융재산공제: 최대 2억
  ────────────────
  = 과세표준

세율 적용:
  1억 이하: 10%
  1~5억: 20%
  5~10억: 30%
  10~30억: 40%
  30억 초과: 50%

  최대주주 할증: +20% (중소기업 제외)
```

#### 4.4.3 증여세 과세특례 시뮬레이터

```python
class GiftTaxSpecialInput(BaseModel):
    """증여세 과세특례 시뮬레이션 입력"""

    # 증여자 (부모) 정보
    donor_age: int                          # 60세 이상 요건
    years_of_management: int                # 경영 기간 (10년 이상)
    ownership_percentage: float             # 지분율

    # 수증자 (자녀) 정보
    donee_age: int                          # 18세 이상 요건

    # 기업 정보
    stock_value: Decimal                    # 주식 평가액
    is_sme: bool                            # 중소기업 여부
    is_mid_size: bool                       # 중견기업 여부
    non_business_asset_ratio: float         # 사업무관자산 비율

    # 옵션
    apply_installment_payment: bool = True  # 연부연납 적용 여부
    installment_years: int = 15             # 연부연납 기간 (최대 15년)


class GiftTaxSpecialResult(BaseModel):
    """증여세 과세특례 시뮬레이션 결과"""

    eligible: bool                          # 특례 적용 가능 여부
    ineligibility_reasons: list[str]        # 미적용 사유

    taxable_amount: Decimal                 # 과세 대상 금액
    basic_deduction: Decimal                # 기초공제 (10억원)
    tax_base: Decimal                       # 과세표준

    # 특례 세율 적용
    tax_amount_special: Decimal             # 특례 적용 세금 (10~20%)
    tax_amount_normal: Decimal              # 일반 증여세 (비교용)
    tax_saving: Decimal                     # 절세 효과

    # 연부연납
    annual_installment: Decimal | None      # 연간 납부액
    installment_schedule: list[dict] | None # 연도별 납부 스케줄

    # 사후관리 요건
    post_management_requirements: list[str] # 충족해야 할 사후관리 요건
```

#### 4.4.4 하이브리드 전략 시뮬레이터

증여특례로 자녀에게 지분 이전 후, 향후 기업 전체를 제3자에게 매각하는 병행 전략의 세금 효과를 시뮬레이션한다.

```
시나리오 A: 직접 매각 (양도세)
  매각가 - 취득가 = 양도차익
  양도소득세 = 양도차익 x 세율 (20~25%)

시나리오 B: 증여특례 후 매각 (하이브리드)
  Step 1: 증여특례로 자녀에게 저가 이전 → 증여세 10~20%
  Step 2: 자녀가 보유 후 매각 → 양도세 (증여 시점 가액 기준)
  총 세금 = 증여세 + 양도세

시나리오 C: 자녀 법인 설립 후 매각
  Step 1: 자녀 법인 설립
  Step 2: 법인이 기업 주식 취득
  Step 3: 법인 차원에서 매각
  총 세금 = 법인세 + 배당소득세

비교 결과: A vs B vs C 총 세 부담 비교표 출력
```

---

### 4.5 칸반보드 기반 로드맵 (Roadmap Manager)

#### 4.5.1 Phase 구조

도메인 문서에서 정의한 M&A 워크플로우 5단계를 칸반보드로 구현한다.

| Phase | 명칭 | 기간 | 핵심 활동 |
|-------|------|------|-----------|
| Phase 1 | 경영 상황 가시화 | T-5~10년 | 재무/세무 진단, 엑시트 전략 수립 |
| Phase 2 | 기업가치 제고(Value-up) | T-3~5년 | 그루밍, 수익성 개선, 규정 정비 |
| Phase 3 | 마케팅 및 파트너 매칭 | T-1~2년 | IM 작성, NDA, 인수자 접촉 |
| Phase 4 | 정밀 실사 및 협상 | T-6개월 | DD, 가격 협상, SPA 작성 |
| Phase 5 | 거래 종결 및 PMI | 종결 후 | 클로징, 기술 전수, 통합 |

#### 4.5.2 체크리스트/템플릿 시스템

```python
class RoadmapTask(BaseModel):
    """로드맵 태스크 (체크리스트 항목)"""

    id: UUID
    phase: int                              # 1~5
    category: str                           # 재무, 법률, 세무, 인사, 기술
    title: str
    description: str

    status: TaskStatus                      # todo, in_progress, done, skipped
    priority: Priority                      # high, medium, low

    is_template: bool = True                # 기본 템플릿 여부
    is_custom: bool = False                 # 사용자 추가 항목

    dependencies: list[UUID] = []           # 선행 태스크
    assigned_to: str | None                 # 담당자 (오너, 세무사, 변호사 등)
    due_date: date | None

    documents: list[str] = []               # 첨부 문서 (Storage 경로)
    notes: str | None                       # 메모

    completed_at: datetime | None
    completed_by: UUID | None
```

#### 4.5.3 기본 템플릿 체크리스트 (Phase 1 예시)

```json
{
  "phase": 1,
  "title": "경영 상황 가시화 및 엑시트 전략 수립",
  "tasks": [
    {
      "category": "재무",
      "title": "최근 3~5개년 재무제표 수집 및 업로드",
      "priority": "high"
    },
    {
      "category": "재무",
      "title": "EBITDA 정상화 작업 수행",
      "priority": "high"
    },
    {
      "category": "세무",
      "title": "현재 주식 평가액 산정",
      "priority": "high"
    },
    {
      "category": "세무",
      "title": "상속세 시뮬레이션 실행",
      "priority": "high"
    },
    {
      "category": "세무",
      "title": "증여세 과세특례 적용 가능성 검토",
      "priority": "medium"
    },
    {
      "category": "자산",
      "title": "사업무관자산 비중 점검 (과다보유현금 200% 기준)",
      "priority": "medium"
    },
    {
      "category": "인사",
      "title": "핵심 인력 현황 파악 및 유출 리스크 진단",
      "priority": "medium"
    },
    {
      "category": "전략",
      "title": "엑시트 경로 결정 (가업승계 / 제3자 매각 / 병행)",
      "priority": "high"
    }
  ]
}
```

#### 4.5.4 실시간 업데이트

- Supabase Realtime을 활용하여 칸반보드 상태 변경을 실시간 동기화
- 동일 기업에 여러 관계자(오너, 세무사, 자문사)가 동시 접근 가능
- 상태 변경 히스토리를 타임라인으로 기록

---

### 4.6 전문가 상담 요청 (Expert Consultation)

#### 4.6.1 상담 요청 흐름

```
사용자 폼 작성 ──> 입력 검증 ──> DB 저장 ──> 이메일 알림 발송
                                                │
                                    ┌───────────┼───────────┐
                                    v           v           v
                              운영팀 알림   전문가 알림   사용자 확인
                              (관리자)      (매칭된)     (접수 완료)
```

#### 4.6.2 상담 유형

| 유형 | 설명 | 매칭 전문가 |
|------|------|-------------|
| 세무 상담 | 상속세/양도세/증여특례 관련 | 세무사/회계사 |
| 법률 상담 | SPA, NDA, 계약서 검토 | M&A 전문 변호사 |
| 가치평가 상담 | 밸류에이션 검증 및 자문 | M&A 자문사 |
| 종합 컨설팅 | M&A 프로세스 전반 | 종합 자문기관 |

#### 4.6.3 이메일/알림 연동

- **이메일 발송**: Supabase Edge Functions 또는 SendGrid API
- **관리자 대시보드**: 상담 요청 목록 조회, 상태 관리 (접수/진행/완료)
- **알림**: 상담 요청 접수 시 사용자 이메일 확인, 전문가 배정 시 알림

---

## 5. API 설계 개요

### 5.1 API 설계 원칙

- RESTful 규칙 준수 (리소스 중심 URL, HTTP 메서드 의미 부여)
- 모든 응답은 일관된 래퍼 구조 사용
- 에러 응답은 RFC 7807 (Problem Details) 형식 준수
- API 버전관리: URL 경로 방식 (`/api/v1/...`)

### 5.2 공통 응답 구조

```python
class ApiResponse(BaseModel, Generic[T]):
    """공통 API 응답 래퍼"""
    success: bool
    data: T | None = None
    error: ApiError | None = None
    meta: dict | None = None      # 페이지네이션 등 메타 정보

class ApiError(BaseModel):
    """에러 응답 구조"""
    code: str                     # 에러 코드 (예: "VALIDATION_ERROR")
    message: str                  # 사용자 친화적 메시지
    details: list[dict] | None    # 상세 에러 정보
```

### 5.3 API 엔드포인트 목록

#### 5.3.1 인증 (Auth)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/auth/signup` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| POST | `/api/v1/auth/logout` | 로그아웃 |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 |
| GET | `/api/v1/auth/me` | 현재 사용자 정보 |
| PUT | `/api/v1/auth/me` | 사용자 정보 수정 |
| POST | `/api/v1/auth/password/reset` | 비밀번호 재설정 요청 |

#### 5.3.2 기업 정보 (Companies)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/companies` | 기업 등록 |
| GET | `/api/v1/companies` | 내 기업 목록 조회 |
| GET | `/api/v1/companies/{id}` | 기업 상세 조회 |
| PUT | `/api/v1/companies/{id}` | 기업 정보 수정 |
| DELETE | `/api/v1/companies/{id}` | 기업 삭제 |

#### 5.3.3 재무제표 (Financials)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/companies/{id}/financials/upload` | 재무제표 파일 업로드 |
| GET | `/api/v1/companies/{id}/financials/upload/{task_id}` | 파싱 진행 상태 조회 |
| GET | `/api/v1/companies/{id}/financials` | 재무 데이터 목록 (연도별) |
| GET | `/api/v1/companies/{id}/financials/{year}` | 특정 연도 재무 상세 |
| PUT | `/api/v1/companies/{id}/financials/{year}` | 재무 데이터 수정 (사용자 보정) |
| DELETE | `/api/v1/companies/{id}/financials/{year}` | 재무 데이터 삭제 |

#### 5.3.4 EBITDA 정상화 (Normalization)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/companies/{id}/normalization` | 정상화 세션 생성 |
| GET | `/api/v1/companies/{id}/normalization/{session_id}` | 정상화 결과 조회 |
| PUT | `/api/v1/companies/{id}/normalization/{session_id}` | 조정 항목 수정 |
| POST | `/api/v1/companies/{id}/normalization/{session_id}/adjustments` | 조정 항목 추가 |
| DELETE | `/api/v1/companies/{id}/normalization/{session_id}/adjustments/{adj_id}` | 조정 항목 삭제 |
| POST | `/api/v1/companies/{id}/normalization/{session_id}/ai-suggest` | AI 자동 감지 요청 |

#### 5.3.5 기업가치 산정 (Valuation)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/companies/{id}/valuations` | 밸류에이션 실행 |
| GET | `/api/v1/companies/{id}/valuations` | 밸류에이션 히스토리 |
| GET | `/api/v1/companies/{id}/valuations/{val_id}` | 밸류에이션 상세 결과 |
| POST | `/api/v1/companies/{id}/valuations/{val_id}/scenarios` | 시나리오 추가 |
| GET | `/api/v1/multiples` | 업종별 멀티플 조회 |
| GET | `/api/v1/multiples/{ksic_code}` | 특정 업종 멀티플 상세 |

#### 5.3.6 세금 시뮬레이션 (Tax Simulation)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/companies/{id}/tax/inheritance` | 상속세 시뮬레이션 |
| POST | `/api/v1/companies/{id}/tax/capital-gains` | 양도소득세 시뮬레이션 |
| POST | `/api/v1/companies/{id}/tax/gift-special` | 증여특례 시뮬레이션 |
| POST | `/api/v1/companies/{id}/tax/hybrid` | 하이브리드 전략 시뮬레이션 |
| GET | `/api/v1/companies/{id}/tax/simulations` | 시뮬레이션 히스토리 |
| GET | `/api/v1/companies/{id}/tax/simulations/{sim_id}` | 시뮬레이션 상세 결과 |
| POST | `/api/v1/companies/{id}/tax/compare` | 시나리오 비교 |

#### 5.3.7 로드맵 (Roadmap)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/companies/{id}/roadmap` | 로드맵 초기화 (템플릿 기반) |
| GET | `/api/v1/companies/{id}/roadmap` | 전체 로드맵 조회 |
| GET | `/api/v1/companies/{id}/roadmap/phases/{phase}` | Phase별 태스크 조회 |
| POST | `/api/v1/companies/{id}/roadmap/tasks` | 태스크 추가 |
| PUT | `/api/v1/companies/{id}/roadmap/tasks/{task_id}` | 태스크 수정 |
| PATCH | `/api/v1/companies/{id}/roadmap/tasks/{task_id}/status` | 태스크 상태 변경 |
| DELETE | `/api/v1/companies/{id}/roadmap/tasks/{task_id}` | 태스크 삭제 |
| PUT | `/api/v1/companies/{id}/roadmap/tasks/{task_id}/order` | 태스크 순서 변경 |

#### 5.3.8 전문가 상담 (Consultation)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/v1/consultations` | 상담 요청 제출 |
| GET | `/api/v1/consultations` | 내 상담 요청 목록 |
| GET | `/api/v1/consultations/{id}` | 상담 요청 상세 |
| PUT | `/api/v1/consultations/{id}/status` | 상담 상태 변경 (관리자) |

### 5.4 주요 요청/응답 예시

#### 기업가치 산정 요청

```json
// POST /api/v1/companies/{id}/valuations
{
  "methodology": "ev_ebitda",
  "normalization_session_id": "uuid-here",
  "multiple_override": null,
  "scenarios": [
    {
      "name": "보수적",
      "multiple_adjustment": -1.0,
      "growth_rate": 0.03
    },
    {
      "name": "기본",
      "multiple_adjustment": 0,
      "growth_rate": 0.05
    },
    {
      "name": "낙관적",
      "multiple_adjustment": 1.5,
      "growth_rate": 0.08
    }
  ]
}
```

#### 기업가치 산정 응답

```json
{
  "success": true,
  "data": {
    "id": "val-uuid",
    "company_id": "comp-uuid",
    "valuation_date": "2026-03-26",
    "methodology": "ev_ebitda",
    "normalized_ebitda": 500000000,
    "industry_multiple": 7.5,
    "scenarios": [
      {
        "name": "보수적",
        "applied_multiple": 6.5,
        "enterprise_value": 3250000000,
        "net_debt": 800000000,
        "equity_value": 2450000000
      },
      {
        "name": "기본",
        "applied_multiple": 7.5,
        "enterprise_value": 3750000000,
        "net_debt": 800000000,
        "equity_value": 2950000000
      },
      {
        "name": "낙관적",
        "applied_multiple": 9.0,
        "enterprise_value": 4500000000,
        "net_debt": 800000000,
        "equity_value": 3700000000
      }
    ],
    "summary": {
      "equity_value_range": "24.5억 ~ 37.0억원",
      "implied_ev_revenue": 1.2,
      "implied_pe": 12.3
    }
  }
}
```

#### 세금 시뮬레이션 비교 응답

```json
{
  "success": true,
  "data": {
    "company_id": "comp-uuid",
    "stock_value": 3000000000,
    "comparison": [
      {
        "scenario": "직접 매각 (양도세)",
        "total_tax": 625000000,
        "effective_rate": 0.208,
        "net_proceeds": 2375000000,
        "pros": ["즉시 현금화", "절차 간단"],
        "cons": ["높은 세 부담"]
      },
      {
        "scenario": "증여특례 후 매각 (하이브리드)",
        "total_tax": 420000000,
        "effective_rate": 0.14,
        "net_proceeds": 2580000000,
        "tax_saving_vs_direct": 205000000,
        "pros": ["절세 효과 극대화", "자녀 경영 참여"],
        "cons": ["7년 사후관리", "복잡한 요건"]
      },
      {
        "scenario": "가업상속공제",
        "total_tax": 0,
        "effective_rate": 0.0,
        "net_proceeds": 3000000000,
        "pros": ["세금 없음"],
        "cons": ["사망 시에만 적용", "5년 사후관리", "요건 매우 엄격"]
      }
    ],
    "recommendation": "증여특례 후 매각 (하이브리드)",
    "recommendation_reason": "세 부담 대비 실현 가능성이 가장 높은 전략"
  }
}
```

---

## 6. 데이터 모델 개요

### 6.1 ERD 주요 엔티티

```
┌─────────────────┐     ┌──────────────────────┐
│     users        │     │     companies         │
│─────────────────│     │──────────────────────│
│ id (PK, UUID)   │────<│ id (PK, UUID)         │
│ email           │     │ user_id (FK)           │
│ full_name       │     │ name                   │
│ phone           │     │ business_number        │
│ role            │     │ ksic_code              │
│ created_at      │     │ industry               │
│ updated_at      │     │ founded_year           │
└─────────────────┘     │ employee_count         │
                        │ ceo_name               │
                        │ ceo_age                │
                        │ ceo_ownership_pct      │
                        │ annual_revenue         │
                        │ status                 │
                        │ created_at             │
                        └──────────┬─────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              v                    v                    v
┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ financial_statements │  │ valuations       │  │ roadmap_tasks    │
│─────────────────────│  │──────────────────│  │──────────────────│
│ id (PK)             │  │ id (PK)          │  │ id (PK)          │
│ company_id (FK)     │  │ company_id (FK)  │  │ company_id (FK)  │
│ fiscal_year         │  │ methodology      │  │ phase            │
│ revenue             │  │ normalized_ebitda│  │ category         │
│ operating_income    │  │ applied_multiple │  │ title            │
│ ebitda              │  │ enterprise_value │  │ status           │
│ net_income          │  │ equity_value_low │  │ priority         │
│ total_assets        │  │ equity_value_mid │  │ assigned_to      │
│ total_liabilities   │  │ equity_value_high│  │ due_date         │
│ total_equity        │  │ assumptions      │  │ sort_order       │
│ source_file_url     │  │ created_at       │  │ completed_at     │
│ parsing_status      │  └──────────────────┘  └──────────────────┘
│ ai_confidence       │
│ created_at          │
└─────────┬───────────┘
          │
          v
┌─────────────────────────┐     ┌──────────────────────────┐
│ normalization_sessions   │     │ tax_simulations           │
│─────────────────────────│     │──────────────────────────│
│ id (PK)                 │     │ id (PK)                   │
│ company_id (FK)         │     │ company_id (FK)           │
│ base_ebitda             │     │ scenario_type             │
│ normalized_ebitda       │     │ input_params (JSONB)      │
│ created_at              │     │ result (JSONB)            │
│                         │     │ total_tax                 │
│ ┌─────────────────────┐ │     │ effective_rate            │
│ │ normalization_items  │ │     │ created_at               │
│ │─────────────────────│ │     └──────────────────────────┘
│ │ id (PK)             │ │
│ │ session_id (FK)     │ │     ┌──────────────────────────┐
│ │ category            │ │     │ consultations             │
│ │ description         │ │     │──────────────────────────│
│ │ amount              │ │     │ id (PK)                   │
│ │ adjustment_type     │ │     │ user_id (FK)              │
│ │ is_active           │ │     │ company_id (FK)           │
│ │ ai_suggested        │ │     │ type                      │
│ │ rationale           │ │     │ subject                   │
│ └─────────────────────┘ │     │ description               │
└─────────────────────────┘     │ contact_preference        │
                                │ status                    │
┌──────────────────────────┐    │ assigned_expert           │
│ industry_multiples       │    │ created_at                │
│──────────────────────────│    └──────────────────────────┘
│ id (PK)                  │
│ ksic_code (UNIQUE)       │    ┌──────────────────────────┐
│ industry_name            │    │ uploaded_files             │
│ ev_ebitda_low            │    │──────────────────────────│
│ ev_ebitda_mid            │    │ id (PK)                   │
│ ev_ebitda_high           │    │ company_id (FK)           │
│ pe_ratio_low             │    │ file_name                 │
│ pe_ratio_mid             │    │ file_type                 │
│ pe_ratio_high            │    │ storage_path              │
│ data_source              │    │ file_size                 │
│ last_updated             │    │ parsing_status            │
│ sample_count             │    │ parsed_data_id (FK)       │
└──────────────────────────┘    │ uploaded_at               │
                                └──────────────────────────┘
```

### 6.2 주요 테이블 상세

#### 6.2.1 users

Supabase Auth의 `auth.users` 테이블과 연동. 추가 프로필 정보는 `public.users` 테이블에 저장.

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    company_role TEXT,  -- 'owner', 'advisor', 'accountant'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);
```

#### 6.2.2 companies

```sql
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- 기본 정보
    name TEXT NOT NULL,
    business_number TEXT UNIQUE,        -- 사업자등록번호
    ksic_code TEXT,                     -- 한국표준산업분류 코드
    industry TEXT,                      -- 업종명
    sub_industry TEXT,                  -- 세부 업종

    -- CEO 정보
    ceo_name TEXT,
    ceo_age INT,
    ceo_ownership_pct DECIMAL(5,2),     -- 지분율 (%)
    years_of_management INT,            -- 경영 기간 (년)

    -- 기업 규모
    founded_year INT,
    employee_count INT,
    annual_revenue BIGINT,              -- 최근 연간 매출 (원)
    is_sme BOOLEAN DEFAULT TRUE,        -- 중소기업 여부
    is_mid_size BOOLEAN DEFAULT FALSE,  -- 중견기업 여부

    -- 승계 관련
    has_successor BOOLEAN,              -- 후계자 유무
    preferred_exit TEXT,                -- 선호 엑시트 경로
    target_exit_year INT,              -- 목표 매각 연도

    status TEXT DEFAULT 'active',       -- active, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 본인 기업만 접근
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own companies"
    ON public.companies FOR ALL
    USING (auth.uid() = user_id);
```

#### 6.2.3 financial_statements

```sql
CREATE TABLE public.financial_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    fiscal_year INT NOT NULL,

    -- 손익계산서
    revenue BIGINT,
    cost_of_goods_sold BIGINT,
    gross_profit BIGINT,
    selling_admin_expenses BIGINT,
    operating_income BIGINT,
    interest_expense BIGINT,
    depreciation BIGINT,
    amortization BIGINT,
    net_income BIGINT,
    ebitda BIGINT,                      -- 계산값: 영업이익 + 감가상각 + 상각

    -- 재무상태표
    total_assets BIGINT,
    total_liabilities BIGINT,
    total_equity BIGINT,
    cash_and_equivalents BIGINT,
    short_term_borrowings BIGINT,
    long_term_borrowings BIGINT,

    -- 현금흐름표
    operating_cash_flow BIGINT,
    investing_cash_flow BIGINT,
    financing_cash_flow BIGINT,

    -- 부가 정보
    employee_count INT,
    executive_compensation BIGINT,

    -- 파싱 메타데이터
    source_file_id UUID REFERENCES public.uploaded_files(id),
    parsing_method TEXT,                -- 'ai_gpt4', 'ocr_tesseract', 'excel_direct', 'manual'
    ai_confidence DECIMAL(3,2),         -- AI 추출 신뢰도 (0.00~1.00)
    is_verified BOOLEAN DEFAULT FALSE,  -- 사용자 검증 완료 여부

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(company_id, fiscal_year)
);
```

### 6.3 JSONB 활용 (유연한 스키마)

세금 시뮬레이션의 입력/출력은 시나리오별로 구조가 다르므로 JSONB 컬럼을 활용한다.

```sql
CREATE TABLE public.tax_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id),

    scenario_type TEXT NOT NULL,         -- 'inheritance', 'capital_gains', 'gift_special', 'hybrid'
    input_params JSONB NOT NULL,         -- 시나리오별 입력 파라미터
    result JSONB NOT NULL,               -- 계산 결과

    total_tax BIGINT,                    -- 총 세금 (원)
    effective_rate DECIMAL(5,4),          -- 실효세율

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JSONB 인덱스
CREATE INDEX idx_tax_sim_scenario ON public.tax_simulations(scenario_type);
CREATE INDEX idx_tax_sim_input ON public.tax_simulations USING GIN (input_params);
```

---

## 7. 보안 요구사항

### 7.1 인증 및 인가 (Authentication & Authorization)

#### 7.1.1 인증 방식

| 항목 | 구현 |
|------|------|
| 인증 제공자 | Supabase Auth (GoTrue 기반) |
| 토큰 형식 | JWT (RS256) |
| Access Token 만료 | 1시간 |
| Refresh Token 만료 | 30일 |
| 로그인 방법 | 이메일/비밀번호, Google OAuth, Kakao OAuth |
| MFA | TOTP 기반 2단계 인증 (선택적, 권장) |

#### 7.1.2 RBAC (역할 기반 접근 제어)

| 역할 | 설명 | 권한 |
|------|------|------|
| `owner` | 기업 오너 (기본) | 자사 데이터 전체 CRUD |
| `advisor` | 자문사/세무사 | 초대받은 기업 데이터 읽기 + 제한적 수정 |
| `admin` | 플랫폼 관리자 | 전체 데이터 읽기, 상담 관리, 시스템 설정 |

```python
# RBAC 구현 (FastAPI Dependency)
class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    async def __call__(
        self, current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="권한이 없습니다.")
        return current_user

# 사용 예시
@router.get("/admin/consultations")
async def list_all_consultations(
    user: User = Depends(RoleChecker(["admin"]))
):
    ...
```

#### 7.1.3 Row Level Security (RLS)

모든 데이터 테이블에 RLS를 적용하여, 사용자가 자신의 데이터에만 접근하도록 보장한다. SQL 쿼리 레벨에서 강제되므로 애플리케이션 로직의 실수로 인한 데이터 유출을 방지한다.

```sql
-- 모든 테이블에 적용되는 기본 RLS 패턴
CREATE POLICY "Users access own company data"
    ON public.financial_statements FOR ALL
    USING (
        company_id IN (
            SELECT id FROM public.companies WHERE user_id = auth.uid()
        )
    );
```

### 7.2 데이터 암호화

#### 7.2.1 전송 구간 암호화

| 구간 | 방식 |
|------|------|
| Client <-> Vercel | TLS 1.3 (Vercel 자동 적용) |
| Vercel <-> Cloud Run | TLS 1.3 (HTTPS 강제) |
| Cloud Run <-> Supabase | TLS 1.3 (Supabase SSL 강제) |

#### 7.2.2 저장 데이터 암호화

| 대상 | 방식 |
|------|------|
| PostgreSQL | Supabase Disk Encryption (AES-256, 기본 제공) |
| Storage 파일 | Supabase Storage Server-side Encryption |
| 민감 컬럼 | 애플리케이션 레벨 필드 암호화 (AES-256-GCM) |

```python
# 민감 데이터 필드 암호화 예시
from cryptography.fernet import Fernet

class FieldEncryptor:
    """민감 필드 암호화/복호화"""

    def __init__(self, key: str):
        self.cipher = Fernet(key.encode())

    def encrypt(self, plaintext: str) -> str:
        return self.cipher.encrypt(plaintext.encode()).decode()

    def decrypt(self, ciphertext: str) -> str:
        return self.cipher.decrypt(ciphertext.encode()).decode()

# 적용 대상 필드
# - 사업자등록번호 (business_number)
# - 대표자 실명 (ceo_name)
# - 연락처 (phone)
# - 재무 수치 원본 (선택적)
```

### 7.3 입력 검증 및 방어

| 위협 | 대응 |
|------|------|
| SQL Injection | SQLAlchemy ORM 사용 (파라미터 바인딩 강제), Raw SQL 금지 |
| XSS | Next.js 기본 이스케이핑, DOMPurify 적용 (사용자 입력 렌더링 시) |
| CSRF | SameSite Cookie, CORS Origin 제한 |
| File Upload 공격 | 확장자/MIME 검증, 파일 크기 제한, 바이러스 스캔 (ClamAV) |
| Rate Limiting | API Gateway 레벨 (IP당 100 req/min), 사용자당 1000 req/hour |
| 브루트포스 | Supabase Auth 기본 제공 (5회 실패 시 잠금) |

### 7.4 감사 로그 (Audit Log)

재무 데이터 열람/수정/삭제 등 주요 이벤트를 감사 로그로 기록한다.

```sql
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action TEXT NOT NULL,             -- 'view', 'create', 'update', 'delete'
    resource_type TEXT NOT NULL,      -- 'financial_statement', 'valuation', 'tax_simulation'
    resource_id UUID,
    details JSONB,                    -- 변경 전/후 데이터 (diff)
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 보존 기간: 최소 5년
-- 삭제 불가 (INSERT ONLY 정책)
```

### 7.5 컴플라이언스

| 항목 | 요구사항 |
|------|----------|
| 개인정보보호법 | 개인정보 수집/이용 동의, 처리방침 공개, 파기 절차 |
| 신용정보법 | 재무 정보 제3자 제공 시 별도 동의 |
| 데이터 보존 | 세무 관련 데이터 5년 보존 |
| 데이터 주권 | 한국 리전 내 데이터 저장 (Supabase ap-northeast-2 또는 셀프호스팅) |

---

## 8. 배포 전략

### 8.1 배포 아키텍처

```
GitHub Repository
      │
      ├── Push to main ──> GitHub Actions CI
      │                         │
      │                    ┌────┴────┐
      │                    v         v
      │              Build &    Build &
      │              Test FE    Test BE
      │                    │         │
      │                    v         v
      │              Vercel      Cloud Run
      │              Deploy      Deploy
      │              (Auto)      (Container)
      │
      ├── Push to develop ──> Preview Deploy
      │                         │
      │                    ┌────┴────┐
      │                    v         v
      │              Vercel      Cloud Run
      │              Preview     Staging
      │
      └── Pull Request ──> PR Preview + Test
```

### 8.2 환경 구성

| 환경 | Frontend | Backend | Database | 용도 |
|------|----------|---------|----------|------|
| **Local** | `localhost:3000` | `localhost:8000` | Supabase Local (Docker) | 개발 |
| **Staging** | `staging.승계브릿지.kr` | Cloud Run (staging) | Supabase 별도 프로젝트 | QA/테스트 |
| **Production** | `승계브릿지.kr` | Cloud Run (prod) | Supabase Production | 운영 |

### 8.3 Frontend 배포 (Vercel)

| 항목 | 설정 |
|------|------|
| Framework Preset | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Node.js Version | 22.x |
| Region | `icn1` (Seoul) |
| 환경변수 | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` |
| Preview Deployments | PR마다 자동 생성 |
| Domain | `승계브릿지.kr` (커스텀 도메인) |

### 8.4 Backend 배포 (Google Cloud Run)

```dockerfile
# Dockerfile
FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir .

COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

| 항목 | 설정 |
|------|------|
| Region | `asia-northeast3` (Seoul) |
| CPU | 2 vCPU |
| Memory | 2 GiB |
| Min Instances | 1 (Cold start 방지) |
| Max Instances | 10 (오토스케일링) |
| Concurrency | 80 |
| Timeout | 300초 (PDF 파싱 대응) |
| CPU Allocation | Always allocated (Background Worker 지원) |

### 8.5 CI/CD 파이프라인 (GitHub Actions)

```yaml
# .github/workflows/backend-ci.yml 개요
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.14'
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: mypy app/
      - run: pytest --cov=app --cov-fail-under=70

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    # Cloud Run staging 배포

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    # Cloud Run production 배포
```

### 8.6 데이터베이스 마이그레이션 전략

- **도구**: Alembic (SQLAlchemy 연동)
- **배포 시 자동 실행**: CI/CD 파이프라인에서 `alembic upgrade head` 실행
- **롤백**: 각 마이그레이션에 `downgrade()` 함수 구현 필수
- **네이밍 규칙**: `YYYY_MM_DD_HHMM_description.py` (예: `2026_03_26_1400_add_companies_table.py`)

---

## 9. 성능 요구사항

### 9.1 응답 시간 목표

| 유형 | 목표 (P95) | 비고 |
|------|-----------|------|
| 정적 페이지 (SSG) | < 200ms | Vercel Edge CDN |
| SSR 페이지 | < 500ms | Next.js Server Components |
| 일반 API (CRUD) | < 300ms | FastAPI |
| 기업가치 산정 API | < 2초 | 복합 계산 |
| 세금 시뮬레이션 API | < 3초 | 다중 시나리오 |
| 재무제표 파싱 (PDF) | < 60초 | 비동기 처리 (Celery) |
| 재무제표 파싱 (Excel) | < 10초 | 동기 처리 가능 |

### 9.2 동시 사용자 처리

| 지표 | 목표 |
|------|------|
| 동시 접속자 | 500명 |
| 일일 활성 사용자 (DAU) | 1,000명 |
| 초당 요청 수 (RPS) | 100 req/sec |
| 업타임 SLA | 99.5% |

### 9.3 캐싱 전략

| 계층 | 대상 | TTL | 구현 |
|------|------|-----|------|
| CDN | 정적 에셋, 마케팅 페이지 | 1일 | Vercel Edge |
| API 응답 | 업종별 멀티플 데이터 | 24시간 | Redis |
| API 응답 | 세금 시뮬레이션 결과 | 1시간 | Redis |
| DB 쿼리 | 자주 조회되는 기업 정보 | 10분 | Redis |
| 클라이언트 | 서버 상태 데이터 | 5분 | TanStack Query `staleTime` |

### 9.4 파일 업로드 최적화

- **청크 업로드**: 50MB 이상 파일은 5MB 청크 분할 업로드 (Supabase Storage resumable upload)
- **파일 압축**: 클라이언트 측 이미지 압축 후 업로드
- **중복 방지**: 파일 해시(SHA-256) 비교로 동일 파일 재업로드 방지
- **처리 큐**: 동시 파싱 요청 제한 (사용자당 3건, 전체 시스템 20건)

### 9.5 데이터베이스 최적화

```sql
-- 주요 인덱스
CREATE INDEX idx_companies_user ON public.companies(user_id);
CREATE INDEX idx_financials_company_year ON public.financial_statements(company_id, fiscal_year);
CREATE INDEX idx_valuations_company ON public.valuations(company_id);
CREATE INDEX idx_tax_sim_company ON public.tax_simulations(company_id);
CREATE INDEX idx_roadmap_company_phase ON public.roadmap_tasks(company_id, phase);
CREATE INDEX idx_audit_user_created ON public.audit_logs(user_id, created_at DESC);

-- 파티셔닝 (감사 로그 - 월별)
CREATE TABLE public.audit_logs (
    ...
) PARTITION BY RANGE (created_at);
```

### 9.6 모니터링 및 알림

| 도구 | 용도 | 알림 조건 |
|------|------|-----------|
| Sentry | 에러 추적 | 5xx 에러 발생 시 즉시 |
| Google Cloud Monitoring | 인프라 지표 | CPU > 80%, Memory > 90% |
| Supabase Dashboard | DB 지표 | Slow query (> 1초), Connection pool 포화 |
| Posthog | 사용자 행동 | 핵심 기능 전환율, 이탈 포인트 |
| UptimeRobot | 가용성 | 서비스 다운 시 즉시 |

---

## 10. 개발 단계 계획

### 10.1 Phase 0: 프로젝트 셋업 (1주)

- 프로젝트 구조 초기화 (monorepo 또는 분리 repo)
- 기술 스택 설치 및 보일러플레이트 구성
- Supabase 프로젝트 생성 및 스키마 초기 마이그레이션
- CI/CD 파이프라인 기본 구성
- 코딩 컨벤션 및 린트 설정

### 10.2 Phase 1: 핵심 기능 MVP (4주)

| 주차 | 태스크 | 우선순위 |
|------|--------|----------|
| 1주 | 인증 (회원가입/로그인), 기업 등록 CRUD | P0 |
| 2주 | 재무제표 업로드 및 AI 파싱 파이프라인 | P0 |
| 3주 | EBITDA 정상화 UI + 기업가치 산정 엔진 | P0 |
| 4주 | 세금 시뮬레이션 (상속세/양도세 기본) | P0 |

### 10.3 Phase 2: 핵심 기능 확장 (3주)

| 주차 | 태스크 | 우선순위 |
|------|--------|----------|
| 5주 | 증여특례/하이브리드 시뮬레이션 | P0 |
| 6주 | 칸반보드 로드맵 시스템 | P1 |
| 7주 | 전문가 상담 요청 + 이메일 연동 | P1 |

### 10.4 Phase 3: 고도화 및 출시 준비 (2주)

| 주차 | 태스크 | 우선순위 |
|------|--------|----------|
| 8주 | 대시보드 시각화, SEO 최적화, 랜딩 페이지 | P1 |
| 9주 | 보안 강화, 성능 최적화, 부하 테스트 | P0 |

### 10.5 Phase 4: 베타 및 출시 (2주)

| 주차 | 태스크 | 우선순위 |
|------|--------|----------|
| 10주 | 클로즈드 베타 (5~10개 기업), 피드백 수집 | P0 |
| 11주 | 버그 수정, 최종 배포, 모니터링 안정화 | P0 |

---

## 부록 A: 한국 세법 주요 수치 참조표 (2025~2026 기준)

| 항목 | 수치 |
|------|------|
| 상속세 최고 세율 | 50% (30억 초과) |
| 최대주주 할증 | 20% (중소기업 제외) |
| 가업상속공제 한도 | 최대 600억원 (30년 이상 경영) |
| 증여세 과세특례 한도 | 600억원 |
| 증여세 과세특례 세율 | 60억 이하 10%, 60억 초과 20% |
| 증여세 기초공제 | 10억원 |
| 연부연납 최대 기간 | 15년 |
| 사후관리 기간 (상속공제) | 5년 |
| 사후관리 기간 (증여특례) | 7년 |
| 과다보유현금 기준 | 업종 평균의 200% |
| 양도소득세 (비상장주식) | 20~25% |
| 중소기업 양도세 세율 | 10% (1년 이상 보유) |

## 부록 B: 업종별 멀티플 참고 범위

| 업종 | EV/EBITDA 범위 | P/E 범위 | 비고 |
|------|---------------|----------|------|
| 제조업 (일반) | 5.0 ~ 8.0x | 8 ~ 15x | |
| 제조업 (기술 특화) | 7.0 ~ 12.0x | 12 ~ 20x | 특허 보유 시 프리미엄 |
| IT/소프트웨어 | 10.0 ~ 20.0x | 20 ~ 35x | SaaS 기업 상한 높음 |
| 유통/도소매 | 4.0 ~ 7.0x | 8 ~ 14x | |
| 건설/부동산 | 4.0 ~ 6.0x | 6 ~ 10x | |
| 식품/음료 | 6.0 ~ 10.0x | 10 ~ 18x | 브랜드 가치 반영 |
| 헬스케어/바이오 | 12.0 ~ 25.0x | 25 ~ 50x | R&D 파이프라인 반영 |
| 에너지/유틸리티 | 6.0 ~ 9.0x | 10 ~ 16x | ESG 프리미엄 반영 |
| 물류/운송 | 5.0 ~ 8.0x | 8 ~ 14x | |

> 상기 멀티플은 참고용이며, 실제 적용 시 기업 규모, 성장성, 수익성, 시장 상황 등을 종합적으로 고려해야 합니다.

---

**문서 끝**

| 항목 | 내용 |
|------|------|
| 작성자 | 승계브릿지 기술팀 |
| 승인자 | - |
| 다음 리뷰 예정 | - |
