update public.ma_phase_documents
set
  title = '통합 작업 관리표',
  updated_at = now()
where document_key = 'phase-5-integration-workstream-tracker';
