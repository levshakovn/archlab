"""Rate limiting for AI endpoints"""
import time
from collections import defaultdict

from fastapi import HTTPException, Request, status

# Rate limit storage (in production, use Redis or similar)
_ai_rate_limits: dict[str, dict] = defaultdict(lambda: {"requests": [], "user_requests": []})


def get_client_identifier(request: Request) -> str:
    """Get client identifier for rate limiting"""
    # Try to get user ID from auth if available
    # For now, use IP address
    return request.client.host if request.client else "unknown"


def rate_limit_ai_dependency(
    request: Request,
    max_requests_per_hour: int = 10,
    max_requests_per_day: int = 50,
) -> None:
    """
    Rate limit AI discussion endpoint

    Limits:
    - 10 requests per user per hour
    - 50 requests per IP per day

    Args:
        request: FastAPI request object
        max_requests_per_hour: Maximum requests per hour
        max_requests_per_day: Maximum requests per day
    """
    client_id = get_client_identifier(request)
    current_time = time.time()

    # Get or create rate limit data
    rate_data = _ai_rate_limits[client_id]

    # Clean old entries (older than 24 hours)
    rate_data["requests"] = [ts for ts in rate_data["requests"] if current_time - ts < 86400]  # 24 hours
    rate_data["user_requests"] = [ts for ts in rate_data["user_requests"] if current_time - ts < 3600]  # 1 hour

    # Check daily limit (per IP)
    if len(rate_data["requests"]) >= max_requests_per_day:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily AI discussion limit reached ({max_requests_per_day} requests). Please try again tomorrow.",
            headers={
                "X-RateLimit-Limit": str(max_requests_per_day),
                "X-RateLimit-Remaining": "0",
                "Retry-After": str(int(86400 - (current_time - rate_data["requests"][0]))),
            },
        )

    # Check hourly limit (per user/IP)
    if len(rate_data["user_requests"]) >= max_requests_per_hour:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Hourly AI discussion limit reached ({max_requests_per_hour} requests). Please try again later.",
            headers={
                "X-RateLimit-Limit": str(max_requests_per_hour),
                "X-RateLimit-Remaining": "0",
                "Retry-After": str(int(3600 - (current_time - rate_data["user_requests"][0]))),
            },
        )

    # Add current request
    rate_data["requests"].append(current_time)
    rate_data["user_requests"].append(current_time)

    # Return remaining counts in headers (would be set by dependency)
    return None
