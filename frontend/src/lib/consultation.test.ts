import { describe, expect, it } from "vitest";

import {
  buildConsultationPayload,
  mergeValuationIntoConsultationSnapshot,
  consultationStatusLabel,
} from "./consultation";

describe("buildConsultationPayload", () => {
  it("keeps summary context and removes sensitive file fields", () => {
    const payload = buildConsultationPayload({
      companyId: "company-1",
      companyName: "동양정밀",
      requesterName: "김영호",
      requesterPhone: "010-1234-5678",
      requesterEmail: "ceo@example.com",
      consultationType: "tax",
      title: "세무 상담",
      description: "매각 전 세금 구조를 확인하고 싶습니다.",
      privacyConsent: true,
      externalTransferConsent: true,
      includeProgressSnapshot: true,
      shareSensitiveFiles: false,
      snapshot: {
        valuation: {
          rangeLow: 3500000000,
          sourceFileUrl: "https://signed.example.com/raw.pdf",
        },
        rawFinancialStatements: [{ fileUrl: "https://private.example.com" }],
      },
    });

    expect(payload.snapshot_json.valuation).toEqual({ rangeLow: 3500000000 });
    expect(JSON.stringify(payload.snapshot_json)).not.toContain("FileUrl");
    expect(JSON.stringify(payload.snapshot_json)).not.toContain("signed.example");
    expect(payload.external_transfer_consent).toBe(true);
  });

  it("omits progress snapshot when the user excludes it", () => {
    const payload = buildConsultationPayload({
      companyId: "company-1",
      companyName: "동양정밀",
      requesterName: "김영호",
      requesterPhone: "010-1234-5678",
      requesterEmail: "ceo@example.com",
      consultationType: "mna",
      title: "M&A 자문",
      description: "매각 준비 로드맵을 검토하고 싶습니다.",
      privacyConsent: true,
      externalTransferConsent: true,
      includeProgressSnapshot: false,
      shareSensitiveFiles: false,
      snapshot: { roadmap: { progressPercent: 24 } },
    });

    expect(payload.snapshot_json).toEqual({});
  });
});

describe("consultationStatusLabel", () => {
  it("maps Patasos sync states to Korean dashboard labels", () => {
    expect(consultationStatusLabel("pending")).toBe("Patasos 전달중");
    expect(consultationStatusLabel("sent")).toBe("Patasos 전달완료");
    expect(consultationStatusLabel("failed")).toBe("전달 실패");
    expect(consultationStatusLabel("not_requested")).toBe("접수됨");
  });
});

describe("mergeValuationIntoConsultationSnapshot", () => {
  it("updates the consultation snapshot with the latest valuation result", () => {
    const snapshot = mergeValuationIntoConsultationSnapshot(
      {
        company: { name: "동양정밀" },
        valuation: {
          ebitda: 950000000,
          rangeLow: 3500000000,
          rangeHigh: 5200000000,
          sourceFileUrl: "removed-by-sanitizer",
        },
      },
      {
        calculatedAt: "2026-06-02T17:42:33.341Z",
        normalizedEbitda: 1100000000,
        ownerSalaryAdjustment: true,
        rangeHigh: 6050000000,
        rangeLow: 4070000000,
        rangeMid: 5280000000,
      },
    );

    expect(snapshot.valuation).toEqual({
      ebitda: 1100000000,
      rangeLow: 4070000000,
      rangeMid: 5280000000,
      rangeHigh: 6050000000,
      scenario: "중립 EV/EBITDA 4.8x",
      calculatedAt: "2026-06-02T17:42:33.341Z",
      sourceFileUrl: "removed-by-sanitizer",
    });
  });
});
