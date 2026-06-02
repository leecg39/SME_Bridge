import { afterEach, describe, expect, it, vi } from "vitest";

import {
  VALUATION_STORAGE_KEY,
  fallbackValuation,
  formatValuationRangeLabel,
  readStoredValuation,
  wonHundredMillion,
} from "./valuation";

function stubLocalStorage(value: string | null) {
  vi.stubGlobal("window", {
    localStorage: {
      getItem: vi.fn(() => value),
    },
  });
}

describe("fallbackValuation", () => {
  it("matches the default 35/45/52 eok valuation shown in the product flow", () => {
    expect(wonHundredMillion(fallbackValuation.rangeLow)).toBe("35억");
    expect(wonHundredMillion(fallbackValuation.rangeMid)).toBe("45억");
    expect(wonHundredMillion(fallbackValuation.rangeHigh)).toBe("52억");
  });
});

describe("readStoredValuation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("derives a middle range from the current review-page stored shape", () => {
    stubLocalStorage(
      JSON.stringify({
        normalizedEbitda: 1000000000,
        rangeLow: 3700000000,
        rangeHigh: 5500000000,
      }),
    );

    const result = readStoredValuation();

    expect(window.localStorage.getItem).toHaveBeenCalledWith(VALUATION_STORAGE_KEY);
    expect(result.rangeLow).toBe(3700000000);
    expect(result.rangeMid).toBe(4600000000);
    expect(result.rangeHigh).toBe(5500000000);
  });

  it("falls back when saved valuation JSON is invalid", () => {
    stubLocalStorage("{");

    expect(readStoredValuation()).toEqual(fallbackValuation);
  });
});

describe("formatValuationRangeLabel", () => {
  it("formats the valuation low and high range for dashboard summary cards", () => {
    expect(
      formatValuationRangeLabel({
        calculatedAt: "2026-06-02T17:42:33.341Z",
        normalizedEbitda: 1100000000,
        ownerSalaryAdjustment: true,
        rangeHigh: 6050000000,
        rangeLow: 4070000000,
        rangeMid: 5280000000,
      }),
    ).toBe("41억~61억");
  });
});
