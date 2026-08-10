from sqlalchemy import (Column, Integer, Float, String, DateTime, ForeignKey)

from sqlalchemy.orm import relationship

from datetime import datetime

from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True,nullable=False)

    transaction_id = Column(String, unique=True)

    amount = Column(Float, nullable=False)

    currency = Column(String, default="INR",nullable=False)

    transaction_type = Column(
        String,
        nullable=False
    )

    status = Column(String, default="SUCCESS",nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow,nullable=False)

    account_id = Column(
        Integer,ForeignKey("accounts.id"),
        nullable=False
    )

    merchant_id = Column(
        Integer,ForeignKey("merchants.id"),
        nullable=True
    )

    device_id = Column(
        Integer,
        ForeignKey("devices.id"),
        nullable=True
    )

    account = relationship(
        "Account",
        back_populates="transactions"
    )

    merchant = relationship(
        "Merchant",
        back_populates="transactions"
    )

    device = relationship(
        "Device",
        back_populates="transactions"
    )
