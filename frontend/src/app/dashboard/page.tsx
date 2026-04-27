"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { FloatingConsultationButton } from "@/components/floating-consultation-button";
import { listConsultations } from "@/lib/api";
import {
  consultationStatusLabel,
  type ConsultationRecord,
  type PatasosSyncStatus,
} from "@/lib/consultation";

export default function DashboardPage() {
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([]);
  const [lastStatus, setLastStatus] = useState<PatasosSyncStatus>("not_requested");

  useEffect(() => {
    const saved = window.localStorage.getItem("lastConsultationStatus");
    if (
      saved === "pending" ||
      saved === "sent" ||
      saved === "failed" ||
      saved === "not_requested"
    ) {
      setLastStatus(saved);
    }
    listConsultations()
      .then((items) => {
        setConsultations(items);
        if (items[0]) setLastStatus(items[0].patasos_sync_status);
      })
      .catch(() => undefined);
  }, []);

  return (
    <section className="page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">대표님 전용 준비 현황</p>
          <h1 className="page-title">오늘은 매각 준비 자료를 먼저 정리하면 좋습니다</h1>
          <p className="lead">
            숫자는 참고 범위로 보고, 다음 상담에서 확인할 질문을 함께 정리합니다.
          </p>
        </div>
        <Link className="button button-primary" href="/consultation">
          자문 요청
          <ArrowRight aria-hidden="true" size={22} />
        </Link>
      </div>
      <div className="executive-band">
        <div>
          <ClipboardList aria-hidden="true" size={28} />
          <strong>다음 권장 행동</strong>
          <span>최근 3개년 재무제표와 주요 계약서를 준비하세요.</span>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" size={28} />
          <strong>정보 보호</strong>
          <span>상담 요청 전까지 원본 파일은 외부로 자동 전송하지 않습니다.</span>
        </div>
        <div>
          <CheckCircle2 aria-hidden="true" size={28} />
          <strong>현재 단계</strong>
          <span>Phase 1 매각 준비, 진행률 24%</span>
        </div>
      </div>
      <div className="grid grid-4">
        <Link className="card metric-card" href="/valuation/upload">
          <h2>예상 기업가치</h2>
          <div className="metric">35억~52억</div>
          <p>최근 산정 기준</p>
        </Link>
        <Link className="card metric-card" href="/tax-simulation">
          <h2>예상 절세 효과</h2>
          <div className="metric">4.2억</div>
          <p>증여특례 검토 시</p>
        </Link>
        <Link className="card metric-card" href="/roadmap">
          <h2>로드맵 진행률</h2>
          <div className="metric">24%</div>
          <p>Phase 1 매각 준비</p>
        </Link>
        <Link className="card metric-card" href="/consultation">
          <h2>상담 상태</h2>
          <span className={`status-pill status-${lastStatus === "failed" ? "failed" : lastStatus === "sent" ? "sent" : "pending"}`}>
            {consultationStatusLabel(lastStatus)}
          </span>
          <p>최근 자문 요청 기준</p>
        </Link>
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h2>최근 상담 요청</h2>
        {consultations.length === 0 ? (
          <p>아직 상담 요청이 없습니다.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>상담 주제</th>
                <th>상태</th>
                <th>Patasos</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.status}</td>
                  <td>{consultationStatusLabel(item.patasos_sync_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <FloatingConsultationButton />
    </section>
  );
}
