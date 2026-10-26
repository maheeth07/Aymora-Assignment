from typing import List, Optional
from pydantic import BaseModel, Field
from backend.schemas.profile import Profile


class ChatMessage(BaseModel):
    id: str = Field(..., description="Message UUID")
    sender_id: str = Field(..., description="User ID of sender")
    text: str = Field(..., min_length=1, description="Message text")
    timestamp: str = Field(..., description="ISO 8601 timestamp")
    is_ai_assisted: bool = Field(False, description="Whether message was drafted via AI")
    tone: Optional[str] = Field(None, description="Selected AI tone: funny, flirty, sweet")


class SendMessageRequest(BaseModel):
    sender_id: str = Field(..., description="User sending message")
    text: str = Field(..., min_length=1, max_length=2000, description="Message body")
    is_ai_assisted: bool = Field(False)
    tone: Optional[str] = Field(None)


class Conversation(BaseModel):
    id: str = Field(..., description="Conversation identifier")
    participant_ids: List[str] = Field(..., description="List of participant user IDs")
    partner: Profile = Field(..., description="Other participant profile")
    messages: List[ChatMessage] = Field(default_factory=list)
    created_at: str
    last_active: str


class ConversationListResponse(BaseModel):
    total: int
    conversations: List[Conversation]
