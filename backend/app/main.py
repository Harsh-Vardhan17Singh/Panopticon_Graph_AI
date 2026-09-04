from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.init_db import create_tables
from app.db.seed import seed_database


# Database initialization
create_tables()
seed_database()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)


# =========================
# CORS CONFIGURATION
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://panopticon-graph-ai.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# API ROUTES
# =========================

app.include_router(api_router)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Panopticon API Running 🚀",
        "version": settings.VERSION,
    }

@app.get("/cors-test")
def cors_test():
    return{
        "cors":"working",
        "origin":"panopticon-graph-ai.vercel.app",
    }