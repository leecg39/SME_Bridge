export interface Financials {
  years: number[];
  revenue: number[];
  operatingIncome: number[];
  depreciation: number[];
}

export interface ValuationResult {
  normalizedEbitda: number;
  rangeLow: number;
  rangeMid: number;
  rangeHigh: number;
  ownerSalaryAdjustment: boolean;
  calculatedAt: string;
}

export interface ValuationMultiples {
  low: number;
  mid: number;
  high: number;
}

export interface ValuationResultCard {
  id: "low" | "mid" | "high";
  title: string;
  valueLabel: string;
  multipleLabel: string;
}

export const FINANCIALS_STORAGE_KEY = "smeBridgeFinancials";
export const VALUATION_STORAGE_KEY = "smeBridgeValuation";
export const DEFAULT_VALUATION_MULTIPLES: ValuationMultiples = {
  low: 3.7,
  mid: 4.8,
  high: 5.5,
};

export const fallbackFinancials: Financials = {
  years: [2022, 2023, 2024],
  revenue: [2960000000, 3550000000, 4700000000],
  operatingIncome: [410000000, 620000000, 820000000],
  depreciation: [95000000, 110000000, 130000000],
};

export const fallbackValuation: ValuationResult = {
  normalizedEbitda: 950000000,
  rangeLow: 3500000000,
  rangeMid: 4500000000,
  rangeHigh: 5200000000,
  ownerSalaryAdjustment: true,
  calculatedAt: "2024-01-01T00:00:00.000Z",
};

export function wonHundredMillion(value: number): string {
  const amount = value / 100000000;
  return `${amount.toLocaleString("ko-KR", {
    maximumFractionDigits: amount >= 10 ? 0 : 1,
  })}억`;
}

export function formatValuationRangeLabel(valuation: ValuationResult): string {
  return `${wonHundredMillion(valuation.rangeLow)}~${wonHundredMillion(valuation.rangeHigh)}`;
}

export function buildValuationResultCards(valuation: ValuationResult): ValuationResultCard[] {
  const multiples = deriveValuationMultiples(valuation);
  return [
    {
      id: "low",
      multipleLabel: `${multiples.low}x 적용`,
      title: "보수적",
      valueLabel: preciseWonHundredMillion(valuation.rangeLow),
    },
    {
      id: "mid",
      multipleLabel: `${multiples.mid}x 적용`,
      title: "중립",
      valueLabel: preciseWonHundredMillion(valuation.rangeMid),
    },
    {
      id: "high",
      multipleLabel: `${multiples.high}x 적용`,
      title: "낙관",
      valueLabel: preciseWonHundredMillion(valuation.rangeHigh),
    },
  ];
}

function preciseWonHundredMillion(value: number): string {
  const amount = value / 100000000;
  return `${amount.toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  })}억`;
}

export function formatNumberWithCommas(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString("ko-KR") : "0";
}

export function parseCommaNumber(value: string): number {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function parseDecimalNumber(value: string): number {
  const normalized = value.replace(/[^\d.]/g, "");
  return normalized ? Number(normalized) : 0;
}

export function calculateValuation({
  financials,
  ownerSalaryAdjustment,
  multiples = DEFAULT_VALUATION_MULTIPLES,
  calculatedAt = new Date().toISOString(),
}: {
  financials: Financials;
  ownerSalaryAdjustment: boolean;
  multiples?: ValuationMultiples;
  calculatedAt?: string;
}): ValuationResult {
  const latestIndex = Math.max(0, financials.years.length - 1);
  const latestOperatingIncome = financials.operatingIncome[latestIndex] ?? 0;
  const latestDepreciation = financials.depreciation[latestIndex] ?? 0;
  const normalizedEbitda =
    latestOperatingIncome + latestDepreciation + (ownerSalaryAdjustment ? 150000000 : 0);

  return calculateValuationFromEbitda({
    normalizedEbitda,
    ownerSalaryAdjustment,
    multiples,
    calculatedAt,
  });
}

export function calculateValuationFromEbitda({
  normalizedEbitda,
  ownerSalaryAdjustment,
  multiples = DEFAULT_VALUATION_MULTIPLES,
  calculatedAt = new Date().toISOString(),
}: {
  normalizedEbitda: number;
  ownerSalaryAdjustment: boolean;
  multiples?: ValuationMultiples;
  calculatedAt?: string;
}): ValuationResult {
  const safeEbitda = Math.max(0, normalizedEbitda);

  return {
    normalizedEbitda: safeEbitda,
    rangeLow: safeEbitda * Math.max(0, multiples.low),
    rangeMid: safeEbitda * Math.max(0, multiples.mid),
    rangeHigh: safeEbitda * Math.max(0, multiples.high),
    ownerSalaryAdjustment,
    calculatedAt,
  };
}

export function deriveValuationMultiples(valuation: ValuationResult): ValuationMultiples {
  if (valuation.normalizedEbitda <= 0) return DEFAULT_VALUATION_MULTIPLES;
  return {
    low: roundMultiple(valuation.rangeLow / valuation.normalizedEbitda),
    mid: roundMultiple(valuation.rangeMid / valuation.normalizedEbitda),
    high: roundMultiple(valuation.rangeHigh / valuation.normalizedEbitda),
  };
}

function roundMultiple(value: number): number {
  return Math.round(value * 10) / 10;
}

export function updateFinancialCell(
  financials: Financials,
  field: Exclude<keyof Financials, "years">,
  index: number,
  value: number,
): Financials {
  return {
    ...financials,
    [field]: financials[field].map((item, itemIndex) =>
      itemIndex === index ? Math.max(0, value) : item,
    ),
  };
}

export function readStoredFinancials(): Financials {
  if (typeof window === "undefined") return fallbackFinancials;
  const saved = window.localStorage.getItem(FINANCIALS_STORAGE_KEY);
  if (!saved) return fallbackFinancials;
  try {
    const parsed = JSON.parse(saved) as Partial<Financials>;
    if (
      Array.isArray(parsed.years) &&
      Array.isArray(parsed.revenue) &&
      Array.isArray(parsed.operatingIncome) &&
      Array.isArray(parsed.depreciation)
    ) {
      return {
        years: parsed.years.map(Number),
        revenue: parsed.revenue.map(Number),
        operatingIncome: parsed.operatingIncome.map(Number),
        depreciation: parsed.depreciation.map(Number),
      };
    }
  } catch {
    return fallbackFinancials;
  }
  return fallbackFinancials;
}

export function readStoredValuation(): ValuationResult {
  if (typeof window === "undefined") return fallbackValuation;
  const saved = window.localStorage.getItem(VALUATION_STORAGE_KEY);
  if (!saved) return fallbackValuation;
  try {
    const parsed = JSON.parse(saved) as Partial<ValuationResult>;
    if (
      typeof parsed.normalizedEbitda === "number" &&
      typeof parsed.rangeLow === "number" &&
      typeof parsed.rangeHigh === "number"
    ) {
      const rangeMid =
        typeof parsed.rangeMid === "number"
          ? parsed.rangeMid
          : (parsed.rangeLow + parsed.rangeHigh) / 2;
      return {
        normalizedEbitda: parsed.normalizedEbitda,
        rangeLow: parsed.rangeLow,
        rangeMid,
        rangeHigh: parsed.rangeHigh,
        ownerSalaryAdjustment: Boolean(parsed.ownerSalaryAdjustment),
        calculatedAt: parsed.calculatedAt ?? new Date().toISOString(),
      };
    }
  } catch {
    return fallbackValuation;
  }
  return fallbackValuation;
}
