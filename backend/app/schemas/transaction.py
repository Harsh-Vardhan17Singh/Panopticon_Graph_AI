from datetime import datetime

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    """
    Data required to create a transaction.
    """

    transaction_id: str = Field(
        ...,
        description="Unique transaction ID",
    )

    amount: float = Field(
        ...,
        gt=0,
        description="Transaction amount",
    )

    currency: str = Field(
        default="INR",
        description="Currency code",
    )

    account_id: int = Field(
        ...,
        description="Account ID",
    )

    merchant_id: int = Field(
        ...,
        description="Merchant ID",
    )

    device_id: int = Field(
        ...,
        description="Device ID",
    )

    transaction_type: str = Field(
        ...,
        description="Transaction type",
    )


class TransactionResponse(BaseModel):
    """
    Data returned to the client for a transaction.
    """

    id: int
    transaction_id: str
    amount: float
    currency: str
    transaction_type: str
    status: str

    risk_score: int
    risk_level: str
    is_suspicious: int

    created_at: datetime

    class Config:
        from_attributes = True