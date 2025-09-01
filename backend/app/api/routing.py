from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.utils import get_db
from app.schemas import RouteRequest, RouteResponse
from app.services.route_optimizer import RouteOptimizer
from app.models import Route as DBRoute

router = APIRouter()
optimizer = RouteOptimizer()


@router.post("/calculate", response_model=RouteResponse)
def calculate_route(request: RouteRequest, db: Session = Depends(get_db)):
    """Calculate the optimal route based on safety and time preferences."""
    try:
        # Calculate the route
        result = optimizer.calculate_route(request)
        
        # Save to database
        db_route = DBRoute(
            start_latitude=request.start.latitude,
            start_longitude=request.start.longitude,
            end_latitude=request.end.latitude,
            end_longitude=request.end.longitude,
            distance_meters=result.routes[0].distance_meters,
            duration_seconds=result.routes[0].duration_seconds,
            overall_safety_score=result.routes[0].safety_score,
            context={
                "user_type": request.user_type,
                "safety_preference": request.safety_preference,
                "time_of_day": request.time_of_day,
                "weather_condition": request.weather_condition
            }
        )
        
        db.add(db_route)
        db.commit()
        db.refresh(db_route)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating route: {str(e)}"
        )


@router.get("/route/{route_id}", response_model=RouteResponse)
def get_route(route_id: str, db: Session = Depends(get_db)):
    """Retrieve a previously calculated route."""
    # Find the route in the database
    db_route = db.query(DBRoute).filter(DBRoute.id == route_id).first()
    
    if not db_route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Route not found"
        )
    
    # Convert DB model to response model
    # In a real implementation, we would reconstruct the full route details
    response = RouteResponse(
        routes=[{
            "id": db_route.id,
            "start": {"latitude": db_route.start_latitude, "longitude": db_route.start_longitude},
            "end": {"latitude": db_route.end_latitude, "longitude": db_route.end_longitude},
            "distance_meters": db_route.distance_meters,
            "duration_seconds": db_route.duration_seconds,
            "safety_score": db_route.overall_safety_score,
            "time_weight": 0.5,  # Default value
            "safety_weight": 0.5,  # Default value
            "polyline": "mock_polyline",  # Mock value
            "waypoints": []  # Mock value
        }],
        safety_analysis={},  # Mock value
        alternatives={}  # Mock value
    )
    
    return response