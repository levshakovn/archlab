"""Schemas for AI discussion API"""
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class AIDiscussionRequest(BaseModel):
    """Request for AI discussion"""

    puzzle_id: str = Field(..., description="Puzzle ID")
    puzzle_title: str = Field(..., description="Puzzle title")
    puzzle_scenario: str = Field(..., description="Puzzle scenario description")
    question: str = Field(..., min_length=10, max_length=500, description="User's question (10-500 characters)")
    solution_summary: str = Field(..., max_length=1000, description="Summary of user's solution")
    score: int = Field(..., ge=0, le=100, description="User's score (0-100)")
    requirements_met: List[str] = Field(default_factory=list, description="Requirements that were met")
    requirements_missed: List[str] = Field(default_factory=list, description="Requirements that were missed")
    feedback: str = Field(..., max_length=2000, description="Grading feedback")
    conversation_history: Optional[List[dict]] = Field(
        default=None, description="Previous messages in the conversation (for context)"
    )

    @field_validator("question")
    @classmethod
    def validate_question(cls, v):
        """Validate question content"""
        if not v or not v.strip():
            raise ValueError("Question cannot be empty")

        # Basic content filtering - reject obviously non-architectural questions
        v_lower = v.lower()
        inappropriate_keywords = [
            "how to hack",
            "bypass",
            "exploit",
            "crack",
            "illegal",
        ]

        for keyword in inappropriate_keywords:
            if keyword in v_lower:
                raise ValueError("Question contains inappropriate content")

        return v.strip()


class AIDiscussionResponse(BaseModel):
    """Response from AI discussion"""

    response: str = Field(..., description="AI's response")
    usage: dict = Field(..., description="Token usage information")
    estimated_cost: float = Field(..., description="Estimated cost in USD")
