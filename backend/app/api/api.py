
from fastapi import APIRouter

from app.api.endpoints import auth, safety, report

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(safety.router, prefix="/safety", tags=["safety"])
api_router.include_router(report.router, prefix="/reports", tags=["reports"])
