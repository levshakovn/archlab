from pydantic import BaseModel, field_validator
from typing import List


class RequirementCheckSchema(BaseModel):
    """Requirement status"""

    requirement: str
    met: bool
    comment: str

    @field_validator("requirement", "comment")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Requirement and comment cannot be empty")
        return v.strip()


class ScoresSchema(BaseModel):
    """Dimension scores"""

    correctness: int
    reliability: int
    security: int
    cost: int
    total: float

    @field_validator("correctness", "reliability", "security", "cost")
    @classmethod
    def validate_score_range(cls, v):
        if not 0 <= v <= 10:
            raise ValueError("Scores must be between 0 and 10")
        return v

    @field_validator("total")
    @classmethod
    def validate_total_range(cls, v):
        if not 0 <= v <= 10:
            raise ValueError("Total score must be between 0 and 10")
        return v


class GradingResultSchema(BaseModel):
    """Grading result"""

    scores: ScoresSchema
    requirements: List[RequirementCheckSchema]
    hardConstraintViolations: List[str]
    summaryFeedback: str

    @field_validator("summaryFeedback")
    @classmethod
    def validate_feedback_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Summary feedback cannot be empty")
        return v.strip()
