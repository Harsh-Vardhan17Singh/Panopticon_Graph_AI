from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.db.init_db import create_tables

create_tables()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(api_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Panopticon API Running 🚀",
        "version": settings.VERSION
    }