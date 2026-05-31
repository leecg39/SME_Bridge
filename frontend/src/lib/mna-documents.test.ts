import { describe, expect, it } from "vitest";

import { SUCCESSION_SUPPORT_CHECK_TASK } from "./government-support";
import { evaluateMnaPhaseDocumentReadiness, mnaRoadmapPhases } from "./mna-documents";

describe("mnaRoadmapPhases", () => {
  it("starts preparation with the government support eligibility check", () => {
    expect(mnaRoadmapPhases[0]?.tasks[0]).toBe(SUCCESSION_SUPPORT_CHECK_TASK);
  });

  it("carries phase-specific government support opportunities", () => {
    expect(mnaRoadmapPhases[0]?.support_programs?.map((program) => program.program_key)).toEqual([
      "succession-consulting",
      "valuation-cost-support",
    ]);
    expect(mnaRoadmapPhases[2]?.support_programs?.[0]?.program_key).toBe(
      "diligence-cost-support",
    );
    expect(mnaRoadmapPhases[4]?.support_programs?.[0]?.program_key).toBe(
      "pmi-consulting-support",
    );
  });
});

describe("evaluateMnaPhaseDocumentReadiness", () => {
  it("calculates the next required document for an in-progress preparation phase", () => {
    const readiness = evaluateMnaPhaseDocumentReadiness("preparation", [
      "phase-1-strategy-brief",
    ]);

    expect(readiness.status).toBe("in-progress");
    expect(readiness.percent).toBe(33);
    expect(readiness.completedRequiredDocumentKeys).toEqual(["phase-1-strategy-brief"]);
    expect(readiness.missingRequiredDocumentKeys).toEqual([
      "phase-1-synergy-hypothesis",
      "phase-1-approval-memo",
    ]);
    expect(readiness.nextRequiredDocumentKey).toBe("phase-1-synergy-hypothesis");
  });

  it("marks a phase ready when every required document is complete", () => {
    const readiness = evaluateMnaPhaseDocumentReadiness("marketing", [
      "phase-2-target-screening-matrix",
      "nda-template",
      "phase-2-target-approach-log",
      "loi-template",
    ]);

    expect(readiness.status).toBe("ready");
    expect(readiness.percent).toBe(100);
    expect(readiness.missingRequiredDocumentKeys).toEqual([]);
    expect(readiness.nextRequiredDocumentKey).toBeNull();
  });

  it("returns a stable empty state for unknown phases", () => {
    expect(evaluateMnaPhaseDocumentReadiness("unknown", [])).toEqual({
      completedRequiredDocumentKeys: [],
      missingRequiredDocumentKeys: [],
      nextRequiredDocumentKey: null,
      percent: 0,
      phaseCode: "unknown",
      requiredDocumentKeys: [],
      status: "no-required-documents",
    });
  });
});
