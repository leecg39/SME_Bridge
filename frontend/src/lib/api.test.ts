import { afterEach, describe, expect, it, vi } from "vitest";

import { saveValuationProgress } from "./api";
import { fallbackValuation } from "./valuation";

describe("saveValuationProgress", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("persists the latest valuation result through the progress API", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ result: fallbackValuation }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(saveValuationProgress(fallbackValuation)).resolves.toEqual({
      result: fallbackValuation,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8001/api/v1/valuation-progress",
      expect.objectContaining({
        body: JSON.stringify({ result: fallbackValuation }),
        method: "PUT",
      }),
    );
  });
});
