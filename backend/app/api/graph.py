from fastapi import APIrouter,Depends, status
from sqlalchemy.orm import Session

from app.core.permission import require_role
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.graph import GraphResponse
from app.services.graph_service import fraph_service

router = APIRouter(
    prefix="/graph",
    tags=["Graph"],
)

@router.get(
    "",
    response_model=GraphResponse,
    status_code=status.HTTP_200_OK,
)
def get_graph(
    db:Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin","analyst")
    ),
):
    """
    Get the Transaction relationship graph.
    """

    return graph_service.get_graph(
        db=db,
    )