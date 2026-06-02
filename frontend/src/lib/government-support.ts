export type SuccessionConsultingTrack = "basic" | "comprehensive" | "not-eligible";

export interface SuccessionConsultingEligibilityInput {
  companyAgeYears: number;
  hasNegotiationTarget: boolean;
  isSme: boolean;
  representativeAge: number;
}

export type SuccessionConsultingBuyerType = "individual" | "sme";

export interface SuccessionConsultingBuyerEligibilityCriteria {
  acquisitionIntentLabel: string;
  eligibleBuyerTypes: SuccessionConsultingBuyerType[];
}

export type SuccessionConsultingApplicationChannel = "online";

export interface SuccessionConsultingApplicationMethodStatus {
  channel: SuccessionConsultingApplicationChannel;
  label: string;
  portalLabel: string;
  portalUrl: string;
}

export type SuccessionConsultingApplicationPeriodType = "until-budget-exhausted";

export interface SuccessionConsultingApplicationPeriodStatus {
  label: string;
  type: SuccessionConsultingApplicationPeriodType;
}

export interface SuccessionConsultingApplicationSchedule {
  closingType: SuccessionConsultingApplicationPeriodType;
  endDate: string | null;
  label: string;
  startDate: string;
}

export interface SuccessionConsultingApplicationPreparationDocument {
  label: string;
  purposeLabel: string;
  url: string;
}

export type SuccessionConsultingContactChannelType =
  | "business-inquiry"
  | "online-application";

export interface SuccessionConsultingContactChannel {
  email: string | null;
  label: string;
  phoneNumbers: string[];
  purposeLabel: string;
  type: SuccessionConsultingContactChannelType;
}

export interface SuccessionConsultingOfficialNoticeSource {
  label: string;
  publishedDate: string;
  purposeLabel: string;
  title: string;
  url: string;
}

export interface SuccessionConsultingNoticeSource {
  label: string;
  publishedDate: string;
  purposeLabel: string;
  title: string;
  url: string;
}

export interface SuccessionConsultingApplicationGuide {
  applicationFormAttachmentLabel: string;
  applicationMethodLabel: string;
  applicationMethodStatus: SuccessionConsultingApplicationMethodStatus;
  applicationPeriodLabel: string;
  applicationPeriodStatus: SuccessionConsultingApplicationPeriodStatus;
  applicationPreparationDocumentLabels: string[];
  applicationPreparationDocuments: SuccessionConsultingApplicationPreparationDocument[];
  applicationSchedule: SuccessionConsultingApplicationSchedule;
  applicationSiteCtaLabel: string;
  buyerEligibilityCriteria: SuccessionConsultingBuyerEligibilityCriteria;
  buyerEligibilityLabel: string;
  contactChannels: SuccessionConsultingContactChannel[];
  contactEmail: string;
  contactLabel: string;
  contactPhoneNumbers: string[];
  noticeAttachmentLabel: string;
  noticePublishedDate: string;
  noticeSource: SuccessionConsultingNoticeSource;
  noticeSourceUrl: string;
  officialNoticeSource: SuccessionConsultingOfficialNoticeSource;
  onlineApplicationContactLabel: string;
  onlineApplicationContactPhoneNumbers: string[];
  operatingAgencyLabel: string;
  operatingAgencyProcedureNotice: string;
  sellerEligibilityLabel: string;
  supervisingMinistryLabel: string;
  url: string;
}

export interface SuccessionConsultingSellerEligibilityCriteria {
  minimumCompanyAgeYears: number;
  minimumRepresentativeAgeYears: number;
  requiresSme: boolean;
}

export type SuccessionConsultingMissingRequirementCode =
  | "company-age"
  | "representative-age"
  | "sme";

export type SuccessionConsultingMissingRequirementInputKey = Exclude<
  keyof SuccessionConsultingEligibilityInput,
  "hasNegotiationTarget"
>;

export type SuccessionConsultingMissingRequirementComparisonOperator =
  | "at-least"
  | "must-be-true";

export interface SuccessionConsultingMissingRequirementDetail {
  actualValue: boolean | number;
  code: SuccessionConsultingMissingRequirementCode;
  comparisonOperator: SuccessionConsultingMissingRequirementComparisonOperator;
  inputKey: SuccessionConsultingMissingRequirementInputKey;
  label: string;
  requiredLabel: string;
  requiredValue: boolean | number;
}

export interface SuccessionConsultingSelectionPlan {
  totalLimitCompanies: number;
  trackLimitCompanies: number;
  trackLimits: Record<Exclude<SuccessionConsultingTrack, "not-eligible">, number>;
  unitLabel: string;
}

export interface SuccessionConsultingSupportScopeByRole {
  buyer: string;
  seller: string;
}

export interface SuccessionConsultingTrackApplicationGuide {
  ctaLabel: string;
  manualAttachmentLabel: string;
  manualUrl: string;
  trackLabel: string;
  url: string;
}

export interface SuccessionConsultingFundingBreakdown {
  companyContributionRate: number;
  companyContributionWon: number;
  consultingFeeWon: number;
  governmentContributionRate: number;
  governmentContributionWon: number;
}

