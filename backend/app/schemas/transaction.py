from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    """
    Data required to create a transaction.
    """

    transaction_id: str = Field(
        ...,
        description="Unique transaction ID"
    )

    amount: float = Field(
        ...,
        gt=0,
        description="Transaction amount"
    )

    currency: str = Field(
        default="INR",
        description="Currency code"
    )

    account_id: int = Field(
        ...,
        description="Account ID"
    )

    merchant_id: int = Field(
        ...,
        description="Merchant ID"
    )

    device_id: int = Field(
        ...,
        description="Device ID"
    )

    transaction_type: str = Field(
        ...,
        description="Transaction type"
    )


class TransactionUpdate(BaseModel):
    """
    Data allowed to be updated for a transaction.
    """

    amount: Optional[float] = Field(
        default=None,
        gt=0,
        description="Updated transaction amount"
    )

    currency: Optional[str] = Field(
        default=None,
        description="Updated currency code"
    )

    transaction_type: Optional[str] = Field(
        default=None,
        description="Updated transaction type"
    )

    status: Optional[str] = Field(
        default=None,
        description="Updated transaction status"
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
    created_at: datetime

    class Config:
        from_attributes = True