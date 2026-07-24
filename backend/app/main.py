from fastapi import FastAPI

from app.api.router import api_router
from app.db.init_db import create_tables

app = FastAPI(
    title="Panopticon API",
    version="1.0.0",
)

create_tables()

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Panopticon API Running 🚀"
    }