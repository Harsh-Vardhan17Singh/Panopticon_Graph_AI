from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


class TransactionService:
    """
    Contains business logic related to transactions.
    """

    def create_transaction(
        self,
        db: Session,
        transaction: TransactionCreate,
    ) -> Transaction:

        db_transaction = Transaction(
            transaction_id=transaction.transaction_id,
            amount=transaction.amount,
            currency=transaction.currency,
            transaction_type=transaction.transaction_type,
            account_id=transaction.account_id,
            merchant_id=transaction.merchant_id,
            device_id=transaction.device_id,
            status="SUCCESS",
        )

        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)

        return db_transaction

    def get_transactions(
        self,
        db: Session,
    ) -> list[Transaction]:
        transactions = db.query(Transaction).all()

        return transactions


transaction_service = TransactionService()