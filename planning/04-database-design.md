# 04. 데이터베이스 설계 문서

## 프로젝트 정보

- **프로젝트명**: 기업승계형 M&A 플랫폼 "승계브릿지"
- **데이터베이스**: Supabase (PostgreSQL 15+)
- **작성일**: 2026-03-26
- **버전**: 1.0

---

## 1. 개요

### 1.1 설계 목표

승계브릿지는 기업 승계를 위한 M&A 플랫폼으로, 다음의 데이터 관리가 필요합니다:

- **사용자 관리**: CEO 사용자와 전문가 등록
- **기업 정보 관리**: 산업, 규모, 재무 상황 등
- **재무 분석**: 실시간 재무제표 업로드 및 자동 추출
- **기업가치 평가**: EBITDA 기반 멀티플 분석 및 예상가 산정
- **세금 시뮬레이션**: 매각 구조별 세금 영향 분석
- **매각 로드맵**: 단계별 체크리스트 및 진도 관리
- **상담 관리**: 전문가 매칭 및 상담 요청 추적
- **문서 관리**: 단계별 필수 문서 템플릿 제공

### 1.2 핵심 설계 원칙

- **데이터 무결성**: Foreign Key 제약조건으로 참조 무결성 보장
- **성능 최적화**: 자주 조회되는 컬럼에 인덱스 설계
- **보안**: Supabase RLS로 사용자별 데이터 접근 제어
- **확장성**: JSON 타입으로 유연한 데이터 확장 지원
- **감시**: 생성/수정 시간 자동 기록 (audit trail)

---

## 2. ERD (Entity-Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          승계브릿지 데이터 모델                            │
└─────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────┐
                          │     users       │
                          │                 │
                          │  id (uuid)      │
                          │  email          │
                          │  role           │
                          │  created_at     │
                          │  updated_at     │
                          └────────┬────────┘
                                   │
                    ┌──────────────┬──────────────┬──────────────┐
                    │              │              │              │
                    ▼              ▼              ▼              ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │  companies   │ │   experts    │ │  consultation│ │  document    │
            │              │ │              │ │  _requests   │ │  _templates  │
            │ id (uuid)    │ │ id (uuid)    │ │              │ │              │
            │ user_id (FK) │ │ user_id (FK) │ │ id (uuid)    │ │ id (uuid)    │
            │              │ │              │ │ company_id(FK)          │
            │              │ │              │ │ expert_id (FK)         │
            └──────┬───────┘ └──────────────┘ │              │ │              │
                   │                          │ created_at   │ │ category     │
                   │                          │ updated_at   │ │ version      │
                   │                          └──────────────┘ │              │
                   │                                            └──────────────┘
                   │
        ┌──────────┴──────────┬───────────────┐
        │                     │               │
        ▼                     ▼               ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │   financial_ │  │  valuations  │  │     tax_     │
    │  statements  │  │              │  │  simulations │
    │              │  │  id (uuid)   │  │              │
    │ id (uuid)    │  │  company_id  │  │ id (uuid)    │
    │ company_id   │  │  (FK)        │  │ company_id   │
    │ (FK)         │  │              │  │ (FK)         │
    │              │  │ ebitda_mult  │  │              │
    │              │  │ exit_valuation  │ scenario     │
    │              │  │              │  │              │
    └──────────────┘  └──────────────┘  └──────────────┘

                    ┌─────────────────┐
                    │  roadmap_phases │
                    │                 │
                    │  id (uuid)      │
                    │  company_id(FK) │
                    │  phase_number   │
                    │  status         │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  roadmap_tasks  │
                    │                 │
                    │  id (uuid)      │
                    │  phase_id (FK)  │
                    │  completed_at   │
                    └─────────────────┘
```

---

## 3. 테이블 상세 정의

### 3.1 users (사용자 테이블)

**설명**: Supabase Auth와 연동된 CEO 사용자 및 전문가 정보

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 사용자 고유 ID (Supabase Auth와 동기) |
| email | varchar(255) | N | - | 이메일 주소 (unique) |
| name | varchar(100) | N | - | 사용자 이름 |
| role | varchar(20) | N | `'ceo'` | 역할 (`ceo`, `expert`) |
| phone | varchar(20) | Y | - | 연락처 |
| company_name | varchar(255) | Y | - | CEO: 소속 기업명 |
| expert_category | varchar(100) | Y | - | Expert: 전문 분야 (예: 세무사, 법무법인) |
| bio | text | Y | - | 프로필 설명 |
| avatar_url | varchar(500) | Y | - | 프로필 사진 URL |
| is_active | boolean | N | true | 활성 사용자 여부 |
| last_login_at | timestamp | Y | - | 마지막 로그인 시간 |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Unique: `email`
- Check: `role IN ('ceo', 'expert')`

**인덱스**:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
```

