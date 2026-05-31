import { describe, expect, it } from "vitest";

import {
  evaluateSuccessionConsultingEligibility,
  SUCCESSION_SUPPORT_CHECK_TASK,
} from "./government-support";

describe("evaluateSuccessionConsultingEligibility", () => {
  it("routes eligible sellers without a target to basic consulting", () => {
    const result = evaluateSuccessionConsultingEligibility({
      companyAgeYears: 12,
      hasNegotiationTarget: false,
      isSme: true,
      representativeAge: 63,
    });

    expect(result.isEligible).toBe(true);
    expect(result.track).toBe("basic");
    expect(result.nextAction).toContain("기초컨설팅");
  });

  it("routes eligible sellers with a negotiation target to comprehensive consulting", () => {
    const result = evaluateSuccessionConsultingEligibility({
      companyAgeYears: 8,
      hasNegotiationTarget: true,
      isSme: true,
      representativeAge: 57,
    });

    expect(result.isEligible).toBe(true);
    expect(result.track).toBe("comprehensive");
    expect(result.nextAction).toContain("종합컨설팅");
  });

  it("returns missing requirements for companies outside the seller criteria", () => {
    const result = evaluateSuccessionConsultingEligibility({
      companyAgeYears: 3,
      hasNegotiationTarget: false,
      isSme: false,
      representativeAge: 51,
    });

    expect(result.isEligible).toBe(false);
    expect(result.track).toBe("not-eligible");
    expect(result.missingRequirements).toEqual([
      "중소기업 여부 확인",
      "대표자 만 55세 이상",
      "업력 만 5년 이상",
    ]);
  });
});

describe("SUCCESSION_SUPPORT_CHECK_TASK", () => {
  it("keeps the roadmap task label stable for persisted checklist keys", () => {
    expect(SUCCESSION_SUPPORT_CHECK_TASK).toBe("기업승계 M&A 컨설팅 지원사업 자격 확인");
  });
});
