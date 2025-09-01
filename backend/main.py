from fastapi import FastAPI
from app.api import api_router
from app.db.session import engine, Base
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        logger.info("SafeRoute backend starting up...")
        logger.info(f"Project: {settings.PROJECT_NAME}")
        logger.info(f"Version: {settings.PROJECT_VERSION}")
        logger.info("Database connected and tables created")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("SafeRoute backend shutting down...")

@app.get("/")
async def root():
    return {
        "message": "Welcome to SafeRoute Backend API",
        "documentation": "/docs",
        "version": settings.PROJECT_VERSION
    }