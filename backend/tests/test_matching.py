import pytest
from backend.services.matching_service import MatchingService
from backend.schemas.match import MatchRequest, MatchFilter
from backend.schemas.profile import Profile
from backend.services.repository import reset_repository


@pytest.fixture(autouse=True)
def setup_repo():
    reset_repository()


def test_jaccard_identical_interests():
    service = MatchingService()
    interests_a = ["Specialty Coffee", "Analog Photography", "Modern Architecture"]
    interests_b = ["Specialty Coffee", "Analog Photography", "Modern Architecture"]

    score, shared, unique_user, unique_cand, status = service.calculate_jaccard_similarity(
        interests_a, interests_b
    )
    assert score == 100.0
    assert len(shared) == 3
    assert len(unique_user) == 0
    assert len(unique_cand) == 0
    assert status == "high"


def test_jaccard_partially_overlapping_interests():
    service = MatchingService()
    # A: [Coffee, Photo], B: [Coffee, Ceramics]
    # Intersection: [Coffee] (size 1)
    # Union: [Coffee, Photo, Ceramics] (size 3)
    # 1 / 3 * 100 = 33.3%
    interests_a = ["Specialty Coffee", "Analog Photography"]
    interests_b = ["Specialty Coffee", "Ceramics"]

    score, shared, unique_user, unique_cand, status = service.calculate_jaccard_similarity(
        interests_a, interests_b
    )
    assert score == 33.3
    assert shared == ["Specialty Coffee"]
    assert unique_user == ["Analog Photography"]
    assert unique_cand == ["Ceramics"]
    assert status == "moderate"


def test_jaccard_no_overlapping_interests():
    service = MatchingService()
    interests_a = ["Bouldering", "Sci-Fi Literature"]
    interests_b = ["Ceramics", "Jazz & Vinyl"]

    score, shared, unique_user, unique_cand, status = service.calculate_jaccard_similarity(
        interests_a, interests_b
    )
    assert score == 0.0
    assert len(shared) == 0
    assert len(unique_user) == 2
    assert len(unique_cand) == 2
    assert status == "exploratory"


def test_jaccard_both_empty_interests():
    service = MatchingService()
    score, shared, unique_user, unique_cand, status = service.calculate_jaccard_similarity(
        [], []
    )
    # Must NOT claim 100% or know compatibility; must be 0.0 and unknown
    assert score == 0.0
    assert len(shared) == 0
    assert status == "unknown"


def test_jaccard_one_empty_interest():
    service = MatchingService()
    score, shared, unique_user, unique_cand, status = service.calculate_jaccard_similarity(
        ["Specialty Coffee"], []
    )
    assert score == 0.0
    assert status == "exploratory"


def test_matching_excludes_current_user():
    service = MatchingService()
    req = MatchRequest(user_id="user-00", limit=15)
    resp = service.find_matches(req)

    match_ids = [m.profile.id for m in resp.matches]
    assert "user-00" not in match_ids
    assert len(match_ids) > 0


def test_matching_top_10_limit_and_sorting():
    service = MatchingService()
    req = MatchRequest(user_id="user-00", limit=10)
    resp = service.find_matches(req)

    assert len(resp.matches) <= 10
    # Verify scores are sorted descending
    scores = [m.compatibility_score for m in resp.matches]
    assert scores == sorted(scores, reverse=True)


def test_matching_deterministic_tie_breaking():
    service = MatchingService()
    # Execute two identical calls, ensure matches returned in exact same order
    req1 = MatchRequest(user_id="user-00", limit=10)
    resp1 = service.find_matches(req1)

    req2 = MatchRequest(user_id="user-00", limit=10)
    resp2 = service.find_matches(req2)

    ids1 = [m.profile.id for m in resp1.matches]
    ids2 = [m.profile.id for m in resp2.matches]
    assert ids1 == ids2


def test_matching_with_age_filter():
    service = MatchingService()
    req = MatchRequest(
        user_id="user-00",
        filters=MatchFilter(min_age=29, max_age=31),
        limit=10
    )
    resp = service.find_matches(req)
    for m in resp.matches:
        assert 29 <= m.profile.age <= 31
