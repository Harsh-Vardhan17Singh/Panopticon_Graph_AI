from sqlalchemy import Column, Integer, String
from app.db.base import Base


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)

    device_id = Column(String, unique=True, nullable=False)

    device_type = Column(String)

    operating_system = Column(String)

    ip_address = Column(String)

    transactions = relationship(
        "Transaction",
        back_populated="device"
    )