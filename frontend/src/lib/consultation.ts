import {
  deriveValuationMultiples,
  type ValuationResult,
} from "./valuation";
import { buildTaxSavingsSummary, compareTaxScenarios, type TaxScenarioId } from "./tax";

export type ConsultationType = "tax" | "legal" | "valuation" | "mna" | "general";
export type PatasosSyncStatus = "not_requested" | "pending" | "sent" | "failed";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface BuildConsultationPayloadInput {
  companyId: string;
  companyName: string;
  requesterName: string;
  requesterPhone: string;
  requesterEmail: string;
  consultationType: ConsultationType;
  title: string;
  description: string;
  privacyConsent: boolean;
  externalTransferConsent: boolean;
  includeProgressSnapshot: boolean;
  shareSensitiveFiles: boolean;
  snapshot: Record<string, JsonValue>;
}

export interface ConsultationPayload {
  company_id: string;
  company_name: string;
  requester_name: string;
  requester_phone: string;
  requester_email: string;
  consultation_type: ConsultationType;
  title: string;
  description: string;
  privacy_consent: boolean;
  external_transfer_consent: boolean;
  share_sensitive_files: boolean;
  snapshot_json: Record<string, JsonValue>;
}

export interface ConsultationRecord extends ConsultationPayload {
  id: string;
  status: string;
  patasos_sync_status: PatasosSyncStatus;
  patasos_issue_id: string | null;
  patasos_issue_identifier: string | null;
  patasos_issue_url: string | null;
  patasos_sync_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardConsultationRow {
  id: string;
  nextActionLabel: string | null;
  patasosStatusLabel: string;
  requestStatusLabel: string;
  savingsLabel: string | null;
  selectedScenarioLabel: string | null;
  title: string;
}

const SENSITIVE_KEYS = new Set([
  "file_url",
  "fileUrl",
  "source_file_url",
  "sourceFileUrl",
  "signed_url",
  "signedUrl",
  "raw_financial_statements",
  "rawFinancialStatements",
  "attachments",
  "documents",
]);

export const consultationTypeLabels: Record<ConsultationType, string> = {
  tax: "세무 상담",
  legal: "법률 상담",
  valuation: "가치평가 상담",
  mna: "M&A 자문",
  general: "종합 상담",
};

export function buildConsultationPayload(
  input: BuildConsultationPayloadInput,
): ConsultationPayload {
  return {
    company_id: input.companyId,
    company_name: input.companyName,
    requester_name: input.requesterName,
    requester_phone: input.requesterPhone,
    requester_email: input.requesterEmail,
    consultation_type: input.consultationType,
    title: input.title,
    description: input.description,
    privacy_consent: input.privacyConsent,
    external_transfer_consent: input.externalTransferConsent,
    share_sensitive_files: input.shareSensitiveFiles,
    snapshot_json: input.includeProgressSnapshot ? sanitizeSnapshotObject(input.snapshot) : {},
  };
}

export function consultationStatusLabel(status: PatasosSyncStatus): string {
  const labels: Record<PatasosSyncStatus, string> = {
    not_requested: "접수됨",
    pending: "Patasos 전달중",
    sent: "Patasos 전달완료",
    failed: "전달 실패",
  };
  return labels[status];
}

export function buildDashboardConsultationRows(
  consultations: ConsultationRecord[],
): DashboardConsultationRow[] {
  return consultations.map((item) => {
    const selectedScenario = selectedTaxScenarioFromSnapshot(item.snapshot_json);
    const selectedScenarioId = selectedTaxScenarioIdFromSnapshot(item.snapshot_json);
    const savingsLabel = taxSavingsLabelFromSnapshot(item.snapshot_json);

    return {
      id: item.id,
      nextActionLabel: selectedScenarioId
        ? nextTaxActionLabelFromScenarioId(selectedScenarioId)
        : null,
      patasosStatusLabel: consultationStatusLabel(item.patasos_sync_status),
      requestStatusLabel: consultationRequestStatusLabel(item.status),
      savingsLabel: savingsLabel ? `예상 절세 효과: ${savingsLabel}` : null,
      selectedScenarioLabel: selectedScenario ? `선택 전략: ${selectedScenario}` : null,
      title: item.title,
    };
  });
}

export function mergeValuationIntoConsultationSnapshot(
  snapshot: Record<string, JsonValue>,
  valuation: ValuationResult,
): Record<string, JsonValue> {
  const previousValuation =
    snapshot.valuation !== null &&
    !Array.isArray(snapshot.valuation) &&
    typeof snapshot.valuation === "object"
      ? snapshot.valuation
      : {};
  const multiples = deriveValuationMultiples(valuation);

  return {
    ...snapshot,
    valuation: {
      ...previousValuation,
      ebitda: valuation.normalizedEbitda,
      rangeLow: valuation.rangeLow,
      rangeMid: valuation.rangeMid,
      rangeHigh: valuation.rangeHigh,
      scenario: `중립 EV/EBITDA ${multiples.mid}x`,
      calculatedAt: valuation.calculatedAt,
    },
  };
}

export function mergeValuationAndTaxIntoConsultationSnapshot(
  snapshot: Record<string, JsonValue>,
  valuation: ValuationResult,
  selectedTaxScenarioId?: TaxScenarioId,
): Record<string, JsonValue> {
  const mergedSnapshot = mergeValuationIntoConsultationSnapshot(snapshot, valuation);
  const taxSummary = buildTaxSavingsSummary(valuation.rangeMid);
  const comparison = compareTaxScenarios(valuation.rangeMid);
  const bestRow =
    comparison.rows.find((row) => row.id === comparison.bestScenarioId) ?? comparison.rows[0]!;
  const selectedRow = selectedTaxScenarioId
    ? comparison.rows.find((row) => row.id === selectedTaxScenarioId)
    : undefined;

  return {
    ...mergedSnapshot,
    tax: {
      baselineScenarioId: taxSummary.baselineScenarioId,
      bestScenario: bestRow.name,
      bestScenarioId: taxSummary.bestScenarioId,
      estimatedSaving: comparison.maxSavingsAgainstBaseline,
      savingsLabel: taxSummary.label,
      ...(selectedRow
        ? {
            selectedScenario: selectedRow.name,
            selectedScenarioId: selectedRow.id,
            selectedScenarioNote: selectedRow.note,
            selectedScenarioTax: selectedRow.tax,
          }
        : {}),
      summaryNote: taxSummary.note,
    },
  };
}

function sanitizeSnapshot(value: JsonValue): JsonValue {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeSnapshot(item));
  }
  if (value !== null && typeof value === "object") {
    const sanitized: Record<string, JsonValue> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key) || key.toLowerCase().includes("url")) {
        continue;
      }
      sanitized[key] = sanitizeSnapshot(nested);
    }
    return sanitized;
  }
  return value;
}

function consultationRequestStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    cancelled: "취소됨",
    completed: "완료",
    in_progress: "진행중",
    pending: "접수됨",
    requested: "접수됨",
  };

  return labels[status] ?? status;
}

function sanitizeSnapshotObject(value: Record<string, JsonValue>): Record<string, JsonValue> {
  const sanitized = sanitizeSnapshot(value);
  return sanitized !== null && !Array.isArray(sanitized) && typeof sanitized === "object"
    ? sanitized
    : {};
}

function selectedTaxScenarioFromSnapshot(snapshot: Record<string, JsonValue>): string | null {
  const tax =
    snapshot.tax !== null && !Array.isArray(snapshot.tax) && typeof snapshot.tax === "object"
      ? snapshot.tax
      : null;

  return typeof tax?.selectedScenario === "string" ? tax.selectedScenario : null;
}

function selectedTaxScenarioIdFromSnapshot(
  snapshot: Record<string, JsonValue>,
): TaxScenarioId | null {
  const tax =
    snapshot.tax !== null && !Array.isArray(snapshot.tax) && typeof snapshot.tax === "object"
      ? snapshot.tax
      : null;

  if (
    tax?.selectedScenarioId === "sale" ||
    tax?.selectedScenarioId === "inheritance" ||
    tax?.selectedScenarioId === "gift" ||
    tax?.selectedScenarioId === "hybrid"
  ) {
    return tax.selectedScenarioId;
  }

  return null;
}

function taxSavingsLabelFromSnapshot(snapshot: Record<string, JsonValue>): string | null {
  const tax =
    snapshot.tax !== null && !Array.isArray(snapshot.tax) && typeof snapshot.tax === "object"
      ? snapshot.tax
      : null;

  return typeof tax?.savingsLabel === "string" ? tax.savingsLabel : null;
}

function nextTaxActionLabelFromScenarioId(scenarioId: TaxScenarioId): string {
  const labels: Record<TaxScenarioId, string> = {
    gift: "다음 확인: 10년 경영·대표이사 취임·5년 사후관리 요건",
    hybrid: "다음 확인: 가족관계·취득가액·지분 구조별 최적 비율 재계산",
    inheritance: "다음 확인: 가업상속공제 적용 여부와 상속세 공제 구조",
    sale: "다음 확인: 취득가액·필요경비·대주주 여부",
  };

  return labels[scenarioId];
}
