from fastapi import APIRouter
from app.schemas.health import HealthResponse

router = APIRouter()

@router.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"]
)
def health_check():
    return HealthResponse(
        status="healthy",
        service="Panopticon Backend",
        version="1.0.0"
    )