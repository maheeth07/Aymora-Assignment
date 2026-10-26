from fastapi.testclient import TestClient
from backend.main import app
from backend.services.repository import reset_repository
import pytest

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_repo():
    reset_repository()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Aymora Spark API"


def test_profiles_endpoint():
    response = client.get("/api/profiles")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 15
    assert len(data["profiles"]) >= 15

    # Test me endpoint
    me_resp = client.get("/api/profiles/me")
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["name"] == "Maya Lin"


def test_matches_endpoint():
    payload = {
        "user_id": "user-00",
        "limit": 5
    }
    response = client.post("/api/matches", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["returned_count"] <= 5
    assert len(data["matches"]) <= 5
    for match in data["matches"]:
        assert "compatibility_score" in match
        assert "shared_interests" in match
        assert "explanation" in match
        assert match["profile"]["id"] != "user-00"


def test_connections_interest_pending():
    payload = {
        "from_user_id": "user-00",
        "to_user_id": "user-04"
    }
    response = client.post("/api/connections/interest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_mutual"] is False
    assert data["status"] == "interest_recorded_privately"


def test_connections_interest_mutual():
    # Julian (user-01) has pre-seeded interest in Maya (user-00)
    payload = {
        "from_user_id": "user-00",
        "to_user_id": "user-01"
    }
    response = client.post("/api/connections/interest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_mutual"] is True
    assert data["status"] == "mutual_connection_created"
    assert data["conversation_id"] is not None


def test_would_you_rather_endpoint():
    response = client.get("/api/games/would-you-rather")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 15
    assert len(data["questions"]) >= 15
    for q in data["questions"]:
        assert "option_a" in q
        assert "option_b" in q
        assert "prompt" in q


def test_conversations_endpoint():
    response = client.get("/api/conversations?user_id=user-00")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