export interface SuccessionConsultingEligibilityResult {
  applicationGuide: SuccessionConsultingApplicationGuide | null;
  companyContributionRate: number | null;
  companyContributionWon: number | null;
  consultingFundingBreakdown: SuccessionConsultingFundingBreakdown | null;
  consultingFeeWon: number | null;
  eligibilityDetailNoticeLabel: string;
  eligibilityDetailNoticeUrl: string;
  governmentContributionRate: number | null;
  governmentContributionWon: number | null;
  isEligible: boolean;
  missingRequirementDetails: SuccessionConsultingMissingRequirementDetail[];
  missingRequirements: string[];
  nextAction: string;
  selectionLimitCompanies: number | null;
  selectionPlan: SuccessionConsultingSelectionPlan | null;
  sellerEligibilityCriteria: SuccessionConsultingSellerEligibilityCriteria;
  supportScopeByRole: SuccessionConsultingSupportScopeByRole | null;
  supportScopeLabel: string | null;
  track: SuccessionConsultingTrack;
  trackApplicationCtaLabel: string | null;
  trackApplicationGuide: SuccessionConsultingTrackApplicationGuide | null;
  trackApplicationUrl: string | null;
  trackQualificationLabel: string | null;
}

export interface MnaSupportFunding {
  max_amount_won: number | null;
  note: string;
  rate_label: string;
  standard_rate: number;
  venture_max_amount_won?: number;
  venture_rate?: number;
}

export interface MnaSupportProgram {
  program_key: string;
  title: string;
  summary: string;
  support_scope: string;
  funding: MnaSupportFunding | null;
  required_document_keys: string[];
  next_action: string;
  source_label: string;
  source_url: string;
  rule_base_date: string;
}

export interface MnaSupportReadiness {
  completedRequiredDocuments: string[];
  missingRequiredDocuments: string[];
  percent: number;
  programKey: string;
  requiredDocumentKeys: string[];
}

export interface MnaSupportFundingEstimate {
  estimatedSupportWon: number;
  expenseAmountWon: number;
  isCapped: boolean;
  maxAmountWon: number | null;
  programKey: string;
  rate: number;
  selfPayWon: number;
}

export interface MnaPhaseSupportFundingEstimate {
  estimatedSupportWon: number;
  estimates: MnaSupportFundingEstimate[];
  expenseAmountWon: number;
  missingExpenseProgramKeys: string[];
  nextAction: string;
  nextExpenseProgramKey: string | null;
  nonMonetaryProgramKeys: string[];
  phaseCode: string;
  selfPayWon: number;
  status: MnaPhaseSupportFundingStatus;
}

export type MnaPhaseSupportFundingStatus =
  | "estimated"
  | "needs-expense"
  | "no-monetary-support"
  | "no-program";

export interface MnaRoadmapSupportFundingPlan {
  cappedPhaseCodes: string[];
  cappedProgramCount: number;
  cappedProgramKeys: string[];
  completedExpenseProgramCount: number;
  estimatedSupportWon: number;
  expenseAmountWon: number;
  expenseInputPercent: number;
  missingExpensePhaseCodes: string[];
  missingExpenseProgramCount: number;
  monetaryProgramCount: number;
  nextAction: string;
  nextExpenseProgramKey: string | null;
  nextPhaseCode: string | null;
  phaseEstimates: MnaPhaseSupportFundingEstimate[];
  selfPayWon: number;
  status: MnaRoadmapSupportFundingStatus;
}

export type MnaRoadmapSupportFundingStatus =
  | "estimated"
  | "needs-expense"
  | "no-support-program";

export type MnaPhaseSupportReadinessStatus =
  | "in-progress"
  | "no-program"
  | "not-started"
  | "ready";

export interface MnaPhaseSupportReadiness {
  missingDocumentKeys: string[];
  nextProgramKey: string | null;
  overallPercent: number;
  phaseCode: string;
  programs: MnaSupportReadiness[];
  readyProgramKeys: string[];
  status: MnaPhaseSupportReadinessStatus;
  totalRequiredDocumentKeys: string[];
}

export const SUCCESSION_SUPPORT_CHECK_TASK =
  "기업승계 M&A 컨설팅 지원사업 자격 확인";

export const SUCCESSION_SUPPORT_RULE_BASE_DATE = "2026-05-31";
const SUCCESSION_CONSULTING_COMPANY_CONTRIBUTION_RATE = 0.3;
const SUCCESSION_CONSULTING_GOVERNMENT_CONTRIBUTION_RATE = 0.7;
const SUCCESSION_CONSULTING_ELIGIBILITY_DETAIL_NOTICE_LABEL =
  "자세한 지원대상 공고문 참조";
