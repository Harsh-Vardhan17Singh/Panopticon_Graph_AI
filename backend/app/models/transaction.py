from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True)
    amount = Column(Float)
    currency = Column(String, default="INR")
    status = Column(String, default="SUCCESS")
    created_at = Column(DateTime, default=datetime.utcnow)