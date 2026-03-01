from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import endpoints
from app.core.config import settings
from app.core.logging import setup_logging
from app.middleware.security import CSRFProtectionMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware

# Setup logging
setup_logging(settings.LOG_LEVEL)

# Create FastAPI app
app = FastAPI(
    title="ArchLab API",
    description="AWS architecture practice tool grading API",
    version="0.1.0",
)

# Store settings in app state for middleware access
app.state.settings = settings

# Add security middleware (order matters - security headers first)
app.add_middleware(SecurityHeadersMiddleware)

# Add rate limiting (100 requests per minute per IP)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)

# Add CSRF protection
app.add_middleware(CSRFProtectionMiddleware, allowed_origins=settings.CORS_ORIGINS)

# Add CORS middleware (after CSRF to allow proper origin checking)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Include routers
app.include_router(endpoints.grading.router, prefix="/api/v1", tags=["grading"])
app.include_router(endpoints.ai.router, prefix="/api/v1", tags=["ai"])


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
