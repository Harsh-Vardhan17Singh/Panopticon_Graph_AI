from fastapi import APIRouter

api_router = APIRouter(
    prefix="/api/v1"
)


@api_router.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Panopticon Backend"
    }