const SUCCESSION_CONSULTING_FEES_WON: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  number
> = {
  basic: 1000000,
  comprehensive: 10000000,
};
const SUCCESSION_CONSULTING_SELECTION_LIMITS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  number
> = {
  basic: 100,
  comprehensive: 40,
};
const SUCCESSION_CONSULTING_TOTAL_SELECTION_LIMIT = 140;
const SUCCESSION_CONSULTING_SELECTION_UNIT_LABEL = "개사";
const SUCCESSION_CONSULTING_SELLER_ELIGIBILITY_CRITERIA = {
  minimumCompanyAgeYears: 5,
  minimumRepresentativeAgeYears: 55,
  requiresSme: true,
} satisfies SuccessionConsultingSellerEligibilityCriteria;
const SUCCESSION_CONSULTING_SUPPORT_SCOPE_LABELS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  string
> = {
  basic:
    "(매도희망기업) M&A 추진을 위한 기초자료 작성 등에 대한 컨설팅, (매수희망기업) 인수대상 탐색, 자금조달방안 등에 대한 컨설팅",
  comprehensive:
    "(매도희망기업) 기업실사, 기업가치평가 등에 대한 컨설팅, (매수희망기업) 인수가격협상, 기업실사 등에 대한 컨설팅",
};
const SUCCESSION_CONSULTING_SUPPORT_SCOPE_BY_ROLE: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  SuccessionConsultingSupportScopeByRole
> = {
  basic: {
    buyer: "인수대상 탐색, 자금조달방안 등에 대한 컨설팅",
    seller: "M&A 추진을 위한 기초자료 작성 등에 대한 컨설팅",
  },
  comprehensive: {
    buyer: "인수가격협상, 기업실사 등에 대한 컨설팅",
    seller: "기업실사, 기업가치평가 등에 대한 컨설팅",
  },
};
const SUCCESSION_CONSULTING_TRACK_QUALIFICATION_LABELS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  string
> = {
  basic: "기초컨설팅(M&A 교섭 대상이 없는 기업)",
  comprehensive: "종합컨설팅(M&A 교섭 대상이 있는 기업)",
};
const SUCCESSION_CONSULTING_TRACK_APPLICATION_URLS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  string
> = {
  basic:
    "https://tb.kibo.or.kr/ktbs/bsConsFndApplication/bsConsFndInsert.do?pblictnId=1850&pbrecuNum=1848&bsnsClCd=18&bsnsClNm=%EA%B8%B0%EC%B4%88%EC%BB%A8%EC%84%A4%ED%8C%85&stDt=2026-04-01&enDt=2026-12-31",
  comprehensive:
    "https://tb.kibo.or.kr/ktbs/bsConsOvrApplication/bsConsOvrInsert.do?pblictnId=1850&pbrecuNum=1849&bsnsClCd=19&bsnsClNm=%EC%A2%85%ED%95%A9%EC%BB%A8%EC%84%A4%ED%8C%85&stDt=2026-04-01&enDt=2026-12-31",
};
const SUCCESSION_CONSULTING_TRACK_APPLICATION_CTA_LABELS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  string
> = {
  basic: "기초컨설팅 신청경로",
  comprehensive: "종합컨설팅 신청경로",
};
const SUCCESSION_CONSULTING_TRACK_APPLICATION_MANUALS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  Pick<SuccessionConsultingTrackApplicationGuide, "manualAttachmentLabel" | "manualUrl">
> = {
  basic: {
    manualAttachmentLabel:
      "2026년도 기초컨설팅 지원사업 신청 매뉴얼_기보 M&A지원센터.pdf",
    manualUrl:
      "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2782&mode=download",
  },
  comprehensive: {
    manualAttachmentLabel:
      "2026년도 종합컨설팅 지원사업 신청 매뉴얼_기보 M&A지원센터.pdf",
    manualUrl:
      "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2783&mode=download",
  },
};
const SUCCESSION_CONSULTING_TRACK_APPLICATION_GUIDES: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  SuccessionConsultingTrackApplicationGuide
> = {
  basic: {
    ctaLabel: SUCCESSION_CONSULTING_TRACK_APPLICATION_CTA_LABELS.basic,
    ...SUCCESSION_CONSULTING_TRACK_APPLICATION_MANUALS.basic,
    trackLabel: "기초컨설팅",
    url: SUCCESSION_CONSULTING_TRACK_APPLICATION_URLS.basic,
  },
  comprehensive: {
    ctaLabel: SUCCESSION_CONSULTING_TRACK_APPLICATION_CTA_LABELS.comprehensive,
    ...SUCCESSION_CONSULTING_TRACK_APPLICATION_MANUALS.comprehensive,
    trackLabel: "종합컨설팅",
    url: SUCCESSION_CONSULTING_TRACK_APPLICATION_URLS.comprehensive,
  },
};
const SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_LABEL =
  "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp";
const SUCCESSION_CONSULTING_OFFICIAL_NOTICE_URL =
  "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&mode=view&title=%EA%B8%B0%EC%97%85%EC%8A%B9%EA%B3%84+M%26A+%ED%99%9C%EC%84%B1%ED%99%94%EB%A5%BC+%EC%9C%84%ED%95%9C++2026%EB%85%84%EB%8F%84+%EC%BB%A8%EC%84%A4%ED%8C%85+%EC%A7%80%EC%9B%90%EC%82%AC%EC%97%85+%EC%8B%9C%ED%96%89%EA%B3%84%ED%9A%8D+%EA%B3%B5%EA%B3%A0";
const SUCCESSION_CONSULTING_OFFICIAL_NOTICE_SOURCE = {
  label: "스마트 테크브릿지 공지사항",
  publishedDate: "2026-03-25",
  purposeLabel: "원공지 및 신청 첨부 기준",
  title: "기업승계 M&A 활성화를 위한 2026년도 컨설팅 지원사업 시행계획 공고",
  url: SUCCESSION_CONSULTING_OFFICIAL_NOTICE_URL,
} satisfies SuccessionConsultingOfficialNoticeSource;
const SUCCESSION_CONSULTING_NOTICE_SOURCE_URL =
  "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120342";
