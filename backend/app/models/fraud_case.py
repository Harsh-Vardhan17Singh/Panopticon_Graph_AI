from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base


class FraudCase(Base):
    __tablename__ = "fraud_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String, unique=True)
    severity = Column(String)
    status = Column(String, default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)