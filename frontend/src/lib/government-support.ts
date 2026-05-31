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

export interface MnaSupportProgram {
  program_key: string;
  title: string;
  summary: string;
  support_scope: string;
  next_action: string;
  source_label: string;
  source_url: string;
  rule_base_date: string;
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

const MNA_SUPPORT_PROGRAMS_BY_PHASE: Record<string, MnaSupportProgram[]> = {
  preparation: [
    {
      program_key: "succession-consulting",
      title: "기업승계 M&A 컨설팅",
      summary: "교섭 대상 유무에 따라 기초컨설팅 또는 종합컨설팅으로 초기 상담 경로를 나눕니다.",
      support_scope: "기초자료 작성, 매각 목적 정리, 교섭 대상 검토",
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
      next_action: "PMI 100일 실행계획과 Day 1 커뮤니케이션 계획을 먼저 작성합니다.",
      source_label: "정책브리핑 2026년 M&A 활성화 지원사업",
      source_url: MNA_ACTIVATION_SUPPORT_SOURCE_URL,
      rule_base_date: SUCCESSION_SUPPORT_RULE_BASE_DATE,
    },
  ],
};
