from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(
    title="Panopticon API",
    version="1.0.0",
    description="Enterprise Fraud Intelligence Platform"
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Panopticon API Running 🚀"
    }