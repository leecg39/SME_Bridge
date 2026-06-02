"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Send, ShieldCheck } from "lucide-react";

import { createConsultation, getValuationProgress } from "@/lib/api";
import {
  buildConsultationPayload,
  consultationTypeLabels,
  type JsonValue,
  mergeValuationAndTaxIntoConsultationSnapshot,
  type ConsultationType,
} from "@/lib/consultation";
import {
  demoCompany,
  getConsultationDraft,
  progressSnapshot,
  recommendedTypeFromPath,
} from "@/lib/demo-data";
import type { TaxScenarioId } from "@/lib/tax";
import { readStoredValuation, wonHundredMillion } from "@/lib/valuation";

const defaultDraft = getConsultationDraft("mna");

export default function ConsultationPage() {
  const [consultationType, setConsultationType] = useState<ConsultationType>(
    defaultDraft.consultationType,
  );
  const [requesterName, setRequesterName] = useState("김영호");
  const [requesterPhone, setRequesterPhone] = useState("010-1234-5678");
  const [requesterEmail, setRequesterEmail] = useState("ceo@example.com");
  const [title, setTitle] = useState(defaultDraft.title);
  const [description, setDescription] = useState(defaultDraft.description);
  const [includeProgressSnapshot, setIncludeProgressSnapshot] = useState(true);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [externalTransferConsent, setExternalTransferConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snapshot, setSnapshot] = useState<Record<string, JsonValue>>(progressSnapshot);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    const scenario = params.get("scenario");
    if (
      type === "tax" ||
      type === "legal" ||
      type === "valuation" ||
      type === "mna" ||
      type === "general"
    ) {
      applyConsultationDraft(type, isTaxScenarioId(scenario) ? scenario : undefined);
      return;
    }
    applyConsultationDraft(recommendedTypeFromPath(document.referrer));
  }, []);

  function applyConsultationDraft(nextType: ConsultationType, taxScenarioId?: TaxScenarioId) {
    const draft = getConsultationDraft(nextType, taxScenarioId);
    setConsultationType(draft.consultationType);
    setTitle(draft.title);
    setDescription(draft.description);
  }

  useEffect(() => {
    const storedValuation = readStoredValuation();
    setSnapshot(mergeValuationAndTaxIntoConsultationSnapshot(progressSnapshot, storedValuation));
    getValuationProgress()
      .then((progress) => {
        if (progress.result) {
          setSnapshot(
            mergeValuationAndTaxIntoConsultationSnapshot(progressSnapshot, progress.result),
          );
        }
      })
      .catch(() => undefined);
  }, []);

  async function submit() {
    setError("");
    setMessage("");
    setIsSubmitting(true);
    try {
      const payload = buildConsultationPayload({
        companyId: demoCompany.id,
        companyName: demoCompany.name,
        requesterName,
        requesterPhone,
        requesterEmail,
        consultationType,
        title,
        description,
        privacyConsent,
        externalTransferConsent,
        includeProgressSnapshot,
        shareSensitiveFiles: false,
        snapshot,
      });
      const created = await createConsultation(payload);
      window.localStorage.setItem("lastConsultationStatus", created.patasos_sync_status);
      setMessage("상담 요청이 접수되었습니다. 대시보드로 이동합니다.");
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 800);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "상담 요청에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    requesterName.trim().length > 0 &&
    requesterPhone.trim().length >= 7 &&
    requesterEmail.includes("@") &&
    description.trim().length >= 10 &&
    privacyConsent &&
    externalTransferConsent &&
    !isSubmitting;
  const valuationSnapshot =
    snapshot.valuation !== null &&
    !Array.isArray(snapshot.valuation) &&
    typeof snapshot.valuation === "object"
      ? snapshot.valuation
      : null;
  const taxSnapshot =
    snapshot.tax !== null &&
    !Array.isArray(snapshot.tax) &&
    typeof snapshot.tax === "object"
      ? snapshot.tax
      : null;

  return (
    <section className="page">
      <p className="eyebrow">비밀 상담 요청</p>
      <h1 className="page-title">필요한 요약만 전달하고, 전문가 검토를 시작합니다</h1>
      <p className="lead">
        상담 요청은 Patasos 회사의 이슈로 생성됩니다. 원본 재무제표 파일은 대표님의 별도 동의 전까지 자동 전송하지 않습니다.
      </p>
      <div className="consultation-assurance">
        <div>
          <LockKeyhole aria-hidden="true" size={28} />
          <strong>원본 파일 비공개</strong>
          <span>상담 시작에는 요약정보만 사용합니다.</span>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" size={28} />
          <strong>동의 기반 전달</strong>
          <span>개인정보와 외부전달 동의를 분리해 받습니다.</span>
        </div>
        <div>
          <Send aria-hidden="true" size={28} />
          <strong>Patasos 이슈 생성</strong>
          <span>에이전트가 확인할 업무 항목으로 접수됩니다.</span>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h2>상담 정보</h2>
          <div className="form">
            <div className="segmented">
              {(Object.keys(consultationTypeLabels) as ConsultationType[]).map((type) => (
                <button
                  className={consultationType === type ? "active" : ""}
                  key={type}
                  type="button"
                  onClick={() => applyConsultationDraft(type)}
                >
                  {consultationTypeLabels[type]}
                </button>
              ))}
            </div>
            <div className="field">
              <label htmlFor="requester-name">성함</label>
              <input
                id="requester-name"
                value={requesterName}
                onChange={(event) => setRequesterName(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="requester-phone">연락처</label>
              <input
                id="requester-phone"
                value={requesterPhone}
                onChange={(event) => setRequesterPhone(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="requester-email">이메일</label>
              <input
                id="requester-email"
                type="email"
                value={requesterEmail}
                onChange={(event) => setRequesterEmail(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="consultation-title">상담 제목</label>
              <input
                id="consultation-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="consultation-description">문의 내용</label>
              <textarea
                id="consultation-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="card">
          <h2>자동 첨부 미리보기</h2>
          <div className="notice snapshot-list">
            <p>
              <strong>기업</strong>
              <span>{demoCompany.name}</span>
            </p>
            <p>
              <strong>업종</strong>
              <span>{demoCompany.industry}</span>
            </p>
            <p>
              <strong>예상 기업가치</strong>
              <span>
                {typeof valuationSnapshot?.rangeLow === "number" &&
                typeof valuationSnapshot?.rangeHigh === "number"
                  ? `${wonHundredMillion(valuationSnapshot.rangeLow)}~${wonHundredMillion(valuationSnapshot.rangeHigh)}`
                  : "35억~52억"}
              </span>
            </p>
            <p>
              <strong>로드맵</strong>
              <span>Phase 1 매각 준비, 24%</span>
            </p>
            <p>
              <strong>예상 절세 효과</strong>
              <span>
                {typeof taxSnapshot?.savingsLabel === "string"
                  ? taxSnapshot.savingsLabel
                  : "4.2억"}
              </span>
            </p>
          </div>
          <label className="checkbox-row">
            <input
              checked={includeProgressSnapshot}
              type="checkbox"
              onChange={(event) => setIncludeProgressSnapshot(event.target.checked)}
            />
            진행상황 요약을 Patasos 이슈에 첨부
          </label>
          <label className="checkbox-row">
            <input
              checked={privacyConsent}
              type="checkbox"
              onChange={(event) => setPrivacyConsent(event.target.checked)}
            />
            개인정보 수집 및 상담 목적 이용에 동의합니다.
          </label>
          <label className="checkbox-row">
            <input
              checked={externalTransferConsent}
              type="checkbox"
              onChange={(event) => setExternalTransferConsent(event.target.checked)}
            />
            상담 처리를 위해 요약정보를 Patasos에 전달하는 데 동의합니다.
          </label>
          {message ? <p className="notice success">{message}</p> : null}
          {error ? <p className="notice error">{error}</p> : null}
          <button
            className="button-primary"
            disabled={!canSubmit}
            type="button"
            onClick={submit}
          >
            {isSubmitting ? "상담 요청 중..." : "상담 신청하기"}
          </button>
        </div>
      </div>
    </section>
  );
}

function isTaxScenarioId(value: string | null): value is TaxScenarioId {
  return (
    value === "sale" ||
    value === "inheritance" ||
    value === "gift" ||
    value === "hybrid"
  );
}
