import { describe, expect, it } from "vitest";

import {
  estimateMnaSupportFunding,
  estimateMnaPhaseSupportFunding,
  estimateMnaRoadmapSupportFunding,
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

  it("returns track-specific consulting fees and company contributions", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      companyContributionRate: 0.3,
      companyContributionWon: 300000,
      consultingFeeWon: 1000000,
      governmentContributionWon: 700000,
      track: "basic",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 8,
        hasNegotiationTarget: true,
        isSme: true,
        representativeAge: 57,
      }),
    ).toMatchObject({
      companyContributionRate: 0.3,
      companyContributionWon: 3000000,
      consultingFeeWon: 10000000,
      governmentContributionWon: 7000000,
      track: "comprehensive",
    });
  });

  it("returns the track-specific selection limit for eligible succession consulting tracks", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      selectionLimitCompanies: 100,
      track: "basic",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 8,
        hasNegotiationTarget: true,
        isSme: true,
        representativeAge: 57,
      }),
    ).toMatchObject({
      selectionLimitCompanies: 40,
      track: "comprehensive",
    });
  });

  it("returns the official application guide for eligible succession consulting tracks", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      applicationGuide: {
        applicationMethodLabel: "스마트테크브릿지 온라인 신청",
        applicationPeriodLabel: "예산 소진시까지",
        contactEmail: "mna@kibo.or.kr",
        contactLabel: "기술보증기금 M&A지원센터",
        contactPhoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
        noticePublishedDate: "2026-04-03",
        noticeSourceUrl:
          "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120342",
        operatingAgencyLabel: "기술보증기금",
        url: "https://tb.kibo.or.kr",
      },
      track: "basic",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 8,
        hasNegotiationTarget: true,
        isSme: true,
        representativeAge: 57,
      }),
    ).toMatchObject({
      applicationGuide: {
        applicationMethodLabel: "스마트테크브릿지 온라인 신청",
        applicationPeriodLabel: "예산 소진시까지",
        contactEmail: "mna@kibo.or.kr",
        contactLabel: "기술보증기금 M&A지원센터",
        contactPhoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
        noticePublishedDate: "2026-04-03",
        noticeSourceUrl:
          "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120342",
        operatingAgencyLabel: "기술보증기금",
        url: "https://tb.kibo.or.kr",
      },
      track: "comprehensive",
    });
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
    expect(result.consultingFeeWon).toBeNull();
    expect(result.companyContributionRate).toBeNull();
    expect(result.companyContributionWon).toBeNull();
    expect(result.governmentContributionWon).toBeNull();
    expect(result.applicationGuide).toBeNull();
    expect(result.selectionLimitCompanies).toBeNull();
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
    expect(programs[0]?.funding).toBeNull();
    expect(programs[1]?.funding).toEqual({
      max_amount_won: 15000000,
      note: "벤처기업은 60%, 2,000만원 한도까지 검토합니다.",
      rate_label: "일반 40% / 벤처 60%",
      standard_rate: 0.4,
      venture_max_amount_won: 20000000,
      venture_rate: 0.6,
    });
  });

  it("maps diligence and PMI phases to the new 2026 M&A cost support categories", () => {
    const diligence = getMnaSupportProgramsForPhase("diligence")[0];
    const pmi = getMnaSupportProgramsForPhase("closing-pmi")[0];

    expect(diligence?.support_scope).toBe("기업실사 비용");
    expect(diligence?.funding?.max_amount_won).toBe(30000000);
    expect(diligence?.funding?.rate_label).toBe("50%");
    expect(pmi?.support_scope).toBe("PMI 컨설팅 비용");
    expect(pmi?.funding?.max_amount_won).toBe(25000000);
  });

  it("returns no support program for phases without a direct government support hook", () => {
    expect(getMnaSupportProgramsForPhase("marketing")).toEqual([]);
  });
});

