import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calculator,
  ChartNoAxesCombined,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Handshake,
  LockKeyhole,
  Network,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type Strength = {
  icon: LucideIcon;
  number: string;
  title: string;
  text: string;
};

const strengths: Strength[] = [
  {
    icon: ShieldCheck,
    number: "1",
    title: "비밀 상담 우선",
    text: "상담 전 원본 재무파일은 자동 전송하지 않고 요약정보만 다룹니다.",
  },
  {
    icon: ChartNoAxesCombined,
    number: "2",
    title: "기업가치 범위 확인",
    text: "EBITDA와 최근 실적을 기준으로 예상 범위를 먼저 확인합니다.",
  },
  {
    icon: Calculator,
    number: "3",
    title: "세금 시나리오 비교",
    text: "양도, 상속, 증여특례를 대표님 눈높이로 나누어 비교합니다.",
  },
  {
    icon: FileCheck2,
    number: "4",
    title: "자료 준비 체크",
    text: "필수 자료와 아직 비어 있는 항목을 한 화면에서 구분합니다.",
  },
  {
    icon: Network,
    number: "5",
    title: "Patasos 이슈 연동",
    text: "상담 요청은 요약된 이슈로 전달되어 에이전트 검토가 시작됩니다.",
  },
  {
    icon: ClipboardCheck,
    number: "6",
    title: "매각 로드맵",
    text: "사전 진단부터 전문가 검토까지 단계별 다음 행동을 정리합니다.",
  },
  {
    icon: Handshake,
    number: "7",
    title: "전문가 검토 연결",
    text: "세무, 법무, 가치평가, M&A 상담 흐름을 요청 유형별로 나눕니다.",
  },
];

const services = [
  "기업승계형 M&A 사전 진단",
  "세금·가치평가 요약 리포트",
  "Patasos 전문가 자문 이슈 생성",
];

