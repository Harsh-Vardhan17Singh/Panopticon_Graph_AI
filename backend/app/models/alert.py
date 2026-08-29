from sqlalchemy import Column, Integer, String , Float 
from app.db.base import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer,
                 primary_key=True,
                index=True)

    transaction_id = Column(
        String,
        ForeignKey("transaction.transaction_id"),
        nullable=False,
    )


    title = Column(String,
                   nullable=False,)

    risk_score = Column(Float,
                        nullable=False,)


    priority = Column(String,
                      nullable=False)

    status = Column(
        String,
        default ="NEW",
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    