const SUCCESSION_CONSULTING_NOTICE_SOURCE = {
  label: "기업마당 공고",
  publishedDate: "2026-04-03",
  purposeLabel: "지원사업 공고 요약",
  title: "2026년 기업승계 M&A 활성화를 위한 컨설팅 지원사업 시행계획 공고",
  url: SUCCESSION_CONSULTING_NOTICE_SOURCE_URL,
} satisfies SuccessionConsultingNoticeSource;
const SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_URL =
  "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2767&mode=download";
const SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_LABEL =
  "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp";
const SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_URL =
  "https://tb.kibo.or.kr/ktbs/board/notice/notice.do?articleNo=1850&attachNo=2768&mode=download";
const SUCCESSION_CONSULTING_APPLICATION_PREPARATION_DOCUMENTS = [
  {
    label: SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_LABEL,
    purposeLabel: "사업 시행계획 공고 확인",
    url: SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_URL,
  },
  {
    label: SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_LABEL,
    purposeLabel: "신청 서식 작성",
    url: SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_URL,
  },
] satisfies SuccessionConsultingApplicationPreparationDocument[];
const SUCCESSION_CONSULTING_APPLICATION_METHOD_STATUS = {
  channel: "online",
  label: "온라인 접수 (스마트 테크브릿지)",
  portalLabel: "스마트 테크브릿지",
  portalUrl: "https://tb.kibo.or.kr/ktbs/index.do",
} satisfies SuccessionConsultingApplicationMethodStatus;
const SUCCESSION_CONSULTING_APPLICATION_PERIOD_STATUS = {
  label: "예산 소진시까지",
  type: "until-budget-exhausted",
} satisfies SuccessionConsultingApplicationPeriodStatus;
const SUCCESSION_CONSULTING_APPLICATION_SCHEDULE = {
  closingType: "until-budget-exhausted",
  endDate: null,
  label: "2026-04-01부터 예산 소진시까지",
  startDate: "2026-04-01",
} satisfies SuccessionConsultingApplicationSchedule;
const SUCCESSION_CONSULTING_BUYER_ELIGIBILITY_CRITERIA: SuccessionConsultingBuyerEligibilityCriteria =
  {
    acquisitionIntentLabel: "중소기업 인수 희망",
    eligibleBuyerTypes: ["sme", "individual"],
  };
const SUCCESSION_CONSULTING_CONTACT_CHANNELS = [
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
] satisfies SuccessionConsultingContactChannel[];
const SUCCESSION_CONSULTING_APPLICATION_GUIDE: SuccessionConsultingApplicationGuide = {
  applicationFormAttachmentLabel: SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_LABEL,
  applicationMethodLabel: "온라인 접수 (스마트 테크브릿지)",
  applicationMethodStatus: SUCCESSION_CONSULTING_APPLICATION_METHOD_STATUS,
  applicationPeriodLabel: "예산 소진시까지",
  applicationPeriodStatus: SUCCESSION_CONSULTING_APPLICATION_PERIOD_STATUS,
  applicationPreparationDocumentLabels: [
    SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_LABEL,
    SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_LABEL,
  ],
  applicationPreparationDocuments: SUCCESSION_CONSULTING_APPLICATION_PREPARATION_DOCUMENTS,
  applicationSchedule: SUCCESSION_CONSULTING_APPLICATION_SCHEDULE,
  applicationSiteCtaLabel: "온라인신청 바로가기",
  buyerEligibilityCriteria: SUCCESSION_CONSULTING_BUYER_ELIGIBILITY_CRITERIA,
  buyerEligibilityLabel: "중소기업 인수를 희망하는 중소기업 또는 개인",
  contactChannels: SUCCESSION_CONSULTING_CONTACT_CHANNELS,
  contactEmail: "mna@kibo.or.kr",
  contactLabel: "기술보증기금 M&A지원센터",
  contactPhoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
  noticeAttachmentLabel: SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_LABEL,
  noticePublishedDate: "2026-04-03",
  noticeSource: SUCCESSION_CONSULTING_NOTICE_SOURCE,
  noticeSourceUrl: SUCCESSION_CONSULTING_NOTICE_SOURCE_URL,
  officialNoticeSource: SUCCESSION_CONSULTING_OFFICIAL_NOTICE_SOURCE,
  onlineApplicationContactLabel: "기술보증기금 기술거래보호부 플랫폼팀",
  onlineApplicationContactPhoneNumbers: ["051-606-7429", "051-606-7431", "051-606-7699"],
  operatingAgencyLabel: "기술보증기금",
  operatingAgencyProcedureNotice: "문의·신청 등의 모든 절차는 수행기관에서 전담합니다.",
  sellerEligibilityLabel: "대표자 만 55세 이상 및 업력 만 5년 이상인 중소기업",
  supervisingMinistryLabel: "중소벤처기업부",
  url: "https://tb.kibo.or.kr/ktbs/index.do",
};
export const MNA_ACTIVATION_SUPPORT_SOURCE_URL =
  "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156748624";

