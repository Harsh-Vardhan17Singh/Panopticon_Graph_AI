from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.dependencies import get_db
from app.models.user import User

from app.schemas.graph import (
    GraphResponse,
    GraphNodeDetails,
)

from app.services.graph_service import graph_service


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
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "analyst")
    ),
):
    """
    Get the Transaction relationship graph.
    """

    return graph_service.get_graph(
        db=db,
    )


@router.get(
    "/{node_id}",
    response_model=GraphNodeDetails,
    status_code=status.HTTP_200_OK,
)
def get_graph_node_details(
    node_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role("admin", "analyst")
    ),
):
    """
    Get real analytics and risk information
    for a selected graph node.
    """

    node_details = graph_service.get_node_details(
        db=db,
        node_id=node_id,
    )

    if node_details is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Graph node not found",
        )

    return node_details