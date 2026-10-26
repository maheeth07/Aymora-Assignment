import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load environment configuration from .env if present
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from backend.routes.health import router as health_router
from backend.routes.profiles import router as profiles_router
from backend.routes.matches import router as matches_router
from backend.routes.connections import router as connections_router
from backend.routes.conversations import router as conversations_router
from backend.routes.games import router as games_router
from backend.routes.chat import router as chat_router

app = FastAPI(
    title="Aymora Spark API",
    description=(
        "Meaningful-connection backend for Aymora Spark. "
        "Provides deterministic compatibility matching, privacy-preserving mutual interest, "
        "interactive conversation games, and AI companion suggestions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
frontend_origin_env = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
allowed_origins = [origin.strip() for origin in frontend_origin_env.split(",") if origin.strip()]
if "http://localhost:3000" not in allowed_origins:
    allowed_origins.append("http://localhost:3000")
if "http://127.0.0.1:3000" not in allowed_origins:
    allowed_origins.append("http://127.0.0.1:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler for uniform JSON responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": request.url.path,
        },
    )

# Include all route modules
app.include_router(health_router)
app.include_router(profiles_router)
app.include_router(matches_router)
app.include_router(connections_router)
app.include_router(conversations_router)
app.include_router(games_router)
app.include_router(chat_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Aymora Spark API",
        "documentation": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
