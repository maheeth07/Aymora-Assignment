from fastapi import APIRouter
from backend.schemas.chat import SuggestionRequest, SuggestionResponse
from backend.services.groq_service import GroqService

router = APIRouter(prefix="/api/chat", tags=["AI Chat Companion"])


@router.post("/suggestions", response_model=SuggestionResponse)
def get_chat_suggestions(request: SuggestionRequest):
    service = GroqService()
    return service.generate_suggestions(request)
