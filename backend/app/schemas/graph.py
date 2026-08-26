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

class GraphNodeDetails(BaseModel):
    node_id:str
    label:str
    type:str

    transaction_count:int
    total_amount:float

    suspicious_count:int
    suspicious_amount:float
    suspicious_percentage:float

    average_risk_score:float
    highest_risk_score:int
    risk_level:str

    connected_entities:int

    explanation:str