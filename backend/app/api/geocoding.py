"""
Geocoding API Endpoint for SafeRoute
Provides geocoding and reverse geocoding services using OSM Nominatim
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.services.geocoding_service import geocoding_service

router = APIRouter()

class GeocodeRequest(BaseModel):
    """Request model for geocoding"""
    query: str
    limit: int = 10
    country_codes: Optional[List[str]] = None
    viewbox: Optional[tuple] = None

class ReverseGeocodeRequest(BaseModel):
    """Request model for reverse geocoding"""
    latitude: float
    longitude: float
    zoom: int = 18

class GeocodeResult(BaseModel):
    """Result model for geocoding"""
    place_id: Optional[str]
    osm_id: Optional[str]
    osm_type: Optional[str]
    name: Optional[str]
    display_name: Optional[str]
    latitude: float
    longitude: float
    bounding_box: Optional[List[float]]
    importance: float
    type: Optional[str]
    category: Optional[str]
    address: dict

class GeocodeResponse(BaseModel):
    """Response model for geocoding"""
    success: bool
    results: Optional[List[GeocodeResult]] = None
    result: Optional[GeocodeResult] = None
    error: Optional[str] = None

@router.get("/geocode", response_model=GeocodeResponse)
async def geocode_location(
    q: str = Query(..., description="Location query string"),
    limit: int = Query(10, description="Maximum number of results to return"),
    countrycodes: Optional[str] = Query(None, description="Comma-separated list of ISO country codes to restrict search")
):
    """
    Geocode a location query using OpenStreetMap Nominatim
    
    Args:
        q: Location query string (required)
        limit: Maximum number of results to return (default: 10)
        countrycodes: Comma-separated list of ISO country codes to restrict search
        
    Returns:
        Geocoding results with coordinates and address information
    """
    try:
        # Parse country codes
        country_codes = countrycodes.split(",") if countrycodes else None
        
        # Call geocoding service
        result = await geocoding_service.geocode(
            query=q,
            limit=limit,
            country_codes=country_codes
        )
        
        if result["success"]:
            return GeocodeResponse(
                success=True,
                results=result["results"]
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/reverse-geocode", response_model=GeocodeResponse)
async def reverse_geocode_location(
    lat: float = Query(..., description="Latitude coordinate"),
    lon: float = Query(..., description="Longitude coordinate"),
    zoom: int = Query(18, description="Zoom level (0-18, higher = more detailed)")
):
    """
    Reverse geocode coordinates to get address information
    
    Args:
        lat: Latitude coordinate (required)
        lon: Longitude coordinate (required)
        zoom: Zoom level (0-18, higher = more detailed) (default: 18)
        
    Returns:
        Address information for the coordinates
    """
    try:
        # Call reverse geocoding service
        result = await geocoding_service.reverse_geocode(
            latitude=lat,
            longitude=lon,
            zoom=zoom
        )
        
        if result["success"]:
            return GeocodeResponse(
                success=True,
                result=result["result"]
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result["error"]
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )