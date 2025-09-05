from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.db.session import engine, Base
from app.core.config import settings
from app.services.osrm_service import osrm_service
import logging
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://saferoute.app",
        "https://safeguardnavigators.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    try:
        # Create database tables
        Base.metadata.create_all(bind=engine)
        
        # Initialize OSRM service
        logger.info("Initializing OSRM service...")
        if osrm_service.is_local_osrm:
            # Setup OSRM with Chennai data
            setup_success = osrm_service.setup_osrm()
            if setup_success:
                logger.info("OSRM setup completed successfully")
                # Start OSRM server
                server_success = osrm_service.start_osrm_server()
                if server_success:
                    logger.info("OSRM server started successfully")
                else:
                    logger.warning("Failed to start OSRM server, using fallback routing")
            else:
                logger.warning("Failed to setup OSRM, using fallback routing")
        else:
            logger.info("Using external OSRM service")
        
        logger.info("SafeRoute backend starting up...")
        logger.info(f"Project: {settings.PROJECT_NAME}")
        logger.info(f"Version: {settings.PROJECT_VERSION}")
        logger.info(f"Database URL: {settings.database_url}")
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