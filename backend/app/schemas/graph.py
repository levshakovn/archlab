import re
from typing import Dict, List

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class NodeSchema(BaseModel):
    """AWS service node"""

    id: str
    serviceType: str
    label: str
    x: int = Field(ge=0, le=100000, description="X coordinate must be between 0 and 100000")
    y: int = Field(ge=0, le=100000, description="Y coordinate must be between 0 and 100000")

    @field_validator("serviceType", "label")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Service type and label cannot be empty")
        # Sanitize input - remove potential XSS
        sanitized = v.strip()
        # Remove script tags and dangerous characters
        sanitized = re.sub(r"<script[^>]*>.*?</script>", "", sanitized, flags=re.IGNORECASE | re.DOTALL)
        sanitized = re.sub(r"javascript:", "", sanitized, flags=re.IGNORECASE)
        # Limit length to prevent DoS
        if len(sanitized) > 200:
            raise ValueError("Service type and label must be 200 characters or less")
        return sanitized

    @field_validator("id")
    @classmethod
    def validate_id_format(cls, v):
        if not v or not v.startswith("node-"):
            raise ValueError('Node ID must start with "node-"')
        # Validate ID format to prevent injection
        if not re.match(r"^node-\d+$", v):
            raise ValueError('Node ID must be in format "node-{number}"')
        # Limit length
        if len(v) > 50:
            raise ValueError("Node ID must be 50 characters or less")
        return v


class EdgeSchema(BaseModel):
    """Connection between services"""

    model_config = ConfigDict(populate_by_name=True)

    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")
    type: str = "connection"

    @field_validator("from_node", "to_node")
    @classmethod
    def validate_node_ids(cls, v):
        if not v or not v.startswith("node-"):
            raise ValueError('Edge node IDs must start with "node-"')
        return v

    @model_validator(mode="after")
    def validate_different_nodes(self):
        if self.from_node == self.to_node:
            raise ValueError("Edge cannot connect a node to itself")
        return self


class GraphJSONSchema(BaseModel):
    """User's architecture diagram"""

    puzzleId: str
    nodes: Dict[str, NodeSchema]
    edges: List[EdgeSchema]

    @field_validator("puzzleId")
    @classmethod
    def validate_puzzle_id(cls, v):
        if not v or not v.startswith("puzzle-"):
            raise ValueError('Puzzle ID must start with "puzzle-"')
        # Validate puzzle ID format
        if not re.match(r"^puzzle-[a-z0-9-]+$", v):
            raise ValueError("Puzzle ID contains invalid characters")
        # Limit length
        if len(v) > 100:
            raise ValueError("Puzzle ID must be 100 characters or less")
        return v

    @model_validator(mode="after")
    def validate_graph_size(self):
        # Prevent DoS attacks with extremely large graphs
        if len(self.nodes) > 1000:
            raise ValueError("Graph cannot contain more than 1000 nodes")
        if len(self.edges) > 5000:
            raise ValueError("Graph cannot contain more than 5000 edges")
        return self

    @model_validator(mode="after")
    def validate_edges_reference_nodes(self):
        node_ids = set(self.nodes.keys())
        for edge in self.edges:
            if edge.from_node not in node_ids:
                raise ValueError(f"Edge references non-existent node: {edge.from_node}")
            if edge.to_node not in node_ids:
                raise ValueError(f"Edge references non-existent node: {edge.to_node}")
        return self
