"""SRAS Backend entrypoint."""
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import close_mongo, connect_to_mongo
from app.routes import admin, ai, analytics, auth, issues, proofs, tasks

app = FastAPI(
    title="Smart Resource Allocation System API",
    description="Backend for SRAS - hackathon MVP",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()] or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static uploads
upload_dir = Path(settings.UPLOAD_DIR)
upload_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


@app.on_event("startup")
async def startup_event() -> None:
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_mongo()


@app.get("/")
async def root():
    return {"name": "SRAS API", "status": "ok"}


@app.get("/healthz")
async def healthz():
    return {"status": "healthy"}


# Routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(issues.router, prefix="/issues", tags=["Issues"])
app.include_router(proofs.router, prefix="/proof", tags=["Proofs"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/ai", tags=["AI Allocation"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
