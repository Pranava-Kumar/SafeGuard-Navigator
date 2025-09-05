#!/usr/bin/env python3

"""
SafeRoute Service Status API
This script provides endpoints to check the status of all SafeRoute services
"""

import asyncio
import aiohttp
import asyncpg
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(title="SafeRoute Service Status API", version="1.0.0")

class ServiceStatus(BaseModel):
    name: str
    status: str
    url: str
    description: str
    error: str = None

class ServiceStatusResponse(BaseModel):
    services: Dict[str, ServiceStatus]
    timestamp: str

async def check_frontend_status(session: aiohttp.ClientSession) -> ServiceStatus:
    """Check frontend service status"""
    url = "http://localhost:3000/api/health"
    try:
        async with session.get(url, timeout=5) as response:
            if response.status == 200:
                return ServiceStatus(
                    name="Frontend",
                    status="running",
                    url=url,
                    description="Next.js Development Server"
                )
            else:
                return ServiceStatus(
                    name="Frontend",
                    status="error",
                    url=url,
                    description="Next.js Development Server",
                    error=f"HTTP {response.status}"
                )
    except Exception as e:
        return ServiceStatus(
            name="Frontend",
            status="stopped",
            url=url,
            description="Next.js Development Server",
            error=str(e)
        )

async def check_backend_status(session: aiohttp.ClientSession) -> ServiceStatus:
    """Check backend API status"""
    url = "http://localhost:8000/api/v1/health"
    try:
        async with session.get(url, timeout=5) as response:
            if response.status == 200:
                return ServiceStatus(
                    name="Backend API",
                    status="running",
                    url=url,
                    description="FastAPI Backend Server"
                )
            else:
                return ServiceStatus(
                    name="Backend API",
                    status="error",
                    url=url,
                    description="FastAPI Backend Server",
                    error=f"HTTP {response.status}"
                )
    except Exception as e:
        return ServiceStatus(
            name="Backend API",
            status="stopped",
            url=url,
            description="FastAPI Backend Server",
            error=str(e)
        )

async def check_osrm_status(session: aiohttp.ClientSession) -> ServiceStatus:
    """Check OSRM service status"""
    url = "http://localhost:5000/health"
    try:
        async with session.get(url, timeout=5) as response:
            if response.status == 200:
                data = await response.json()
                if data.get("status") == "OK":
                    return ServiceStatus(
                        name="OSRM Service",
                        status="running",
                        url=url,
                        description="OSRM Routing Engine"
                    )
                else:
                    return ServiceStatus(
                        name="OSRM Service",
                        status="error",
                        url=url,
                        description="OSRM Routing Engine",
                        error="Unexpected response"
                    )
            else:
                return ServiceStatus(
                    name="OSRM Service",
                    status="error",
                    url=url,
                    description="OSRM Routing Engine",
                    error=f"HTTP {response.status}"
                )
    except Exception as e:
        return ServiceStatus(
            name="OSRM Service",
            status="stopped",
            url=url,
            description="OSRM Routing Engine",
            error=str(e)
        )

async def check_database_status() -> ServiceStatus:
    """Check database connection status"""
    try:
        # Get database URL from environment
        database_url = os.getenv("DATABASE_URL", "postgresql://neondb_owner:npg_ManPy6Y2oFNe@ep-noisy-math-a1ls63lm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require")
        
        # Attempt to connect
        conn = await asyncpg.connect(database_url, timeout=5)
        await conn.fetchval("SELECT 1")
        await conn.close()
        
        return ServiceStatus(
            name="Database",
            status="running",
            url="Database Connection",
            description="PostgreSQL/NeonDB"
        )
    except Exception as e:
        return ServiceStatus(
            name="Database",
            status="error",
            url="Database Connection",
            description="PostgreSQL/NeonDB",
            error=str(e)
        )

@app.get("/api/v1/service-status", response_model=ServiceStatusResponse)
async def get_service_status():
    """Get the status of all SafeRoute services"""
    async with aiohttp.ClientSession() as session:
        # Run all checks concurrently
        frontend_task = check_frontend_status(session)
        backend_task = check_backend_status(session)
        osrm_task = check_osrm_status(session)
        database_task = check_database_status()
        
        # Wait for all tasks to complete
        results = await asyncio.gather(
            frontend_task,
            backend_task,
            osrm_task,
            database_task,
            return_exceptions=True
        )
        
        # Handle any exceptions
        services = {}
        for result in results:
            if isinstance(result, Exception):
                # Handle exception case
                continue
            elif isinstance(result, ServiceStatus):
                services[result.name.lower().replace(" ", "_")] = result
        
        return ServiceStatusResponse(
            services=services,
            timestamp=str(asyncio.get_event_loop().time())
        )

@app.get("/api/v1/health")
async def health_check():
    """Simple health check endpoint"""
    return {"status": "OK", "service": "Service Status API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)