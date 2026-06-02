export type TaxScenarioId = "sale" | "inheritance" | "gift" | "hybrid";

export interface TaxScenarioDefinition {
  id: TaxScenarioId;
  name: string;
  note: string;
}

export interface TaxScenarioEstimate extends TaxScenarioDefinition {
  basis: string;
  effectiveRate: number;
  formulaLabel: string;
  net: number;
  tax: number;
  warnings: string[];
}

export interface TaxScenarioComparisonRow extends TaxScenarioEstimate {
  rank: number;
  savingsAgainstBaseline: number;
  taxGapFromBest: number;
}

export interface TaxScenarioComparison {
  baselineScenarioId: TaxScenarioId;
  bestScenarioId: TaxScenarioId;
  maxSavingsAgainstBaseline: number;
  rows: TaxScenarioComparisonRow[];
  taxableBase: number;
}

export interface TaxSavingsSummary {
  baselineScenarioId: TaxScenarioId;
  bestScenarioId: TaxScenarioId;
  label: string;
  note: string;
}

export interface TaxScenarioComparisonTableRow {
  effectiveRateLabel: string;
  id: TaxScenarioId;
  name: string;
  netLabel: string;
  note: string;
  rank: number;
  savingsAgainstBaselineLabel: string;
  taxGapFromBestLabel: string;
  taxLabel: string;
}

export interface BusinessSuccessionGiftEligibilityInput {
  donorAge: number;
  isCompanyShareGift: boolean;
  isEligibleCompany: boolean;
  parentManagementYears: number;
  recipientAge: number;
  recipientIsResident: boolean;
  willBecomeCeoWithinThreeYears: boolean;
  willJoinBusinessByFilingDeadline: boolean;
  willMaintainCeoForFiveYears: boolean;
}

export interface BusinessSuccessionGiftEligibilityResult {
  isEligible: boolean;
  missingRequirements: string[];
  nextAction: string;
  postManagementWarnings: string[];
  ruleBaseDate: string;
}

export interface BusinessSuccessionGiftTaxResult {
  excessAmount: number;
  specialCap: number;
  specialTaxBase: number;
  tax: number;
}

export type BusinessSuccessionGiftReviewDecision =
  | "eligible"
  | "needs-review"
  | "not-eligible";

export interface BusinessSuccessionGiftReviewInput extends BusinessSuccessionGiftEligibilityInput {
  taxableBase: number;
}

export interface BusinessSuccessionGiftReviewResult {
  blockerCount: number;
  decision: BusinessSuccessionGiftReviewDecision;
  eligibility: BusinessSuccessionGiftEligibilityResult;
  nextAction: string;
  tax: BusinessSuccessionGiftTaxResult;
  warningCount: number;
}

export const TAX_RULE_BASE_DATE = "2026-05-31";

export const taxScenarioDefinitions: TaxScenarioDefinition[] = [
  { id: "sale", name: "양도소득세", note: "일반 지분 매각 간이 기준" },
  { id: "inheritance", name: "상속세", note: "공제 미반영 보수적 기준" },
  { id: "gift", name: "증여특례", note: "가업승계 증여특례 검토 기준" },
  { id: "hybrid", name: "혼합 전략", note: "일부 지분 매각과 승계 병행" },
];

const ONE_EOK = 100000000;
const BUSINESS_SUCCESSION_GIFT_DEDUCTION = 10 * ONE_EOK;
const BUSINESS_SUCCESSION_GIFT_LOW_RATE_LIMIT = 120 * ONE_EOK;

export function estimateTaxScenarios(taxableBase: number): TaxScenarioEstimate[] {
  return taxScenarioDefinitions.map((scenario) => estimateTaxScenario(scenario.id, taxableBase));
}

export function compareTaxScenarios(
  taxableBase: number,
  baselineScenarioId: TaxScenarioId = "sale",
): TaxScenarioComparison {
  const base = Math.max(0, taxableBase);
  const estimates = estimateTaxScenarios(base);
  const baseline = estimates.find((estimate) => estimate.id === baselineScenarioId) ?? estimates[0]!;
  const best = estimates.reduce((currentBest, estimate) =>
    estimate.tax < currentBest.tax ? estimate : currentBest,
  );
  const rows = [...estimates]
    .sort((left, right) => left.tax - right.tax)
    .map((estimate, index) => ({
      ...estimate,
      rank: index + 1,
      savingsAgainstBaseline: Math.max(0, baseline.tax - estimate.tax),
      taxGapFromBest: Math.max(0, estimate.tax - best.tax),
    }));

  return {
    baselineScenarioId: baseline.id,
    bestScenarioId: best.id,
    maxSavingsAgainstBaseline: Math.max(
      0,
      ...rows.map((estimate) => estimate.savingsAgainstBaseline),
    ),
    rows,
    taxableBase: base,
  };
}

