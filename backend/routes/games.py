from fastapi import APIRouter
from backend.schemas.game import GameQuestionsResponse
from backend.services.repository import get_repository

router = APIRouter(prefix="/api/games", tags=["Games"])


@router.get("/would-you-rather", response_model=GameQuestionsResponse)
def get_would_you_rather_questions():
    repo = get_repository()
    questions = repo.list_all_questions()
    return GameQuestionsResponse(
        total=len(questions),
        game_type="Would You Rather",
        description="Thought-provoking, low-pressure conversation starters designed for genuine rapport.",
        questions=questions,
    )
