import { describe, expect, it } from "vitest";

import { SUCCESSION_SUPPORT_CHECK_TASK } from "./government-support";
import { mnaRoadmapPhases } from "./mna-documents";

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
