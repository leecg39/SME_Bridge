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

export const TAX_RULE_BASE_DATE = "2026-05-31";

export const taxScenarioDefinitions: TaxScenarioDefinition[] = [
  { id: "sale", name: "양도소득세", note: "일반 지분 매각 간이 기준" },
  { id: "inheritance", name: "상속세", note: "공제 미반영 보수적 기준" },
  { id: "gift", name: "증여특례", note: "가업승계 증여특례 검토 기준" },
  { id: "hybrid", name: "혼합 전략", note: "일부 지분 매각과 승계 병행" },
];

const ONE_EOK = 100000000;
const BUSINESS_SUCCESSION_GIFT_CAP = 600 * ONE_EOK;
const BUSINESS_SUCCESSION_GIFT_DEDUCTION = 10 * ONE_EOK;
const BUSINESS_SUCCESSION_GIFT_LOW_RATE_LIMIT = 120 * ONE_EOK;

export function estimateTaxScenarios(taxableBase: number): TaxScenarioEstimate[] {
  return taxScenarioDefinitions.map((scenario) => estimateTaxScenario(scenario.id, taxableBase));
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

export function calculateBusinessSuccessionGiftTax(taxableBase: number) {
  const base = Math.max(0, taxableBase);
  const specialAmount = Math.min(base, BUSINESS_SUCCESSION_GIFT_CAP);
  const specialTaxBase = Math.max(0, specialAmount - BUSINESS_SUCCESSION_GIFT_DEDUCTION);
  const lowRateBase = Math.min(specialTaxBase, BUSINESS_SUCCESSION_GIFT_LOW_RATE_LIMIT);
  const highRateBase = Math.max(0, specialTaxBase - BUSINESS_SUCCESSION_GIFT_LOW_RATE_LIMIT);
  const excessAmount = Math.max(0, base - BUSINESS_SUCCESSION_GIFT_CAP);
  const specialTax = lowRateBase * 0.1 + highRateBase * 0.2;
  const excessTax = excessAmount > 0 ? calculateProgressiveTransferTax(excessAmount) : 0;

  return {
    excessAmount,
    specialTaxBase,
    tax: Math.max(0, specialTax + excessTax),
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

function calculateCapitalGainsTax(taxableBase: number): number {
  return Math.max(0, taxableBase) * 0.262;
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