export function evaluateSuccessionConsultingEligibility(
  input: SuccessionConsultingEligibilityInput,
): SuccessionConsultingEligibilityResult {
  const {
    minimumCompanyAgeYears,
    minimumRepresentativeAgeYears,
    requiresSme,
  } = SUCCESSION_CONSULTING_SELLER_ELIGIBILITY_CRITERIA;
  const missingRequirementDetails: SuccessionConsultingMissingRequirementDetail[] = [];
  if (!input.isSme && requiresSme) {
    missingRequirementDetails.push({
      actualValue: input.isSme,
      code: "sme",
      comparisonOperator: "must-be-true",
      inputKey: "isSme",
      label: "중소기업 여부 확인",
      requiredLabel: "중소기업",
      requiredValue: true,
    });
  }
  if (input.representativeAge < minimumRepresentativeAgeYears) {
    missingRequirementDetails.push({
      actualValue: input.representativeAge,
      code: "representative-age",
      comparisonOperator: "at-least",
      inputKey: "representativeAge",
      label: "대표자 만 55세 이상",
      requiredLabel: "대표자 만 55세 이상",
      requiredValue: minimumRepresentativeAgeYears,
    });
  }
  if (input.companyAgeYears < minimumCompanyAgeYears) {
    missingRequirementDetails.push({
      actualValue: input.companyAgeYears,
      code: "company-age",
      comparisonOperator: "at-least",
      inputKey: "companyAgeYears",
      label: "업력 만 5년 이상",
      requiredLabel: "업력 만 5년 이상",
      requiredValue: minimumCompanyAgeYears,
    });
  }
  const missingRequirements = missingRequirementDetails.map(({ label }) => label);
  const isEligible = missingRequirements.length === 0;
  const track = isEligible
    ? input.hasNegotiationTarget
      ? "comprehensive"
      : "basic"
    : "not-eligible";
  const consultingFeeWon =
    track === "not-eligible" ? null : SUCCESSION_CONSULTING_FEES_WON[track];
  const companyContributionRate =
    consultingFeeWon === null ? null : SUCCESSION_CONSULTING_COMPANY_CONTRIBUTION_RATE;
  const companyContributionWon =
    consultingFeeWon === null || companyContributionRate === null
      ? null
      : Math.round(consultingFeeWon * companyContributionRate);
  const governmentContributionRate =
    consultingFeeWon === null ? null : SUCCESSION_CONSULTING_GOVERNMENT_CONTRIBUTION_RATE;
  const governmentContributionWon =
    consultingFeeWon === null || companyContributionWon === null
      ? null
      : consultingFeeWon - companyContributionWon;
  const consultingFundingBreakdown =
    consultingFeeWon === null ||
    companyContributionRate === null ||
    companyContributionWon === null ||
    governmentContributionRate === null ||
    governmentContributionWon === null
      ? null
      : {
          companyContributionRate,
          companyContributionWon,
          consultingFeeWon,
          governmentContributionRate,
          governmentContributionWon,
        };

  return {
    applicationGuide:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_APPLICATION_GUIDE,
    companyContributionRate,
    companyContributionWon,
    consultingFundingBreakdown,
    consultingFeeWon,
    eligibilityDetailNoticeLabel: SUCCESSION_CONSULTING_ELIGIBILITY_DETAIL_NOTICE_LABEL,
    eligibilityDetailNoticeUrl: SUCCESSION_CONSULTING_OFFICIAL_NOTICE_URL,
    governmentContributionRate,
    governmentContributionWon,
    isEligible,
    missingRequirementDetails,
    missingRequirements,
    nextAction: supportNextAction(track),
    selectionLimitCompanies:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_SELECTION_LIMITS[track],
    selectionPlan:
      track === "not-eligible"
        ? null
        : {
            totalLimitCompanies: SUCCESSION_CONSULTING_TOTAL_SELECTION_LIMIT,
            trackLimitCompanies: SUCCESSION_CONSULTING_SELECTION_LIMITS[track],
            trackLimits: SUCCESSION_CONSULTING_SELECTION_LIMITS,
            unitLabel: SUCCESSION_CONSULTING_SELECTION_UNIT_LABEL,
          },
    sellerEligibilityCriteria: SUCCESSION_CONSULTING_SELLER_ELIGIBILITY_CRITERIA,
    supportScopeByRole:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_SUPPORT_SCOPE_BY_ROLE[track],
    supportScopeLabel:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_SUPPORT_SCOPE_LABELS[track],
    track,
    trackApplicationCtaLabel:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_TRACK_APPLICATION_CTA_LABELS[track],
    trackApplicationGuide:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_TRACK_APPLICATION_GUIDES[track],
    trackApplicationUrl:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_TRACK_APPLICATION_URLS[track],
    trackQualificationLabel:
      track === "not-eligible"
        ? null
        : SUCCESSION_CONSULTING_TRACK_QUALIFICATION_LABELS[track],
  };
}

function supportNextAction(track: SuccessionConsultingTrack): string {
  if (track === "comprehensive") {
    return "교섭 대상 기업, 기업가치평가, 실사 범위를 정리해 종합컨설팅 상담으로 연결합니다.";
  }
  if (track === "basic") {
    return "M&A 추진 기초자료, 매각 목적, 후보 탐색 조건을 정리해 기초컨설팅 상담으로 연결합니다.";
  }
  return "대표자 연령, 업력, 중소기업 여부를 먼저 확인한 뒤 일반 M&A 상담으로 연결합니다.";
}

export function getMnaSupportProgramsForPhase(phaseCode: string): MnaSupportProgram[] {
  return MNA_SUPPORT_PROGRAMS_BY_PHASE[phaseCode] ?? [];
}