export function buildTaxSavingsSummary(taxableBase: number): TaxSavingsSummary {
  const comparison = compareTaxScenarios(taxableBase);
  const bestScenario =
    comparison.rows.find((row) => row.id === comparison.bestScenarioId) ?? comparison.rows[0]!;

  return {
    baselineScenarioId: comparison.baselineScenarioId,
    bestScenarioId: comparison.bestScenarioId,
    label: formatTaxSavingsLabel(comparison.maxSavingsAgainstBaseline),
    note: `양도소득세 대비 ${bestScenario.name} 검토 시`,
  };
}

export function buildTaxScenarioComparisonTableRows(
  taxableBase: number,
): TaxScenarioComparisonTableRow[] {
  return compareTaxScenarios(taxableBase).rows.map((row) => ({
    effectiveRateLabel: `${(row.effectiveRate * 100).toFixed(1)}%`,
    id: row.id,
    name: row.name,
    netLabel: formatTaxSavingsLabel(row.net),
    note: row.note,
    rank: row.rank,
    savingsAgainstBaselineLabel: formatTaxSavingsLabel(row.savingsAgainstBaseline),
    taxGapFromBestLabel: formatTaxSavingsLabel(row.taxGapFromBest),
    taxLabel: formatTaxSavingsLabel(row.tax),
  }));
}

export function estimateTaxScenario(
  id: TaxScenarioId,
  taxableBase: number,
): TaxScenarioEstimate {
  const base = Math.max(0, taxableBase);
  const definition =
    taxScenarioDefinitions.find((scenario) => scenario.id === id) ?? taxScenarioDefinitions[0]!;

  if (definition.id === "gift") {
    const result = calculateBusinessSuccessionGiftTax(base);
    return buildEstimate(definition, base, result.tax, {
      basis: "가업승계 주식 등 증여재산 600억원 한도, 10억원 공제 후 10%/20% 특례세율",
      formulaLabel: "10억원 공제 + 120억원 초과분 20%",
      warnings: result.excessAmount > 0
        ? ["600억원 한도 초과분은 일반 증여세율 간이 계산으로만 반영했습니다."]
        : ["수증자, 업종, 지분, 대표이사 취임, 5년 사후관리 요건 확인이 필요합니다."],
    });
  }

  if (definition.id === "inheritance") {
    return buildEstimate(definition, base, calculateProgressiveTransferTax(base), {
      basis: "상속세 기본세율 간이 계산, 배우자공제·일괄공제·가업상속공제 미반영",
      formulaLabel: "상속세 기본 누진세율",
      warnings: ["가업상속공제 적용 여부에 따라 결과가 크게 달라질 수 있습니다."],
    });
  }

  if (definition.id === "hybrid") {
    const saleBase = base * 0.5;
    const giftBase = base - saleBase;
    const tax =
      calculateCapitalGainsTax(saleBase) + calculateBusinessSuccessionGiftTax(giftBase).tax;

    return buildEstimate(definition, base, tax, {
      basis: "50% 지분 양도 + 50% 가업승계 증여특례를 섞은 간이 비교",
      formulaLabel: "양도 50% + 증여특례 50%",
      warnings: ["실제 최적 비율은 가족관계, 취득가액, 지분 구조별로 다시 계산해야 합니다."],
    });
  }

  return buildEstimate(definition, base, calculateCapitalGainsTax(base), {
    basis: "비상장주식 양도소득세와 지방소득세를 단순 합산한 MVP 간이율",
    formulaLabel: "양도가액 기준 26.2%",
    warnings: ["취득가액, 필요경비, 대주주 여부, 중소기업 여부는 전문가 검토가 필요합니다."],
  });
}

export function calculateBusinessSuccessionGiftTax(
  taxableBase: number,
  options: { parentManagementYears?: number } = {},
): BusinessSuccessionGiftTaxResult {
  const base = Math.max(0, taxableBase);
  const specialCap = getBusinessSuccessionGiftCap(options.parentManagementYears);
  const specialAmount = Math.min(base, specialCap);
  const specialTaxBase = Math.max(0, specialAmount - BUSINESS_SUCCESSION_GIFT_DEDUCTION);
  const lowRateBase = Math.min(specialTaxBase, BUSINESS_SUCCESSION_GIFT_LOW_RATE_LIMIT);
  const highRateBase = Math.max(0, specialTaxBase - BUSINESS_SUCCESSION_GIFT_LOW_RATE_LIMIT);
  const excessAmount = Math.max(0, base - specialCap);
  const specialTax = lowRateBase * 0.1 + highRateBase * 0.2;
  const excessTax = excessAmount > 0 ? calculateProgressiveTransferTax(excessAmount) : 0;

  return {
    excessAmount,
    specialCap,
    specialTaxBase,
    tax: Math.max(0, specialTax + excessTax),
  };
}

export function getBusinessSuccessionGiftCap(parentManagementYears = 30): number {
  if (parentManagementYears >= 30) return 600 * ONE_EOK;
  if (parentManagementYears >= 20) return 400 * ONE_EOK;
  if (parentManagementYears >= 10) return 300 * ONE_EOK;
  return 0;
}

