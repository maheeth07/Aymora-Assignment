from typing import Optional, List
from pydantic import BaseModel, Field


class SuggestionRequest(BaseModel):
    conversation_id: Optional[str] = Field(None, description="Optional conversation context")
    partner_id: str = Field(..., description="ID of match profile being messaged")
    current_user_id: Optional[str] = Field("user-00", description="Current user ID")
    recent_messages: Optional[List[str]] = Field(default_factory=list, description="Recent conversation turns")
    context_note: Optional[str] = Field(None, description="User note or custom scenario")


class SuggestionTones(BaseModel):
    funny: str = Field(..., description="Witty, playful, self-aware icebreaker")
    flirty: str = Field(..., description="Charming, subtle, warm conversational spark")
    sweet: str = Field(..., description="Thoughtful, curious, gentle question or observation")


class SuggestionResponse(BaseModel):
    suggestions: SuggestionTones
    source: str = Field(..., description="'groq_llm' or 'contextual_fallback'")
    model: Optional[str] = None
    partner_name: str
    shared_interests: List[str] = Field(default_factory=list)
    generated_at: str
    safety_disclaimer: str = Field(
        "AI drafts are suggestions only. You are in complete control: review, edit, and send manually."
    )
