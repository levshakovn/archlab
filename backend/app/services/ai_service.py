"""AI service for discussing AWS architecture solutions"""
import logging
import os
from typing import Any, Dict, Optional

from openai import OpenAI
from openai.types.chat import ChatCompletion

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered architecture discussions"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI service

        Args:
            api_key: OpenAI API key. If None, will try to get from environment.
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None

        if self.api_key and self.api_key.strip():
            try:
                self.client = OpenAI(api_key=self.api_key.strip())
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                self.client = None
        else:
            logger.warning("OpenAI API key not provided. AI features will be disabled.")

    def is_available(self) -> bool:
        """Check if AI service is available"""
        return self.client is not None

    def _build_system_prompt(self, puzzle_title: str, puzzle_scenario: str) -> str:
        """Build system prompt for AWS architecture discussion"""
        return f"""You are an expert AWS Solutions Architect and educator helping students learn cloud architecture design.

Your role:
- Provide constructive, educational feedback on AWS architecture solutions
- Focus on the Well-Architected Framework principles (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization)
- Explain trade-offs and best practices
- Suggest improvements while acknowledging what was done well
- Reference specific AWS services and their use cases
- Keep responses concise but informative (aim for 2-4 paragraphs)

Context:
- Puzzle: {puzzle_title}
- Scenario: {puzzle_scenario}

Guidelines:
- Stay focused on AWS architecture topics
- If asked about non-AWS topics, politely redirect to AWS alternatives
- If asked to generate code or configurations, provide high-level guidance only
- Do not provide exact API keys, credentials, or sensitive information
- Encourage learning and experimentation
- Be encouraging and supportive

Important boundaries:
- Maximum response length: 500 words
- Do not discuss topics unrelated to AWS architecture
- Do not provide step-by-step tutorials for non-educational purposes
- Do not generate full infrastructure-as-code templates
"""

    def _build_user_prompt(
        self,
        user_question: str,
        puzzle_title: str,
        solution_summary: str,
        score: int,
        requirements_met: list[str],
        requirements_missed: list[str],
        feedback: str,
    ) -> str:
        """Build user prompt with context"""
        context = f"""I just completed the "{puzzle_title}" puzzle and scored {score}%.

My solution includes:
{', '.join(requirements_met) if requirements_met else 'No requirements met'}

I missed these requirements:
{', '.join(requirements_missed) if requirements_missed else 'All requirements met!'}

Grading feedback: {feedback}

Solution summary: {solution_summary}

My question: {user_question}"""

        return context

    async def discuss_solution(
        self,
        user_question: str,
        puzzle_title: str,
        puzzle_scenario: str,
        solution_summary: str,
        score: int,
        requirements_met: list[str],
        requirements_missed: list[str],
        feedback: str,
        conversation_history: Optional[list[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Discuss a solution with AI

        Args:
            user_question: User's question about their solution
            puzzle_title: Title of the puzzle
            puzzle_scenario: Scenario description
            solution_summary: Summary of the user's solution
            score: User's score (0-100)
            requirements_met: List of requirements that were met
            requirements_missed: List of requirements that were missed
            feedback: Grading feedback
            conversation_history: Previous messages in the conversation

        Returns:
            Dict with 'response' and 'usage' information
        """
        if not self.is_available():
            raise ValueError("AI service is not available. Please configure OPENAI_API_KEY.")

        # Build prompts
        system_prompt = self._build_system_prompt(puzzle_title, puzzle_scenario)
        user_prompt = self._build_user_prompt(
            user_question, puzzle_title, solution_summary, score, requirements_met, requirements_missed, feedback
        )

        # Build messages
        messages = [
            {"role": "system", "content": system_prompt},
        ]

        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)

        # Add current question
        messages.append({"role": "user", "content": user_prompt})

        try:
            # Call OpenAI API with strict limits
            response: ChatCompletion = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Use cost-effective model
                messages=messages,
                max_tokens=500,  # Limit response length
                temperature=0.7,  # Balanced creativity
                top_p=0.9,
                frequency_penalty=0.3,  # Encourage diverse responses
                presence_penalty=0.3,
            )

            ai_response = response.choices[0].message.content

            # Extract usage information
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }

            logger.info(f"AI discussion completed. Tokens used: {usage['total_tokens']}")

            return {
                "response": ai_response,
                "usage": usage,
            }

        except Exception as e:
            logger.error(f"AI discussion failed: {e}", exc_info=True)
            raise ValueError(f"Failed to get AI response: {str(e)}")

    def estimate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Estimate cost in USD for API call

        Using gpt-4o-mini pricing (as of 2024):
        - Input: $0.15 per 1M tokens
        - Output: $0.60 per 1M tokens
        """
        input_cost = (prompt_tokens / 1_000_000) * 0.15
        output_cost = (completion_tokens / 1_000_000) * 0.60
        return input_cost + output_cost


# Singleton instance
_ai_service: Optional[AIService] = None


def get_ai_service() -> AIService:
    """Get or create AI service instance"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
