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

export const SUCCESSION_SUPPORT_CHECK_TASK =
  "기업승계 M&A 컨설팅 지원사업 자격 확인";

export const SUCCESSION_SUPPORT_RULE_BASE_DATE = "2026-05-31";

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
