from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate
from app.services.risk_service import risk_service
from app.services.alert_service import alert_service

class TransactionService:
    """
    Contains business logic related to transactions.
    """

    def create_transaction(
        self,
        db: Session,
        transaction: TransactionCreate,
    ) -> Transaction:

        risk_result = risk_service.calculate_risk(
    amount=transaction.amount,
    transaction_type=transaction.transaction_type,
)

        db_transaction = Transaction(
            transaction_id=transaction.transaction_id,
            amount=transaction.amount,
            currency=transaction.currency,
            transaction_type=transaction.transaction_type,
            account_id=transaction.account_id,
            merchant_id=transaction.merchant_id,
            device_id=transaction.device_id,
            status="SUCCESS",
            risk_score=risk_result["risk_score"],
            risk_level=risk_result["risk_level"],
            is_suspicious=int(risk_result["is_suspicious"]),
        )

        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)

        #Create an Alert for high-risk transaction

        if risk_result["is_suspicious"]:
            alert_service.create_alert(
                db=db,
                title=f"Suspicious transaction detected: {transaction.transaction_id}",
                risk_score=risk_result["risk_score"],
                priority=risk_result["risk_level"],
            )
            

        return db_transaction

    def get_transactions(
        self,
        db: Session,
        status: str | None = None,
        account_id: int | None = None,
        transaction_type: str | None = None,
        risk_level: str | None = None,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Transaction]:

        query = db.query(Transaction)

        if status is not None:
            query = query.filter(Transaction.status == status)

        if account_id is not None:
            query = query.filter(
                Transaction.account_id == account_id
            )

        if transaction_type is not None:
            query = query.filter(
                Transaction.transaction_type == transaction_type
            )

        if risk_level is not None:
            query = query.filter(
                Transaction.risk_level == risk_level.upper()
            )

        transactions = (
            query
            .offset(skip)
            .limit(limit)
            .all()
        )

        return transactions

    def get_suspicious_transactions(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Transaction]:

        transactions = (
            db.query(Transaction)
            .filter(Transaction.is_suspicious == 1)
            .offset(skip)
            .limit(limit)
            .all()
        )

        return transactions

    def get_transaction_by_id(
        self,
        db: Session,
        transaction_id: int,
    ) -> Transaction | None:

        transaction = (
            db.query(Transaction)
            .filter(Transaction.id == transaction_id)
            .first()
        )

        return transaction


transaction_service = TransactionService()