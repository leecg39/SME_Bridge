import type { ConsultationType } from "./consultation";

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

export function recommendedTypeFromPath(pathname: string): ConsultationType {
  if (pathname.includes("tax")) return "tax";
  if (pathname.includes("roadmap")) return "mna";
  if (pathname.includes("valuation")) return "valuation";
  return "mna";
}
