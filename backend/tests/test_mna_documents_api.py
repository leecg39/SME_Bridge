from fastapi.testclient import TestClient

from app.main import app
from app.services.mna_document_service import MnaPhaseDocument, MnaRoadmapPhase


client = TestClient(app)


def test_mna_documents_exposes_downloadable_forms_by_phase():
    response = client.get("/api/v1/mna-documents")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 5
    assert payload[0]["name"] == "매각 준비"
    assert payload[0]["tasks"][0] == "기업승계 M&A 컨설팅 지원사업 자격 확인"
    assert [program["program_key"] for program in payload[0]["support_programs"]] == [
        "succession-consulting",
        "valuation-cost-support",
    ]
    assert payload[0]["support_programs"][0]["required_document_keys"] == [
        "phase-1-strategy-brief",
        "phase-1-synergy-hypothesis",
        "phase-1-approval-memo",
    ]
    assert payload[0]["support_programs"][0]["funding"] is None
    assert payload[0]["support_programs"][1]["funding"] == {
        "max_amount_won": 15000000,
        "note": "벤처기업은 60%, 2,000만원 한도까지 검토합니다.",
        "rate_label": "일반 40% / 벤처 60%",
        "standard_rate": 0.4,
        "venture_max_amount_won": 20000000,
        "venture_rate": 0.6,
    }
    assert payload[0]["readiness_seed"] == {
        "first_required_document_key": "phase-1-strategy-brief",
        "required_document_count": 3,
        "required_document_keys": [
            "phase-1-strategy-brief",
            "phase-1-synergy-hypothesis",
            "phase-1-approval-memo",
        ],
        "support_program_count": 2,
        "support_required_document_keys": [
            "phase-1-strategy-brief",
            "phase-1-synergy-hypothesis",
            "phase-1-approval-memo",
            "phase-3-valuation-workbook-checklist",
        ],
    }
    assert payload[1]["readiness_seed"]["support_program_count"] == 0
    assert payload[1]["readiness_seed"]["support_required_document_keys"] == []
    assert payload[2]["support_programs"][0]["program_key"] == "diligence-cost-support"
    assert payload[2]["support_programs"][0]["required_document_keys"] == [
        "dd-request-list",
        "phase-3-data-room-index",
        "phase-3-red-flag-log",
    ]
    assert payload[2]["support_programs"][0]["funding"]["max_amount_won"] == 30000000
    assert payload[2]["support_programs"][0]["funding"]["rate_label"] == "50%"
    assert payload[2]["support_programs"][0]["funding"]["standard_rate"] == 0.5
    assert payload[4]["support_programs"][0]["support_scope"] == "PMI 컨설팅 비용"
    assert payload[4]["support_programs"][0]["funding"]["max_amount_won"] == 25000000
    assert payload[4]["support_programs"][0]["funding"]["standard_rate"] == 0.5
    assert all(phase["documents"] for phase in payload)
    assert payload[1]["documents"][1]["title"] == "NDA 양식"
    assert payload[3]["documents"][0]["file_path"].endswith(
        "/phase-4-spa-key-terms-checklist.pdf"
    )


def test_mna_phase_model_derives_readiness_seed_for_repository_rows():
    phase = MnaRoadmapPhase(
        phase=99,
        code="custom",
        name="커스텀",
        duration="1개월",
        tasks=[],
        documents=[
            MnaPhaseDocument(
                document_key="later-doc",
                title="후순위",
                description="후순위 문서",
                file_path="/templates/later.pdf",
                category="test",
                is_required=True,
                sort_order=2,
            ),
            MnaPhaseDocument(
                document_key="optional-doc",
                title="선택",
                description="선택 문서",
                file_path="/templates/optional.pdf",
                category="test",
                is_required=False,
                sort_order=1,
            ),
            MnaPhaseDocument(
                document_key="first-doc",
                title="우선",
                description="우선 문서",
                file_path="/templates/first.pdf",
                category="test",
                is_required=True,
                sort_order=1,
            ),
        ],
    )

    assert phase.readiness_seed is not None
    assert phase.readiness_seed.first_required_document_key == "first-doc"
    assert phase.readiness_seed.required_document_count == 2
    assert phase.readiness_seed.required_document_keys == ["first-doc", "later-doc"]