---

### 3.2 companies (기업 정보 테이블)

**설명**: CEO가 등록한 기업의 상세 정보

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 기업 고유 ID |
| user_id | uuid | N | - | 소유자 사용자 ID (FK → users.id) |
| company_name | varchar(255) | N | - | 기업명 |
| registration_number | varchar(50) | Y | - | 사업자등록번호 |
| industry | varchar(100) | Y | - | 산업 분야 (예: IT, 제조업, 유통) |
| founded_year | integer | Y | - | 설립연도 |
| employee_count | integer | Y | - | 직원 수 |
| annual_revenue | decimal(15,2) | Y | - | 연간 매출 (KRW) |
| description | text | Y | - | 기업 설명 |
| website | varchar(500) | Y | - | 홈페이지 URL |
| logo_url | varchar(500) | Y | - | 로고 이미지 URL |
| status | varchar(30) | N | `'draft'` | 진행 상태 (draft, in_progress, completed) |
| metadata | jsonb | Y | `'{}'::jsonb` | 추가 정보 (산업 세부, 위치, 기타) |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `user_id` → users(id) ON DELETE CASCADE
- Check: `status IN ('draft', 'in_progress', 'completed')`
- Unique: `registration_number`

**인덱스**:
```sql
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
```

---

### 3.3 financial_statements (재무제표 테이블)

**설명**: CEO가 업로드한 재무제표 및 자동 추출된 재무 데이터

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 재무제표 고유 ID |
| company_id | uuid | N | - | 기업 ID (FK → companies.id) |
| fiscal_year | integer | N | - | 회계연도 (예: 2024) |
| quarter | integer | Y | - | 분기 (Q1-Q4, NULL이면 연간) |
| statement_type | varchar(50) | N | - | 재무제표 타입 (income_statement, balance_sheet, cash_flow) |
| file_url | varchar(500) | Y | - | 업로드된 파일 경로 (Supabase Storage) |
| extracted_data | jsonb | N | `'{}'::jsonb` | AI 추출 재무 데이터 (key-value) |
| revenue | decimal(15,2) | Y | - | 매출액 (KRW) |
| operating_income | decimal(15,2) | Y | - | 영업이익 (KRW) |
| net_income | decimal(15,2) | Y | - | 순이익 (KRW) |
| ebitda | decimal(15,2) | Y | - | EBITDA (KRW) |
| total_assets | decimal(15,2) | Y | - | 총자산 (KRW) |
| total_liabilities | decimal(15,2) | Y | - | 총부채 (KRW) |
| equity | decimal(15,2) | Y | - | 자본 (KRW) |
| extraction_status | varchar(30) | N | `'pending'` | 추출 상태 (pending, processing, completed, failed) |
| extraction_error | text | Y | - | 추출 실패 시 에러 메시지 |
| notes | text | Y | - | 관리자 메모 |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `company_id` → companies(id) ON DELETE CASCADE
- Check: `statement_type IN ('income_statement', 'balance_sheet', 'cash_flow')`
- Check: `extraction_status IN ('pending', 'processing', 'completed', 'failed')`
- Unique: `(company_id, fiscal_year, quarter, statement_type)`

**인덱스**:
```sql
CREATE INDEX idx_financial_statements_company_id ON financial_statements(company_id);
CREATE INDEX idx_financial_statements_fiscal_year ON financial_statements(fiscal_year);
CREATE INDEX idx_financial_statements_extraction_status ON financial_statements(extraction_status);
CREATE INDEX idx_financial_statements_created_at ON financial_statements(created_at DESC);
```

---

### 3.4 valuations (기업가치 산정 테이블)

**설명**: 기업가치 평가 결과 (EBITDA 멀티플 방식)

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 평가 고유 ID |
| company_id | uuid | N | - | 기업 ID (FK → companies.id) |
| valuation_date | date | N | - | 평가 기준일 |
| fiscal_year | integer | N | - | 기준 회계연도 |
| ebitda_amount | decimal(15,2) | N | - | EBITDA (KRW) |
| ebitda_multiple | decimal(4,2) | N | - | 적용 멀티플 (예: 5.5) |
| valuation_result | decimal(15,2) | N | - | 기업가치 (EBITDA × Multiple) |
| industry_multiple_avg | decimal(4,2) | Y | - | 산업 평균 멀티플 |
| valuation_range_low | decimal(15,2) | Y | - | 평가액 범위 (하한) |
| valuation_range_high | decimal(15,2) | Y | - | 평가액 범위 (상한) |
| notes | text | Y | - | 평가 근거 및 메모 |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `company_id` → companies(id) ON DELETE CASCADE
- Check: `ebitda_multiple > 0`