export function evaluateMnaSupportReadiness(
  programKey: string,
  completedDocumentKeys: string[],
): MnaSupportReadiness {
  const requiredDocumentKeys = getMnaSupportProgramByKey(programKey)?.required_document_keys ?? [];
  const completedSet = new Set(completedDocumentKeys);
  const completedRequiredDocuments = requiredDocumentKeys.filter((key) => completedSet.has(key));
  const missingRequiredDocuments = requiredDocumentKeys.filter((key) => !completedSet.has(key));

  return {
    completedRequiredDocuments,
    missingRequiredDocuments,
    percent:
      requiredDocumentKeys.length === 0
        ? 0
        : Math.round((completedRequiredDocuments.length / requiredDocumentKeys.length) * 100),
    programKey,
    requiredDocumentKeys,
  };
}

export function estimateMnaSupportFunding(
  programKey: string,
  expenseAmountWon: number,
  options: { isVentureCompany?: boolean } = {},
): MnaSupportFundingEstimate | null {
  const funding = getMnaSupportProgramByKey(programKey)?.funding;
  if (!funding) return null;

  const expenseAmount = Math.max(0, expenseAmountWon);
  const isVentureFunding = options.isVentureCompany && funding.venture_rate !== undefined;
  const rate = isVentureFunding ? funding.venture_rate! : funding.standard_rate;
  const maxAmountWon =
    isVentureFunding && funding.venture_max_amount_won !== undefined
      ? funding.venture_max_amount_won
      : funding.max_amount_won;
  const uncappedSupport = expenseAmount * rate;
  const estimatedSupport =
    maxAmountWon === null ? uncappedSupport : Math.min(uncappedSupport, maxAmountWon);

  return {
    estimatedSupportWon: estimatedSupport,
    expenseAmountWon: expenseAmount,
    isCapped: maxAmountWon !== null && uncappedSupport > maxAmountWon,
    maxAmountWon,
    programKey,
    rate,
    selfPayWon: Math.max(0, expenseAmount - estimatedSupport),
  };
}

export function estimateMnaPhaseSupportFunding(
  phaseCode: string,
  expenseAmountWonByProgramKey: Record<string, number>,
  options: { isVentureCompany?: boolean } = {},
): MnaPhaseSupportFundingEstimate {
  const programs = getMnaSupportProgramsForPhase(phaseCode);
  const estimates = programs.flatMap((program) => {
    const expenseAmountWon = expenseAmountWonByProgramKey[program.program_key];
    if (
      !program.funding ||
      expenseAmountWon === undefined ||
      !Object.hasOwn(expenseAmountWonByProgramKey, program.program_key)
    ) {
      return [];
    }

    const estimate = estimateMnaSupportFunding(
      program.program_key,
      expenseAmountWon,
      options,
    );

    return estimate ? [estimate] : [];
  });
  const expenseAmountWon = sumBy(estimates, (estimate) => estimate.expenseAmountWon);
  const estimatedSupportWon = sumBy(estimates, (estimate) => estimate.estimatedSupportWon);
  const missingExpenseProgramKeys = programs
    .filter(
      (program) =>
        program.funding && !Object.hasOwn(expenseAmountWonByProgramKey, program.program_key),
    )
    .map((program) => program.program_key);
  const monetaryProgramCount = programs.filter((program) => program.funding).length;
  const nextExpenseProgramKey = missingExpenseProgramKeys[0] ?? null;
  const status = getPhaseSupportFundingStatus(
    programs.length,
    monetaryProgramCount,
    missingExpenseProgramKeys.length,
  );

  return {
    estimatedSupportWon,
    estimates,
    expenseAmountWon,
    missingExpenseProgramKeys,
    nextAction: getPhaseSupportFundingNextAction(status, nextExpenseProgramKey),
    nextExpenseProgramKey,
    nonMonetaryProgramKeys: programs
      .filter((program) => program.funding === null)
      .map((program) => program.program_key),
    phaseCode,
    selfPayWon: Math.max(0, expenseAmountWon - estimatedSupportWon),
    status,
  };
}

