from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import endpoints
from app.core.config import settings
from app.core.logging import setup_logging

# Setup logging
setup_logging(settings.LOG_LEVEL)

# Create FastAPI app
app = FastAPI(
    title="ArchLab API",
    description="AWS architecture practice tool grading API",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(endpoints.grading.router, prefix="/api/v1", tags=["grading"])


# Health check
@app.get("/health")
def health_check():
    """Check API health"""
    return {"status": "healthy", "version": "0.1.0"}


# Root endpoint
@app.get("/")
def root():
    """Welcome to ArchLab API"""
    return {
        "message": "Welcome to ArchLab",
        "docs": "/docs",
        "health": "/health",
    }