**인덱스**:
```sql
CREATE INDEX idx_valuations_company_id ON valuations(company_id);
CREATE INDEX idx_valuations_valuation_date ON valuations(valuation_date DESC);
CREATE INDEX idx_valuations_fiscal_year ON valuations(fiscal_year);
```

---

### 3.5 tax_simulations (세금 시뮬레이션 테이블)

**설명**: 매각 구조별 세금 영향 분석 (4가지 시나리오)

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 시뮬레이션 고유 ID |
| company_id | uuid | N | - | 기업 ID (FK → companies.id) |
| simulation_date | date | N | - | 시뮬레이션 기준일 |
| scenario | varchar(50) | N | - | 시나리오 (100_percent_sale, partial_sale, earnout, management_buyout) |
| sale_price | decimal(15,2) | N | - | 매각가 (KRW) |
| capital_gains_tax | decimal(15,2) | N | - | 양도소득세 (KRW) |
| corporate_tax | decimal(15,2) | Y | - | 법인세 (해당시) |
| local_income_tax | decimal(15,2) | Y | - | 지방소득세 (해당시) |
| health_insurance_contribution | decimal(15,2) | Y | - | 건강보험료 (해당시) |
| total_tax | decimal(15,2) | N | - | 총 세금 (KRW) |
| net_proceeds | decimal(15,2) | N | - | 순 수령액 (매각가 - 총세금) |
| effective_tax_rate | decimal(5,2) | N | - | 실효세율 (%) |
| assumptions | jsonb | Y | `'{}'::jsonb` | 시뮬레이션 가정 (취득원가, 기간 등) |
| notes | text | Y | - | 분석 메모 |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `company_id` → companies(id) ON DELETE CASCADE
- Check: `scenario IN ('100_percent_sale', 'partial_sale', 'earnout', 'management_buyout')`

**인덱스**:
```sql
CREATE INDEX idx_tax_simulations_company_id ON tax_simulations(company_id);
CREATE INDEX idx_tax_simulations_scenario ON tax_simulations(scenario);
CREATE INDEX idx_tax_simulations_simulation_date ON tax_simulations(simulation_date DESC);
```

---

### 3.6 roadmap_phases (매각 로드맵 단계 테이블)

**설명**: 매각 프로세스 5단계의 진행 상황

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 로드맵 단계 고유 ID |
| company_id | uuid | N | - | 기업 ID (FK → companies.id) |
| phase_number | integer | N | - | 단계 번호 (1-5) |
| phase_name | varchar(100) | N | - | 단계명 (진단, 준비, 마케팅, 협상, 완료) |
| description | text | Y | - | 단계 설명 |
| expected_duration_days | integer | Y | - | 예상 소요 일수 |
| status | varchar(30) | N | `'not_started'` | 진행 상태 (not_started, in_progress, completed) |
| started_at | timestamp | Y | - | 단계 시작 시간 |
| completed_at | timestamp | Y | - | 단계 완료 시간 |
| notes | text | Y | - | 진행 메모 |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `company_id` → companies(id) ON DELETE CASCADE
- Check: `phase_number BETWEEN 1 AND 5`
- Check: `status IN ('not_started', 'in_progress', 'completed')`
- Unique: `(company_id, phase_number)`

**인덱스**:
```sql
CREATE INDEX idx_roadmap_phases_company_id ON roadmap_phases(company_id);
CREATE INDEX idx_roadmap_phases_status ON roadmap_phases(status);
CREATE INDEX idx_roadmap_phases_phase_number ON roadmap_phases(phase_number);
```

---

### 3.7 roadmap_tasks (로드맵 체크리스트 항목 테이블)

**설명**: 각 Phase 내의 구체적인 체크리스트 항목

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 태스크 고유 ID |
| phase_id | uuid | N | - | 로드맵 단계 ID (FK → roadmap_phases.id) |
| task_order | integer | N | - | 태스크 순서 (Phase 내에서) |
| task_title | varchar(255) | N | - | 태스크 제목 |
| description | text | Y | - | 태스크 설명 |
| is_completed | boolean | N | false | 완료 여부 |
| completed_at | timestamp | Y | - | 완료 시간 |
| assigned_to | uuid | Y | - | 할당 대상 (전문가 ID) |
| due_date | date | Y | - | 예정 완료 기한 |
| priority | varchar(20) | N | `'medium'` | 우선순위 (low, medium, high) |
| attachments | jsonb | Y | `'[]'::jsonb` | 첨부 파일 목록 |
| notes | text | Y | - | 태스크 노트 |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `phase_id` → roadmap_phases(id) ON DELETE CASCADE
- Check: `priority IN ('low', 'medium', 'high')`