export default function LandingPage() {
  return (
    <>
      <div className="market-news-bar">
        <Link href="/consultation">
          <span>알림</span>
          2026년 승계 준비 상담은 연락 동의와 요약정보만으로 먼저 접수됩니다.
          <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </div>

      <section className="hero">
        <div className="hero-inner">
          <p className="hero-kicker">200억 이하 중소기업 기업승계형 M&A</p>
          <h1>기업승계 M&A에 신뢰를 더합니다</h1>
          <p className="lead">
            기업가치, 세금, 매각 준비, 전문가 자문요청까지 대표님이 먼저 판단할
            순서로 정리합니다.
          </p>
          <div className="hero-succession-note" aria-label="사업승계형 M&A 설명">
            <strong>사업승계형 M&A란?</strong>
            <p>
              친족·사내 승계가 어려울 때 제3의 인수자에게 사업, 임직원,
              거래관계, 대표님의 경영 철학을 이어가게 하는 선택지입니다.
              지금까지 쌓은 가치를 다음 성장으로 연결합니다.
            </p>
            <div>
              <span>후계자 부재</span>
              <span>고용·거래처 유지</span>
              <span>100년 기업 준비</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href="/auth">
              내 회사 예상가치 확인
              <ArrowRight aria-hidden="true" size={22} />
            </Link>
          </div>
          <div className="trust-row" aria-label="서비스 신뢰 기준">
            <span>
              <LockKeyhole aria-hidden="true" size={20} />
              비밀 상담
            </span>
            <span>
              <ShieldCheck aria-hidden="true" size={20} />
              요약정보만 전달
            </span>
            <span>
              <Handshake aria-hidden="true" size={20} />
              Patasos 이슈 연동
            </span>
          </div>
        </div>
      </section>

      <section className="quick-action-strip" aria-label="주요 진입 메뉴">
        <Link className="quick-action quick-action-sell" href="/valuation/upload">
          <span>승계·양도 준비</span>
          <strong>우리 회사 예상가치부터 확인</strong>
          <ArrowRight aria-hidden="true" size={22} />
        </Link>
        <Link className="quick-action quick-action-consult" href="/consultation">
          <span>전문가 자문요청</span>
          <strong>요약정보만 Patasos 이슈로 전달</strong>
          <ArrowRight aria-hidden="true" size={22} />
        </Link>
      </section>

      <section className="page section-band">
        <div className="section-heading centered">
          <p className="eyebrow">TRUST POINTS</p>
          <h2>대표님의 첫 판단을 돕는 7가지 신뢰 기준</h2>
        </div>
        <div className="strength-grid">
          {strengths.map((item) => {
            const Icon = item.icon;

            return (
              <article className="strength-card" key={item.number}>
                <div className="strength-icon">
                  <span>{item.number}</span>
                  <Icon aria-hidden="true" size={40} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="page section-band promo-video-section">
        <div className="promo-video-heading">
          <div>
            <p className="eyebrow">승계브릿지 소개 영상</p>
            <h2>상담 전, 전체 흐름을 먼저 확인하세요</h2>
          </div>
          <p>
            기업가치, 세금, 로드맵, Patasos 자문 요청까지 어떤 순서로 준비되는지
            짧은 영상으로 정리했습니다.
          </p>
        </div>
        <div className="promo-video-frame" aria-label="승계브릿지 홍보 영상">
          <iframe
            src="/hyperframes/sme-bridge-promo.html"
            title="승계브릿지 홍보 영상"
            loading="lazy"
            sandbox="allow-scripts"
          />
        </div>
      </section>

      <section className="page section-band deal-section">
        <div className="section-heading">
          <p className="eyebrow">CONSULTATION FLOW</p>
          <h2>상담 요청은 내부 기록과 Patasos 이슈 상태로 함께 관리됩니다</h2>
        </div>
        <div className="deal-board">
          <article className="deal-card">
            <p className="deal-code">SB-VAL-001</p>
            <h3>기업가치 산정 요청</h3>
            <dl>
              <div>
                <dt>대상</dt>
                <dd>제조업 / 매출 30억</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>요약 생성</dd>
              </div>
            </dl>
          </article>
          <article className="deal-card highlighted">
            <p className="deal-code">SB-TAX-014</p>
            <h3>세금 시뮬레이션 상담</h3>
            <dl>
              <div>
                <dt>대상</dt>
                <dd>양도·상속 비교</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>Patasos 전달중</dd>
              </div>
            </dl>
          </article>
          <article className="deal-card">
            <p className="deal-code">SB-MNA-027</p>
            <h3>M&A 로드맵 검토</h3>
            <dl>
              <div>
                <dt>대상</dt>
                <dd>후계자 부재</dd>
              </div>
              <div>
                <dt>상태</dt>
                <dd>전문가 검토</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="service-split">
        <div className="service-image" aria-hidden="true" />
        <div className="service-copy">
          <p className="eyebrow">SERVICE</p>
          <h2>복잡한 M&A 준비를 세 가지 상담 서비스로 나눕니다</h2>
          <ul>
            {services.map((service, index) => (
              <li key={service}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {service}
              </li>
            ))}
          </ul>
          <Link className="button button-primary" href="/consultation">
            전문가 자문요청
            <ArrowRight aria-hidden="true" size={22} />
          </Link>
        </div>
      </section>

      <section className="page section-band">
        <div className="section-heading">
          <p className="eyebrow">FIRST DECISIONS</p>
          <h2>복잡한 M&A 절차를 큰 판단 단위로 정리했습니다</h2>
        </div>
        <div className="grid grid-3">
          <div className="card service-card">
            <Calculator size={34} />
            <h3>우리 회사는 어느 정도인가</h3>
            <p>최근 재무 수치를 확인하고 EBITDA 기준 예상 기업가치 범위를 봅니다.</p>
          </div>
          <div className="card service-card">
            <FileText size={34} />
            <h3>세금은 얼마나 달라지는가</h3>
            <p>양도, 상속, 증여특례 시나리오를 대표님 눈높이로 비교합니다.</p>
          </div>
          <div className="card service-card">
            <Handshake size={34} />
            <h3>누구에게 무엇을 물어볼까</h3>
            <p>상담 요청은 Patasos 이슈로 전달되어 에이전트와 전문가 검토가 시작됩니다.</p>
          </div>
        </div>
      </section>

      <section className="final-cta-band">
        <Building2 aria-hidden="true" size={44} />
        <div>
          <p className="eyebrow">NEXT STEP</p>
          <h2>대표님의 회사, 오늘은 요약정보부터 안전하게 정리하세요</h2>
        </div>
        <Link className="button button-primary" href="/auth">
          시작하기
          <ArrowRight aria-hidden="true" size={22} />
        </Link>
      </section>
    </>
  );
}
