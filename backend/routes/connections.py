from fastapi import APIRouter, Query
from backend.schemas.connection import InterestRequest, InterestResponse, ConnectionListResponse
from backend.services.connection_service import ConnectionService

router = APIRouter(prefix="/api/connections", tags=["Connections"])


@router.post("/interest", response_model=InterestResponse)
def express_interest(request: InterestRequest):
    service = ConnectionService()
    return service.process_interest(request)


@router.get("", response_model=ConnectionListResponse)
def get_user_connections(user_id: str = Query("user-00", description="User ID to list connections for")):
    service = ConnectionService()
    return service.list_connections(user_id)
