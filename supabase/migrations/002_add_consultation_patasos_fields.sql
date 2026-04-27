alter table public.consultation_requests
  add column if not exists company_name varchar(255),
  add column if not exists requester_name varchar(100),
  add column if not exists requester_phone varchar(20),
  add column if not exists requester_email varchar(255),
  add column if not exists privacy_consent boolean not null default false,
  add column if not exists external_transfer_consent boolean not null default false,
  add column if not exists snapshot_json jsonb not null default '{}'::jsonb,
  add column if not exists share_sensitive_files boolean not null default false,
  add column if not exists sensitive_files_consented_at timestamptz,
  add column if not exists patasos_sync_status varchar(30) not null default 'not_requested',
  add column if not exists patasos_issue_id varchar(100),
  add column if not exists patasos_issue_identifier varchar(100),
  add column if not exists patasos_issue_url varchar(500),
  add column if not exists patasos_synced_at timestamptz,
  add column if not exists patasos_sync_error text;

update public.consultation_requests cr
set company_name = coalesce(cr.company_name, c.company_name, '')
from public.companies c
where cr.company_id = c.id
  and cr.company_name is null;

update public.consultation_requests
set
  company_name = coalesce(company_name, ''),
  requester_name = coalesce(requester_name, ''),
  requester_phone = coalesce(requester_phone, ''),
  requester_email = coalesce(requester_email, '')
where company_name is null
  or requester_name is null
  or requester_phone is null
  or requester_email is null;

alter table public.consultation_requests
  alter column company_name set not null,
  alter column requester_name set not null,
  alter column requester_phone set not null,
  alter column requester_email set not null;

do $$
declare
  check_name text;
begin
  for check_name in
    select conname
    from pg_constraint
    where conrelid = 'public.consultation_requests'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%consultation_type%'
  loop
    execute format('alter table public.consultation_requests drop constraint %I', check_name);
  end loop;
end $$;

alter table public.consultation_requests
  add constraint consultation_requests_consultation_type_check
  check (consultation_type in ('tax', 'legal', 'accounting', 'business', 'valuation', 'mna', 'general'));

alter table public.consultation_requests
  drop constraint if exists consultation_requests_patasos_sync_status_check,
  add constraint consultation_requests_patasos_sync_status_check
  check (patasos_sync_status in ('not_requested', 'pending', 'sent', 'failed'));

create index if not exists idx_consultation_requests_patasos_sync_status
  on public.consultation_requests(patasos_sync_status);

alter table public.valuations
  add column if not exists snapshot_json jsonb not null default '{}'::jsonb;