describe("estimateMnaSupportFunding", () => {
  it("calculates capped valuation support for a standard company", () => {
    expect(estimateMnaSupportFunding("valuation-cost-support", 50000000)).toEqual({
      estimatedSupportWon: 15000000,
      expenseAmountWon: 50000000,
      isCapped: true,
      maxAmountWon: 15000000,
      programKey: "valuation-cost-support",
      rate: 0.4,
      selfPayWon: 35000000,
    });
  });

  it("uses venture valuation support rates when the company is a venture", () => {
    expect(
      estimateMnaSupportFunding("valuation-cost-support", 50000000, {
        isVentureCompany: true,
      }),
    ).toEqual({
      estimatedSupportWon: 20000000,
      expenseAmountWon: 50000000,
      isCapped: true,
      maxAmountWon: 20000000,
      programKey: "valuation-cost-support",
      rate: 0.6,
      selfPayWon: 30000000,
    });
  });

  it("calculates uncapped diligence support from the standard rate", () => {
    expect(estimateMnaSupportFunding("diligence-cost-support", 40000000)).toEqual({
      estimatedSupportWon: 20000000,
      expenseAmountWon: 40000000,
      isCapped: false,
      maxAmountWon: 30000000,
      programKey: "diligence-cost-support",
      rate: 0.5,
      selfPayWon: 20000000,
    });
  });

  it("returns null for non-monetary or unknown support programs", () => {
    expect(estimateMnaSupportFunding("succession-consulting", 10000000)).toBeNull();
    expect(estimateMnaSupportFunding("unknown", 10000000)).toBeNull();
  });
});

describe("estimateMnaPhaseSupportFunding", () => {
  it("summarizes preparation phase funding and separates non-monetary consulting", () => {
    expect(
      estimateMnaPhaseSupportFunding("preparation", {
        "valuation-cost-support": 50000000,
      }),
    ).toEqual({
      estimatedSupportWon: 15000000,
      estimates: [
        {
          estimatedSupportWon: 15000000,
          expenseAmountWon: 50000000,
          isCapped: true,
          maxAmountWon: 15000000,
          programKey: "valuation-cost-support",
          rate: 0.4,
          selfPayWon: 35000000,
        },
      ],
      expenseAmountWon: 50000000,
      missingExpenseProgramKeys: [],
      nextAction: "예상 지원금과 자부담을 상담 스냅샷에 반영합니다.",
      nextExpenseProgramKey: null,
      nonMonetaryProgramKeys: ["succession-consulting"],
      phaseCode: "preparation",
      selfPayWon: 35000000,
      status: "estimated",
    });
  });

  it("uses venture valuation caps in preparation phase totals", () => {
    expect(
      estimateMnaPhaseSupportFunding(
        "preparation",
        {
          "valuation-cost-support": 50000000,
        },
        { isVentureCompany: true },
      ),
    ).toMatchObject({
      estimatedSupportWon: 20000000,
      expenseAmountWon: 50000000,
      selfPayWon: 30000000,
    });
  });

  it("summarizes diligence phase funding totals", () => {
    expect(
      estimateMnaPhaseSupportFunding("diligence", {
        "diligence-cost-support": 40000000,
      }),
    ).toMatchObject({
      estimatedSupportWon: 20000000,
      expenseAmountWon: 40000000,
      nonMonetaryProgramKeys: [],
      selfPayWon: 20000000,
    });
  });

  it("returns empty totals for phases without support programs", () => {
    expect(
      estimateMnaPhaseSupportFunding("marketing", {
        "valuation-cost-support": 50000000,
      }),
    ).toEqual({
      estimatedSupportWon: 0,
      estimates: [],
      expenseAmountWon: 0,
      missingExpenseProgramKeys: [],
      nextAction: "이 단계에는 직접 연결된 비용지원 프로그램이 없습니다.",
      nextExpenseProgramKey: null,
      nonMonetaryProgramKeys: [],
      phaseCode: "marketing",
      selfPayWon: 0,
      status: "no-program",
    });
  });

  it("tracks monetary support programs that still need expense inputs and the next input", () => {
    expect(estimateMnaPhaseSupportFunding("preparation", {})).toEqual({
      estimatedSupportWon: 0,
      estimates: [],
      expenseAmountWon: 0,
      missingExpenseProgramKeys: ["valuation-cost-support"],
      nextAction: "기업가치평가 비용지원 예상 비용을 입력해 지원금과 자부담을 산출합니다.",
      nextExpenseProgramKey: "valuation-cost-support",
      nonMonetaryProgramKeys: ["succession-consulting"],
      phaseCode: "preparation",
      selfPayWon: 0,
      status: "needs-expense",
    });
  });

  it("treats explicit zero expense as an estimated funding state", () => {
    expect(
      estimateMnaPhaseSupportFunding("diligence", {
        "diligence-cost-support": 0,
      }),
    ).toMatchObject({
      missingExpenseProgramKeys: [],
      nextAction: "예상 지원금과 자부담을 상담 스냅샷에 반영합니다.",
      nextExpenseProgramKey: null,
      status: "estimated",
    });
  });
});

