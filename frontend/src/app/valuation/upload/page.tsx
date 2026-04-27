"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";

const extractedFinancials = {
  years: [2022, 2023, 2024],
  revenue: [2960000000, 3550000000, 4700000000],
  operatingIncome: [410000000, 620000000, 820000000],
  depreciation: [95000000, 110000000, 130000000],
};

export default function ValuationUploadPage() {
  const [fileName, setFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function startAnalysis() {
    setIsAnalyzing(true);
    window.localStorage.setItem(
      "smeBridgeFinancials",
      JSON.stringify(extractedFinancials),
    );
    window.setTimeout(() => {
      window.location.href = "/valuation/review";
    }, 600);
  }

  return (
    <section className="page">
      <h1 className="page-title">재무제표 업로드</h1>
      <p className="lead">최근 3개년 손익계산서와 재무상태표를 올려주세요.</p>
      <div className="card">
        <label
          className="notice"
          htmlFor="financial-file"
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 260,
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <UploadCloud size={48} />
          <strong>PDF, JPG, PNG, Excel 파일 선택</strong>
          <span>최대 30MB까지 지원합니다. 데모에서는 파일명이 저장됩니다.</span>
          <input
            id="financial-file"
            style={{ display: "none" }}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name ?? "");
            }}
          />
        </label>
        {fileName ? <p>선택된 파일: {fileName}</p> : null}
        <button
          className="button-primary"
          disabled={!fileName || isAnalyzing}
          type="button"
          onClick={startAnalysis}
        >
          {isAnalyzing ? "AI 추출 중..." : "AI 추출 시작"}
        </button>
      </div>
      <FloatingConsultationButton />
    </section>
  );
}
