import { describe, expect, it } from "vitest";

import {
  buildTaxSavingsSummary,
  buildBusinessSuccessionGiftReview,
  calculateBusinessSuccessionGiftTax,
  calculateProgressiveTransferTax,
  compareTaxScenarios,
  evaluateBusinessSuccessionGiftEligibility,
  estimateTaxScenario,
  estimateTaxScenarios,
  getBusinessSuccessionGiftCap,
} from "./tax";

const ONE_EOK = 100000000;

describe("calculateBusinessSuccessionGiftTax", () => {
  it("applies the business succession gift tax deduction and low rate band", () => {
    const result = calculateBusinessSuccessionGiftTax(45 * ONE_EOK);

    expect(result.specialTaxBase).toBe(35 * ONE_EOK);
    expect(result.tax).toBe(3.5 * ONE_EOK);
  });

  it("keeps the 10 percent rate through the current 120 eok low-rate band", () => {
    const result = calculateBusinessSuccessionGiftTax(90 * ONE_EOK);

    expect(result.specialTaxBase).toBe(80 * ONE_EOK);
    expect(result.tax).toBe(8 * ONE_EOK);
  });

  it("applies the 20 percent rate above the current 120 eok low-rate band", () => {
    const result = calculateBusinessSuccessionGiftTax(150 * ONE_EOK);

    expect(result.specialTaxBase).toBe(140 * ONE_EOK);
    expect(result.tax).toBe(16 * ONE_EOK);
  });

  it("uses the current management-period cap before applying regular gift tax to excess value", () => {
    const result = calculateBusinessSuccessionGiftTax(450 * ONE_EOK, {
      parentManagementYears: 15,
    });

    expect(result.specialCap).toBe(300 * ONE_EOK);
    expect(result.excessAmount).toBe(150 * ONE_EOK);
    expect(result.tax).toBeCloseTo(116.4 * ONE_EOK);
  });
});

describe("getBusinessSuccessionGiftCap", () => {
  it("maps parent management years to the current 300/400/600 eok caps", () => {
    expect(getBusinessSuccessionGiftCap(9)).toBe(0);
    expect(getBusinessSuccessionGiftCap(10)).toBe(300 * ONE_EOK);
    expect(getBusinessSuccessionGiftCap(20)).toBe(400 * ONE_EOK);
    expect(getBusinessSuccessionGiftCap(30)).toBe(600 * ONE_EOK);
  });
});

describe("evaluateBusinessSuccessionGiftEligibility", () => {
  const eligibleInput = {
    donorAge: 64,
    isCompanyShareGift: true,
    isEligibleCompany: true,
    parentManagementYears: 18,
    recipientAge: 35,
    recipientIsResident: true,
    willBecomeCeoWithinThreeYears: true,
    willJoinBusinessByFilingDeadline: true,
    willMaintainCeoForFiveYears: true,
  };

  it("passes the current pre-check when all core requirements are met", () => {
    const result = evaluateBusinessSuccessionGiftEligibility(eligibleInput);

    expect(result.isEligible).toBe(true);
    expect(result.missingRequirements).toEqual([]);
    expect(result.postManagementWarnings).toEqual([]);
    expect(result.nextAction).toContain("특례세율 계산값");
  });

  it("lists missing statutory requirements before applying the special tax treatment", () => {
    const result = evaluateBusinessSuccessionGiftEligibility({
      ...eligibleInput,
      donorAge: 58,
      isCompanyShareGift: false,
      parentManagementYears: 7,
      recipientAge: 17,
      recipientIsResident: false,
      willBecomeCeoWithinThreeYears: false,
      willJoinBusinessByFilingDeadline: false,
    });

    expect(result.isEligible).toBe(false);
    expect(result.missingRequirements).toEqual([
      "가업 주식 또는 출자지분 증여",
      "부모의 10년 이상 계속 경영",
      "증여자 60세 이상 부모",
      "수증자 18세 이상",
      "수증자 거주자",
      "증여세 신고기한까지 가업 종사",
      "증여일부터 3년 이내 대표이사 취임",
    ]);
  });

  it("separates post-management warnings from initial eligibility", () => {
    const result = evaluateBusinessSuccessionGiftEligibility({
      ...eligibleInput,
      willMaintainCeoForFiveYears: false,
    });

    expect(result.isEligible).toBe(true);
    expect(result.postManagementWarnings).toEqual([
      "증여일부터 5년까지 대표이사 유지 사후관리 필요",
    ]);
  });
});

