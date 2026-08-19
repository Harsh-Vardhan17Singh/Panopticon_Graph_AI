from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """
    Summary analytics for the fraud monitoring dashboard.
    """

    total_transactions: int
    total_transaction_amount: float

    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int

    suspicious_transaction_count: int
    suspicious_transaction_amount: float