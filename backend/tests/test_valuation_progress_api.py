from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_get_valuation_progress_defaults_to_empty_result():
    response = client.get("/api/v1/valuation-progress")

    assert response.status_code == 200
    assert response.json() == {"result": None}


def test_save_and_get_valuation_progress_round_trips_result():
    payload = {
        "result": {
            "normalizedEbitda": 820000000,
            "recommendedMultiple": 3.7,
            "valuationLow": 2730000000,
            "valuationHigh": 3340000000,
        }
    }

    save_response = client.put("/api/v1/valuation-progress", json=payload)
    get_response = client.get("/api/v1/valuation-progress")

    assert save_response.status_code == 200
    assert save_response.json() == payload
    assert get_response.status_code == 200
    assert get_response.json() == payload
