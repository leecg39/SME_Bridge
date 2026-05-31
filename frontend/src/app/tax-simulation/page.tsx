"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";
import { getValuationProgress } from "@/lib/api";
import {
  fallbackValuation,
  readStoredValuation,
  wonHundredMillion,
  type ValuationResult,
} from "@/lib/valuation";
import {
  estimateTaxScenario,
  estimateTaxScenarios,
  TAX_RULE_BASE_DATE,
  taxScenarioDefinitions,
  type TaxScenarioId,
} from "@/lib/tax";

type ValuationCase = "low" | "mid" | "high" | "manual";

export default function TaxSimulationPage() {
  const [selected, setSelected] = useState<TaxScenarioId>("gift");
  const [valuation, setValuation] = useState<ValuationResult>(fallbackValuation);
  const [valuationCase, setValuationCase] = useState<ValuationCase>("mid");
  const [salePriceEok, setSalePriceEok] = useState(45);
  const [ownershipPercent, setOwnershipPercent] = useState(100);
  const taxableBase = useMemo(
    () => salePriceEok * 100000000 * (ownershipPercent / 100),
    [ownershipPercent, salePriceEok],
  );
  const scenarioRows = useMemo(
    () => estimateTaxScenarios(taxableBase),
    [taxableBase],
  );
  const selectedScenario = useMemo(
    () => estimateTaxScenario(selected, taxableBase),
    [selected, taxableBase],
  );
  const valueCases = [
    { id: "low", label: "보수", value: valuation.rangeLow },
    { id: "mid", label: "중립", value: valuation.rangeMid },
    { id: "high", label: "낙관", value: valuation.rangeHigh },
  ] as const;

  useEffect(() => {
    const storedValuation = readStoredValuation();
    applyValuation(storedValuation, "mid");
    getValuationProgress()
      .then((progress) => {
        if (progress.result) {
          applyValuation(progress.result, "mid");
        }
      })
      .catch(() => undefined);
  }, []);

  function applyValuation(next: ValuationResult, nextCase: Exclude<ValuationCase, "manual">) {
    setValuation(next);
    setValuationCase(nextCase);
    setSalePriceEok(Math.round((valuationCaseValue(next, nextCase) / 100000000) * 10) / 10);
  }

  function selectValuationCase(nextCase: Exclude<ValuationCase, "manual">) {
    applyValuation(valuation, nextCase);
  }

  function valuationCaseValue(
    next: ValuationResult,
    nextCase: Exclude<ValuationCase, "manual">,
  ) {
    if (nextCase === "low") return next.rangeLow;
    if (nextCase === "mid") return next.rangeMid;
    return next.rangeHigh;
  }

  return (
    <section className="page">
      <h1 className="page-title">세금 시뮬레이션</h1>
      <p className="lead">기업가치 산정 결과를 기준으로 세금 시나리오를 비교합니다.</p>
      <div className="card tax-source-card">
        <div>
          <h2>기업가치 결과 기준</h2>
          <p>
            저장된 기업가치 결과의 보수/중립/낙관 값을 불러와 기준 매각가로 사용합니다.
          </p>
        </div>
        <div className="tax-source-grid">
          {valueCases.map((item) => (
            <button
              className={valuationCase === item.id ? "active" : ""}
              key={item.id}
              type="button"
              onClick={() => selectValuationCase(item.id)}
            >
              <span>{item.label}</span>
              <strong>{wonHundredMillion(item.value)}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="card tax-input-panel">
        <div className="field">
          <label htmlFor="sale-price">기준 매각가</label>
          <div className="input-with-unit">
            <input
              id="sale-price"
              min={1}
              step={0.1}
              type="number"
              value={salePriceEok}
              onChange={(event) => {
                setSalePriceEok(Number(event.target.value) || 0);
                setValuationCase("manual");
              }}
            />
            <span>억원</span>
          </div>
        </div>
        <div className="field">
          <label htmlFor="ownership-percent">보유 지분율</label>
          <div className="input-with-unit">
            <input
              id="ownership-percent"
              max={100}
              min={1}
              type="number"
              value={ownershipPercent}
              onChange={(event) =>
                setOwnershipPercent(Math.min(100, Math.max(1, Number(event.target.value) || 1)))
              }
            />
            <span>%</span>
          </div>
        </div>
      </div>
      <div className="segmented" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {taxScenarioDefinitions.map((scenario) => (
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
          <div className="metric">{wonHundredMillion(selectedScenario.tax)}</div>
          <p>{selectedScenario.note}</p>
        </div>
        <div className="card success">
          <h2>예상 순수령액</h2>
          <div className="metric">{wonHundredMillion(selectedScenario.net)}</div>
          <p>
            기준 매각가 {salePriceEok.toLocaleString("ko-KR")}억원, 지분율{" "}
            {ownershipPercent}% 적용
          </p>
        </div>
      </div>
      <div className="card tax-rule-card">
        <div className="tax-rule-heading">
          <div>
            <h2>계산 근거</h2>
            <p>{selectedScenario.basis}</p>
          </div>
          <span className="status-pill status-pending">
            기준일 {TAX_RULE_BASE_DATE}
          </span>
        </div>
        <dl className="tax-rule-list">
          <div>
            <dt>적용식</dt>
            <dd>{selectedScenario.formulaLabel}</dd>
          </div>
          <div>
            <dt>실효세율</dt>
            <dd>{(selectedScenario.effectiveRate * 100).toFixed(1)}%</dd>
          </div>
          <div>
            <dt>확인 필요</dt>
            <dd>{selectedScenario.warnings.join(" ")}</dd>
          </div>
        </dl>
      </div>
      <div className="card tax-comparison-card">
        <h2>시나리오 비교</h2>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>시나리오</th>
                <th>실효세율</th>
                <th>예상 세액</th>
                <th>예상 순수령액</th>
                <th>메모</th>
              </tr>
            </thead>
            <tbody>
              {scenarioRows.map((scenario) => (
                <tr className={selected === scenario.id ? "selected-row" : ""} key={scenario.id}>
                  <td>{scenario.name}</td>
                  <td>{(scenario.effectiveRate * 100).toFixed(1)}%</td>
                  <td>{wonHundredMillion(scenario.tax)}</td>
                  <td>{wonHundredMillion(scenario.net)}</td>
                  <td>{scenario.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>본 계산은 참고용이며 실제 세액은 전문가 검토가 필요합니다.</p>
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
