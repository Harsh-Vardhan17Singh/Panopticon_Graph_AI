from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
)
from app.services.transaction_service import transaction_service


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"],
)


@router.post(
    "",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new financial transaction.
    """

    return transaction_service.create_transaction(
        db=db,
        transaction=transaction,
    )

@router.get(
    "",
    response_model=list[TransactionResponse],
    status_code=status.HTTP_200_OK,
)
def get_transaction(
    db: Session = Depends(get_db),
):
    """
    Get all financial transactions.
    """

    return transaction_service.get_transactions(
        db=db,
    )