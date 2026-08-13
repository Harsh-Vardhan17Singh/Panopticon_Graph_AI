from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)

    merchant_name = Column(String, nullable=False)

    category = Column(String)

    city = Column(String)

    country = Column(String)

    transactions = relationship(
        "Transaction",
        back_populates="merchant"
    )