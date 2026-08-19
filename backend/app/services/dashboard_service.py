from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.transaction import Transaction


class DashboardService:
    """
    Contains business logic for dashboard analytics.
    """

    def get_summary(
        self,
        db: Session,
    ) -> dict:

        total_transactions = db.query(
            Transaction
        ).count()

        total_transaction_amount = (
            db.query(
                func.sum(Transaction.amount)
            ).scalar()
            or 0
        )

        low_risk_count = (
            db.query(Transaction)
            .filter(Transaction.risk_level == "LOW")
            .count()
        )

        medium_risk_count = (
            db.query(Transaction)
            .filter(Transaction.risk_level == "MEDIUM")
            .count()
        )

        high_risk_count = (
            db.query(Transaction)
            .filter(Transaction.risk_level == "HIGH")
            .count()
        )

        suspicious_transaction_count = (
            db.query(Transaction)
            .filter(Transaction.is_suspicious == 1)
            .count()
        )

        suspicious_transaction_amount = (
            db.query(
                func.sum(Transaction.amount)
            )
            .filter(Transaction.is_suspicious == 1)
            .scalar()
            or 0
        )

        return {
            "total_transactions": total_transactions,
            "total_transaction_amount": float(
                total_transaction_amount
            ),

            "low_risk_count": low_risk_count,
            "medium_risk_count": medium_risk_count,
            "high_risk_count": high_risk_count,

            "suspicious_transaction_count":
                suspicious_transaction_count,

            "suspicious_transaction_amount": float(
                suspicious_transaction_amount
            ),
        }


dashboard_service = DashboardService()