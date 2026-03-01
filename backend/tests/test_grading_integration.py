def test_grade_rejects_unknown_puzzle(client):
    payload = {
        "puzzleId": "puzzle-unknown",
        "nodes": {},
        "edges": [],
    }

    response = client.post("/api/v1/grade", json=payload)

    assert response.status_code == 400
    assert "Unknown puzzle ID" in response.json()["detail"]


def test_grade_rejects_edges_with_missing_nodes(client):
    payload = {
        "puzzleId": "puzzle-3tier-basic",
        "nodes": {
            "node-0": {
                "id": "node-0",
                "serviceType": "ALB",
                "label": "ALB",
                "x": 100,
                "y": 100,
            }
        },
        "edges": [{"from": "node-0", "to": "node-9", "type": "connection"}],
    }

    response = client.post("/api/v1/grade", json=payload)

    assert response.status_code == 422
    assert "Edge references non-existent node" in response.text


def test_grade_rejects_self_referential_edge(client):
    payload = {
        "puzzleId": "puzzle-3tier-basic",
        "nodes": {
            "node-0": {
                "id": "node-0",
                "serviceType": "ALB",
                "label": "ALB",
                "x": 100,
                "y": 100,
            }
        },
        "edges": [{"from": "node-0", "to": "node-0", "type": "connection"}],
    }

    response = client.post("/api/v1/grade", json=payload)

    assert response.status_code == 422
    assert "Edge cannot connect a node to itself" in response.text


def test_grade_rejects_invalid_node_id_format(client):
    payload = {
        "puzzleId": "puzzle-3tier-basic",
        "nodes": {
            "bad-id": {
                "id": "bad-id",
                "serviceType": "ALB",
                "label": "ALB",
                "x": 100,
                "y": 100,
            }
        },
        "edges": [],
    }

    response = client.post("/api/v1/grade", json=payload)

    assert response.status_code == 422
    assert 'Node ID must start with "node-"' in response.text
