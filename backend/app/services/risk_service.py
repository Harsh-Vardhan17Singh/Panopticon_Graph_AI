from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


class RiskService:
    """
    Contains rule-based fraud and transaction risk analysis logic.
    """

    def calculate_risk(
        self,
        amount: float,
        transaction_type: str,
    ) -> dict:
        """
        Calculate a risk score between 0 and 100.
        """

        risk_score = 0
        reasons = []

        # Rule 1: Large transaction amounts
        if amount >= 100000:
            risk_score += 60
            reasons.append("Very high transaction amount")

        elif amount >= 50000:
            risk_score += 40
            reasons.append("High transaction amount")

        elif amount >= 10000:
            risk_score += 20
            reasons.append("Moderately high transaction amount")

        # Rule 2: Cash transactions have additional risk
        if transaction_type.upper() == "CASH":
            risk_score += 20
            reasons.append("Cash transaction")

        # Maximum score = 100
        risk_score = min(risk_score, 100)

        # Determine risk level
        if risk_score >= 70:
            risk_level = "HIGH"

        elif risk_score >= 30:
            risk_level = "MEDIUM"

        else:
            risk_level = "LOW"

        # Mark high-risk transactions as suspicious
        is_suspicious = risk_score >= 70

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "is_suspicious": is_suspicious,
            "reasons": reasons,
        }


risk_service = RiskService()