describe("estimateMnaRoadmapSupportFunding", () => {
  it("summarizes support funding across selected roadmap phases", () => {
    expect(
      estimateMnaRoadmapSupportFunding(
        ["preparation", "diligence", "closing-pmi"],
        {
          preparation: {
            "valuation-cost-support": 50000000,
          },
          diligence: {
            "diligence-cost-support": 40000000,
          },
          "closing-pmi": {
            "pmi-consulting-support": 30000000,
          },
        },
      ),
    ).toMatchObject({
      cappedPhaseCodes: ["preparation"],
      cappedProgramCount: 1,
      cappedProgramKeys: ["valuation-cost-support"],
      completedExpenseProgramCount: 3,
      estimatedSupportWon: 50000000,
      expenseInputPercent: 100,
      expenseAmountWon: 120000000,
      missingExpenseProgramCount: 0,
      missingExpensePhaseCodes: [],
      monetaryProgramCount: 3,
      nextAction: "전 구간 예상 지원금과 자부담을 상담 스냅샷에 반영합니다.",
      nextExpenseProgramKey: null,
      nextPhaseCode: null,
      selfPayWon: 70000000,
      status: "estimated",
    });
  });

  it("selects the next phase and support program that still needs an expense", () => {
    expect(
      estimateMnaRoadmapSupportFunding(
        ["preparation", "diligence", "closing-pmi"],
        {
          preparation: {
            "valuation-cost-support": 50000000,
          },
          diligence: {
            "diligence-cost-support": 40000000,
          },
        },
      ),
    ).toMatchObject({
      cappedPhaseCodes: ["preparation"],
      cappedProgramCount: 1,
      cappedProgramKeys: ["valuation-cost-support"],
      completedExpenseProgramCount: 2,
      estimatedSupportWon: 35000000,
      expenseInputPercent: 67,
      expenseAmountWon: 90000000,
      missingExpenseProgramCount: 1,
      missingExpensePhaseCodes: ["closing-pmi"],
      monetaryProgramCount: 3,
      nextAction:
        "closing-pmi 단계의 PMI 컨설팅 비용지원 예상 비용을 입력해 지원금과 자부담을 산출합니다.",
      nextExpenseProgramKey: "pmi-consulting-support",
      nextPhaseCode: "closing-pmi",
      selfPayWon: 55000000,
      status: "needs-expense",
    });
  });

  it("returns a no-support state for roadmap sections without support programs", () => {
    expect(estimateMnaRoadmapSupportFunding(["marketing"], {})).toMatchObject({
      cappedPhaseCodes: [],
      cappedProgramCount: 0,
      cappedProgramKeys: [],
      completedExpenseProgramCount: 0,
      estimatedSupportWon: 0,
      expenseInputPercent: 0,
      expenseAmountWon: 0,
      missingExpenseProgramCount: 0,
      missingExpensePhaseCodes: [],
      monetaryProgramCount: 0,
      nextAction: "선택한 구간에는 직접 연결된 비용지원 프로그램이 없습니다.",
      nextExpenseProgramKey: null,
      nextPhaseCode: null,
      phaseEstimates: [
        {
          phaseCode: "marketing",
          status: "no-program",
        },
      ],
      selfPayWon: 0,
      status: "no-support-program",
    });
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
