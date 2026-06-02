import { describe, expect, it } from "vitest";

import { getConsultationDraft } from "./demo-data";

describe("getConsultationDraft", () => {
  it("returns a tax-focused consultation draft for the tax flow", () => {
    expect(getConsultationDraft("tax")).toEqual({
      consultationType: "tax",
      description:
        "기업가치 산정 결과를 기준으로 양도소득세, 가업승계 증여특례, 혼합 전략의 세금 차이를 전문가와 검토하고 싶습니다.",
      title: "기업승계 세무 상담 요청",
    });
  });

  it("tailors the tax consultation draft to the selected tax scenario", () => {
    expect(getConsultationDraft("tax", "hybrid")).toEqual({
      consultationType: "tax",
      description:
        "혼합 전략을 중심으로 지분 양도와 가업승계 증여특례 비율, 세액 차이, 실행 리스크를 전문가와 검토하고 싶습니다.",
      title: "기업승계 세무 상담 요청",
    });
  });

  it("returns a valuation-focused consultation draft for the valuation flow", () => {
    expect(getConsultationDraft("valuation")).toEqual({
      consultationType: "valuation",
      description:
        "업로드한 재무정보와 EBITDA 멀티플 산정 결과를 기준으로 기업가치 범위와 보정 항목을 검토하고 싶습니다.",
      title: "기업가치 평가 상담 요청",
    });
  });

  it("keeps the existing M&A draft as the default flow", () => {
    expect(getConsultationDraft("mna")).toEqual({
      consultationType: "mna",
      description:
        "매각을 준비하기 전에 기업가치와 세금, 필요한 자료를 전문가와 함께 검토하고 싶습니다.",
      title: "기업승계 M&A 자문 요청",
    });
  });
});
