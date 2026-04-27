from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_mna_documents_exposes_downloadable_forms_by_phase():
    response = client.get("/api/v1/mna-documents")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) == 5
    assert payload[0]["name"] == "매각 준비"
    assert all(phase["documents"] for phase in payload)
    assert payload[1]["documents"][1]["title"] == "NDA 양식"
    assert payload[3]["documents"][0]["file_path"].endswith(
        "/phase-4-spa-key-terms-checklist.md"
    )
