from pydantic import BaseModel

class GraphNode(BaseModel):
    id: str
    label: str
    type: str

class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    transaction_count: int
    total_amount: float

class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]