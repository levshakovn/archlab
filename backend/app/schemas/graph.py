from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from typing import Dict, List


class NodeSchema(BaseModel):
    """AWS service node"""

    id: str
    serviceType: str
    label: str
    x: int = Field(ge=0, description="X coordinate must be non-negative")
    y: int = Field(ge=0, description="Y coordinate must be non-negative")

    @field_validator("serviceType", "label")
    @classmethod
    def validate_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Service type and label cannot be empty")
        return v.strip()

    @field_validator("id")
    @classmethod
    def validate_id_format(cls, v):
        if not v or not v.startswith("node-"):
            raise ValueError('Node ID must start with "node-"')
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
        return v

    @model_validator(mode="after")
    def validate_edges_reference_nodes(self):
        node_ids = set(self.nodes.keys())
        for edge in self.edges:
            if edge.from_node not in node_ids:
                raise ValueError(f"Edge references non-existent node: {edge.from_node}")
            if edge.to_node not in node_ids:
                raise ValueError(f"Edge references non-existent node: {edge.to_node}")
        return self
