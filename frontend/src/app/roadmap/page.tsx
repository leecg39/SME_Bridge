"use client";

import { useState } from "react";
import Link from "next/link";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";

const phases = [
  {
    phase: 1,
    name: "매각 준비",
    duration: "3~6개월",
    tasks: ["최근 3개년 재무제표 준비", "임대차 계약서 정리", "주요 거래처 매출 비중 확인"],
  },
  {
    phase: 2,
    name: "마케팅",
    duration: "2~3개월",
    tasks: ["티저 작성", "NDA 준비", "인수후보 롱리스트 작성"],
  },
  {
    phase: 3,
    name: "실사",
    duration: "1~2개월",
    tasks: ["재무 실사 자료실 구성", "법률 리스크 점검", "노무 이슈 확인"],
  },
  {
    phase: 4,
    name: "협상/계약",
    duration: "1~2개월",
    tasks: ["LOI 검토", "가격 조정 조건 정리", "SPA 주요 조항 검토"],
  },
  {
    phase: 5,
    name: "클로징/PMI",
    duration: "1~3개월",
    tasks: ["대금 수수 준비", "경영권 이전 일정", "직원 커뮤니케이션 계획"],
  },
];

export default function RoadmapPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const completed = Object.values(checked).filter(Boolean).length;
  const total = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);

  function toggle(key: string) {
    setChecked((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="page">
      <h1 className="page-title">매각 로드맵</h1>
      <p className="lead">완료 항목 {completed}/{total}개</p>
      <div className="kanban">
        {phases.map((phase) => (
          <div className="card phase-card" key={phase.phase}>
            <h2>
              Phase {phase.phase}. {phase.name}
            </h2>
            <p>{phase.duration}</p>
            {phase.tasks.map((task) => {
              const key = `${phase.phase}-${task}`;
              return (
                <label className="checkbox-row" key={key}>
                  <input
                    checked={Boolean(checked[key])}
                    type="checkbox"
                    onChange={() => toggle(key)}
                  />
                  {task}
                </label>
              );
            })}
            <a
              className="button button-outline"
              download
              href={`/templates/phase-${phase.phase}-checklist.md`}
              style={{ marginTop: 16 }}
            >
              템플릿 다운로드
            </a>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24 }}>
        <Link className="button button-primary" href="/consultation?type=mna">
          M&A 자문 요청
        </Link>
      </div>
      <FloatingConsultationButton />
    </section>
  );
}
