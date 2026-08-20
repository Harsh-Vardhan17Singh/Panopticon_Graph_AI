from fastapi import APIROUTER , Depends, status
from sqlalchemy.orm import Session 

from app.core.permissions import require_role
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import dashboard_service

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashnoard"],
)

@router.get(
    "/summary",
    response_model=DashboardSummary,
    status_code=status.HTTP_200_OK,
)
def get_dashboard_summary(
    db:Session = Depends(get_db),
    current_user:User = Depends(
        require_role("admin","analyst")
    ),
):
    """
    Get Fraud monitoring dashboard summary.
    """

    return dashboard_service.get_summary(
        db=db,
    )