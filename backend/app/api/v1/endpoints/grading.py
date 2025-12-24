from fastapi import APIRouter, HTTPException
import logging
from app.schemas.graph import GraphJSONSchema
from app.schemas.grading import GradingResultSchema
from app.services.grading_service import grading_service

logger = logging.getLogger(__name__)
router = APIRouter()

# Temporary: Load puzzles for rules
PUZZLE_RULES = {
    "puzzle-3tier-basic": {
        "requirements": ["Load balancer", "Compute layer", "Database layer"],
    },
    "puzzle-static-site-cdn": {
        "requirements": ["S3 bucket", "CDN distribution", "HTTPS", "Private S3 access"],
    },
    "puzzle-serverless-api": {
        "requirements": ["REST API", "Serverless compute", "Managed database", "Auto-scaling"],
    },
    "puzzle-async-processing": {
        "requirements": ["Decouple upload/processing", "Queue/pub-sub", "Dead-letter handling", "Scalable workers"],
    },
    "puzzle-data-lake-analytics": {
        "requirements": ["Durable storage", "Ad-hoc SQL queries", "No persistent servers", "Data catalog"],
    },
}

@router.post("/grade", response_model=GradingResultSchema)
async def grade_architecture(request: GraphJSONSchema):
    """
    Grade a user's AWS architecture diagram.
    
    Takes a graph of AWS services and returns:
    - Scores for correctness, reliability, security, cost
    - Requirements check
    - Hard constraint violations
    - Summary feedback
    """
    try:
        puzzle_rules = PUZZLE_RULES.get(request.puzzleId, {})
        result = grading_service.grade_architecture(
            request.puzzleId,
            request,
            puzzle_rules,
        )
        return GradingResultSchema(**result)
    except Exception as e:
        logger.error(f"Grading failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

