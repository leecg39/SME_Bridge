create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  name varchar(100) not null,
  role varchar(20) not null default 'ceo' check (role in ('ceo', 'expert', 'admin')),
  phone varchar(20),
  company_name varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_name varchar(255) not null,
  industry varchar(100),
  founded_year integer,
  employee_count integer,
  annual_revenue numeric(15,2),
  status varchar(30) not null default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.valuations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  valuation_date date not null default current_date,
  fiscal_year integer not null,
  ebitda_amount numeric(15,2) not null,
  valuation_range_low numeric(15,2),
  valuation_range_high numeric(15,2),
  snapshot_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tax_simulations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  simulation_date date not null default current_date,
  scenario varchar(50) not null,
  total_tax numeric(15,2) not null,
  net_proceeds numeric(15,2) not null,
  assumptions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.roadmap_tasks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  phase_number integer not null check (phase_number between 1 and 5),
  task_title varchar(255) not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  company_name varchar(255) not null,
  requester_name varchar(100) not null,
  requester_phone varchar(20) not null,
  requester_email varchar(255) not null,
  consultation_type varchar(30) not null check (consultation_type in ('tax', 'legal', 'valuation', 'mna', 'general')),
  title varchar(255) not null,
  description text not null,
  status varchar(30) not null default 'pending' check (status in ('pending', 'accepted', 'completed', 'declined')),
  privacy_consent boolean not null default false,
  external_transfer_consent boolean not null default false,
  snapshot_json jsonb not null default '{}'::jsonb,
  share_sensitive_files boolean not null default false,
  sensitive_files_consented_at timestamptz,
  patasos_sync_status varchar(30) not null default 'not_requested'
    check (patasos_sync_status in ('not_requested', 'pending', 'sent', 'failed')),
  patasos_issue_id varchar(100),
  patasos_issue_identifier varchar(100),
  patasos_issue_url varchar(500),
  patasos_synced_at timestamptz,
  patasos_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_companies_user_id on public.companies(user_id);
create index if not exists idx_valuations_company_id on public.valuations(company_id);
create index if not exists idx_tax_simulations_company_id on public.tax_simulations(company_id);
create index if not exists idx_roadmap_tasks_company_id on public.roadmap_tasks(company_id);
create index if not exists idx_consultation_requests_company_id on public.consultation_requests(company_id);
create index if not exists idx_consultation_requests_patasos_sync_status
  on public.consultation_requests(patasos_sync_status);

alter table public.companies enable row level security;
alter table public.valuations enable row level security;
alter table public.tax_simulations enable row level security;
alter table public.roadmap_tasks enable row level security;
alter table public.consultation_requests enable row level security;

create policy "Users can view own companies"
  on public.companies for select
  using (user_id = auth.uid());

create policy "Users can manage own consultation requests"
  on public.consultation_requests for all
  using (
    company_id in (select id from public.companies where user_id = auth.uid())
  )
  with check (
    company_id in (select id from public.companies where user_id = auth.uid())
  );
