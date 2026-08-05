from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


class TransactionService:
    """
    Handles all business logic related to transactions.
    """

    def create_transaction(
        self,
        db: Session,
        transaction: TransactionCreate,
    ) -> Transaction:
        """
        Creates a new transaction in the database.
        """

        db_transaction = Transaction(
            transaction_id=transaction.transaction_id,
            amount=transaction.amount,
            currency=transaction.currency,
            account_id=transaction.account_id,
            merchant_id=transaction.merchant_id,
            device_id=transaction.device_id,
            status="SUCCESS"
        )

        db.add(db_transaction)

        db.commit()

        db.refresh(db_transaction)

        return db_transaction


transaction_service = TransactionService()