from pydantic import BaseModel
from typing import List

class RequirementCheckSchema(BaseModel):
    """Requirement status"""
    requirement: str
    met: bool
    comment: str

class ScoresSchema(BaseModel):
    """Dimension scores"""
    correctness: int
    reliability: int
    security: int
    cost: int
    total: float

class GradingResultSchema(BaseModel):
    """Grading result"""
    scores: ScoresSchema
    requirements: List[RequirementCheckSchema]
    hardConstraintViolations: List[str]
    summaryFeedback: str

