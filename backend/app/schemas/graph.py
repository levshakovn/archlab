from pydantic import BaseModel, Field
from typing import Dict, List

class NodeSchema(BaseModel):
    """AWS service node"""
    id: str
    serviceType: str
    label: str
    x: int
    y: int

class EdgeSchema(BaseModel):
    """Connection between services"""
    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")
    type: str = "connection"

    class Config:
        populate_by_name = True

class GraphJSONSchema(BaseModel):
    """User's architecture diagram"""
    puzzleId: str
    nodes: Dict[str, NodeSchema]
    edges: List[EdgeSchema]

