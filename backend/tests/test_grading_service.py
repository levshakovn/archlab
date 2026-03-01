from app.schemas.graph import GraphJSONSchema
from app.services.grading_service import GradingService


def build_graph(puzzle_id, services, edges):
    nodes = {
        f"node-{index}": {
            "id": f"node-{index}",
            "serviceType": service,
            "label": service,
            "x": 100 + index * 50,
            "y": 100 + index * 50,
        }
        for index, service in enumerate(services)
    }

    return GraphJSONSchema(
        puzzleId=puzzle_id,
        nodes=nodes,
        edges=[{"from": edge[0], "to": edge[1], "type": "connection"} for edge in edges],
    )


def test_static_site_scores_and_feedback():
    graph = build_graph(
        "puzzle-static-site-cdn",
        ["S3", "CloudFront"],
        [("node-0", "node-1")],
    )
    puzzle_rules = {"requirements": ["Serve static assets", "Global caching"]}

    result = GradingService.grade_architecture("puzzle-static-site-cdn", graph, puzzle_rules)

    assert result["scores"]["correctness"] == 9
    assert result["scores"]["reliability"] == 9
    assert result["hardConstraintViolations"] == []
    assert "Solid architecture" in result["summaryFeedback"]


def test_constraints_report_missing_tiers():
    graph = build_graph("puzzle-3tier-basic", ["ALB"], [])
    puzzle_rules = {"requirements": []}

    result = GradingService.grade_architecture("puzzle-3tier-basic", graph, puzzle_rules)

    assert "Missing compute tier (EC2 or ASG)" in result["hardConstraintViolations"]
    assert "Missing database layer" in result["hardConstraintViolations"]
    assert "Good attempt" in result["summaryFeedback"]


def test_constraints_clear_when_tiers_present():
    graph = build_graph(
        "puzzle-3tier-basic",
        ["ALB", "EC2", "RDS"],
        [("node-0", "node-1"), ("node-1", "node-2")],
    )
    puzzle_rules = {"requirements": []}

    result = GradingService.grade_architecture("puzzle-3tier-basic", graph, puzzle_rules)

    assert result["hardConstraintViolations"] == []


def test_requirements_met_count_scales_with_services():
    graph = build_graph("puzzle-data-lake-analytics", ["S3", "Athena", "Glue"], [])
    puzzle_rules = {"requirements": ["A", "B", "C"]}

    result = GradingService.grade_architecture("puzzle-data-lake-analytics", graph, puzzle_rules)

    assert result["requirements"][0]["met"] is True
    assert result["requirements"][1]["met"] is True
    assert result["requirements"][2]["met"] is False
