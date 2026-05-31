import { describe, expect, it } from "vitest";

import {
  evaluateMnaPhaseSupportReadiness,
  evaluateSuccessionConsultingEligibility,
  evaluateMnaSupportReadiness,
  getMnaSupportProgramsForPhase,
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

describe("getMnaSupportProgramsForPhase", () => {
  it("maps preparation to succession consulting and valuation support", () => {
    const programs = getMnaSupportProgramsForPhase("preparation");

    expect(programs.map((program) => program.program_key)).toEqual([
      "succession-consulting",
      "valuation-cost-support",
    ]);
    expect(programs[0]?.required_document_keys).toEqual([
      "phase-1-strategy-brief",
      "phase-1-synergy-hypothesis",
      "phase-1-approval-memo",
    ]);
  });

  it("maps diligence and PMI phases to the new 2026 M&A cost support categories", () => {
    expect(getMnaSupportProgramsForPhase("diligence")[0]?.support_scope).toBe(
      "기업실사 비용",
    );
    expect(getMnaSupportProgramsForPhase("closing-pmi")[0]?.support_scope).toBe(
      "PMI 컨설팅 비용",
    );
  });

  it("returns no support program for phases without a direct government support hook", () => {
    expect(getMnaSupportProgramsForPhase("marketing")).toEqual([]);
  });
});

describe("evaluateMnaSupportReadiness", () => {
  it("calculates required document readiness for a support program", () => {
    const readiness = evaluateMnaSupportReadiness("diligence-cost-support", [
      "dd-request-list",
      "phase-3-red-flag-log",
    ]);

    expect(readiness.percent).toBe(67);
    expect(readiness.completedRequiredDocuments).toEqual([
      "dd-request-list",
      "phase-3-red-flag-log",
    ]);
    expect(readiness.missingRequiredDocuments).toEqual(["phase-3-data-room-index"]);
  });

  it("returns an empty readiness result for unknown programs", () => {
    expect(evaluateMnaSupportReadiness("unknown", ["phase-1-strategy-brief"])).toEqual({
      completedRequiredDocuments: [],
      missingRequiredDocuments: [],
      percent: 0,
      programKey: "unknown",
      requiredDocumentKeys: [],
    });
  });
});

describe("evaluateMnaPhaseSupportReadiness", () => {
  it("summarizes phase-level readiness and selects the closest support application", () => {
    const readiness = evaluateMnaPhaseSupportReadiness("preparation", [
      "phase-1-strategy-brief",
    ]);

    expect(readiness.status).toBe("in-progress");
    expect(readiness.overallPercent).toBe(25);
    expect(readiness.nextProgramKey).toBe("valuation-cost-support");
    expect(readiness.totalRequiredDocumentKeys).toEqual([
      "phase-1-strategy-brief",
      "phase-1-synergy-hypothesis",
      "phase-1-approval-memo",
      "phase-3-valuation-workbook-checklist",
    ]);
    expect(readiness.missingDocumentKeys).toEqual([
      "phase-1-synergy-hypothesis",
      "phase-1-approval-memo",
      "phase-3-valuation-workbook-checklist",
    ]);
  });

  it("marks all support programs ready when every unique required document is complete", () => {
    const readiness = evaluateMnaPhaseSupportReadiness("preparation", [
      "phase-1-strategy-brief",
      "phase-1-synergy-hypothesis",
      "phase-1-approval-memo",
      "phase-3-valuation-workbook-checklist",
    ]);

    expect(readiness.status).toBe("ready");
    expect(readiness.overallPercent).toBe(100);
    expect(readiness.readyProgramKeys).toEqual([
      "succession-consulting",
      "valuation-cost-support",
    ]);
    expect(readiness.nextProgramKey).toBeNull();
  });

  it("separates roadmap phases without a direct government support hook", () => {
    expect(evaluateMnaPhaseSupportReadiness("marketing", [])).toEqual({
      missingDocumentKeys: [],
      nextProgramKey: null,
      overallPercent: 0,
      phaseCode: "marketing",
      programs: [],
      readyProgramKeys: [],
      status: "no-program",
      totalRequiredDocumentKeys: [],
    });
  });
});