export function estimateMnaRoadmapSupportFunding(
  phaseCodes: string[],
  expenseAmountWonByPhaseCode: Record<string, Record<string, number>>,
  options: { isVentureCompany?: boolean } = {},
): MnaRoadmapSupportFundingPlan {
  const phaseEstimates = phaseCodes.map((phaseCode) =>
    estimateMnaPhaseSupportFunding(
      phaseCode,
      expenseAmountWonByPhaseCode[phaseCode] ?? {},
      options,
    ),
  );
  const missingExpensePhaseCodes = phaseEstimates
    .filter((phaseEstimate) => phaseEstimate.status === "needs-expense")
    .map((phaseEstimate) => phaseEstimate.phaseCode);
  const nextPhaseEstimate =
    phaseEstimates.find((phaseEstimate) => phaseEstimate.status === "needs-expense") ?? null;
  const completedExpenseProgramCount = sumBy(
    phaseEstimates,
    (phaseEstimate) => phaseEstimate.estimates.length,
  );
  const missingExpenseProgramCount = sumBy(
    phaseEstimates,
    (phaseEstimate) => phaseEstimate.missingExpenseProgramKeys.length,
  );
  const cappedPrograms = phaseEstimates.flatMap((phaseEstimate) =>
    phaseEstimate.estimates
      .filter((estimate) => estimate.isCapped)
      .map((estimate) => ({
        phaseCode: phaseEstimate.phaseCode,
        programKey: estimate.programKey,
      })),
  );
  const monetaryProgramCount = completedExpenseProgramCount + missingExpenseProgramCount;
  const status = getRoadmapSupportFundingStatus(
    phaseEstimates.length,
    phaseEstimates.some((phaseEstimate) => phaseEstimate.status !== "no-program"),
    missingExpensePhaseCodes.length,
  );

  return {
    cappedPhaseCodes: uniqueValues(cappedPrograms.map((program) => program.phaseCode)),
    cappedProgramCount: cappedPrograms.length,
    cappedProgramKeys: cappedPrograms.map((program) => program.programKey),
    completedExpenseProgramCount,
    estimatedSupportWon: sumBy(
      phaseEstimates,
      (phaseEstimate) => phaseEstimate.estimatedSupportWon,
    ),
    expenseAmountWon: sumBy(phaseEstimates, (phaseEstimate) => phaseEstimate.expenseAmountWon),
    expenseInputPercent:
      monetaryProgramCount === 0
        ? 0
        : Math.round((completedExpenseProgramCount / monetaryProgramCount) * 100),
    missingExpensePhaseCodes,
    missingExpenseProgramCount,
    monetaryProgramCount,
    nextAction: getRoadmapSupportFundingNextAction(status, nextPhaseEstimate),
    nextExpenseProgramKey: nextPhaseEstimate?.nextExpenseProgramKey ?? null,
    nextPhaseCode: nextPhaseEstimate?.phaseCode ?? null,
    phaseEstimates,
    selfPayWon: sumBy(phaseEstimates, (phaseEstimate) => phaseEstimate.selfPayWon),
    status,
  };
}

export function evaluateMnaPhaseSupportReadiness(
  phaseCode: string,
  completedDocumentKeys: string[],
): MnaPhaseSupportReadiness {
  const programs = getMnaSupportProgramsForPhase(phaseCode).map((program) =>
    evaluateMnaSupportReadiness(program.program_key, completedDocumentKeys),
  );
  const totalRequiredDocumentKeys = uniqueDocumentKeys(
    programs.flatMap((program) => program.requiredDocumentKeys),
  );
  const completedSet = new Set(completedDocumentKeys);
  const completedDocumentCount = totalRequiredDocumentKeys.filter((key) =>
    completedSet.has(key),
  ).length;
  const missingDocumentKeys = totalRequiredDocumentKeys.filter((key) => !completedSet.has(key));
  const overallPercent =
    totalRequiredDocumentKeys.length === 0
      ? 0
      : Math.round((completedDocumentCount / totalRequiredDocumentKeys.length) * 100);

  return {
    missingDocumentKeys,
    nextProgramKey: getNextSupportProgramKey(programs),
    overallPercent,
    phaseCode,
    programs,
    readyProgramKeys: programs
      .filter((program) => program.requiredDocumentKeys.length > 0 && program.percent === 100)
      .map((program) => program.programKey),
    status: getPhaseSupportReadinessStatus(programs.length, overallPercent),
    totalRequiredDocumentKeys,
  };
}

function getMnaSupportProgramByKey(programKey: string): MnaSupportProgram | undefined {
  return Object.values(MNA_SUPPORT_PROGRAMS_BY_PHASE)
    .flat()
    .find((program) => program.program_key === programKey);
}

function getNextSupportProgramKey(programs: MnaSupportReadiness[]): string | null {
  const incompletePrograms = programs.filter(
    (program) => program.requiredDocumentKeys.length > 0 && program.percent < 100,
  );
  if (incompletePrograms.length === 0) return null;

  return incompletePrograms.reduce((best, program) =>
    program.percent > best.percent ? program : best,
  ).programKey;
}

function getPhaseSupportReadinessStatus(
  programCount: number,
  overallPercent: number,
): MnaPhaseSupportReadinessStatus {
  if (programCount === 0) return "no-program";
  if (overallPercent === 100) return "ready";
  if (overallPercent > 0) return "in-progress";
  return "not-started";
}

function getPhaseSupportFundingStatus(
  programCount: number,
  monetaryProgramCount: number,
  missingExpenseProgramCount: number,
): MnaPhaseSupportFundingStatus {
  if (programCount === 0) return "no-program";
  if (monetaryProgramCount === 0) return "no-monetary-support";
  if (missingExpenseProgramCount > 0) return "needs-expense";
  return "estimated";
}

function getPhaseSupportFundingNextAction(
  status: MnaPhaseSupportFundingStatus,
  nextExpenseProgramKey: string | null,
): string {
  if (status === "needs-expense" && nextExpenseProgramKey) {
    const title = getMnaSupportProgramByKey(nextExpenseProgramKey)?.title ?? "비용지원";

    return `${title} 예상 비용을 입력해 지원금과 자부담을 산출합니다.`;
  }
  if (status === "no-program") {
    return "이 단계에는 직접 연결된 비용지원 프로그램이 없습니다.";
  }
  if (status === "no-monetary-support") {
    return "비용지원 산출 대상은 없고 비금전 지원 프로그램을 상담 스냅샷에 반영합니다.";
  }
  return "예상 지원금과 자부담을 상담 스냅샷에 반영합니다.";
}

