from sqlalchemy.orm import Session

from app.models.alert import Alert

class AlertService:
    def create_alert(
            self,
            db:Session,
            title:str,
            risk_score:float,
            priority:str,

    ) -> Alert:

        alert = Alert(
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
            db:Session,

    )-> list[ALert]:

        return (
            db.query(Alert)
            .order_by(Alert.id.desc())
            .all()
        )

    alert_service = AlertService()