**인덱스**:
```sql
CREATE INDEX idx_roadmap_tasks_phase_id ON roadmap_tasks(phase_id);
CREATE INDEX idx_roadmap_tasks_is_completed ON roadmap_tasks(is_completed);
CREATE INDEX idx_roadmap_tasks_assigned_to ON roadmap_tasks(assigned_to);
CREATE INDEX idx_roadmap_tasks_due_date ON roadmap_tasks(due_date);
```

---

### 3.8 consultation_requests (전문가 상담 요청 테이블)

**설명**: CEO의 전문가 상담 요청 및 상담 이력

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 상담 요청 고유 ID |
| company_id | uuid | N | - | 기업 ID (FK → companies.id) |
| expert_id | uuid | Y | - | 전문가 ID (FK → users.id, expert 역할만) |
| consultation_type | varchar(50) | N | - | 상담 분야 (tax, legal, accounting, business) |
| title | varchar(255) | N | - | 상담 주제 |
| description | text | N | - | 상담 내용 (요청 상세) |
| status | varchar(30) | N | `'pending'` | 상담 상태 (pending, accepted, completed, declined) |
| scheduled_date | timestamp | Y | - | 예정 상담 시간 |
| consultation_date | timestamp | Y | - | 실제 상담 시간 |
| duration_minutes | integer | Y | - | 상담 시간 (분) |
| outcome | text | Y | - | 상담 결과 및 조언 |
| follow_up_required | boolean | N | false | 후속 상담 필요 여부 |
| rating | integer | Y | - | 상담 만족도 (1-5) |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `company_id` → companies(id) ON DELETE CASCADE
- Foreign Key: `expert_id` → users(id) ON DELETE SET NULL
- Check: `consultation_type IN ('tax', 'legal', 'accounting', 'business')`
- Check: `status IN ('pending', 'accepted', 'completed', 'declined')`
- Check: `rating BETWEEN 1 AND 5 OR rating IS NULL`

**인덱스**:
```sql
CREATE INDEX idx_consultation_requests_company_id ON consultation_requests(company_id);
CREATE INDEX idx_consultation_requests_expert_id ON consultation_requests(expert_id);
CREATE INDEX idx_consultation_requests_status ON consultation_requests(status);
CREATE INDEX idx_consultation_requests_consultation_type ON consultation_requests(consultation_type);
CREATE INDEX idx_consultation_requests_scheduled_date ON consultation_requests(scheduled_date);
```

---

### 3.9 experts (전문가 등록 프로필 테이블)

**설명**: 전문가의 상세 프로필 (세무사, 법무법인, 회계사, 경영 컨설턴트)

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 전문가 고유 ID |
| user_id | uuid | N | - | 사용자 ID (FK → users.id, role='expert') |
| license_number | varchar(100) | Y | - | 자격증 번호 (세무사, 변호사 등) |
| firm_name | varchar(255) | Y | - | 소속 법인/회사명 |
| specialties | varchar(500)[] | Y | - | 전문 분야 배열 (예: {세금, 상속세, 양도소득세}) |
| experience_years | integer | Y | - | 경력 년수 |
| consultation_fee_rate | decimal(5,2) | Y | - | 상담료 비율 (%) |
| hourly_rate | decimal(10,2) | Y | - | 시간당 요금 (KRW) |
| bio | text | Y | - | 전문가 소개 |
| certifications | jsonb | Y | `'[]'::jsonb` | 자격증 목록 (JSON: 자격증명, 취득일, 유효기간) |
| languages | varchar(100)[] | Y | - | 사용 언어 |
| availability_status | varchar(30) | N | `'available'` | 상담 가능 상태 (available, busy, unavailable) |
| response_time_hours | integer | Y | - | 평균 응답 시간 (시간) |
| total_consultations | integer | N | 0 | 총 상담 건수 |
| average_rating | decimal(3,2) | Y | - | 평균 평점 |
| is_verified | boolean | N | false | 자격증 인증 여부 |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Foreign Key: `user_id` → users(id) ON DELETE CASCADE
- Check: `availability_status IN ('available', 'busy', 'unavailable')`
- Check: `average_rating BETWEEN 1 AND 5 OR average_rating IS NULL`

