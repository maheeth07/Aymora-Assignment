from typing import Optional, List
from pydantic import BaseModel, Field
from backend.schemas.profile import Profile


class InterestRequest(BaseModel):
    from_user_id: str = Field(..., description="ID of user expressing interest")
    to_user_id: str = Field(..., description="ID of candidate receiving interest")


class InterestResponse(BaseModel):
    status: str = Field(
        ...,
        description="'interest_recorded_privately' or 'mutual_connection_created'"
    )
    is_mutual: bool = Field(..., description="True if mutual connection established")
    message: str = Field(..., description="User feedback message")
    conversation_id: Optional[str] = Field(None, description="Active conversation ID if mutual")
    partner: Optional[Profile] = Field(None, description="Partner profile if mutual")
    disclaimer: str = Field(
        "Prototype in-memory state: interest actions reset if the backend server restarts.",
        description="Privacy and simulation disclosure"
    )


class ConnectionItem(BaseModel):
    connection_id: str
    partner: Profile
    connected_at: str
    conversation_id: str
    last_message: Optional[str] = None


class ConnectionListResponse(BaseModel):
    total: int
    connections: List[ConnectionItem]
