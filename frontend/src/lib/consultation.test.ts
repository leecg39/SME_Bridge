import { describe, expect, it } from "vitest";

import {
  buildDashboardConsultationRows,
  buildConsultationPayload,
  mergeValuationAndTaxIntoConsultationSnapshot,
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

describe("buildDashboardConsultationRows", () => {
  it("surfaces the selected tax scenario and user-facing status labels", () => {
    const rows = buildDashboardConsultationRows([
      {
        company_id: "company-1",
        company_name: "동양정밀",
        consultation_type: "tax",
        created_at: "2026-06-02T22:20:00Z",
        description: "혼합 전략을 중심으로 검토하고 싶습니다.",
        external_transfer_consent: true,
        id: "consultation-1",
        patasos_issue_id: null,
        patasos_issue_identifier: null,
        patasos_issue_url: null,
        patasos_sync_error: null,
        patasos_sync_status: "not_requested",
        privacy_consent: true,
        requester_email: "ceo@example.com",
        requester_name: "김영호",
        requester_phone: "010-1234-5678",
        share_sensitive_files: false,
        snapshot_json: {
          tax: {
            selectedScenario: "혼합 전략",
            selectedScenarioId: "hybrid",
          },
        },
        status: "pending",
        title: "기업승계 세무 상담 요청",
        updated_at: "2026-06-02T22:20:00Z",
      },
    ]);

    expect(rows[0]).toEqual({
      id: "consultation-1",
      patasosStatusLabel: "접수됨",
      requestStatusLabel: "접수됨",
      selectedScenarioLabel: "선택 전략: 혼합 전략",
      title: "기업승계 세무 상담 요청",
    });
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

describe("mergeValuationAndTaxIntoConsultationSnapshot", () => {
  it("updates the consultation snapshot tax summary from the latest valuation middle range", () => {
    const snapshot = mergeValuationAndTaxIntoConsultationSnapshot(
      {
        valuation: {
          ebitda: 950000000,
          rangeLow: 3500000000,
          rangeHigh: 5200000000,
        },
        tax: {
          bestScenario: "가업승계 증여특례 검토",
          estimatedSaving: 420000000,
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

    expect(snapshot.valuation).toMatchObject({
      rangeLow: 4070000000,
      rangeMid: 5280000000,
      rangeHigh: 6050000000,
    });
    expect(snapshot.tax).toEqual({
      baselineScenarioId: "sale",
      bestScenario: "증여특례",
      bestScenarioId: "gift",
      estimatedSaving: 955360000,
      savingsLabel: "9.6억",
      summaryNote: "양도소득세 대비 증여특례 검토 시",
    });
  });

  it("adds the selected tax scenario to the consultation snapshot when provided", () => {
    const snapshot = mergeValuationAndTaxIntoConsultationSnapshot(
      {
        tax: {
          bestScenario: "가업승계 증여특례 검토",
          estimatedSaving: 420000000,
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
      "hybrid",
    );

    expect(snapshot.tax).toMatchObject({
      selectedScenario: "혼합 전략",
      selectedScenarioId: "hybrid",
      selectedScenarioNote: "일부 지분 매각과 승계 병행",
      selectedScenarioTax: 855680000,
    });
  });
});
