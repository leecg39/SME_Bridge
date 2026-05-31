from __future__ import annotations

from typing import Any, List, Optional

from pydantic import BaseModel, Field


class MnaPhaseDocument(BaseModel):
    document_key: str
    title: str
    description: str
    file_path: str
    category: str
    is_required: bool
    sort_order: int


class MnaRoadmapPhase(BaseModel):
    phase: int
    code: str
    name: str
    duration: str
    tasks: List[str]
    documents: List[MnaPhaseDocument] = Field(default_factory=list)


DEFAULT_MNA_ROADMAP_PHASES = [
    MnaRoadmapPhase(
        phase=1,
        code="preparation",
        name="매각 준비",
        duration="3~6개월",
        tasks=[
            "기업승계 M&A 컨설팅 지원사업 자격 확인",
            "최근 3개년 재무제표 준비",
            "임대차 계약서 정리",
            "주요 거래처 매출 비중 확인",
        ],
        documents=[
            MnaPhaseDocument(
                document_key="phase-1-strategy-brief",
                title="M&A 전략 정의서",
                description="거래 목적, 성공 기준, 승인권자를 한 장으로 정리합니다.",
                file_path="/templates/ma-pdf/phase-1-strategy-brief.pdf",
                category="strategy",
                is_required=True,
                sort_order=1,
            ),
            MnaPhaseDocument(
                document_key="phase-1-synergy-hypothesis",
                title="시너지 가설 정리표",
                description="매출, 비용, 기술, 조직 시너지와 검증 자료를 정리합니다.",
                file_path="/templates/ma-pdf/phase-1-synergy-hypothesis.pdf",
                category="strategy",
                is_required=True,
                sort_order=2,
            ),
            MnaPhaseDocument(
                document_key="phase-1-approval-memo",
                title="검토 착수 승인 메모",
                description="후보 탐색과 자문 착수 전 내부 승인 근거를 남깁니다.",
                file_path="/templates/ma-pdf/phase-1-approval-memo.pdf",
                category="governance",
                is_required=True,
                sort_order=3,
            ),
        ],
    ),
    MnaRoadmapPhase(
        phase=2,
        code="marketing",
        name="마케팅",
        duration="2~3개월",
        tasks=["티저 작성", "NDA 준비", "인수후보 롱리스트 작성"],
        documents=[
            MnaPhaseDocument(
                document_key="phase-2-target-screening-matrix",
                title="후보 Long List 평가표",
                description="후보 기업을 전략 적합성, 재무 성과, 거래 가능성으로 비교합니다.",
                file_path="/templates/ma-pdf/phase-2-target-screening-matrix.pdf",
                category="screening",
                is_required=True,
                sort_order=1,
            ),
            MnaPhaseDocument(
                document_key="nda-template",
                title="NDA 양식",
                description="자료 제공 전 비밀정보 범위와 사용 목적 제한을 확인합니다.",
                file_path="/templates/ma-pdf/nda-template.pdf",
                category="legal",
                is_required=True,
                sort_order=2,
            ),
            MnaPhaseDocument(
                document_key="phase-2-target-approach-log",
                title="대상 접촉 기록지",
                description="후보 접촉 이력, 수령 자료, 다음 액션을 추적합니다.",
                file_path="/templates/ma-pdf/phase-2-target-approach-log.pdf",
                category="screening",
                is_required=True,
                sort_order=3,
            ),
            MnaPhaseDocument(
                document_key="loi-template",
                title="LOI 양식",
                description="가격 범위, 독점 협상권, 실사 범위와 주요 조건을 정리합니다.",
                file_path="/templates/ma-pdf/loi-template.pdf",
                category="legal",
                is_required=True,
                sort_order=4,
            ),
        ],
    ),
    MnaRoadmapPhase(
        phase=3,
        code="diligence",
        name="실사",
        duration="1~2개월",
        tasks=["재무 실사 자료실 구성", "법률 리스크 점검", "노무 이슈 확인"],
        documents=[
            MnaPhaseDocument(
                document_key="dd-request-list",
                title="실사 요청자료 목록",
                description="재무, 세무, 법률, 인사, 영업, IT 자료와 상태를 관리합니다.",
                file_path="/templates/ma-pdf/dd-request-list.pdf",
                category="diligence",
                is_required=True,
                sort_order=1,
            ),
            MnaPhaseDocument(
                document_key="phase-3-data-room-index",
                title="데이터룸 인덱스",
                description="자료실 폴더, 파일 버전, 접근 권한과 검토 상태를 관리합니다.",
                file_path="/templates/ma-pdf/phase-3-data-room-index.pdf",
                category="diligence",
                is_required=True,
                sort_order=2,
            ),
            MnaPhaseDocument(
                document_key="phase-3-red-flag-log",
                title="Red Flag 이슈 로그",
                description="거래 중단, 가격 조정, 조건 변경 이슈를 기록합니다.",
                file_path="/templates/ma-pdf/phase-3-red-flag-log.pdf",
                category="risk",
                is_required=True,
                sort_order=3,
            ),
            MnaPhaseDocument(
                document_key="phase-3-valuation-workbook-checklist",
                title="가치평가 준비 체크리스트",
                description="DCF, EV/EBITDA, 유사 거래 비교에 필요한 입력 자료를 점검합니다.",
                file_path="/templates/ma-pdf/phase-3-valuation-workbook-checklist.pdf",
                category="valuation",
                is_required=True,
                sort_order=4,
            ),
        ],
    ),
    MnaRoadmapPhase(
        phase=4,
        code="negotiation",
        name="협상/계약",
        duration="1~2개월",
        tasks=["LOI 검토", "가격 조정 조건 정리", "SPA 주요 조항 검토"],
        documents=[
            MnaPhaseDocument(
                document_key="phase-4-spa-key-terms-checklist",
                title="SPA 핵심 조항 체크리스트",
                description="가격 조정, 진술보장, 손해배상, 선행조건을 조항별로 점검합니다.",
                file_path="/templates/ma-pdf/phase-4-spa-key-terms-checklist.pdf",
                category="legal",
                is_required=True,
                sort_order=1,
            ),
            MnaPhaseDocument(
                document_key="phase-4-disclosure-schedule-tracker",
                title="Disclosure Schedule 추적표",
                description="진술보장 예외 공시 항목과 검토 이력을 관리합니다.",
                file_path="/templates/ma-pdf/phase-4-disclosure-schedule-tracker.pdf",
                category="legal",
                is_required=True,
                sort_order=2,
            ),
            MnaPhaseDocument(
                document_key="closing-day-checklist",
                title="Closing 체크리스트",
                description="선행조건, 서명, 대금 지급, 주식/자산 이전을 점검합니다.",
                file_path="/templates/ma-pdf/closing-day-checklist.pdf",
                category="closing",
                is_required=True,
                sort_order=3,
            ),
        ],
    ),
    MnaRoadmapPhase(
        phase=5,
        code="closing-pmi",
        name="클로징/PMI",
        duration="1~3개월",
        tasks=["대금 수수 준비", "경영권 이전 일정", "직원 커뮤니케이션 계획"],
        documents=[
            MnaPhaseDocument(
                document_key="phase-5-pmi-100-day-plan",
                title="PMI 100일 실행계획",
                description="핵심 KPI, 주차별 실행 과제, 초기 리스크 대응을 정리합니다.",
                file_path="/templates/ma-pdf/phase-5-pmi-100-day-plan.pdf",
                category="integration",
                is_required=True,
                sort_order=1,
            ),
            MnaPhaseDocument(
                document_key="phase-5-day-1-communication-plan",
                title="Day 1 커뮤니케이션 계획서",
                description="임직원, 고객, 공급사, 금융기관 대상 메시지와 일정을 준비합니다.",
                file_path="/templates/ma-pdf/phase-5-day-1-communication-plan.pdf",
                category="integration",
                is_required=True,
                sort_order=2,
            ),
            MnaPhaseDocument(
                document_key="employee-transfer-plan",
                title="직원 승계 계획서",
                description="핵심 인력 유지와 고용 승계 메시지를 정리합니다.",
                file_path="/templates/ma-pdf/employee-transfer-plan.pdf",
                category="hr",
                is_required=True,
                sort_order=3,
            ),
            MnaPhaseDocument(
                document_key="phase-5-integration-workstream-tracker",
                title="통합 작업 관리표",
                description="재무, 인사, 영업, IT 등 통합 과제와 PMO 회의를 관리합니다.",
                file_path="/templates/ma-pdf/phase-5-integration-workstream-tracker.pdf",
                category="integration",
                is_required=True,
                sort_order=4,
            ),
        ],
    ),
]


