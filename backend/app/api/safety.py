from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.utils import get_db
from app.schemas import SafetyScoreRequest, SafetyScoreResponse
from app.services.safety_calculator import SafetyScoreCalculator
from app.models import SafetyScore as DBSafetyScore

router = APIRouter()
calculator = SafetyScoreCalculator()


@router.post("/calculate", response_model=SafetyScoreResponse)
def calculate_safety_score(request: SafetyScoreRequest, db: Session = Depends(get_db)):
    """Calculate a safety score based on provided factors."""
    try:
        # Calculate the safety score
        result = calculator.calculate_score(request)
        
        # Save to database
        db_score = DBSafetyScore(
            latitude=request.latitude,
            longitude=request.longitude,
            geohash=f"{request.latitude},{request.longitude}",  # Simplified geohash
            overall_score=result.overall_score,
            confidence=result.confidence,
            lighting_score=request.factors.lighting.score,
            footfall_score=request.factors.footfall.score,
            hazard_score=request.factors.hazards.score,
            proximity_score=request.factors.proximity.score,
            factors=request.factors.dict(),
            timestamp=request.timestamp
        )
        
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating safety score: {str(e)}"
        )


@router.get("/score/{latitude}/{longitude}", response_model=SafetyScoreResponse)
def get_safety_score(latitude: float, longitude: float, db: Session = Depends(get_db)):
    """Retrieve a previously calculated safety score."""
    # Find the most recent score for this location
    db_score = db.query(DBSafetyScore).filter(
        DBSafetyScore.latitude == latitude,
        DBSafetyScore.longitude == longitude
    ).order_by(DBSafetyScore.timestamp.desc()).first()
    
    if not db_score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Safety score not found for this location"
        )
    
    # Convert DB model to response model
    factors = db_score.factors
    response = SafetyScoreResponse(
        overall_score=db_score.overall_score,
        factors=factors,
        weights=calculator.DEFAULT_WEIGHTS,  # Return default weights
        confidence=db_score.confidence,
        timestamp=db_score.timestamp
    )
    
    return response