**인덱스**:
```sql
CREATE INDEX idx_experts_user_id ON experts(user_id);
CREATE INDEX idx_experts_specialties ON experts USING GIN(specialties);
CREATE INDEX idx_experts_is_verified ON experts(is_verified);
CREATE INDEX idx_experts_availability_status ON experts(availability_status);
CREATE INDEX idx_experts_average_rating ON experts(average_rating DESC);
```

---

### 3.10 document_templates (단계별 문서 템플릿 테이블)

**설명**: 각 로드맵 단계별로 필요한 문서 템플릿 및 체크리스트

| 컬럼명 | 데이터타입 | Null | 기본값 | 설명 |
|--------|-----------|------|--------|------|
| id | uuid | N | `gen_random_uuid()` | 템플릿 고유 ID |
| template_name | varchar(255) | N | - | 문서 템플릿명 (예: "DD 체크리스트") |
| category | varchar(50) | N | - | 문서 분류 (due_diligence, financial, legal, regulatory) |
| phase_number | integer | Y | - | 해당 로드맵 단계 (1-5, NULL이면 전체) |
| description | text | Y | - | 템플릿 설명 |
| content | text | N | - | 템플릿 본문 (HTML 또는 마크다운) |
| file_url | varchar(500) | Y | - | 다운로드 가능한 템플릿 파일 URL |
| version | varchar(20) | N | `'1.0'` | 템플릿 버전 |
| is_active | boolean | N | true | 사용 중 여부 |
| metadata | jsonb | Y | `'{}'::jsonb` | 추가 메타데이터 (언어, 산업별 버전 등) |
| created_at | timestamp | N | `now()` | 생성 시간 |
| updated_at | timestamp | N | `now()` | 수정 시간 |

**제약조건**:
- Primary Key: `id`
- Check: `phase_number BETWEEN 1 AND 5 OR phase_number IS NULL`
- Check: `category IN ('due_diligence', 'financial', 'legal', 'regulatory')`

**인덱스**:
```sql
CREATE INDEX idx_document_templates_category ON document_templates(category);
CREATE INDEX idx_document_templates_phase_number ON document_templates(phase_number);
CREATE INDEX idx_document_templates_is_active ON document_templates(is_active);
```

---

## 4. 관계 설명 (Relationships)

### 4.1 사용자 관련 관계

```
users (CEO)
  ├─ 1:N ─→ companies (소유 기업)
  ├─ 1:N ─→ consultation_requests (상담 요청)
  └─ 1:N ─→ document_templates (문서 작성, 관리)

users (Expert)
  ├─ 1:1 ─→ experts (전문가 프로필)
  └─ 1:N ─→ consultation_requests (상담 응답)
```

### 4.2 기업 관련 관계

```
companies
  ├─ 1:N ─→ financial_statements (재무제표)
  ├─ 1:N ─→ valuations (기업가치 평가)
  ├─ 1:N ─→ tax_simulations (세금 시뮬레이션)
  ├─ 1:N ─→ roadmap_phases (매각 로드맵)
  └─ 1:N ─→ consultation_requests (상담 요청)
```

### 4.3 로드맵 관계

```
roadmap_phases
  └─ 1:N ─→ roadmap_tasks (단계별 체크리스트)
```

### 4.4 참조 관계

- `financial_statements.extracted_data` (JSONB): AI 추출 재무 데이터
- `roadmap_tasks.attachments` (JSONB): 첨부 파일 메타데이터
- `experts.certifications` (JSONB): 자격증 상세 정보
- `companies.metadata` (JSONB): 기업 추가 정보
- `tax_simulations.assumptions` (JSONB): 세금 계산 가정

---

## 5. 인덱스 전략

### 5.1 조회 성능 최적화

**자주 조회되는 필터링**:
- 사용자별 기업 조회: `idx_companies_user_id`
- 기업별 재무제표: `idx_financial_statements_company_id`
- 기업별 평가 결과: `idx_valuations_company_id`
- 상담 요청 상태: `idx_consultation_requests_status`

### 5.2 정렬 최적화

**최근 기록 조회**:
```sql
-- 최근 생성된 기업
SELECT * FROM companies WHERE user_id = $1 ORDER BY created_at DESC;
-- 인덱스: idx_companies_created_at ON companies(created_at DESC)
```

### 5.3 복합 인덱스 (Composite Index)