describe("buildBusinessSuccessionGiftReview", () => {
  const reviewInput = {
    donorAge: 64,
    isCompanyShareGift: true,
    isEligibleCompany: true,
    parentManagementYears: 18,
    recipientAge: 35,
    recipientIsResident: true,
    taxableBase: 45 * ONE_EOK,
    willBecomeCeoWithinThreeYears: true,
    willJoinBusinessByFilingDeadline: true,
    willMaintainCeoForFiveYears: true,
  };

  it("combines tax and eligibility into an eligible consultation snapshot", () => {
    const result = buildBusinessSuccessionGiftReview(reviewInput);

    expect(result.decision).toBe("eligible");
    expect(result.blockerCount).toBe(0);
    expect(result.warningCount).toBe(0);
    expect(result.tax.specialCap).toBe(300 * ONE_EOK);
    expect(result.tax.tax).toBe(3.5 * ONE_EOK);
    expect(result.nextAction).toContain("상담 스냅샷");
  });

  it("flags post-management risk without blocking the initial special tax review", () => {
    const result = buildBusinessSuccessionGiftReview({
      ...reviewInput,
      willMaintainCeoForFiveYears: false,
    });

    expect(result.decision).toBe("needs-review");
    expect(result.eligibility.isEligible).toBe(true);
    expect(result.warningCount).toBe(1);
    expect(result.nextAction).toContain("사후관리 경고 1개");
  });

  it("blocks special treatment when statutory requirements are missing", () => {
    const result = buildBusinessSuccessionGiftReview({
      ...reviewInput,
      donorAge: 58,
      parentManagementYears: 7,
    });

    expect(result.decision).toBe("not-eligible");
    expect(result.blockerCount).toBe(2);
    expect(result.tax.specialCap).toBe(0);
    expect(result.tax.tax).toBeCloseTo(17.9 * ONE_EOK);
    expect(result.eligibility.missingRequirements).toContain("부모의 10년 이상 계속 경영");
  });
});

describe("calculateProgressiveTransferTax", () => {
  it("uses the basic inheritance and gift tax progressive brackets", () => {
    expect(calculateProgressiveTransferTax(45 * ONE_EOK)).toBeCloseTo(17.9 * ONE_EOK);
  });
});

describe("estimateTaxScenarios", () => {
  it("returns scenario estimates with stable effective rates", () => {
    const rows = estimateTaxScenarios(45 * ONE_EOK);

    expect(rows).toHaveLength(4);
    expect(rows.find((row) => row.id === "sale")?.effectiveRate).toBeCloseTo(0.262);
    expect(rows.find((row) => row.id === "gift")?.tax).toBe(3.5 * ONE_EOK);
    expect(rows.every((row) => Number.isFinite(row.net))).toBe(true);
  });

  it("keeps the hybrid strategy as a real split calculation", () => {
    const hybrid = estimateTaxScenario("hybrid", 45 * ONE_EOK);

    expect(hybrid.formulaLabel).toContain("50%");
    expect(hybrid.tax).toBe(7.145 * ONE_EOK);
  });

  it("describes the current business succession gift tax threshold", () => {
    const gift = estimateTaxScenario("gift", 90 * ONE_EOK);

    expect(gift.formulaLabel).toBe("10억원 공제 + 120억원 초과분 20%");
    expect(gift.tax).toBe(8 * ONE_EOK);
  });
});

describe("compareTaxScenarios", () => {
  it("ranks tax scenarios and calculates savings against the sale baseline", () => {
    const comparison = compareTaxScenarios(45 * ONE_EOK);

    expect(comparison.bestScenarioId).toBe("gift");
    expect(comparison.maxSavingsAgainstBaseline).toBeCloseTo(8.29 * ONE_EOK);
    expect(comparison.rows.map((row) => row.id)).toEqual([
      "gift",
      "hybrid",
      "sale",
      "inheritance",
    ]);
    expect(comparison.rows[0]?.id).toBe("gift");
    expect(comparison.rows[0]?.rank).toBe(1);
    expect(comparison.rows[0]?.savingsAgainstBaseline).toBeCloseTo(8.29 * ONE_EOK);
    expect(comparison.rows[0]?.taxGapFromBest).toBe(0);
    expect(comparison.rows.find((row) => row.id === "inheritance")?.taxGapFromBest).toBeCloseTo(
      14.4 * ONE_EOK,
    );
  });

  it("keeps comparison values stable for a zero taxable base", () => {
    const comparison = compareTaxScenarios(0);

    expect(comparison.bestScenarioId).toBe("sale");
    expect(comparison.maxSavingsAgainstBaseline).toBe(0);
    expect(comparison.rows.every((row) => row.savingsAgainstBaseline === 0)).toBe(true);
    expect(comparison.rows.every((row) => row.taxGapFromBest === 0)).toBe(true);
  });
});

describe("buildTaxSavingsSummary", () => {
  it("formats dashboard tax savings from the current valuation middle range", () => {
    expect(buildTaxSavingsSummary(52.8 * ONE_EOK)).toEqual({
      baselineScenarioId: "sale",
      bestScenarioId: "gift",
      label: "9.6억",
      note: "양도소득세 대비 증여특례 검토 시",
    });
  });
});
