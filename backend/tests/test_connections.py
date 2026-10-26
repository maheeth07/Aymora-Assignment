import pytest
from backend.services.connection_service import ConnectionService
from backend.schemas.connection import InterestRequest
from backend.services.repository import reset_repository


@pytest.fixture(autouse=True)
def setup_repo():
    reset_repository()


def test_private_pending_interest():
    service = ConnectionService()
    # User-00 expresses interest in User-03 (Kaelen Chen, who hasn't expressed interest back yet)
    req = InterestRequest(from_user_id="user-00", to_user_id="user-03")
    res = service.process_interest(req)

    assert res.is_mutual is False
    assert res.status == "interest_recorded_privately"
    assert res.conversation_id is None
    assert "recorded privately" in res.message


def test_mutual_connection_created_when_reciprocated():
    service = ConnectionService()
    # Julian (user-01) already has seeded interest in Maya (user-00) in repository
    req = InterestRequest(from_user_id="user-00", to_user_id="user-01")
    res = service.process_interest(req)

    assert res.is_mutual is True
    assert res.status == "mutual_connection_created"
    assert res.conversation_id is not None
    assert res.partner is not None
    assert res.partner.id == "user-01"
    assert "It's mutual!" in res.message


def test_two_users_express_interest_step_by_step():
    service = ConnectionService()
    # 1. User-05 likes User-06
    step1 = service.process_interest(InterestRequest(from_user_id="user-05", to_user_id="user-06"))
    assert step1.is_mutual is False
    assert step1.conversation_id is None

    # 2. User-06 likes User-05 -> Mutual match triggers!
    step2 = service.process_interest(InterestRequest(from_user_id="user-06", to_user_id="user-05"))
    assert step2.is_mutual is True
    assert step2.status == "mutual_connection_created"
    assert step2.conversation_id is not None


def test_prevent_self_interest():
    service = ConnectionService()
    req = InterestRequest(from_user_id="user-00", to_user_id="user-00")
    res = service.process_interest(req)

    assert res.is_mutual is False
    assert res.status == "invalid_self_interest"


def test_interest_in_nonexistent_user():
    service = ConnectionService()
    req = InterestRequest(from_user_id="user-00", to_user_id="user-non-existent")
    res = service.process_interest(req)

    assert res.is_mutual is False
    assert res.status == "candidate_not_found"
