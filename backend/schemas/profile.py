from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class Preferences(BaseModel):
    looking_for: Optional[str] = None
    communication_style: Optional[str] = None
    dealbreaker: Optional[str] = None


class Profile(BaseModel):
    id: str = Field(..., description="Unique profile identifier")
    name: str = Field(..., description="Display name")
    age: int = Field(..., ge=18, le=100, description="Age in years")
    pronouns: Optional[str] = Field(None, description="Preferred pronouns")
    location: Optional[str] = Field(None, description="City / Neighborhood")
    occupation: Optional[str] = Field(None, description="Occupation or vocation")
    bio: str = Field(..., description="Short personal bio")
    avatar: str = Field(..., description="Profile portrait URL or avatar")
    interests: List[str] = Field(default_factory=list, description="List of user interests")
    preferences: Optional[Preferences] = Field(default_factory=Preferences, description="Declared preferences")
    is_current_user: bool = Field(False, description="Whether this is the simulated logged-in user")


class ProfileListResponse(BaseModel):
    total: int
    profiles: List[Profile]
