from typing import List, Optional
from pydantic import BaseModel, Field
from backend.schemas.profile import Profile


class MatchFilter(BaseModel):
    min_age: Optional[int] = Field(None, ge=18, le=100)
    max_age: Optional[int] = Field(None, ge=18, le=100)
    must_include_interests: Optional[List[str]] = Field(default=None)


class MatchRequest(BaseModel):
    user_id: Optional[str] = Field("user-00", description="User ID to match against others")
    custom_interests: Optional[List[str]] = Field(
        None, description="Optional override/transient interests for the current user"
    )
    filters: Optional[MatchFilter] = Field(default_factory=MatchFilter)
    limit: int = Field(10, ge=1, le=50, description="Max number of candidate matches to return")


class MatchItem(BaseModel):
    profile: Profile
    compatibility_score: float = Field(..., description="Calculated Jaccard similarity score (0 to 100)")
    shared_interests: List[str] = Field(default_factory=list, description="Interests shared by both profiles")
    unique_user_interests: List[str] = Field(default_factory=list, description="Interests unique to current user")
    unique_candidate_interests: List[str] = Field(default_factory=list, description="Interests unique to candidate")
    explanation: str = Field(..., description="Transparent human-readable reason for match recommendation")
    status: str = Field(..., description="Classification: high, moderate, low, or unknown")


class MatchResponse(BaseModel):
    current_user_id: Optional[str] = None
    evaluated_interests: List[str] = Field(default_factory=list)
    total_candidates_evaluated: int
    returned_count: int
    matches: List[MatchItem]
