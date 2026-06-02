"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";
import { getValuationProgress } from "@/lib/api";
import {
  buildValuationResultCards,
  fallbackValuation,
  readStoredValuation,
  type ValuationResult,
} from "@/lib/valuation";

export default function ValuationResultPage() {
  const [valuation, setValuation] = useState<ValuationResult>(fallbackValuation);
  const resultCards = buildValuationResultCards(valuation);

  useEffect(() => {
    setValuation(readStoredValuation());
    getValuationProgress()
      .then((progress) => {
        if (progress.result) {
          setValuation(progress.result);
        }
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="page">
      <h1 className="page-title">예상 기업가치 결과</h1>
      <p className="lead">EBITDA 멀티플 기반 데모 산정 결과입니다.</p>
      <div className="grid grid-3">
        {resultCards.map((card) => (
          <div className="card" key={card.id}>
            <h2>{card.title}</h2>
            <div className="metric">{card.valueLabel}</div>
            <p>{card.multipleLabel}</p>
          </div>
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h2>다음 단계</h2>
        <p>결과는 참고용입니다. 세금 구조와 매각 준비 자료를 함께 확인하세요.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/tax-simulation">
            세금 시뮬레이션
          </Link>
          <Link className="button button-secondary" href="/consultation?type=valuation">
            가치평가 상담 요청
          </Link>
        </div>
      </div>
      <FloatingConsultationButton />
    </section>
  );
}
