"""AI discussion API endpoints"""
import logging

from fastapi import APIRouter, HTTPException, Request

from app.middleware.rate_limit import rate_limit_ai_dependency
from app.schemas.ai import AIDiscussionRequest, AIDiscussionResponse
from app.services.ai_service import get_ai_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/discuss", response_model=AIDiscussionResponse)
async def discuss_solution(
    request: AIDiscussionRequest,
    http_request: Request,
):
    """
    Discuss a solution with AI.

    This endpoint allows users to ask questions about their AWS architecture solution
    and get personalized feedback from AI.

    **Rate Limits:**
    - 10 requests per user per hour
    - 50 requests per IP per day

    **Cost Controls:**
    - Maximum 500 tokens per response
    - Uses cost-effective gpt-4o-mini model

    **Request Body:**
    ```json
    {
      "puzzle_id": "puzzle-static-site-cdn",
      "puzzle_title": "Static Site with CDN",
      "puzzle_scenario": "Build a static website...",
      "question": "How can I improve my security score?",
      "solution_summary": "I used S3, CloudFront, and Route 53",
      "score": 75,
      "requirements_met": ["S3 bucket", "CDN distribution"],
      "requirements_missed": ["HTTPS"],
      "feedback": "Good use of CDN but missing HTTPS..."
    }
    ```
    """
    # Apply rate limiting
    rate_limit_ai_dependency(http_request)
    ai_service = get_ai_service()

    if not ai_service.is_available():
        raise HTTPException(
            status_code=503, detail="AI service is not available. Please configure OPENAI_API_KEY in environment variables."
        )

    try:
        result = await ai_service.discuss_solution(
            user_question=request.question,
            puzzle_title=request.puzzle_title,
            puzzle_scenario=request.puzzle_scenario,
            solution_summary=request.solution_summary,
            score=request.score,
            requirements_met=request.requirements_met,
            requirements_missed=request.requirements_missed,
            feedback=request.feedback,
            conversation_history=request.conversation_history,
        )

        # Calculate estimated cost
        estimated_cost = ai_service.estimate_cost(result["usage"]["prompt_tokens"], result["usage"]["completion_tokens"])

        return AIDiscussionResponse(
            response=result["response"],
            usage=result["usage"],
            estimated_cost=estimated_cost,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"AI discussion failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while processing your question. Please try again.")
