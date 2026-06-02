import type { ConsultationType } from "./consultation";

export interface ConsultationDraft {
  consultationType: ConsultationType;
  description: string;
  title: string;
}

export const demoCompany = {
  id: "company-1",
  name: "동양정밀",
  industry: "자동차 부품 제조",
  revenue: 8000000000,
  employeeCount: 45,
};

export const progressSnapshot = {
  company: {
    name: demoCompany.name,
    industry: demoCompany.industry,
    revenueBand: "50억~100억",
    employees: demoCompany.employeeCount,
  },
  valuation: {
    ebitda: 950000000,
    rangeLow: 3500000000,
    rangeHigh: 5200000000,
    scenario: "중립 EV/EBITDA 4.8x",
    sourceFileUrl: "removed-by-sanitizer",
  },
  tax: {
    bestScenario: "가업승계 증여특례 검토",
    estimatedSaving: 420000000,
  },
  roadmap: {
    currentPhase: "매각 준비",
    progressPercent: 24,
    nextAction: "최근 3개년 재무자료 정리",
  },
  rawFinancialStatements: [{ fileUrl: "removed-by-sanitizer" }],
};

const consultationDrafts: Record<ConsultationType, Omit<ConsultationDraft, "consultationType">> = {
  tax: {
    description:
      "기업가치 산정 결과를 기준으로 양도소득세, 가업승계 증여특례, 혼합 전략의 세금 차이를 전문가와 검토하고 싶습니다.",
    title: "기업승계 세무 상담 요청",
  },
  legal: {
    description:
      "매각 구조, 주주 동의, 비밀유지, 계약상 제한사항을 법률 전문가와 검토하고 싶습니다.",
    title: "기업승계 법률 상담 요청",
  },
  valuation: {
    description:
      "업로드한 재무정보와 EBITDA 멀티플 산정 결과를 기준으로 기업가치 범위와 보정 항목을 검토하고 싶습니다.",
    title: "기업가치 평가 상담 요청",
  },
  mna: {
    description:
      "매각을 준비하기 전에 기업가치와 세금, 필요한 자료를 전문가와 함께 검토하고 싶습니다.",
    title: "기업승계 M&A 자문 요청",
  },
  general: {
    description:
      "기업승계와 매각 준비 과정에서 우선 확인해야 할 이슈를 종합적으로 상담하고 싶습니다.",
    title: "기업승계 종합 상담 요청",
  },
};

export function getConsultationDraft(consultationType: ConsultationType): ConsultationDraft {
  return {
    consultationType,
    ...consultationDrafts[consultationType],
  };
}

export function recommendedTypeFromPath(pathname: string): ConsultationType {
  if (pathname.includes("tax")) return "tax";
  if (pathname.includes("roadmap")) return "mna";
  if (pathname.includes("valuation")) return "valuation";
  return "mna";
}
