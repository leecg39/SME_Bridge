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
      consultingFundingBreakdown: {
        companyContributionRate: 0.3,
        companyContributionWon: 300000,
        consultingFeeWon: 1000000,
        governmentContributionRate: 0.7,
        governmentContributionWon: 700000,
      },
      consultingFeeWon: 1000000,
      governmentContributionRate: 0.7,
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
      consultingFundingBreakdown: {
        companyContributionRate: 0.3,
        companyContributionWon: 3000000,
        consultingFeeWon: 10000000,
        governmentContributionRate: 0.7,
        governmentContributionWon: 7000000,
      },
      consultingFeeWon: 10000000,
      governmentContributionRate: 0.7,
      governmentContributionWon: 7000000,
      track: "comprehensive",
    });
  });

  it("returns the official seller eligibility criteria for explanation screens", () => {
    const sellerEligibilityCriteria = {
      minimumCompanyAgeYears: 5,
      minimumRepresentativeAgeYears: 55,
      requiresSme: true,
    };

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      sellerEligibilityCriteria,
      track: "basic",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      sellerEligibilityCriteria,
      track: "not-eligible",
    });
  });

  it("returns the official detailed eligibility notice for all pre-check outcomes", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      eligibilityDetailNoticeLabel: "자세한 지원대상 공고문 참조",
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
      eligibilityDetailNoticeLabel: "자세한 지원대상 공고문 참조",
      track: "comprehensive",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      eligibilityDetailNoticeLabel: "자세한 지원대상 공고문 참조",
      track: "not-eligible",
    });
  });

  it("returns the official buyer eligibility criteria in the application guide", () => {
    const buyerEligibilityCriteria = {
      acquisitionIntentLabel: "중소기업 인수 희망",
      eligibleBuyerTypes: ["sme", "individual"],
    };

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      applicationGuide: {
        buyerEligibilityCriteria,
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
        buyerEligibilityCriteria,
      },
      track: "comprehensive",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      applicationGuide: null,
      track: "not-eligible",
    });
  });

  it("returns the official support scope for eligible succession consulting tracks", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      supportScopeLabel:
        "(매도희망기업) M&A 추진을 위한 기초자료 작성 등에 대한 컨설팅, (매수희망기업) 인수대상 탐색, 자금조달방안 등에 대한 컨설팅",
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
      supportScopeLabel:
        "(매도희망기업) 기업실사, 기업가치평가 등에 대한 컨설팅, (매수희망기업) 인수가격협상, 기업실사 등에 대한 컨설팅",
      track: "comprehensive",
    });
  });

  it("returns the official support scope split by seller and buyer roles", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      supportScopeByRole: {
        buyer: "인수대상 탐색, 자금조달방안 등에 대한 컨설팅",
        seller: "M&A 추진을 위한 기초자료 작성 등에 대한 컨설팅",
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
      supportScopeByRole: {
        buyer: "인수가격협상, 기업실사 등에 대한 컨설팅",
        seller: "기업실사, 기업가치평가 등에 대한 컨설팅",
      },
      track: "comprehensive",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      supportScopeByRole: null,
      track: "not-eligible",
    });
  });

  it("returns the official qualification label for eligible succession consulting tracks", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      track: "basic",
      trackQualificationLabel: "기초컨설팅(M&A 교섭 대상이 없는 기업)",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 8,
        hasNegotiationTarget: true,
        isSme: true,
        representativeAge: 57,
      }),
    ).toMatchObject({
      track: "comprehensive",
      trackQualificationLabel: "종합컨설팅(M&A 교섭 대상이 있는 기업)",
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
      selectionPlan: {
        totalLimitCompanies: 140,
        trackLimitCompanies: 100,
        trackLimits: {
          basic: 100,
          comprehensive: 40,
        },
      },
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
      selectionPlan: {
        totalLimitCompanies: 140,
        trackLimitCompanies: 40,
        trackLimits: {
          basic: 100,
          comprehensive: 40,
        },
      },
      selectionLimitCompanies: 40,
      track: "comprehensive",
    });
  });

  it("returns the official track-specific application URL for eligible tracks", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      track: "basic",
      trackApplicationUrl:
        "https://tb.kibo.or.kr/ktbs/bsConsFndApplication/bsConsFndInsert.do?pblictnId=1850&pbrecuNum=1848&bsnsClCd=18&bsnsClNm=%EA%B8%B0%EC%B4%88%EC%BB%A8%EC%84%A4%ED%8C%85&stDt=2026-04-01&enDt=2026-12-31",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 8,
        hasNegotiationTarget: true,
        isSme: true,
        representativeAge: 57,
      }),
    ).toMatchObject({
      track: "comprehensive",
      trackApplicationUrl:
        "https://tb.kibo.or.kr/ktbs/bsConsOvrApplication/bsConsOvrInsert.do?pblictnId=1850&pbrecuNum=1849&bsnsClCd=19&bsnsClNm=%EC%A2%85%ED%95%A9%EC%BB%A8%EC%84%A4%ED%8C%85&stDt=2026-04-01&enDt=2026-12-31",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      track: "not-eligible",
      trackApplicationUrl: null,
    });
  });

  it("returns the official track-specific application CTA label for eligible tracks", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      track: "basic",
      trackApplicationCtaLabel: "기초컨설팅 신청경로",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 8,
        hasNegotiationTarget: true,
        isSme: true,
        representativeAge: 57,
      }),
    ).toMatchObject({
      track: "comprehensive",
      trackApplicationCtaLabel: "종합컨설팅 신청경로",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      track: "not-eligible",
      trackApplicationCtaLabel: null,
    });
  });

  it("returns the official track-specific application guide for eligible tracks", () => {
    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      track: "basic",
      trackApplicationGuide: {
        ctaLabel: "기초컨설팅 신청경로",
        manualAttachmentLabel:
          "2026년도 기초컨설팅 지원사업 신청 매뉴얼_기보 M&A지원센터.pdf",
        manualUrl:
          "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2782&mode=download",
        url: "https://tb.kibo.or.kr/ktbs/bsConsFndApplication/bsConsFndInsert.do?pblictnId=1850&pbrecuNum=1848&bsnsClCd=18&bsnsClNm=%EA%B8%B0%EC%B4%88%EC%BB%A8%EC%84%A4%ED%8C%85&stDt=2026-04-01&enDt=2026-12-31",
      },
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 8,
        hasNegotiationTarget: true,
        isSme: true,
        representativeAge: 57,
      }),
    ).toMatchObject({
      track: "comprehensive",
      trackApplicationGuide: {
        ctaLabel: "종합컨설팅 신청경로",
        manualAttachmentLabel:
          "2026년도 종합컨설팅 지원사업 신청 매뉴얼_기보 M&A지원센터.pdf",
        manualUrl:
          "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2783&mode=download",
        url: "https://tb.kibo.or.kr/ktbs/bsConsOvrApplication/bsConsOvrInsert.do?pblictnId=1850&pbrecuNum=1849&bsnsClCd=19&bsnsClNm=%EC%A2%85%ED%95%A9%EC%BB%A8%EC%84%A4%ED%8C%85&stDt=2026-04-01&enDt=2026-12-31",
      },
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      track: "not-eligible",
      trackApplicationGuide: null,
    });
  });

  it("returns the official budget-exhaustion application period status", () => {
    const applicationPeriodStatus = {
      label: "예산 소진시까지",
      type: "until-budget-exhausted",
    };

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      applicationGuide: {
        applicationPeriodStatus,
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
        applicationPeriodStatus,
      },
      track: "comprehensive",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      applicationGuide: null,
      track: "not-eligible",
    });
  });

  it("returns the official online application method status", () => {
    const applicationMethodStatus = {
      channel: "online",
      label: "온라인 접수 (스마트 테크브릿지)",
      portalLabel: "스마트 테크브릿지",
    };

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 12,
        hasNegotiationTarget: false,
        isSme: true,
        representativeAge: 63,
      }),
    ).toMatchObject({
      applicationGuide: {
        applicationMethodStatus,
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
        applicationMethodStatus,
      },
      track: "comprehensive",
    });

    expect(
      evaluateSuccessionConsultingEligibility({
        companyAgeYears: 3,
        hasNegotiationTarget: false,
        isSme: false,
        representativeAge: 51,
      }),
    ).toMatchObject({
      applicationGuide: null,
      track: "not-eligible",
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
        applicationFormAttachmentLabel:
          "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp",
        applicationMethodLabel: "온라인 접수 (스마트 테크브릿지)",
        applicationPeriodLabel: "예산 소진시까지",
        applicationSchedule: {
          closingType: "until-budget-exhausted",
          endDate: null,
          label: "2026-04-01부터 예산 소진시까지",
          startDate: "2026-04-01",
        },
        applicationPreparationDocumentLabels: [
          "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp",
          "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp",
        ],
        applicationPreparationDocuments: [
          {
            label: "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp",
            url: "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2767&mode=download",
          },
          {
            label: "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp",
            url: "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2768&mode=download",
          },
        ],
        applicationSiteCtaLabel: "온라인신청 바로가기",
        buyerEligibilityLabel: "중소기업 인수를 희망하는 중소기업 또는 개인",
        contactChannels: [
          {
            email: "mna@kibo.or.kr",
            label: "기술보증기금 M&A지원센터",
            phoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
            purposeLabel: "사업 문의",
            type: "business-inquiry",
          },
          {
            email: null,
            label: "기술보증기금 기술거래보호부 플랫폼팀",
            phoneNumbers: ["051-606-7429", "051-606-7431", "051-606-7699"],
            purposeLabel: "온라인 신청 문의",
            type: "online-application",
          },
        ],
        contactEmail: "mna@kibo.or.kr",
        contactLabel: "기술보증기금 M&A지원센터",
        contactPhoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
        noticePublishedDate: "2026-04-03",
        noticeSourceUrl:
          "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120342",
        noticeAttachmentLabel: "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp",
        officialNoticeSource: {
          label: "스마트 테크브릿지 공지사항",
          publishedDate: "2026-03-25",
          url: "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&mode=view&title=%EA%B8%B0%EC%97%85%EC%8A%B9%EA%B3%84+M%26A+%ED%99%9C%EC%84%B1%ED%99%94%EB%A5%BC+%EC%9C%84%ED%95%9C++2026%EB%85%84%EB%8F%84+%EC%BB%A8%EC%84%A4%ED%8C%85+%EC%A7%80%EC%9B%90%EC%82%AC%EC%97%85+%EC%8B%9C%ED%96%89%EA%B3%84%ED%9A%8D+%EA%B3%B5%EA%B3%A0",
        },
        onlineApplicationContactLabel: "기술보증기금 기술거래보호부 플랫폼팀",
        onlineApplicationContactPhoneNumbers: [
          "051-606-7429",
          "051-606-7431",
          "051-606-7699",
        ],
        operatingAgencyLabel: "기술보증기금",
        operatingAgencyProcedureNotice:
          "문의·신청 등의 모든 절차는 수행기관에서 전담합니다.",
        sellerEligibilityLabel: "대표자 만 55세 이상 및 업력 만 5년 이상인 중소기업",
        supervisingMinistryLabel: "중소벤처기업부",
        url: "https://tb.kibo.or.kr/ktbs/index.do",
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
        applicationFormAttachmentLabel:
          "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp",
        applicationMethodLabel: "온라인 접수 (스마트 테크브릿지)",
        applicationPeriodLabel: "예산 소진시까지",
        applicationSchedule: {
          closingType: "until-budget-exhausted",
          endDate: null,
          label: "2026-04-01부터 예산 소진시까지",
          startDate: "2026-04-01",
        },
        applicationPreparationDocumentLabels: [
          "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp",
          "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp",
        ],
        applicationPreparationDocuments: [
          {
            label: "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp",
            url: "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2767&mode=download",
          },
          {
            label: "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp",
            url: "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2768&mode=download",
          },
        ],
        applicationSiteCtaLabel: "온라인신청 바로가기",
        buyerEligibilityLabel: "중소기업 인수를 희망하는 중소기업 또는 개인",
        contactChannels: [
          {
            email: "mna@kibo.or.kr",
            label: "기술보증기금 M&A지원센터",
            phoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
            purposeLabel: "사업 문의",
            type: "business-inquiry",
          },
          {
            email: null,
            label: "기술보증기금 기술거래보호부 플랫폼팀",
            phoneNumbers: ["051-606-7429", "051-606-7431", "051-606-7699"],
            purposeLabel: "온라인 신청 문의",
            type: "online-application",
          },
        ],
        contactEmail: "mna@kibo.or.kr",
        contactLabel: "기술보증기금 M&A지원센터",
        contactPhoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
        noticePublishedDate: "2026-04-03",
        noticeSourceUrl:
          "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120342",
        noticeAttachmentLabel: "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp",
        officialNoticeSource: {
          label: "스마트 테크브릿지 공지사항",
          publishedDate: "2026-03-25",
          url: "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&mode=view&title=%EA%B8%B0%EC%97%85%EC%8A%B9%EA%B3%84+M%26A+%ED%99%9C%EC%84%B1%ED%99%94%EB%A5%BC+%EC%9C%84%ED%95%9C++2026%EB%85%84%EB%8F%84+%EC%BB%A8%EC%84%A4%ED%8C%85+%EC%A7%80%EC%9B%90%EC%82%AC%EC%97%85+%EC%8B%9C%ED%96%89%EA%B3%84%ED%9A%8D+%EA%B3%B5%EA%B3%A0",
        },
        onlineApplicationContactLabel: "기술보증기금 기술거래보호부 플랫폼팀",
        onlineApplicationContactPhoneNumbers: [
          "051-606-7429",
          "051-606-7431",
          "051-606-7699",
        ],
        operatingAgencyLabel: "기술보증기금",
        operatingAgencyProcedureNotice:
          "문의·신청 등의 모든 절차는 수행기관에서 전담합니다.",
        sellerEligibilityLabel: "대표자 만 55세 이상 및 업력 만 5년 이상인 중소기업",
        supervisingMinistryLabel: "중소벤처기업부",
        url: "https://tb.kibo.or.kr/ktbs/index.do",
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
    expect(result.consultingFundingBreakdown).toBeNull();
    expect(result.consultingFeeWon).toBeNull();
    expect(result.companyContributionRate).toBeNull();
    expect(result.companyContributionWon).toBeNull();
    expect(result.governmentContributionRate).toBeNull();
    expect(result.governmentContributionWon).toBeNull();
    expect(result.applicationGuide).toBeNull();
    expect(result.selectionLimitCompanies).toBeNull();
    expect(result.selectionPlan).toBeNull();
    expect(result.supportScopeLabel).toBeNull();
    expect(result.trackQualificationLabel).toBeNull();
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
