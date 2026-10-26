import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from backend.schemas.conversation import (
    Conversation,
    ConversationListResponse,
    SendMessageRequest,
    ChatMessage,
)
from backend.services.repository import get_repository

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


@router.get("", response_model=ConversationListResponse)
def list_conversations(
    user_id: str = Query("user-00", description="User ID to list active threads for")
):
    repo = get_repository()
    convs = repo.list_user_conversations(user_id)
    return ConversationListResponse(total=len(convs), conversations=convs)


@router.get("/{conversation_id}", response_model=Conversation)
def get_conversation(conversation_id: str):
    repo = get_repository()
    conv = repo.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(
            status_code=404,
            detail=f"Conversation '{conversation_id}' not found."
        )
    return conv


@router.post("/{conversation_id}/messages", response_model=ChatMessage)
def post_message(conversation_id: str, request: SendMessageRequest):
    repo = get_repository()
    conv = repo.get_conversation(conversation_id)
    if not conv:
        raise HTTPException(
            status_code=404,
            detail=f"Conversation '{conversation_id}' not found."
        )

    msg_id = f"msg-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    new_message = ChatMessage(
        id=msg_id,
        sender_id=request.sender_id,
        text=request.text.strip(),
        timestamp=now_iso,
        is_ai_assisted=request.is_ai_assisted,
        tone=request.tone,
    )

    updated_conv = repo.add_message_to_conversation(conversation_id, new_message)
    if not updated_conv:
        raise HTTPException(status_code=500, detail="Failed to save message to thread.")

    return new_message
