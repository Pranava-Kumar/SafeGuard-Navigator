
from sqlalchemy.orm import Session
from app import crud, schemas
from app.services import viirs_service, mappls_service, municipal_service, weather_service
from datetime import datetime

def calculate_safety_score(db: Session, lat: float, lon: float):
    """
    Calculates the safety score for a given location.
    """
    # Get lighting data from VIIRS
    lighting_score = viirs_service.get_viirs_lighting_data(lat, lon) * 100

    # Adjust lighting score based on municipal dark spots
    dark_spots = municipal_service.get_dark_spots(lat, lon)
    if dark_spots:
        lighting_score *= 0.5  # Reduce lighting score by 50% if in a dark spot area

    # Get footfall data from Mappls
    poi_count = mappls_service.get_nearby_places_count(lat, lon)
    # Normalize POI count to a score from 0 to 100 (e.g., max 50 POIs is 100)
    footfall_score = min(poi_count * 2, 100)

    # Get weather conditions
    weather = weather_service.get_weather_conditions(lat, lon)
    weather_hazard = 0
    if weather.get("weathercode", 0) > 50:  # Rain, snow, etc.
        weather_hazard = 20

    # Get hazard reports from users
    reports = crud.report.get_reports_near_location(db, lat=lat, lon=lon)
    report_hazard = len(reports) * 10 # Each report adds 10 to the hazard score

    # Mock other factors for now
    hazards_score = 90 - weather_hazard - report_hazard # Initial hazard score is high, reduced by weather and reports
    proximity_to_help_score = 60

    # Calculate overall score (simple average for now)
    overall_score = (
        lighting_score + footfall_score + hazards_score + proximity_to_help_score
    ) / 4

    # Create the factors object
    factors = schemas.SafetyFactors(
        lighting=schemas.SafetyFactor(
            score=int(lighting_score),
            description="Lighting conditions based on VIIRS satellite data"
        ),
        footfall=schemas.SafetyFactor(
            score=int(footfall_score),
            description="Footfall activity based on nearby places of interest"
        ),
        hazards=schemas.SafetyFactor(
            score=int(hazards_score),
            description="Hazards based on weather conditions and user reports"
        ),
        proximity=schemas.SafetyFactor(
            score=int(proximity_to_help_score),
            description="Proximity to help services"
        )
    )

    # Return a SafetyScoreResponse object instead of SafetyScore
    return schemas.SafetyScoreResponse(
        overall_score=int(overall_score),
        factors=factors,
        weights={
            "lighting": 1.0,
            "footfall": 1.0,
            "hazards": 1.0,
            "proximity": 1.0
        },
        confidence=0.75,
        timestamp=datetime.utcnow()
    )
