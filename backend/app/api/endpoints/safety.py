
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas
from app.api import deps
from app.services import safety_service

router = APIRouter()

@router.get("/score", response_model=schemas.SafetyScore)
def get_safety_score(
    lat: float,
    lon: float,
    db: Session = Depends(deps.get_db),
) -> schemas.SafetyScore:
    """
    Get safety score for a given location.
    """
    return safety_service.calculate_safety_score(db=db, lat=lat, lon=lon)
