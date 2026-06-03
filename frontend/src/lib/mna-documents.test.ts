import { describe, expect, it } from "vitest";

import { SUCCESSION_SUPPORT_CHECK_TASK } from "./government-support";
import {
  buildMnaRoadmapTaskProgressSummary,
  buildMnaPhaseActionSummary,
  buildMnaRoadmapActionPlan,
  evaluateMnaPhaseDocumentReadiness,
  mnaRoadmapPhases,
  parseMnaRoadmapTaskChecklist,
  serializeMnaRoadmapTaskChecklist,
} from "./mna-documents";

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

describe("buildMnaPhaseActionSummary", () => {
  it("prioritizes the next required document before support program cleanup", () => {
    const summary = buildMnaPhaseActionSummary("preparation", ["phase-1-strategy-brief"]);

    expect(summary.priority).toBe("document");
    expect(summary.nextDocumentKey).toBe("phase-1-synergy-hypothesis");
    expect(summary.nextSupportProgramKey).toBe("valuation-cost-support");
    expect(summary.nextAction).toContain("phase-1-synergy-hypothesis");
  });

  it("moves to support program cleanup after phase documents are ready", () => {
    const summary = buildMnaPhaseActionSummary("preparation", [
      "phase-1-strategy-brief",
      "phase-1-synergy-hypothesis",
      "phase-1-approval-memo",
    ]);

    expect(summary.documentReadiness.status).toBe("ready");
    expect(summary.priority).toBe("support");
    expect(summary.nextDocumentKey).toBeNull();
    expect(summary.nextSupportProgramKey).toBe("valuation-cost-support");
  });

  it("marks a phase ready when both documents and support requirements are complete", () => {
    const summary = buildMnaPhaseActionSummary("closing-pmi", [
      "phase-5-pmi-100-day-plan",
      "phase-5-day-1-communication-plan",
      "employee-transfer-plan",
      "phase-5-integration-workstream-tracker",
    ]);

    expect(summary.priority).toBe("ready");
    expect(summary.supportReadiness.readyProgramKeys).toEqual(["pmi-consulting-support"]);
    expect(summary.nextAction).toContain("상담 스냅샷");
  });

  it("returns no action for unknown phases", () => {
    const summary = buildMnaPhaseActionSummary("unknown", []);

    expect(summary.priority).toBe("none");
    expect(summary.nextDocumentKey).toBeNull();
    expect(summary.nextSupportProgramKey).toBeNull();
    expect(summary.documentReadiness.status).toBe("no-required-documents");
    expect(summary.supportReadiness.status).toBe("no-program");
  });
});

describe("buildMnaRoadmapActionPlan", () => {
  const preparationDocumentKeys = [
    "phase-1-strategy-brief",
    "phase-1-synergy-hypothesis",
    "phase-1-approval-memo",
  ];

  it("selects the first roadmap bottleneck from all phase summaries", () => {
    const plan = buildMnaRoadmapActionPlan(["phase-1-strategy-brief"]);

    expect(plan.status).toBe("in-progress");
    expect(plan.currentPhaseCode).toBe("preparation");
    expect(plan.currentPriority).toBe("document");
    expect(plan.overallDocumentPercent).toBe(6);
    expect(plan.phaseSummaries).toHaveLength(5);
    expect(plan.nextAction).toContain("phase-1-synergy-hypothesis");
  });

  it("keeps focus on preparation when support program documents are still missing", () => {
    const plan = buildMnaRoadmapActionPlan(preparationDocumentKeys);

    expect(plan.currentPhaseCode).toBe("preparation");
    expect(plan.currentPriority).toBe("support");
    expect(plan.phaseSummaries[0]?.nextSupportProgramKey).toBe("valuation-cost-support");
  });

  it("moves to marketing after preparation documents and support requirements are ready", () => {
    const plan = buildMnaRoadmapActionPlan([
      ...preparationDocumentKeys,
      "phase-3-valuation-workbook-checklist",
    ]);

    expect(plan.readyPhaseCodes).toContain("preparation");
    expect(plan.currentPhaseCode).toBe("marketing");
    expect(plan.currentPriority).toBe("document");
    expect(plan.phaseSummaries[1]?.nextDocumentKey).toBe("phase-2-target-screening-matrix");
  });

  it("marks the full roadmap ready when every required document is complete", () => {
    const allRequiredDocumentKeys = mnaRoadmapPhases.flatMap((phase) =>
      phase.documents
        .filter((document) => document.is_required)
        .map((document) => document.document_key),
    );
    const plan = buildMnaRoadmapActionPlan(allRequiredDocumentKeys);

    expect(plan.status).toBe("ready");
    expect(plan.currentPhaseCode).toBeNull();
    expect(plan.currentPriority).toBe("ready");
    expect(plan.overallDocumentPercent).toBe(100);
    expect(plan.readyPhaseCodes).toEqual([
      "preparation",
      "marketing",
      "diligence",
      "negotiation",
      "closing-pmi",
    ]);
  });
});

describe("roadmap task checklist persistence", () => {
  it("round-trips only boolean checklist states from storage", () => {
    const serialized = serializeMnaRoadmapTaskChecklist({
      "1-최근 3개년 재무제표 준비": true,
      "1-임대차 계약서 정리": false,
    });

    expect(parseMnaRoadmapTaskChecklist(serialized)).toEqual({
      "1-최근 3개년 재무제표 준비": true,
      "1-임대차 계약서 정리": false,
    });
    expect(
      parseMnaRoadmapTaskChecklist('{"1-최근 3개년 재무제표 준비":true,"bad":"yes"}'),
    ).toEqual({
      "1-최근 3개년 재무제표 준비": true,
    });
    expect(parseMnaRoadmapTaskChecklist("not-json")).toEqual({});
  });
});

describe("buildMnaRoadmapTaskProgressSummary", () => {
  it("summarizes stored roadmap task progress for dashboard cards", () => {
    expect(
      buildMnaRoadmapTaskProgressSummary({
        "1-최근 3개년 재무제표 준비": true,
        "1-임대차 계약서 정리": false,
      }),
    ).toEqual({
      completed: 1,
      detailLabel: "완료 항목 1/16개",
      percent: 6,
      percentLabel: "6%",
      stageLabel: "Phase 1 매각 준비, 진행률 6%",
      total: 16,
    });
  });
});