function getRoadmapSupportFundingStatus(
  phaseCount: number,
  hasSupportProgram: boolean,
  missingExpensePhaseCount: number,
): MnaRoadmapSupportFundingStatus {
  if (phaseCount === 0 || !hasSupportProgram) return "no-support-program";
  if (missingExpensePhaseCount > 0) return "needs-expense";
  return "estimated";
}

function getRoadmapSupportFundingNextAction(
  status: MnaRoadmapSupportFundingStatus,
  nextPhaseEstimate: MnaPhaseSupportFundingEstimate | null,
): string {
  if (status === "needs-expense" && nextPhaseEstimate) {
    return `${nextPhaseEstimate.phaseCode} 단계의 ${nextPhaseEstimate.nextAction}`;
  }
  if (status === "no-support-program") {
    return "선택한 구간에는 직접 연결된 비용지원 프로그램이 없습니다.";
  }
  return "전 구간 예상 지원금과 자부담을 상담 스냅샷에 반영합니다.";
}

function uniqueDocumentKeys(documentKeys: string[]): string[] {
  return Array.from(new Set(documentKeys));
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values));
}

function sumBy<T>(items: T[], selectValue: (item: T) => number): number {
  return items.reduce((total, item) => total + selectValue(item), 0);
}

const MNA_SUPPORT_PROGRAMS_BY_PHASE: Record<string, MnaSupportProgram[]> = {
  preparation: [
    {
      program_key: "succession-consulting",
      title: "기업승계 M&A 컨설팅",
      summary: "교섭 대상 유무에 따라 기초컨설팅 또는 종합컨설팅으로 초기 상담 경로를 나눕니다.",
      support_scope: "기초자료 작성, 매각 목적 정리, 교섭 대상 검토",
      funding: null,
      required_document_keys: [
        "phase-1-strategy-brief",
        "phase-1-synergy-hypothesis",
        "phase-1-approval-memo",
      ],
      next_action: "대표자 연령, 업력, 중소기업 여부, 교섭 대상 유무를 상담 스냅샷에 포함합니다.",
      source_label: "기업마당 기업승계 M&A 컨설팅 지원사업",
      source_url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120342",
      rule_base_date: SUCCESSION_SUPPORT_RULE_BASE_DATE,
    },
    {
      program_key: "valuation-cost-support",
      title: "기업가치평가 비용지원",
      summary: "M&A 검토 단계에서 외부 가치평가 비용 부담을 낮추는 지원사업을 검토합니다.",
      support_scope: "기업가치평가 비용",
      funding: {
        max_amount_won: 15000000,
        note: "벤처기업은 60%, 2,000만원 한도까지 검토합니다.",
        rate_label: "일반 40% / 벤처 60%",
        standard_rate: 0.4,
        venture_max_amount_won: 20000000,
        venture_rate: 0.6,
      },
      required_document_keys: [
        "phase-1-strategy-brief",
        "phase-3-valuation-workbook-checklist",
      ],
      next_action: "최근 3개년 재무자료와 가치평가 목적을 정리합니다.",
      source_label: "정책브리핑 2026년 M&A 활성화 지원사업",
      source_url: MNA_ACTIVATION_SUPPORT_SOURCE_URL,
      rule_base_date: SUCCESSION_SUPPORT_RULE_BASE_DATE,
    },
  ],
  diligence: [
    {
      program_key: "diligence-cost-support",
      title: "기업실사 비용지원",
      summary: "재무·법률·세무 등 실사 단계의 외부 비용 지원 가능성을 검토합니다.",
      support_scope: "기업실사 비용",
      funding: {
        max_amount_won: 30000000,
        note: "법률·회계·세무 분야별 실사는 1,000만원 한도로 검토합니다.",
        rate_label: "50%",
        standard_rate: 0.5,
      },
      required_document_keys: [
        "dd-request-list",
        "phase-3-data-room-index",
        "phase-3-red-flag-log",
      ],
      next_action: "실사 요청자료 목록, 데이터룸 인덱스, Red Flag 로그를 우선 정리합니다.",
      source_label: "정책브리핑 2026년 M&A 활성화 지원사업",
      source_url: MNA_ACTIVATION_SUPPORT_SOURCE_URL,
      rule_base_date: SUCCESSION_SUPPORT_RULE_BASE_DATE,
    },
  ],
  "closing-pmi": [
    {
      program_key: "pmi-consulting-support",
      title: "PMI 컨설팅 비용지원",
      summary: "거래 종결 후 통합 실행계획 수립 비용 지원 가능성을 검토합니다.",
      support_scope: "PMI 컨설팅 비용",
      funding: {
        max_amount_won: 25000000,
        note: "조직·인사·재무·사업 통합 컨설팅 비용 기준입니다.",
        rate_label: "50%",
        standard_rate: 0.5,
      },
      required_document_keys: [
        "phase-5-pmi-100-day-plan",
        "phase-5-day-1-communication-plan",
        "phase-5-integration-workstream-tracker",
      ],
      next_action: "PMI 100일 실행계획과 Day 1 커뮤니케이션 계획을 먼저 작성합니다.",
      source_label: "정책브리핑 2026년 M&A 활성화 지원사업",
      source_url: MNA_ACTIVATION_SUPPORT_SOURCE_URL,
      rule_base_date: SUCCESSION_SUPPORT_RULE_BASE_DATE,
    },
  ],
};
