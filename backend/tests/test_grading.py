from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root(client: TestClient):
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["message"] == "Welcome to ArchLab"

def test_grade_endpoint(client: TestClient):
    """Test grading endpoint"""
    request_data = {
        "puzzleId": "puzzle-3tier-basic",
        "nodes": {
            "node-0": {
                "id": "node-0",
                "serviceType": "ALB",
                "label": "ALB",
                "x": 100,
                "y": 100
            },
            "node-1": {
                "id": "node-1",
                "serviceType": "EC2",
                "label": "EC2",
                "x": 200,
                "y": 200
            }
        },
        "edges": [
            {"from": "node-0", "to": "node-1", "type": "connection"}
        ]
    }
    
    response = client.post("/api/v1/grade", json=request_data)
    assert response.status_code == 200
    data = response.json()
    assert "scores" in data
    assert "requirements" in data
    assert "hardConstraintViolations" in data
    assert "summaryFeedback" in data
    assert "correctness" in data["scores"]
    assert "reliability" in data["scores"]
    assert "security" in data["scores"]
    assert "cost" in data["scores"]
    assert "total" in data["scores"]

