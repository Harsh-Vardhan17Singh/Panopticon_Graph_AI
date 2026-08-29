from pydantic import BaseModel

class AlertResponse(BaseModel):
    id:int
    transaction_id:str
    title:str
    risk_score:float
    priority:str
    status:str

    class Config:
        from_attributes = True
        