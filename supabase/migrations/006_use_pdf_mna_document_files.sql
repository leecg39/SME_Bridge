update public.ma_phase_documents
set
  file_path = case document_key
    when 'phase-1-strategy-brief' then '/templates/ma-pdf/phase-1-strategy-brief.pdf'
    when 'phase-1-synergy-hypothesis' then '/templates/ma-pdf/phase-1-synergy-hypothesis.pdf'
    when 'phase-1-approval-memo' then '/templates/ma-pdf/phase-1-approval-memo.pdf'
    when 'phase-2-target-screening-matrix' then '/templates/ma-pdf/phase-2-target-screening-matrix.pdf'
    when 'nda-template' then '/templates/ma-pdf/nda-template.pdf'
    when 'phase-2-target-approach-log' then '/templates/ma-pdf/phase-2-target-approach-log.pdf'
    when 'loi-template' then '/templates/ma-pdf/loi-template.pdf'
    when 'dd-request-list' then '/templates/ma-pdf/dd-request-list.pdf'
    when 'phase-3-data-room-index' then '/templates/ma-pdf/phase-3-data-room-index.pdf'
    when 'phase-3-red-flag-log' then '/templates/ma-pdf/phase-3-red-flag-log.pdf'
    when 'phase-3-valuation-workbook-checklist' then '/templates/ma-pdf/phase-3-valuation-workbook-checklist.pdf'
    when 'phase-4-spa-key-terms-checklist' then '/templates/ma-pdf/phase-4-spa-key-terms-checklist.pdf'
    when 'phase-4-disclosure-schedule-tracker' then '/templates/ma-pdf/phase-4-disclosure-schedule-tracker.pdf'
    when 'closing-day-checklist' then '/templates/ma-pdf/closing-day-checklist.pdf'
    when 'phase-5-pmi-100-day-plan' then '/templates/ma-pdf/phase-5-pmi-100-day-plan.pdf'
    when 'phase-5-day-1-communication-plan' then '/templates/ma-pdf/phase-5-day-1-communication-plan.pdf'
    when 'employee-transfer-plan' then '/templates/ma-pdf/employee-transfer-plan.pdf'
    when 'phase-5-integration-workstream-tracker' then '/templates/ma-pdf/phase-5-integration-workstream-tracker.pdf'
    else file_path
  end,
  updated_at = now()
where document_key in (
  'phase-1-strategy-brief',
  'phase-1-synergy-hypothesis',
  'phase-1-approval-memo',
  'phase-2-target-screening-matrix',
  'nda-template',
  'phase-2-target-approach-log',
  'loi-template',
  'dd-request-list',
  'phase-3-data-room-index',
  'phase-3-red-flag-log',
  'phase-3-valuation-workbook-checklist',
  'phase-4-spa-key-terms-checklist',
  'phase-4-disclosure-schedule-tracker',
  'closing-day-checklist',
  'phase-5-pmi-100-day-plan',
  'phase-5-day-1-communication-plan',
  'employee-transfer-plan',
  'phase-5-integration-workstream-tracker'
);
