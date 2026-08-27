from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


class RiskService:
    """
    Contains rule-based fraud and transaction risk analysis logic.

    The service combines transaction-level signals with
    relationship-based signals from the database.
    """

    def calculate_risk(
        self,
        db: Session,
        transaction: TransactionCreate,
    ) -> dict:
        """
        Calculate a risk score between 0 and 100.
        """

        risk_score = 0
        reasons = []

        amount = transaction.amount
        transaction_type = transaction.transaction_type

        # ==========================================
        # RULE 1: Transaction amount
        # ==========================================

        if amount >= 100000:
            risk_score += 60
            reasons.append("Very high transaction amount")

        elif amount >= 50000:
            risk_score += 40
            reasons.append("High transaction amount")

        elif amount >= 10000:
            risk_score += 20
            reasons.append("Moderately high transaction amount")

        # ==========================================
        # RULE 2: Cash transactions
        # ==========================================

        if transaction_type.upper() == "CASH":
            risk_score += 20
            reasons.append("Cash transaction")

        # ==========================================
        # RULE 3: Shared device detection
        # ==========================================

        if transaction.device_id is not None:

            device_transaction_count = (
                db.query(Transaction)
                .filter(
                    Transaction.device_id == transaction.device_id
                )
                .count()
            )

            if device_transaction_count >= 5:
                risk_score += 20
                reasons.append(
                    "Device associated with multiple transactions"
                )

        # ==========================================
        # RULE 4: Merchant activity
        # ==========================================

        if transaction.merchant_id is not None:

            merchant_transaction_count = (
                db.query(Transaction)
                .filter(
                    Transaction.merchant_id == transaction.merchant_id
                )
                .count()
            )

            if merchant_transaction_count >= 10:
                risk_score += 10
                reasons.append(
                    "Merchant has high transaction activity"
                )

        # ==========================================
        # Keep score between 0 and 100
        # ==========================================

        risk_score = min(risk_score, 100)

        # ==========================================
        # Determine risk level
        # ==========================================

        if risk_score >= 70:
            risk_level = "HIGH"

        elif risk_score >= 30:
            risk_level = "MEDIUM"

        else:
            risk_level = "LOW"

        # ==========================================
        # Suspicious classification
        # ==========================================

        is_suspicious = risk_score >= 70

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "is_suspicious": is_suspicious,
            "reasons": reasons,
        }


risk_service = RiskService()