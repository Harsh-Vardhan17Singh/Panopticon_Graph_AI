from fastapi import APIRouter, Depends, HTTPException ,  status
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

@router.get(
    "/{transaction_id}",
    response_model-TransactionResponse,
    status_code=status.HTTP_200_OK,
)
def get_transaction_by_id(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    """
    Get a Single Transaction by its DB ID.
    """

    transaction = transaction_service.get_transaction_by_id(
        db=db,
        transaction_id=transaction_id,
    )
    if transaction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not Found"
        )
    return transaction