from app.ml.predictor import ml_predictor


class RiskService:
    """
    Hybrid transaction risk analysis using
    rule-based scoring + machine learning.
    """

    def calculate_risk(
        self,
        amount: float,
        transaction_type: str,
        account_age_days: int = 365,
        transaction_frequency: int = 5,
        unusual_device: int = 0,
    ) -> dict:

        rule_score = 0
        reasons = []

        # -----------------------------------------
        # RULE 1: Transaction amount
        # -----------------------------------------

        if amount >= 100000:
            rule_score += 60
            reasons.append("Very high transaction amount")

        elif amount >= 50000:
            rule_score += 40
            reasons.append("High transaction amount")

        elif amount >= 10000:
            rule_score += 20
            reasons.append("Moderately high transaction amount")

        # -----------------------------------------
        # RULE 2: Cash transaction
        # -----------------------------------------

        if transaction_type.upper() == "CASH":
            rule_score += 20
            reasons.append("Cash transaction")

        # -----------------------------------------
        # ML PREDICTION
        # -----------------------------------------

        ml_result = ml_predictor.predict(
            amount=amount,
            transaction_type=transaction_type,
            account_age_days=account_age_days,
            transaction_frequency=transaction_frequency,
            unusual_device=unusual_device,
        )

        ml_score = ml_result["ml_score"]

        if ml_result["ml_prediction"] == 1:
            reasons.append("ML model detected suspicious behavior")

        # -----------------------------------------
        # HYBRID SCORE
        # -----------------------------------------

        final_score = (
            (rule_score * 0.6) +
            (ml_score * 0.4)
        )

        final_score = int(round(min(final_score,100)))

        # -----------------------------------------
        # RISK LEVEL
        # -----------------------------------------

        if final_score >= 70:
            risk_level = "HIGH"

        elif final_score >= 30:
            risk_level = "MEDIUM"

        else:
            risk_level = "LOW"

        is_suspicious = final_score >= 70

        return {
            "risk_score": final_score,
            "risk_level": risk_level,
            "is_suspicious": is_suspicious,
            "reasons": reasons,
            "rule_score": rule_score,
            "ml_score": ml_score,
        }


risk_service = RiskService()