"use client";

import { useEffect, useState } from "react";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";
import { saveValuationProgress } from "@/lib/api";
import {
  VALUATION_STORAGE_KEY,
  calculateValuationFromEbitda,
} from "@/lib/valuation";

interface Financials {
  years: number[];
  revenue: number[];
  operatingIncome: number[];
  depreciation: number[];
}

const fallbackFinancials: Financials = {
  years: [2022, 2023, 2024],
  revenue: [2960000000, 3550000000, 4700000000],
  operatingIncome: [410000000, 620000000, 820000000],
  depreciation: [95000000, 110000000, 130000000],
};

function won(value: number): string {
  return `${Math.round(value / 100000000).toLocaleString("ko-KR")}억`;
}

export default function ValuationReviewPage() {
  const [financials, setFinancials] = useState<Financials>(fallbackFinancials);
  const [ownerSalaryAdjustment, setOwnerSalaryAdjustment] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("smeBridgeFinancials");
    if (saved) setFinancials(JSON.parse(saved) as Financials);
  }, []);

  const latestIndex = financials.years.length - 1;
  const latestOperatingIncome = financials.operatingIncome[latestIndex] ?? 0;
  const latestDepreciation = financials.depreciation[latestIndex] ?? 0;
  const normalizedEbitda =
    latestOperatingIncome + latestDepreciation + (ownerSalaryAdjustment ? 150000000 : 0);

  async function continueToResult() {
    const result = calculateValuationFromEbitda({
      normalizedEbitda,
      ownerSalaryAdjustment,
    });
    window.localStorage.setItem(VALUATION_STORAGE_KEY, JSON.stringify(result));
    await saveValuationProgress(result).catch(() => undefined);
    window.location.href = "/valuation/result";
  }

  return (
    <section className="page">
      <h1 className="page-title">AI 추출/검토</h1>
      <p className="lead">연도별 수치가 맞는지 확인하고 EBITDA 정상화 항목을 선택합니다.</p>
      <div className="grid grid-2">
        <div className="card">
          <h2>추출 재무 수치</h2>
          <table className="table">
            <thead>
              <tr>
                <th>항목</th>
                {financials.years.map((year) => (
                  <th key={year}>{year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>매출액</td>
                {financials.revenue.map((value, index) => (
                  <td key={financials.years[index]}>{won(value)}</td>
                ))}
              </tr>
              <tr>
                <td>영업이익</td>
                {financials.operatingIncome.map((value, index) => (
                  <td key={financials.years[index]}>{won(value)}</td>
                ))}
              </tr>
              <tr>
                <td>감가상각비</td>
                {financials.depreciation.map((value, index) => (
                  <td key={financials.years[index]}>{won(value)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>정상화 조정</h2>
          <label className="checkbox-row">
            <input
              checked={ownerSalaryAdjustment}
              type="checkbox"
              onChange={(event) => setOwnerSalaryAdjustment(event.target.checked)}
            />
            오너 초과 급여 1.5억 조정
          </label>
          <div style={{ marginTop: 24 }}>
            <p>정상화 EBITDA</p>
            <div className="metric">{won(normalizedEbitda)}</div>
          </div>
          <button className="button-primary" type="button" onClick={continueToResult}>
            가치 산정 보기
          </button>
        </div>
      </div>
      <FloatingConsultationButton />
    </section>
  );
}
