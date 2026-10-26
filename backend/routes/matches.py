from fastapi import APIRouter
from backend.schemas.match import MatchRequest, MatchResponse
from backend.services.matching_service import MatchingService

router = APIRouter(prefix="/api/matches", tags=["Matches"])


@router.post("", response_model=MatchResponse)
def compute_matches(request: MatchRequest):
    service = MatchingService()
    return service.find_matches(request)
