# 07. 코딩 컨벤션

> **프로젝트**: 승계브릿지 - 기업승계형 M&A 플랫폼
> **기술 스택**: Next.js 14+ (App Router) / FastAPI / Supabase (PostgreSQL)
> **대상**: L3 개발자 (경력 개발자)
> **최종 수정**: 2026-03-26

---

## 목차

1. [프로젝트 구조](#1-프로젝트-구조)
2. [네이밍 규칙](#2-네이밍-규칙)
3. [TypeScript 규칙](#3-typescript-규칙)
4. [Python 규칙](#4-python-규칙)
5. [컴포넌트 작성 규칙](#5-컴포넌트-작성-규칙)
6. [API 설계 규칙](#6-api-설계-규칙)
7. [Git 규칙](#7-git-규칙)
8. [코드 리뷰 규칙](#8-코드-리뷰-규칙)
9. [테스트 전략](#9-테스트-전략)

---

## 1. 프로젝트 구조

### 1.1 프론트엔드 (Next.js App Router)

```
src/
  app/                        # App Router 페이지 및 레이아웃
    (auth)/                   # 인증 관련 라우트 그룹
      login/page.tsx
      register/page.tsx
    (dashboard)/              # 대시보드 라우트 그룹
      deals/                  # M&A 딜 관리
        [id]/page.tsx
        page.tsx
      companies/              # 기업 관리
        page.tsx
      layout.tsx
    api/                      # Route Handlers (BFF)
    layout.tsx                # 루트 레이아웃
    globals.css
  components/                 # 공통 컴포넌트
    ui/                       # 기본 UI (Button, Input, Modal 등)
    forms/                    # 폼 관련 컴포넌트
    layouts/                  # 레이아웃 컴포넌트 (Header, Sidebar 등)
    features/                 # 기능별 복합 컴포넌트
      deal/                   # 딜 관련 컴포넌트
      company/                # 기업 관련 컴포넌트
      valuation/              # 기업가치 평가 관련
  lib/                        # 유틸리티 및 설정
    api-client.ts             # API 클라이언트 (fetch wrapper)
    supabase/
      client.ts               # Supabase 브라우저 클라이언트
      server.ts               # Supabase 서버 클라이언트
      middleware.ts            # 인증 미들웨어
    utils/                    # 범용 유틸리티 함수
    constants.ts              # 상수 정의
  hooks/                      # 커스텀 React 훅
    use-auth.ts
    use-deals.ts
    use-debounce.ts
  types/                      # TypeScript 타입 정의
    deal.ts                   # 딜 관련 타입
    company.ts                # 기업 관련 타입
    api.ts                    # API 응답/요청 타입
    supabase.ts               # Supabase 자동생성 타입
  middleware.ts               # Next.js 미들웨어 (인증 가드)
```

### 1.2 백엔드 (FastAPI)

```
backend/
  app/
    main.py                   # FastAPI 앱 엔트리포인트
    api/
      v1/
        routes/
          auth.py             # 인증 엔드포인트
          deals.py            # 딜 CRUD
          companies.py        # 기업 관리
          valuations.py       # 기업가치 평가
        dependencies.py       # 공통 Depends
      router.py               # 라우터 통합
    services/                 # 비즈니스 로직 계층
      deal_service.py
      company_service.py
      valuation_service.py
      notification_service.py
    models/                   # Pydantic 스키마 (요청/응답)
      deal.py
      company.py
      auth.py
      common.py               # 공통 응답 모델
    core/
      config.py               # 환경변수 설정 (pydantic-settings)
      security.py             # JWT, 권한 검증
      exceptions.py           # 커스텀 예외 및 핸들러
    db/
      models.py               # SQLAlchemy ORM 모델 (필요 시)
      supabase.py             # Supabase 클라이언트
  tests/
    conftest.py
    api/
    services/
  alembic/                    # DB 마이그레이션 (필요 시)
```

### 1.3 디렉토리 원칙

| 원칙 | 설명 |
|------|------|
| **Colocation** | 라우트 전용 컴포넌트는 해당 `app/` 디렉토리에 배치 |
| **단방향 의존성** | `components/` -> `lib/`, `hooks/` -> `lib/` (역방향 금지) |
| **index 파일** | 컴포넌트 디렉토리의 public API는 `index.ts`로 re-export |
| **기능 단위 분리** | `features/` 하위는 도메인별로 분리 |

---

## 2. 네이밍 규칙

### 2.1 파일/디렉토리 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 페이지/레이아웃 | Next.js 컨벤션 | `page.tsx`, `layout.tsx`, `loading.tsx` |
| 컴포넌트 파일 | kebab-case | `deal-card.tsx`, `company-filter.tsx` |
| 훅 파일 | kebab-case + `use-` 접두사 | `use-deals.ts`, `use-auth.ts` |
| 유틸리티 파일 | kebab-case | `format-currency.ts`, `date-utils.ts` |
| 타입 파일 | kebab-case | `deal.ts`, `api-response.ts` |
| Python 파일 | snake_case | `deal_service.py`, `auth_router.py` |
| 테스트 파일 | 원본명 + `.test` / `test_` | `deal-card.test.tsx`, `test_deals.py` |
| 디렉토리 | kebab-case | `deal-management/`, `api-client/` |

### 2.2 코드 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `DealCard`, `CompanyList` |
| TypeScript 함수/변수 | camelCase | `formatCurrency()`, `dealCount` |
| TypeScript 상수 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `API_BASE_URL` |
| TypeScript 타입/인터페이스 | PascalCase | `DealResponse`, `CompanyFilter` |
| Enum 값 | PascalCase | `DealStatus.InProgress` |
| Python 함수/변수 | snake_case | `get_deal_by_id()`, `deal_count` |
| Python 클래스 | PascalCase | `DealService`, `CompanySchema` |
| Python 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 환경변수 | UPPER_SNAKE_CASE | `SUPABASE_URL`, `JWT_SECRET` |
| CSS 클래스 (Tailwind) | - | Tailwind 유틸리티 클래스 직접 사용 |

### 2.3 네이밍 금지 사항

```typescript
// Bad
const data = await fetchDeals();       // 의미 없는 이름
const handleClick = () => {};          // 무엇을 클릭하는지 불명확
const tmp = calculateValue();          // 약어 금지

// Good
const activeDeals = await fetchDeals();
const handleDealSubmit = () => {};
const estimatedValue = calculateValue();
```

---

## 3. TypeScript 규칙

### 3.1 기본 설정

```jsonc
// tsconfig.json 핵심 설정
{
  "compilerOptions": {
    "strict": true,                    // 필수: strict 모드
    "noUncheckedIndexedAccess": true,  // 배열/객체 인덱스 접근 시 undefined 체크
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 3.2 타입 정의 규칙

```typescript
// [규칙] interface 우선 사용, 유니온/인터섹션 필요 시에만 type 사용
// Good: 객체 형태는 interface
interface Deal {
  id: string;
  title: string;
  status: DealStatus;
  seller: Company;
  askingPrice: number;
  createdAt: string;
}

// Good: 유니온 타입은 type alias
type DealStatus = "draft" | "active" | "in_progress" | "closed" | "cancelled";

// Good: 유틸리티 타입 조합은 type alias
type DealSummary = Pick<Deal, "id" | "title" | "status">;

// Bad: any 사용 금지
const processData = (data: any) => {};  // 절대 금지

// Good: unknown 사용 후 타입 가드
const processData = (data: unknown) => {
  if (isDeal(data)) {
    // data는 Deal 타입
  }
};
```

### 3.3 타입 가드와 Assertion

```typescript
// 타입 가드 함수는 is 키워드 사용
function isDeal(value: unknown): value is Deal {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "title" in value
  );
}

// as 캐스팅은 최후의 수단, 사용 시 반드시 주석으로 이유 명시
const element = document.getElementById("root") as HTMLDivElement; // DOM API 반환 타입 한계
```

### 3.4 Enum 대체

```typescript
// [규칙] TypeScript enum 대신 const 객체 + as const 사용
const DEAL_STATUS = {
  Draft: "draft",
  Active: "active",
  InProgress: "in_progress",
  Closed: "closed",
  Cancelled: "cancelled",
} as const;

type DealStatus = (typeof DEAL_STATUS)[keyof typeof DEAL_STATUS];
```

### 3.5 금지 패턴

| 금지 | 대안 |
|------|------|
| `any` | `unknown` + 타입 가드 |
| `// @ts-ignore` | `// @ts-expect-error` + 사유 주석 |
| `!` (non-null assertion) | 옵셔널 체이닝 `?.` 또는 조건 분기 |
| `as` 남용 | 타입 가드, 제네릭, 오버로드 활용 |

---

## 4. Python 규칙

### 4.1 기본 설정

- Python 3.14+
- 포매터: `ruff format`
- 린터: `ruff check`
- 타입 체커: `mypy --strict`
- 라인 길이: 88자 (ruff 기본값)

### 4.2 Type Hints 필수

```python
# [규칙] 모든 함수 시그니처에 타입 힌트 필수
# Good
async def get_deal_by_id(deal_id: str, db: AsyncSession) -> Deal | None:
    ...

# Bad - 타입 힌트 누락
async def get_deal_by_id(deal_id, db):
    ...

# 컬렉션 타입은 내장 제네릭 사용 (Python 3.10+)
def filter_deals(
    deals: list[Deal],
    status: str | None = None,
    min_price: int | None = None,
) -> list[Deal]:
    ...
```

### 4.3 Pydantic 모델 패턴

```python
from pydantic import BaseModel, Field, ConfigDict


# [규칙] 요청/응답 모델은 용도별로 분리
class DealBase(BaseModel):
    """딜 공통 필드"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=5000)
    asking_price: int = Field(..., gt=0)

class DealCreate(DealBase):
    """딜 생성 요청"""
    seller_id: str

class DealUpdate(BaseModel):
    """딜 수정 요청 - 모든 필드 Optional"""
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    asking_price: int | None = Field(default=None, gt=0)

class DealResponse(DealBase):
    """딜 응답"""
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    created_at: datetime
    seller: CompanyResponse
```

### 4.4 FastAPI 라우터 패턴

```python
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("/{deal_id}", response_model=DealResponse)
async def get_deal(
    deal_id: str,
    current_user: User = Depends(get_current_user),
    deal_service: DealService = Depends(get_deal_service),
) -> DealResponse:
    """딜 상세 조회"""
    deal = await deal_service.get_by_id(deal_id)
    if deal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deal not found",
        )
    return deal
```

### 4.5 금지 패턴

```python
# Bad: f-string SQL (SQL Injection 위험)
query = f"SELECT * FROM deals WHERE id = '{deal_id}'"

# Good: 파라미터 바인딩
result = await db.execute(
    select(Deal).where(Deal.id == deal_id)
)

# Bad: 하드코딩된 시크릿
JWT_SECRET = "my-secret-key-12345"

# Good: 환경변수 (pydantic-settings)
class Settings(BaseSettings):
    jwt_secret: str = Field(..., alias="JWT_SECRET")
```

---

## 5. 컴포넌트 작성 규칙

### 5.1 기본 구조

```tsx
// [규칙] 함수형 컴포넌트 + Props 인터페이스
// 파일: components/features/deal/deal-card.tsx

interface DealCardProps {
  deal: Deal;
  onSelect?: (dealId: string) => void;
  variant?: "compact" | "detailed";
}

export function DealCard({ deal, onSelect, variant = "compact" }: DealCardProps) {
  const formattedPrice = formatCurrency(deal.askingPrice);

  const handleClick = () => {
    onSelect?.(deal.id);
  };

  return (
    <article
      className="rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-lg font-semibold">{deal.title}</h3>
      <p className="text-sm text-muted-foreground">{formattedPrice}</p>
      {variant === "detailed" && (
        <p className="mt-2 text-sm">{deal.description}</p>
      )}
    </article>
  );
}
```

### 5.2 컴포넌트 규칙 요약

| 규칙 | 설명 |
|------|------|
| **named export** | `export default` 금지, `export function` 사용 |
| **Props 인터페이스** | 컴포넌트명 + `Props` 접미사, 별도 export |
| **단일 책임** | 한 컴포넌트 = 한 역할 (150줄 초과 시 분리 검토) |
| **이벤트 핸들러** | `handle` + 동사 (내부), `on` + 동사 (Props) |
| **Server/Client 구분** | 기본은 Server Component, 상태/이벤트 필요 시에만 `"use client"` |
| **children 사용** | 합성 패턴 적극 활용, prop drilling 3단계 초과 시 Context 검토 |

### 5.3 Server Component vs Client Component

```tsx
// Server Component (기본값) - "use client" 없음
// 데이터 페칭, 정적 렌더링에 사용
export async function DealListPage() {
  const deals = await fetchDeals();  // 서버에서 직접 호출
  return <DealList deals={deals} />;
}

// Client Component - 상호작용 필요 시만
"use client";

import { useState } from "react";

export function DealFilter({ onFilterChange }: DealFilterProps) {
  const [status, setStatus] = useState<DealStatus | null>(null);
  // ...
}
```

### 5.4 커스텀 훅 패턴

```typescript
// hooks/use-deals.ts
// [규칙] 데이터 페칭 훅은 로딩/에러 상태를 함께 반환
export function useDeals(filter?: DealFilter) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadDeals() {
      try {
        setIsLoading(true);
        const data = await apiClient.getDeals(filter, {
          signal: abortController.signal,
        });
        setDeals(data);
      } catch (err) {
        if (!abortController.signal.aborted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDeals();
    return () => abortController.abort();
  }, [filter]);

  return { deals, isLoading, error } as const;
}
```

---

## 6. API 설계 규칙

### 6.1 URL 설계

```
# [규칙] RESTful 원칙 준수, 리소스 중심 설계
# 버전 접두사 필수

GET    /api/v1/deals                  # 딜 목록 조회
POST   /api/v1/deals                  # 딜 생성
GET    /api/v1/deals/{deal_id}        # 딜 상세 조회
PATCH  /api/v1/deals/{deal_id}        # 딜 부분 수정
DELETE /api/v1/deals/{deal_id}        # 딜 삭제

# 하위 리소스
GET    /api/v1/deals/{deal_id}/documents     # 딜 문서 목록
POST   /api/v1/deals/{deal_id}/documents     # 딜 문서 업로드

# 행위(action)가 필요한 경우 - 동사 허용
POST   /api/v1/deals/{deal_id}/publish       # 딜 공개
POST   /api/v1/deals/{deal_id}/close         # 딜 종료
```

### 6.2 응답 형식 표준

```json
// 성공 응답 - 단건
{
  "data": {
    "id": "deal_abc123",
    "title": "서울 강남 카페 양도",
    "status": "active"
  }
}

// 성공 응답 - 목록 (페이지네이션)
{
  "data": [
    { "id": "deal_abc123", "title": "..." }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 142,
    "totalPages": 8
  }
}

// 에러 응답
{
  "error": {
    "code": "DEAL_NOT_FOUND",
    "message": "요청한 딜을 찾을 수 없습니다.",
    "details": null
  }
}

// 검증 에러 응답
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력값이 유효하지 않습니다.",
    "details": [
      { "field": "asking_price", "message": "0보다 큰 값이어야 합니다." }
    ]
  }
}
```

### 6.3 에러 코드 표준

| HTTP Status | 에러 코드 | 사용 시점 |
|-------------|-----------|-----------|
| 400 | `VALIDATION_ERROR` | 입력값 검증 실패 |
| 400 | `INVALID_REQUEST` | 잘못된 요청 형식 |
| 401 | `UNAUTHORIZED` | 인증 필요 (토큰 없음/만료) |
| 403 | `FORBIDDEN` | 권한 부족 |
| 404 | `{RESOURCE}_NOT_FOUND` | 리소스 없음 (`DEAL_NOT_FOUND`) |
| 409 | `{RESOURCE}_ALREADY_EXISTS` | 중복 리소스 |
| 409 | `CONFLICT` | 상태 충돌 (이미 종료된 딜 수정 등) |
| 422 | `UNPROCESSABLE_ENTITY` | 비즈니스 로직 검증 실패 |
| 429 | `RATE_LIMITED` | 요청 한도 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

### 6.4 페이지네이션

```
# 쿼리 파라미터 방식 (offset 기반)
GET /api/v1/deals?page=2&page_size=20&sort=-created_at

# 필터링
GET /api/v1/deals?status=active&min_price=10000000&region=seoul
```

### 6.5 인증

```
# [규칙] Supabase Auth + JWT
# Authorization 헤더에 Bearer 토큰 전달
Authorization: Bearer <supabase_access_token>
```

---

## 7. Git 규칙

### 7.1 브랜치 전략

```
main                          # 프로덕션 배포 브랜치
  develop                     # 개발 통합 브랜치
    feature/deal-crud         # 기능 개발
    feature/company-search    # 기능 개발
    fix/deal-price-calc       # 버그 수정
    hotfix/auth-token-expire  # 긴급 수정 (main에서 분기)
    refactor/api-client       # 리팩토링
    chore/update-deps         # 의존성/설정
```

| 접두사 | 용도 | 분기 기준 | 병합 대상 |
|--------|------|-----------|-----------|
| `feature/` | 새 기능 | develop | develop |
| `fix/` | 버그 수정 | develop | develop |
| `hotfix/` | 긴급 수정 | main | main + develop |
| `refactor/` | 리팩토링 | develop | develop |
| `chore/` | 설정/의존성 | develop | develop |

### 7.2 Conventional Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**타입 목록:**

| 타입 | 용도 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat(deal): 딜 목록 필터링 추가` |
| `fix` | 버그 수정 | `fix(auth): 토큰 만료 시 리다이렉트 누락 수정` |
| `refactor` | 리팩토링 | `refactor(api): API 클라이언트 에러 핸들링 통합` |
| `test` | 테스트 | `test(deal): 딜 생성 서비스 단위 테스트 추가` |
| `docs` | 문서 | `docs: API 엔드포인트 명세 업데이트` |
| `style` | 포매팅 | `style: ruff format 적용` |
| `chore` | 빌드/설정 | `chore: vitest 설정 추가` |
| `perf` | 성능 개선 | `perf(deal): 딜 목록 쿼리 최적화` |

**커밋 메시지 규칙:**
- 제목은 50자 이내, 본문은 72자에서 줄바꿈
- 한글 사용 가능 (description 부분)
- `scope`는 기능 도메인 단위: `deal`, `auth`, `company`, `valuation`, `api`
- 제목에 마침표 금지

### 7.3 커밋 단위

```
# Good - 하나의 논리적 변경 = 하나의 커밋
feat(deal): 딜 생성 API 엔드포인트 구현
feat(deal): 딜 생성 폼 UI 구현
test(deal): 딜 생성 통합 테스트 추가

# Bad - 여러 변경을 하나에 몰아넣기
feat: 딜 기능 구현 (API + UI + 테스트)
```

---

## 8. 코드 리뷰 규칙

### 8.1 PR 작성 규칙

```markdown
## 변경 사항
- 딜 목록 조회 API 구현 (GET /api/v1/deals)
- 페이지네이션 및 필터링 지원

## 리뷰 포인트
- [ ] DealService.list_deals()의 쿼리 최적화 검토
- [ ] 페이지네이션 응답 형식이 표준과 일치하는지 확인

## 테스트
- pytest: 12/12 통과
- 수동 테스트: Swagger UI에서 확인 완료

## 스크린샷 (UI 변경 시)
(해당 없음)
```

### 8.2 리뷰어 체크리스트

| 항목 | 확인 내용 |
|------|-----------|
| **기능** | 요구사항 충족 여부 |
| **타입 안전성** | `any`, `as` 남용 없는지 |
| **에러 처리** | 예외 상황 누락 없는지 |
| **보안** | SQL Injection, XSS, 인증/인가 누락 |
| **성능** | N+1 쿼리, 불필요한 리렌더링 |
| **테스트** | 핵심 경로 테스트 존재 여부 |
| **네이밍** | 컨벤션 준수 여부 |

### 8.3 리뷰 에티켓

- **Approve 기준**: 핵심 로직에 문제없으면 nit 코멘트와 함께 승인
- **Request Changes 기준**: 보안 이슈, 버그, 설계 결함이 있을 때만
- **리뷰 응답**: 24시간 이내 1차 리뷰 완료
- **코멘트 접두사**: `nit:` (사소한 제안), `question:` (질문), `suggestion:` (대안 제시), `blocker:` (반드시 수정)

---

## 9. 테스트 전략

### 9.1 테스트 피라미드

```
         /  E2E  \           # Playwright (핵심 플로우만)
        /----------\
       / Integration \       # API 통합 테스트 (pytest + httpx)
      /----------------\
     /    Unit Tests     \   # 비즈니스 로직 (pytest + vitest)
    /____________________\
```

| 레벨 | 프론트엔드 | 백엔드 | 커버리지 목표 |
|------|-----------|--------|-------------|
| Unit | vitest + React Testing Library | pytest | 70% 이상 |
| Integration | - | pytest + httpx (TestClient) | 핵심 API 100% |
| E2E | Playwright | - | 핵심 시나리오 |

### 9.2 프론트엔드 테스트 (vitest)

```typescript
// components/features/deal/__tests__/deal-card.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DealCard } from "../deal-card";

describe("DealCard", () => {
  const mockDeal: Deal = {
    id: "deal_1",
    title: "테스트 딜",
    status: "active",
    askingPrice: 50000000,
    // ...
  };

  it("딜 제목과 가격을 렌더링한다", () => {
    render(<DealCard deal={mockDeal} />);

    expect(screen.getByText("테스트 딜")).toBeInTheDocument();
    expect(screen.getByText("5,000만원")).toBeInTheDocument();
  });

  it("클릭 시 onSelect 콜백을 호출한다", async () => {
    const handleSelect = vi.fn();
    render(<DealCard deal={mockDeal} onSelect={handleSelect} />);

    await userEvent.click(screen.getByRole("article"));

    expect(handleSelect).toHaveBeenCalledWith("deal_1");
  });
});
```

### 9.3 백엔드 테스트 (pytest)

```python
# tests/api/test_deals.py
import pytest
from httpx import AsyncClient


@pytest.fixture
def sample_deal_data() -> dict:
    return {
        "title": "테스트 딜",
        "description": "설명",
        "asking_price": 50_000_000,
        "seller_id": "company_1",
    }


class TestDealAPI:
    """딜 API 테스트"""

    @pytest.mark.asyncio
    async def test_create_deal_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_deal_data: dict,
    ) -> None:
        """딜 생성 - 정상 케이스"""
        response = await client.post(
            "/api/v1/deals",
            json=sample_deal_data,
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()["data"]
        assert data["title"] == sample_deal_data["title"]
        assert data["status"] == "draft"

    @pytest.mark.asyncio
    async def test_create_deal_invalid_price(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_deal_data: dict,
    ) -> None:
        """딜 생성 - 가격 음수 시 422 반환"""
        sample_deal_data["asking_price"] = -1000

        response = await client.post(
            "/api/v1/deals",
            json=sample_deal_data,
            headers=auth_headers,
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_deal_not_found(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ) -> None:
        """존재하지 않는 딜 조회 시 404 반환"""
        response = await client.get(
            "/api/v1/deals/nonexistent",
            headers=auth_headers,
        )

        assert response.status_code == 404
        assert response.json()["error"]["code"] == "DEAL_NOT_FOUND"
```

### 9.4 테스트 네이밍 규칙

```python
# Python: 한글 docstring으로 의도 명시
async def test_create_deal_success(self):
    """딜 생성 - 정상 케이스"""

async def test_create_deal_without_auth(self):
    """딜 생성 - 미인증 시 401 반환"""

async def test_update_deal_forbidden(self):
    """딜 수정 - 권한 없는 사용자 시 403 반환"""
```

```typescript
// TypeScript: describe + it 조합으로 가독성 확보
describe("DealCard", () => {
  it("딜 제목과 가격을 렌더링한다", () => {});
  it("variant가 detailed이면 설명을 표시한다", () => {});
  it("클릭 시 onSelect 콜백을 호출한다", () => {});
});
```

### 9.5 테스트 실행 명령

```bash
# 백엔드 전체 테스트
pytest -v --cov=app --cov-report=term-missing

# 백엔드 특정 모듈
pytest tests/api/test_deals.py -v

# 프론트엔드 전체 테스트
npx vitest run

# 프론트엔드 watch 모드
npx vitest

# 프론트엔드 커버리지
npx vitest run --coverage
```

---

## 부록: 도구 설정 요약

| 도구 | 프론트엔드 | 백엔드 |
|------|-----------|--------|
| 포매터 | Prettier | ruff format |
| 린터 | ESLint (flat config) | ruff check |
| 타입 체크 | TypeScript (strict) | mypy (strict) |
| 테스트 | vitest + RTL | pytest + httpx |
| E2E | Playwright | - |
| Git Hooks | husky + lint-staged | pre-commit |
