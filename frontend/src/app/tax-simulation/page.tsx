"use client";

import { useState } from "react";
import Link from "next/link";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";

const scenarios = [
  { id: "sale", name: "양도소득세", tax: 1180000000, net: 3320000000 },
  { id: "inheritance", name: "상속세", tax: 1450000000, net: 3050000000 },
  { id: "gift", name: "증여특례", tax: 760000000, net: 3740000000 },
  { id: "hybrid", name: "혼합 전략", tax: 880000000, net: 3620000000 },
] as const;

function won(value: number): string {
  return `${(value / 100000000).toFixed(1)}억`;
}

export default function TaxSimulationPage() {
  const [selected, setSelected] = useState<(typeof scenarios)[number]["id"]>("gift");
  const selectedScenario = scenarios.find((scenario) => scenario.id === selected) ?? scenarios[2];

  return (
    <section className="page">
      <h1 className="page-title">세금 시뮬레이션</h1>
      <p className="lead">예상 매각가 45억 기준으로 세금 시나리오를 비교합니다.</p>
      <div className="segmented" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {scenarios.map((scenario) => (
          <button
            className={selected === scenario.id ? "active" : ""}
            key={scenario.id}
            type="button"
            onClick={() => setSelected(scenario.id)}
          >
            {scenario.name}
          </button>
        ))}
      </div>
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h2>{selectedScenario.name}</h2>
          <p>예상 세액</p>
          <div className="metric">{won(selectedScenario.tax)}</div>
        </div>
        <div className="card success">
          <h2>예상 순수령액</h2>
          <div className="metric">{won(selectedScenario.net)}</div>
          <p>본 계산은 참고용이며 실제 세액은 전문가 검토가 필요합니다.</p>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <Link className="button button-primary" href="/consultation?type=tax">
          세무 전문가 상담 요청
        </Link>
      </div>
      <FloatingConsultationButton />
    </section>
  );
}