```sql
-- 회계연도별, 제표 타입별 조회
CREATE INDEX idx_financial_statements_year_type
  ON financial_statements(fiscal_year, statement_type);

-- 기업별 로드맵 상태 조회
CREATE INDEX idx_roadmap_phases_company_status
  ON roadmap_phases(company_id, status);

-- 전문가의 상담 분야 및 상태
CREATE INDEX idx_consultation_requests_expert_type_status
  ON consultation_requests(expert_id, consultation_type, status);
```

### 5.4 전문 인덱스

**배열 필드 검색**:
```sql
-- 전문가 전문 분야 검색 (예: "세무사" 포함)
CREATE INDEX idx_experts_specialties
  ON experts USING GIN(specialties);

-- 언어 검색
CREATE INDEX idx_experts_languages
  ON experts USING GIN(languages);
```

**JSONB 필드 검색**:
```sql
-- 추출된 재무 데이터 검색
CREATE INDEX idx_financial_statements_extracted_data
  ON financial_statements USING GIN(extracted_data);

-- 회사 메타데이터 검색
CREATE INDEX idx_companies_metadata
  ON companies USING GIN(metadata);
```

---

## 6. Supabase RLS (Row Level Security) 정책

### 6.1 기본 원칙

- **CEO**: 본인의 기업 및 관련 데이터만 조회/수정 가능
- **Expert**: 할당받은 상담 건만 접근 가능
- **Admin**: 모든 데이터 접근 (Auth 권한 기반)

### 6.2 users 테이블 RLS

```sql
-- CEO는 자신의 정보만 조회
CREATE POLICY "Users can view themselves"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 전문가는 자신의 정보만 조회
CREATE POLICY "Experts can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id OR role = 'expert');

-- 사용자는 자신의 정보만 수정
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### 6.3 companies 테이블 RLS

```sql
-- CEO는 자신의 기업만 조회
CREATE POLICY "Users can view own companies"
  ON companies FOR SELECT
  USING (user_id = auth.uid());

-- CEO는 자신의 기업만 수정
CREATE POLICY "Users can update own companies"
  ON companies FOR UPDATE
  USING (user_id = auth.uid());

-- CEO는 자신의 기업만 삭제
CREATE POLICY "Users can delete own companies"
  ON companies FOR DELETE
  USING (user_id = auth.uid());

-- CEO만 기업 생성 가능
CREATE POLICY "Users can create companies"
  ON companies FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

### 6.4 financial_statements 테이블 RLS

```sql
-- CEO는 자신의 기업의 재무제표만 조회
CREATE POLICY "Users can view own company financials"
  ON financial_statements FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- CEO는 자신의 기업에만 재무제표 업로드
CREATE POLICY "Users can insert own company financials"
  ON financial_statements FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );
```

### 6.5 consultation_requests 테이블 RLS

```sql
-- CEO는 자신의 상담 요청만 조회
CREATE POLICY "CEOs can view own consultation requests"
  ON consultation_requests FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM companies WHERE user_id = auth.uid()
    )
  );

-- Expert는 할당받은 상담만 조회
CREATE POLICY "Experts can view assigned consultations"
  ON consultation_requests FOR SELECT
  USING (expert_id = auth.uid());

-- Expert는 할당받은 상담만 수정
CREATE POLICY "Experts can update assigned consultations"
  ON consultation_requests FOR UPDATE
  USING (expert_id = auth.uid());
```

### 6.6 experts 테이블 RLS

```sql
-- 모든 사용자는 Expert 프로필 조회 가능 (매칭 검색용)
CREATE POLICY "Anyone can view expert profiles"
  ON experts FOR SELECT
  USING (true);

-- Expert는 자신의 프로필만 수정
CREATE POLICY "Experts can update own profile"
  ON experts FOR UPDATE
  USING (user_id = auth.uid());
```

---

## 7. 마이그레이션 전략

### 7.1 Alembic을 이용한 버전 관리

**마이그레이션 파일 구조**:
```
alembic/
├── versions/
│   ├── 001_create_users_table.py
│   ├── 002_create_companies_table.py
│   ├── 003_create_financial_statements_table.py
│   ├── 004_create_valuations_table.py
│   ├── 005_create_tax_simulations_table.py
│   ├── 006_create_roadmap_tables.py
│   ├── 007_create_consultation_requests_table.py
│   ├── 008_create_experts_table.py
│   └── 009_create_document_templates_table.py
├── env.py
└── alembic.ini
```

### 7.2 초기 마이그레이션 실행 순서

