import { describe, expect, it } from "vitest";

import { SUCCESSION_SUPPORT_CHECK_TASK } from "./government-support";
import { mnaRoadmapPhases } from "./mna-documents";

describe("mnaRoadmapPhases", () => {
  it("starts preparation with the government support eligibility check", () => {
    expect(mnaRoadmapPhases[0]?.tasks[0]).toBe(SUCCESSION_SUPPORT_CHECK_TASK);
  });
});
