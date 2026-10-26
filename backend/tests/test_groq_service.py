from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.schemas.chat import SuggestionRequest
from backend.services.groq_service import GroqService
from backend.services.repository import reset_repository

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_repo():
    reset_repository()


def test_groq_fallback_when_no_api_key(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "")
    service = GroqService()
    req = SuggestionRequest(partner_id="user-01")
    resp = service.generate_suggestions(req)

    assert resp.source == "contextual_fallback"
    assert resp.partner_name == "Julian Vance"
    assert len(resp.suggestions.funny) > 0
    assert len(resp.suggestions.flirty) > 0
    assert len(resp.suggestions.sweet) > 0


def test_groq_successful_llm_response(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "gsk_mock_test_key_12345")
    service = GroqService()

    mock_chat_completion = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = (
        '{"funny": "Mock funny opener", "flirty": "Mock flirty spark", "sweet": "Mock sweet thought"}'
    )
    mock_chat_completion.choices = [mock_choice]

    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = mock_chat_completion

    with patch.object(service, "_get_client", return_value=mock_client):
        req = SuggestionRequest(partner_id="user-01")
        resp = service.generate_suggestions(req)

        assert resp.source == "groq_llm"
        assert resp.suggestions.funny == "Mock funny opener"
        assert resp.suggestions.flirty == "Mock flirty spark"
        assert resp.suggestions.sweet == "Mock sweet thought"


def test_groq_fallback_on_api_exception(monkeypatch):
    monkeypatch.setenv("GROQ_API_KEY", "gsk_mock_test_key_12345")
    service = GroqService()

    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = TimeoutError("Request timed out")

    with patch.object(service, "_get_client", return_value=mock_client):
        req = SuggestionRequest(partner_id="user-01")
        resp = service.generate_suggestions(req)

        # Must gracefully degrade to fallback rather than raising an uncaught exception
        assert resp.source == "contextual_fallback"
        assert len(resp.suggestions.funny) > 0
        assert len(resp.suggestions.flirty) > 0
        assert len(resp.suggestions.sweet) > 0


def test_chat_suggestions_api_endpoint():
    payload = {
        "partner_id": "user-01",
        "current_user_id": "user-00",
        "recent_messages": ["Hey there!"]
    }
    response = client.post("/api/chat/suggestions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data
    assert "funny" in data["suggestions"]
    assert "flirty" in data["suggestions"]
    assert "sweet" in data["suggestions"]
    assert data["partner_name"] == "Julian Vance"
