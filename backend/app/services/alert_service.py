from sqlalchemy.orm import Session

from app.models.alert import Alert


class AlertService:

    def create_alert(
        self,
        db: Session,
        transaction_id: str,
        title: str,
        risk_score: float,
        priority: str,
    ) -> Alert:

        alert = Alert(
            transaction_id=transaction_id,
            title=title,
            risk_score=risk_score,
            priority=priority,
            status="NEW",
        )

        db.add(alert)
        db.commit()
        db.refresh(alert)

        return alert

    def get_alerts(
        self,
        db: Session,
    ) -> list[Alert]:

        return (
            db.query(Alert)
            .order_by(Alert.id.desc())
            .all()
        )


alert_service = AlertService()