from fastapi import APIRouter
from app.api import auth, safety, routing, reputation, predictions, data_ingestion, emergency

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(safety.router, prefix="/safety", tags=["safety"])
api_router.include_router(routing.router, prefix="/routes", tags=["routes"])
api_router.include_router(reputation.router, prefix="/reputation", tags=["reputation"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(data_ingestion.router, prefix="/data", tags=["data"])
api_router.include_router(emergency.router, prefix="/emergency", tags=["emergency"])

# Health check endpoint
@api_router.get("/health")
def health_check():
    return {"status": "healthy", "message": "SafeRoute backend is running"}

# API version information
@api_router.get("/version")
def get_version():
    return {
        "name": "SafeRoute Backend",
        "version": "1.0.0",
        "description": "Backend services for SafeRoute - AI-Driven Public Safety Navigation System"
    }