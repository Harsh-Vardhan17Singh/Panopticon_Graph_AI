from sqlalchemy import Column, Integer, String, Float
from app.db.base import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String, unique=True, nullable=False)
    account_type = Column(String, nullable=False)
    balance = Column(Float, default=0.0)
    status = Column(String, default="ACTIVE")