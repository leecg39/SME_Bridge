export type SuccessionConsultingTrack = "basic" | "comprehensive" | "not-eligible";

export interface SuccessionConsultingEligibilityInput {
  companyAgeYears: number;
  hasNegotiationTarget: boolean;
  isSme: boolean;
  representativeAge: number;
}

export interface SuccessionConsultingEligibilityResult {
  isEligible: boolean;
  missingRequirements: string[];
  nextAction: string;
  track: SuccessionConsultingTrack;
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

  return {
    isEligible,
    missingRequirements,
    nextAction: supportNextAction(track),
    track,
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

  return {
    estimatedSupportWon,
    estimates,
    expenseAmountWon,
    missingExpenseProgramKeys,
    nextExpenseProgramKey: missingExpenseProgramKeys[0] ?? null,
    nonMonetaryProgramKeys: programs
      .filter((program) => program.funding === null)
      .map((program) => program.program_key),
    phaseCode,
    selfPayWon: Math.max(0, expenseAmountWon - estimatedSupportWon),
    status: getPhaseSupportFundingStatus(
      programs.length,
      monetaryProgramCount,
      missingExpenseProgramKeys.length,
    ),
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

function uniqueDocumentKeys(documentKeys: string[]): string[] {
  return Array.from(new Set(documentKeys));
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
