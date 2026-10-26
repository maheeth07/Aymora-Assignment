from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])


@router.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "Aymora Spark API",
        "version": "1.0.0",
        "environment": "development",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tagline": "Meaningful compatibility & genuine connection",
    }