```
1. users 테이블 (가장 기본)
   ↓
2. companies 테이블 (user_id FK)
   ↓
3. experts 테이블 (user_id FK)
   ↓
4. financial_statements 테이블 (company_id FK)
   ↓
5. valuations 테이블 (company_id FK)
   ↓
6. tax_simulations 테이블 (company_id FK)
   ↓
7. roadmap_phases 테이블 (company_id FK)
   ↓
8. roadmap_tasks 테이블 (phase_id FK)
   ↓
9. consultation_requests 테이블 (company_id, expert_id FK)
   ↓
10. document_templates 테이블 (독립적)
```

### 7.3 데이터 마이그레이션

**초기 마이그레이션 후 seed 데이터**:

1. **document_templates 초기화**
   - 5가지 로드맵 단계별 템플릿 생성
   - 각 단계의 필수 문서 정의

2. **기본 로드맵 Phase 템플릿**
   - Phase 1: 진단 및 준비 (30일)
   - Phase 2: 기업 정보 수집 (30일)
   - Phase 3: 마케팅 및 홍보 (60일)
   - Phase 4: 협상 (60일)
   - Phase 5: 완료 (30일)

### 7.4 롤백 전략

```sql
-- Alembic 다운그레이드
alembic downgrade -1  # 마지막 마이그레이션 취소
alembic downgrade 001  # 특정 버전까지 롤백
```

---

## 8. 성능 최적화 고려사항

### 8.1 쿼리 최적화

**자주 사용되는 쿼리 패턴**:

1. **기업 대시보드 조회**
   ```sql
   SELECT c.*,
          (SELECT COUNT(*) FROM financial_statements WHERE company_id = c.id) as statement_count,
          (SELECT COUNT(*) FROM valuations WHERE company_id = c.id) as valuation_count
   FROM companies c
   WHERE c.user_id = $1
   ORDER BY c.created_at DESC;
   ```
   - 인덱스: `idx_companies_user_id`, `idx_financial_statements_company_id`

2. **최신 기업가치 조회**
   ```sql
   SELECT * FROM valuations
   WHERE company_id = $1
   ORDER BY valuation_date DESC
   LIMIT 1;
   ```
   - 인덱스: `idx_valuations_company_id`, `idx_valuations_valuation_date`

3. **상담 가능 전문가 검색**
   ```sql
   SELECT * FROM experts
   WHERE availability_status = 'available'
     AND specialties && $1  -- PostgreSQL 배열 교집합
   ORDER BY average_rating DESC;
   ```
   - 인덱스: `idx_experts_specialties`, `idx_experts_availability_status`

### 8.2 연결 풀링 설정

```python
# SQLAlchemy with asyncpg connection pooling
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

# 풀 설정
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,  # 풀에 유지할 연결 수
    max_overflow=20,  # 풀 초과 시 허용 추가 연결
    pool_pre_ping=True,  # 연결 유효성 확인
    pool_recycle=3600,  # 1시간마다 연결 재생성
)
```

### 8.3 JSONB 필드 최적화

- `extracted_data` (financial_statements): GIN 인덱스로 키 검색 최적화
- `metadata` (companies): 자주 쿼리되는 키는 별도 컬럼으로 분리 고려
- `assumptions` (tax_simulations): 읽기 전용으로 취급

### 8.4 대용량 데이터 처리

**배치 작업**:
- 월별 재무제표 자동 추출: 배치 프로세스로 처리
- 세금 시뮬레이션 갱신: 야간 배치 처리
- 문서 생성: 큐 기반 비동기 처리

---

## 9. 보안 및 감시 (Audit)

### 9.1 데이터 암호화

**Supabase 제공 암호화**:
- 연결: SSL/TLS (기본 활성화)
- 저장소: PostgreSQL 전체 암호화 (선택적)

**애플리케이션 레벨**:
```python
# 민감 정보 암호화 (선택사항)
# 예: 사용자 연락처, 기업 사업자등록번호
from cryptography.fernet import Fernet

def encrypt_sensitive(data: str, key: str) -> str:
    cipher = Fernet(key.encode())
    return cipher.encrypt(data.encode()).decode()
```

### 9.2 감시 (Audit Trail)

모든 테이블에 자동 타임스탬프:

```python
from sqlalchemy import func, Column, DateTime

class Base:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
```

**선택적: 감시 로그 테이블**:
```sql
CREATE TABLE audit_logs (
    id uuid PRIMARY KEY,
    table_name varchar(100),
    record_id uuid,
    operation varchar(10),  -- 'INSERT', 'UPDATE', 'DELETE'
    old_values jsonb,
    new_values jsonb,
    changed_by uuid,
    changed_at timestamp DEFAULT now()
);

CREATE INDEX idx_audit_logs_table_record
  ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at
  ON audit_logs(changed_at DESC);
```

---

