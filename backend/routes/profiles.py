from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from backend.schemas.profile import Profile, ProfileListResponse
from backend.services.repository import get_repository

router = APIRouter(prefix="/api/profiles", tags=["Profiles"])


@router.get("", response_model=ProfileListResponse)
def get_profiles(
    exclude_current: bool = Query(False, description="Exclude the current simulated user"),
    interest: Optional[str] = Query(None, description="Filter by interest tag"),
):
    repo = get_repository()
    profiles = repo.list_all_profiles()
    
    if exclude_current:
        profiles = [p for p in profiles if not p.is_current_user]

    if interest:
        interest_norm = interest.strip().lower()
        profiles = [
            p for p in profiles 
            if any(interest_norm in i.lower() for i in p.interests)
        ]

    return ProfileListResponse(total=len(profiles), profiles=profiles)


@router.get("/me", response_model=Profile)
def get_current_user_profile():
    repo = get_repository()
    current_user = repo.get_current_user()
    if not current_user:
        raise HTTPException(status_code=404, detail="Default current user profile not found.")
    return current_user


@router.get("/{profile_id}", response_model=Profile)
def get_profile_by_id(profile_id: str):
    repo = get_repository()
    profile = repo.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_id}' not found.")
    return profile
