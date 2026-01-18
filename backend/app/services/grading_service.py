"""Grading service for architecture evaluation"""
import logging
from typing import Dict, List
from app.schemas.graph import GraphJSONSchema

logger = logging.getLogger(__name__)


class GradingService:
    """Service for grading AWS architectures"""

    @staticmethod
    def grade_architecture(
        puzzle_id: str, graph: GraphJSONSchema, puzzle_rules: Dict
    ) -> Dict:
        """
        Grade a user's architecture

        Args:
            puzzle_id: ID of the puzzle
            graph: User's architecture graph
            puzzle_rules: Puzzle requirements and rules

        Returns:
            Grading result with scores and feedback
        """
        logger.info(f"Grading architecture for puzzle: {puzzle_id}")

        # Get services in the graph
        services = [node.serviceType for node in graph.nodes.values()]
        edge_count = len(graph.edges)

        # Score dimensions
        scores = GradingService._score_dimensions(puzzle_id, services, edge_count)

        # Check requirements
        requirements = GradingService._check_requirements(
            puzzle_rules.get("requirements", []), services, edge_count
        )

        # Check constraints
        violations = GradingService._check_constraints(puzzle_id, services, graph)

        # Generate feedback
        feedback = GradingService._generate_feedback(puzzle_id, services, violations)

        return {
            "scores": scores,
            "requirements": requirements,
            "hardConstraintViolations": violations,
            "summaryFeedback": feedback,
        }

    @staticmethod
    def _score_dimensions(puzzle_id: str, services: List[str], edge_count: int) -> Dict:
        """Calculate scores for each dimension"""
        service_count = len(services)

        # Default scoring
        correctness = min(10, (service_count / 5) * 8)
        reliability = 7 if edge_count > 0 else 4
        security = 6 if service_count > 2 else 3
        cost = 7 if service_count < 8 else 5

        # Puzzle-specific adjustments
        if puzzle_id == "puzzle-3tier-basic":
            has_lb = any(s in ["ALB", "NLB"] for s in services)
            has_compute = any(s in ["EC2", "ASG"] for s in services)
            has_db = any(s in ["RDS", "Aurora", "DynamoDB"] for s in services)

            correctness = 9 if has_lb and has_compute and has_db else 5
            reliability = 8 if edge_count > 2 else 5
        elif puzzle_id == "puzzle-static-site-cdn":
            has_s3 = "S3" in services
            has_cf = "CloudFront" in services
            correctness = 9 if has_s3 and has_cf else 5
            reliability = 9 if has_cf else 5
        elif puzzle_id == "puzzle-serverless-api":
            has_lambda = "Lambda" in services
            has_api_gw = "API Gateway" in services
            has_db = any(s in ["DynamoDB", "Aurora Serverless"] for s in services)
            correctness = 9 if has_lambda and has_api_gw and has_db else 5
        elif puzzle_id == "puzzle-async-processing":
            has_s3 = "S3" in services
            has_queue = any(s in ["SQS", "SNS"] for s in services)
            correctness = 8 if has_s3 and has_queue else 4
        elif puzzle_id == "puzzle-data-lake-analytics":
            has_s3 = "S3" in services
            has_athena = "Athena" in services
            correctness = 8 if has_s3 and has_athena else 4

        # Calculate weighted average (weights sum to 1.0, so result is already 0-10 scale)
        total = correctness * 0.4 + reliability * 0.2 + security * 0.2 + cost * 0.2

        return {
            "correctness": round(correctness),
            "reliability": round(reliability),
            "security": round(security),
            "cost": round(cost),
            "total": round(total * 10) / 10,
        }

    @staticmethod
    def _check_requirements(
        requirements: List[str], services: List[str], edge_count: int
    ) -> List[Dict]:
        """Check which requirements are met"""
        result = []
        service_count = len(services)

        for i, req in enumerate(requirements):
            met = i < min(service_count - 1, len(requirements))
            comment = (
                "Architecture addresses this"
                if met
                else "Add more services to address this"
            )

            result.append(
                {
                    "requirement": req,
                    "met": met,
                    "comment": comment,
                }
            )

        return result

    @staticmethod
    def _check_constraints(
        puzzle_id: str, services: List[str], graph: GraphJSONSchema
    ) -> List[str]:
        """Check hard constraints"""
        violations = []

        if puzzle_id == "puzzle-3tier-basic":
            if not any(s in ["ALB", "NLB"] for s in services):
                violations.append("Missing load balancer (ALB or NLB)")
            if not any(s in ["EC2", "ASG"] for s in services):
                violations.append("Missing compute tier (EC2 or ASG)")
            if not any(s in ["RDS", "Aurora", "DynamoDB"] for s in services):
                violations.append("Missing database layer")

        return violations

    @staticmethod
    def _generate_feedback(
        puzzle_id: str, services: List[str], violations: List[str]
    ) -> str:
        """Generate human-friendly feedback"""
        if violations:
            return f"Good attempt! But you're missing: {', '.join(violations)}. Consider adding these components."

        if len(services) < 3:
            return "Start with more services. The architecture needs more components to be complete."

        return "Solid architecture! Consider whether all services are necessary for the stated requirements."


# Create service instance
grading_service = GradingService()
