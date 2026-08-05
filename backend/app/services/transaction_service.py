from datetime import datetime
from pydantic import BaseModel, Field

class TransactionCreate(BaseModel):
    """
    Request model used when creating a new transaction.
    """

    transaction_id:str = Field(
        ...,
        description="Unique transaction ID"
        )

    amount:float = Field(
        ...,
        gt=0,
        description="Transaction amount"
    )

    currency: str = Field(
        default="INR",
        description="Currency Code"
    )

    account_id: int =Field(
        ...,
        description="Account ID"
    )

    merchant_id: int = Field(
        ...,
        description="Merchant ID"
    )

    device_id:int = Field(
        ...,
        description="Device ID"
    )

class TransactionResponse(BaseModel):
    """
    Response model returned after creating a transaction.
    """

    id:int 
    transaction_id:str
    amount:float
    currency:str
    status:str
    creaated_at:datetime

    class Config:
        from_attributes = True