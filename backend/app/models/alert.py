from sqlalchemy import Column, Integer, String , Float 
from app.db.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    risk_score = Column(Float)
    priority = Column(String)
    status = Column(String, default="NEW")

    