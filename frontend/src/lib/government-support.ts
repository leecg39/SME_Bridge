export type SuccessionConsultingTrack = "basic" | "comprehensive" | "not-eligible";

export interface SuccessionConsultingEligibilityInput {
  companyAgeYears: number;
  hasNegotiationTarget: boolean;
  isSme: boolean;
  representativeAge: number;
}

export interface SuccessionConsultingApplicationGuide {
  applicationFormAttachmentLabel: string;
  applicationMethodLabel: string;
  applicationPeriodLabel: string;
  applicationPreparationDocumentLabels: string[];
  buyerEligibilityLabel: string;
  contactEmail: string;
  contactLabel: string;
  contactPhoneNumbers: string[];
  noticeAttachmentLabel: string;
  noticePublishedDate: string;
  noticeSourceUrl: string;
  onlineApplicationContactLabel: string;
  onlineApplicationContactPhoneNumbers: string[];
  operatingAgencyLabel: string;
  operatingAgencyProcedureNotice: string;
  sellerEligibilityLabel: string;
  supervisingMinistryLabel: string;
  url: string;
}

export interface SuccessionConsultingEligibilityResult {
  applicationGuide: SuccessionConsultingApplicationGuide | null;
  companyContributionRate: number | null;
  companyContributionWon: number | null;
  consultingFeeWon: number | null;
  governmentContributionWon: number | null;
  isEligible: boolean;
  missingRequirements: string[];
  nextAction: string;
  selectionLimitCompanies: number | null;
  supportScopeLabel: string | null;
  track: SuccessionConsultingTrack;
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
const SUCCESSION_CONSULTING_SUPPORT_SCOPE_LABELS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  string
> = {
  basic:
    "(매도희망기업) M&A 추진을 위한 기초자료 작성 등에 대한 컨설팅, (매수희망기업) 인수대상 탐색, 자금조달방안 등에 대한 컨설팅",
  comprehensive:
    "(매도희망기업) 기업실사, 기업가치평가 등에 대한 컨설팅, (매수희망기업) 인수가격협상, 기업실사 등에 대한 컨설팅",
};
const SUCCESSION_CONSULTING_TRACK_QUALIFICATION_LABELS: Record<
  Exclude<SuccessionConsultingTrack, "not-eligible">,
  string
> = {
  basic: "기초컨설팅(M&A 교섭 대상이 없는 기업)",
  comprehensive: "종합컨설팅(M&A 교섭 대상이 있는 기업)",
};
const SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_LABEL =
  "(붙임1) 2026년도 컨설팅 지원사업 시행계획 공고.hwp";
const SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_LABEL =
  "(붙임2) 2026년도 컨설팅 지원사업 시행계획 공고 첨부서식.hwp";
const SUCCESSION_CONSULTING_APPLICATION_GUIDE: SuccessionConsultingApplicationGuide = {
  applicationFormAttachmentLabel: SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_LABEL,
  applicationMethodLabel: "스마트테크브릿지 온라인 신청",
  applicationPeriodLabel: "예산 소진시까지",
  applicationPreparationDocumentLabels: [
    SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_LABEL,
    SUCCESSION_CONSULTING_APPLICATION_FORM_ATTACHMENT_LABEL,
  ],
  buyerEligibilityLabel: "중소기업 인수를 희망하는 중소기업 또는 개인",
  contactEmail: "mna@kibo.or.kr",
  contactLabel: "기술보증기금 M&A지원센터",
  contactPhoneNumbers: ["02-3215-5917", "02-3215-5999", "02-3215-5995"],
  noticeAttachmentLabel: SUCCESSION_CONSULTING_NOTICE_ATTACHMENT_LABEL,
  noticePublishedDate: "2026-04-03",
  noticeSourceUrl:
    "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000120342",
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
  const missingRequirements = [
    ...(input.isSme ? [] : ["중소기업 여부 확인"]),
    ...(input.representativeAge >= 55 ? [] : ["대표자 만 55세 이상"]),
    ...(input.companyAgeYears >= 5 ? [] : ["업력 만 5년 이상"]),
  ];
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

  return {
    applicationGuide:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_APPLICATION_GUIDE,
    companyContributionRate,
    companyContributionWon,
    consultingFeeWon,
    governmentContributionWon:
      consultingFeeWon === null || companyContributionWon === null
        ? null
        : consultingFeeWon - companyContributionWon,
    isEligible,
    missingRequirements,
    nextAction: supportNextAction(track),
    selectionLimitCompanies:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_SELECTION_LIMITS[track],
    supportScopeLabel:
      track === "not-eligible" ? null : SUCCESSION_CONSULTING_SUPPORT_SCOPE_LABELS[track],
    track,
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
