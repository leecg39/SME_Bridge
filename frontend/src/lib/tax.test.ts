import { describe, expect, it } from "vitest";

import {
  calculateBusinessSuccessionGiftTax,
  calculateProgressiveTransferTax,
  estimateTaxScenario,
  estimateTaxScenarios,
} from "./tax";

const ONE_EOK = 100000000;

describe("calculateBusinessSuccessionGiftTax", () => {
  it("applies the business succession gift tax deduction and low rate band", () => {
    const result = calculateBusinessSuccessionGiftTax(45 * ONE_EOK);

    expect(result.specialTaxBase).toBe(35 * ONE_EOK);
    expect(result.tax).toBe(3.5 * ONE_EOK);
  });

  it("applies the 20 percent rate above the special low-rate band", () => {
    const result = calculateBusinessSuccessionGiftTax(90 * ONE_EOK);

    expect(result.specialTaxBase).toBe(80 * ONE_EOK);
    expect(result.tax).toBe(10 * ONE_EOK);
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
});
