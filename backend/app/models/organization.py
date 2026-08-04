from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    industry = Column(String)

    country = Column(String)

    users = relationship(
        "User",
        back_populates="organization",
        cascade="all, delete-orphan"
    )

    accounts = relationship(
        "Account",
        back_populates="organization",
        cascade="all, delete-orphan"
    )