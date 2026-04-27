from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def valid_payload(**overrides):
    payload = {
        "company_id": "company-1",
        "company_name": "동양정밀",
        "requester_name": "김영호",
        "requester_phone": "010-1234-5678",
        "requester_email": "ceo@example.com",
        "consultation_type": "mna",
        "title": "M&A 자문 요청",
        "description": "매각 준비 단계와 필요한 자료를 상담받고 싶습니다.",
        "privacy_consent": True,
        "external_transfer_consent": True,
        "share_sensitive_files": False,
        "snapshot_json": {
            "valuation": {"range_low": 3500000000, "range_high": 5200000000},
            "roadmap": {"current_phase": "매각 준비", "progress_percent": 24},
        },
    }
    payload.update(overrides)
    return payload


def test_create_consultation_rejects_missing_external_transfer_consent():
    response = client.post(
        "/api/v1/consultations",
        json=valid_payload(external_transfer_consent=False),
    )

    assert response.status_code == 400
    assert "Patasos" in response.json()["detail"]


def test_create_and_list_consultations_without_patasos_env():
    response = client.post("/api/v1/consultations", json=valid_payload())

    assert response.status_code == 201
    created = response.json()
    assert created["patasos_sync_status"] == "not_requested"
    assert created["patasos_issue_id"] is None

    list_response = client.get("/api/v1/consultations")
    assert list_response.status_code == 200
    assert any(item["id"] == created["id"] for item in list_response.json())