## 10. 데이터 무결성 규칙

### 10.1 제약조건 요약

| 테이블 | 제약조건 | 설명 |
|--------|---------|------|
| users | email UNIQUE | 이메일 중복 방지 |
| companies | registration_number UNIQUE | 사업자등록번호 중복 방지 |
| financial_statements | (company_id, fiscal_year, quarter, statement_type) UNIQUE | 동일 기간 중복 방지 |
| roadmap_phases | (company_id, phase_number) UNIQUE | 단계 중복 방지 |
| consultation_requests | status IN (...) | 유효한 상태만 허용 |

### 10.2 Foreign Key 정책

```sql
-- CASCADE: 상위 레코드 삭제 시 하위 레코드도 삭제
-- ON DELETE CASCADE:
--   - users 삭제 → companies, experts, consultation_requests 삭제
--   - companies 삭제 → financial_statements, valuations, tax_simulations, roadmap_phases 삭제

-- SET NULL: 상위 레코드 삭제 시 FK를 NULL로 설정
-- ON DELETE SET NULL:
--   - users(expert) 삭제 → consultation_requests.expert_id = NULL
```

---

## 11. 배포 체크리스트

### 11.1 프로덕션 배포 전

- [ ] 모든 마이그레이션 실행 확인
- [ ] 인덱스 생성 확인
- [ ] RLS 정책 활성화
- [ ] 백업 전략 수립 (Supabase 자동 백업 설정)
- [ ] 성능 테스트 (주요 쿼리 응답 시간 확인)
- [ ] Seed 데이터 로드 (document_templates 등)

### 11.2 운영 체크리스트

- [ ] 일일 백업 확인
- [ ] 데이터 접근 로그 모니터링 (RLS 위반)
- [ ] 쿼리 성능 모니터링 (느린 쿼리 감지)
- [ ] 테이블 크기 모니터링 (특히 financial_statements, audit_logs)

---

## 12. 참고 자료

### 12.1 SQLAlchemy ORM 모델 예시

```python
# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False, default="ceo", index=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
```

### 12.2 Alembic 마이그레이션 예시

```python
# alembic/versions/001_create_users_table.py
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.func.gen_random_uuid(), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('role', sa.String(20), nullable=False, server_default='ceo'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_role', 'users', ['role'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])

def downgrade():
    op.drop_table('users')
```

### 12.3 Supabase 프로젝트 설정

```bash
# Supabase CLI로 로컬 개발 환경 구성
supabase start

# 마이그레이션 실행
supabase db push

# Supabase 클라우드로 배포
supabase link --project-ref your-project-id
supabase db push --remote
```

---

## 13. FAQ

### Q1: EBITDA를 저장할 때 정수 vs 소수?
**A**: `decimal(15,2)`를 사용하여 원화 단위의 2자리 소수 정밀도를 보장합니다. (최대 999,999,999,999.99)

### Q2: 재무제표 파일은 DB에 저장하나?
**A**: 파일은 Supabase Storage에 저장하고, DB의 `file_url`에는 경로만 저장합니다. 추출된 데이터는 `extracted_data` (JSONB)에 저장합니다.

### Q3: 멀티테넌트 격리를 어떻게 하나?
**A**: Supabase RLS 정책으로 사용자별 데이터 접근을 자동 제한합니다. `company_id`가 현재 사용자 소유 여부를 확인합니다.

### Q4: 상담 요청 알림은 어떻게 처리하나?
**A**: `consultation_requests` 상태 변경 시 DB 트리거 또는 애플리케이션 로직에서 Supabase Realtime을 이용해 실시간 알림을 보냅니다.

### Q5: 세금 시뮬레이션 4가지 시나리오는?
**A**:
1. `100_percent_sale`: 전액 매각
2. `partial_sale`: 부분 매각
3. `earnout`: 이후 수익 배분
4. `management_buyout`: 경영진 인수

---

## 14. 변경 이력

| 버전 | 날짜 | 변경사항 |
|------|------|---------|
| 1.0 | 2026-03-26 | 초기 문서 작성 |

---

**작성자**: DB Engineer
**마지막 수정**: 2026-03-26
**상태**: 검토 대기 중

---

## 부록: SQL DDL 전체 스크립트

전체 테이블 생성 스크립트는 Alembic 마이그레이션 파일에 포함되어 있습니다.
직접 실행 시에는 아래 순서를 따릅니다:

1. `alembic upgrade head` (모든 마이그레이션 실행)
2. `psql -U user -d dbname -f seed_data.sql` (초기 데이터 로드)
3. RLS 정책 활성화

---