export function evaluateBusinessSuccessionGiftEligibility(
  input: BusinessSuccessionGiftEligibilityInput,
): BusinessSuccessionGiftEligibilityResult {
  const missingRequirements = [
    ...(input.isCompanyShareGift ? [] : ["가업 주식 또는 출자지분 증여"]),
    ...(input.isEligibleCompany ? [] : ["중소기업 또는 요건을 충족한 중견기업"]),
    ...(input.parentManagementYears >= 10 ? [] : ["부모의 10년 이상 계속 경영"]),
    ...(input.donorAge >= 60 ? [] : ["증여자 60세 이상 부모"]),
    ...(input.recipientAge >= 18 ? [] : ["수증자 18세 이상"]),
    ...(input.recipientIsResident ? [] : ["수증자 거주자"]),
    ...(input.willJoinBusinessByFilingDeadline ? [] : ["증여세 신고기한까지 가업 종사"]),
    ...(input.willBecomeCeoWithinThreeYears ? [] : ["증여일부터 3년 이내 대표이사 취임"]),
  ];
  const postManagementWarnings = input.willMaintainCeoForFiveYears
    ? []
    : ["증여일부터 5년까지 대표이사 유지 사후관리 필요"];

  return {
    isEligible: missingRequirements.length === 0,
    missingRequirements,
    nextAction:
      missingRequirements.length === 0
        ? "특례세율 계산값과 5년 사후관리 의무를 전문가 상담 스냅샷에 포함합니다."
        : "누락 요건을 먼저 확인한 뒤 일반 증여세 또는 다른 승계 전략과 비교합니다.",
    postManagementWarnings,
    ruleBaseDate: TAX_RULE_BASE_DATE,
  };
}

export function buildBusinessSuccessionGiftReview(
  input: BusinessSuccessionGiftReviewInput,
): BusinessSuccessionGiftReviewResult {
  const { taxableBase, ...eligibilityInput } = input;
  const eligibility = evaluateBusinessSuccessionGiftEligibility(eligibilityInput);
  const tax = calculateBusinessSuccessionGiftTax(taxableBase, {
    parentManagementYears: input.parentManagementYears,
  });
  const blockerCount = eligibility.missingRequirements.length;
  const warningCount = eligibility.postManagementWarnings.length;
  const decision = getBusinessSuccessionGiftReviewDecision(blockerCount, warningCount);

  return {
    blockerCount,
    decision,
    eligibility,
    nextAction: getBusinessSuccessionGiftReviewNextAction(decision, blockerCount, warningCount),
    tax,
    warningCount,
  };
}

export function calculateProgressiveTransferTax(taxableBase: number): number {
  const base = Math.max(0, taxableBase);

  if (base <= 1 * ONE_EOK) return base * 0.1;
  if (base <= 5 * ONE_EOK) return base * 0.2 - 0.1 * ONE_EOK;
  if (base <= 10 * ONE_EOK) return base * 0.3 - 0.6 * ONE_EOK;
  if (base <= 30 * ONE_EOK) return base * 0.4 - 1.6 * ONE_EOK;
  return base * 0.5 - 4.6 * ONE_EOK;
}

function getBusinessSuccessionGiftReviewDecision(
  blockerCount: number,
  warningCount: number,
): BusinessSuccessionGiftReviewDecision {
  if (blockerCount > 0) return "not-eligible";
  if (warningCount > 0) return "needs-review";
  return "eligible";
}

function getBusinessSuccessionGiftReviewNextAction(
  decision: BusinessSuccessionGiftReviewDecision,
  blockerCount: number,
  warningCount: number,
): string {
  if (decision === "not-eligible") {
    return `누락 요건 ${blockerCount}개를 먼저 확인한 뒤 일반 증여세 또는 다른 승계 전략과 비교합니다.`;
  }

  if (decision === "needs-review") {
    return `특례세액 계산은 가능하지만 사후관리 경고 ${warningCount}개를 상담 안건으로 올립니다.`;
  }

  return "특례세액, 적용요건, 사후관리 확인 결과를 상담 스냅샷으로 전송할 수 있습니다.";
}

function calculateCapitalGainsTax(taxableBase: number): number {
  return Math.max(0, taxableBase) * 0.262;
}

function formatTaxSavingsLabel(value: number): string {
  const safeValue = Math.max(0, value);
  if (safeValue === 0) return "0원";
  if (safeValue < ONE_EOK) return `${Math.round(safeValue / 10000).toLocaleString("ko-KR")}만원`;
  return `${(safeValue / ONE_EOK).toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  })}억`;
}

function buildEstimate(
  definition: TaxScenarioDefinition,
  taxableBase: number,
  tax: number,
  metadata: Pick<TaxScenarioEstimate, "basis" | "formulaLabel" | "warnings">,
): TaxScenarioEstimate {
  const safeTax = Math.min(Math.max(0, tax), taxableBase);

  return {
    ...definition,
    ...metadata,
    effectiveRate: taxableBase === 0 ? 0 : safeTax / taxableBase,
    net: taxableBase - safeTax,
    tax: safeTax,
  };
}