class SupabaseMnaDocumentRepository:
    def __init__(self, client: object) -> None:
        self.client = client

    async def list_phases(self) -> List[MnaRoadmapPhase]:
        phases = (
            self.client.table("ma_roadmap_phases")
            .select("phase,code,name,duration,tasks,sort_order")
            .order("sort_order")
            .execute()
            .data
        )
        documents = (
            self.client.table("ma_phase_documents")
            .select(
                "phase,document_key,title,description,file_path,category,is_required,sort_order"
            )
            .order("phase")
            .order("sort_order")
            .execute()
            .data
        )

        documents_by_phase: dict[int, list[dict[str, Any]]] = {}
        for row in documents or []:
            phase_number = row.get("phase")
            if isinstance(phase_number, int):
                documents_by_phase.setdefault(phase_number, []).append(
                    {key: value for key, value in row.items() if key != "phase"}
                )

        return [
            MnaRoadmapPhase(
                phase=row["phase"],
                code=row["code"],
                name=row["name"],
                duration=row["duration"],
                tasks=row.get("tasks") or [],
                documents=documents_by_phase.get(row["phase"], []),
            )
            for row in phases or []
        ]


class MnaDocumentService:
    def __init__(self, repository: Optional[SupabaseMnaDocumentRepository]) -> None:
        self.repository = repository

    async def list_phases(self) -> List[MnaRoadmapPhase]:
        if not self.repository:
            return DEFAULT_MNA_ROADMAP_PHASES
        try:
            phases = await self.repository.list_phases()
        except Exception:
            return DEFAULT_MNA_ROADMAP_PHASES
        if not phases or not all(phase.documents for phase in phases):
            return DEFAULT_MNA_ROADMAP_PHASES
        return phases
