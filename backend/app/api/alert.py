from fastapi import APIRouter,Depends,status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.alert import AlertResponse
from app.services.alert_service import alert_service

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
) 

@router.get(
    "",
    reponse_model=list[AlertResponse],
    status_code=status.HTTP_200_OK,
)
def get_alerts(
    db:Session = Depends(get_db),
    current_user:User = Depends(
        reuire_role("admin","analyst")
    ),
):
    return alert_service.get_alerts(db=db)