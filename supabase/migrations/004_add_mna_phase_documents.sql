create table if not exists public.ma_roadmap_phases (
  phase integer primary key check (phase between 1 and 5),
  code varchar(40) not null unique,
  name varchar(100) not null,
  duration varchar(40) not null,
  tasks jsonb not null default '[]'::jsonb,
  sort_order integer not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.ma_phase_documents (
  id uuid primary key default gen_random_uuid(),
  phase integer not null references public.ma_roadmap_phases(phase) on delete cascade,
  document_key varchar(100) not null unique,
  title varchar(140) not null,
  description text not null,
  file_path varchar(255) not null,
  category varchar(40) not null default 'template',
  is_required boolean not null default true,
  sort_order integer not null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_ma_phase_documents_phase
  on public.ma_phase_documents(phase);

insert into public.ma_roadmap_phases (
  phase,
  code,
  name,
  duration,
  tasks,
  sort_order
)
values
  (
    1,
    'preparation',
    '매각 준비',
    '3~6개월',
    jsonb_build_array(
      '기업승계 M&A 컨설팅 지원사업 자격 확인',
      '최근 3개년 재무제표 준비',
      '임대차 계약서 정리',
      '주요 거래처 매출 비중 확인'
    ),
    1
  ),
  (
    2,
    'marketing',
    '마케팅',
    '2~3개월',
    jsonb_build_array('티저 작성', 'NDA 준비', '인수후보 롱리스트 작성'),
    2
  ),
  (
    3,
    'diligence',
    '실사',
    '1~2개월',
    jsonb_build_array('재무 실사 자료실 구성', '법률 리스크 점검', '노무 이슈 확인'),
    3
  ),
  (
    4,
    'negotiation',
    '협상/계약',
    '1~2개월',
    jsonb_build_array('LOI 검토', '가격 조정 조건 정리', 'SPA 주요 조항 검토'),
    4
  ),
  (
    5,
    'closing-pmi',
    '클로징/PMI',
    '1~3개월',
    jsonb_build_array('대금 수수 준비', '경영권 이전 일정', '직원 커뮤니케이션 계획'),
    5
  )
on conflict (phase) do update
set
  code = excluded.code,
  name = excluded.name,
  duration = excluded.duration,
  tasks = excluded.tasks,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.ma_phase_documents (
  phase,
  document_key,
  title,
  description,
  file_path,
  category,
  is_required,
  sort_order
)
values
  (
    1,
    'phase-1-strategy-brief',
    'M&A 전략 정의서',
    '거래 목적, 성공 기준, 승인권자를 한 장으로 정리합니다.',
    '/templates/ma/phase-1-strategy-brief.md',
    'strategy',
    true,
    1
  ),
  (
    1,
    'phase-1-synergy-hypothesis',
    '시너지 가설 정리표',
    '매출, 비용, 기술, 조직 시너지와 검증 자료를 정리합니다.',
    '/templates/ma/phase-1-synergy-hypothesis.md',
    'strategy',
    true,
    2
  ),
  (
    1,
    'phase-1-approval-memo',
    '검토 착수 승인 메모',
    '후보 탐색과 자문 착수 전 내부 승인 근거를 남깁니다.',
    '/templates/ma/phase-1-approval-memo.md',
    'governance',
    true,
    3
  ),
  (
    2,
    'phase-2-target-screening-matrix',
    '후보 Long List 평가표',
    '후보 기업을 전략 적합성, 재무 성과, 거래 가능성으로 비교합니다.',
    '/templates/ma/phase-2-target-screening-matrix.md',
    'screening',
    true,
    1
  ),
  (
    2,
    'nda-template',
    'NDA 양식',
    '자료 제공 전 비밀정보 범위와 사용 목적 제한을 확인합니다.',
    '/templates/nda-template.md',
    'legal',
    true,
    2
  ),
  (
    2,
    'phase-2-target-approach-log',
    '대상 접촉 기록지',
    '후보 접촉 이력, 수령 자료, 다음 액션을 추적합니다.',
    '/templates/ma/phase-2-target-approach-log.md',
    'screening',
    true,
    3
  ),
  (
    2,
    'loi-template',
    'LOI 양식',
    '가격 범위, 독점 협상권, 실사 범위와 주요 조건을 정리합니다.',
    '/templates/loi-template.md',
    'legal',
    true,
    4
  ),
  (
    3,
    'dd-request-list',
    '실사 요청자료 목록',
    '재무, 세무, 법률, 인사, 영업, IT 자료와 상태를 관리합니다.',
    '/templates/dd-request-list.md',
    'diligence',
    true,
    1
  ),
  (
    3,
    'phase-3-data-room-index',
    '데이터룸 인덱스',
    '자료실 폴더, 파일 버전, 접근 권한과 검토 상태를 관리합니다.',
    '/templates/ma/phase-3-data-room-index.md',
    'diligence',
    true,
    2
  ),
  (
    3,
    'phase-3-red-flag-log',
    'Red Flag 이슈 로그',
    '거래 중단, 가격 조정, 조건 변경 이슈를 기록합니다.',
    '/templates/ma/phase-3-red-flag-log.md',
    'risk',
    true,
    3
  ),
  (
    3,
    'phase-3-valuation-workbook-checklist',
    '가치평가 준비 체크리스트',
    'DCF, EV/EBITDA, 유사 거래 비교에 필요한 입력 자료를 점검합니다.',
    '/templates/ma/phase-3-valuation-workbook-checklist.md',
    'valuation',
    true,
    4
  ),
  (
    4,
    'phase-4-spa-key-terms-checklist',
    'SPA 핵심 조항 체크리스트',
    '가격 조정, 진술보장, 손해배상, 선행조건을 조항별로 점검합니다.',
    '/templates/ma/phase-4-spa-key-terms-checklist.md',
    'legal',
    true,
    1
  ),
  (
    4,
    'phase-4-disclosure-schedule-tracker',
    'Disclosure Schedule 추적표',
    '진술보장 예외 공시 항목과 검토 이력을 관리합니다.',
    '/templates/ma/phase-4-disclosure-schedule-tracker.md',
    'legal',
    true,
    2
  ),
  (
    4,
    'closing-day-checklist',
    'Closing 체크리스트',
    '선행조건, 서명, 대금 지급, 주식/자산 이전을 점검합니다.',
    '/templates/closing-day-checklist.md',
    'closing',
    true,
    3
  ),
  (
    5,
    'phase-5-pmi-100-day-plan',
    'PMI 100일 실행계획',
    '핵심 KPI, 주차별 실행 과제, 초기 리스크 대응을 정리합니다.',
    '/templates/ma/phase-5-pmi-100-day-plan.md',
    'integration',
    true,
    1
  ),
  (
    5,
    'phase-5-day-1-communication-plan',
    'Day 1 커뮤니케이션 계획서',
    '임직원, 고객, 공급사, 금융기관 대상 메시지와 일정을 준비합니다.',
    '/templates/ma/phase-5-day-1-communication-plan.md',
    'integration',
    true,
    2
  ),
  (
    5,
    'employee-transfer-plan',
    '직원 승계 계획서',
    '핵심 인력 유지와 고용 승계 메시지를 정리합니다.',
    '/templates/employee-transfer-plan.md',
    'hr',
    true,
    3
  ),
  (
    5,
    'phase-5-integration-workstream-tracker',
    '통합 Workstream 관리표',
    '재무, 인사, 영업, IT 등 통합 과제와 PMO 회의를 관리합니다.',
    '/templates/ma/phase-5-integration-workstream-tracker.md',
    'integration',
    true,
    4
  )
on conflict (document_key) do update
set
  phase = excluded.phase,
  title = excluded.title,
  description = excluded.description,
  file_path = excluded.file_path,
  category = excluded.category,
  is_required = excluded.is_required,
  sort_order = excluded.sort_order,
  updated_at = now();

alter table public.ma_roadmap_phases enable row level security;
alter table public.ma_phase_documents enable row level security;

drop policy if exists "Public can read M&A roadmap phases" on public.ma_roadmap_phases;
create policy "Public can read M&A roadmap phases"
  on public.ma_roadmap_phases for select
  using (true);

drop policy if exists "Public can read M&A phase documents" on public.ma_phase_documents;
create policy "Public can read M&A phase documents"
  on public.ma_phase_documents for select
  using (true);
