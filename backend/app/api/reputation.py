from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.utils import get_db
from app.schemas import (
    ReputationUpdateRequest, 
    ReputationResponse, 
    ReputationCalculationRequest, 
    WilsonScoreResponse
)
from app.services.reputation_calculator import ReputationCalculator
from app.models import UserReputation as DBUserReputation
from sqlalchemy import func

router = APIRouter()
calculator = ReputationCalculator()


@router.post("/calculate-wilson-score", response_model=WilsonScoreResponse)
def calculate_wilson_score(request: ReputationCalculationRequest):
    """Calculate the Wilson Score Confidence Interval."""
    try:
        score = calculator.calculate_wilson_score(
            request.positive, 
            request.total, 
            request.z_score
        )
        return WilsonScoreResponse(wilson_score=score)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating Wilson score: {str(e)}"
        )


@router.post("/update-reputation", response_model=ReputationResponse)
def update_user_reputation(request: ReputationUpdateRequest, db: Session = Depends(get_db)):
    """Update a user's reputation based on a new report verification."""
    try:
        # Get current reputation
        db_reputation = db.query(DBUserReputation).filter(
            DBUserReputation.user_id == request.user_id
        ).first()
        
        # If user doesn't have a reputation record, create one
        if not db_reputation:
            db_reputation = DBUserReputation(user_id=request.user_id)
            db.add(db_reputation)
            db.commit()
            db.refresh(db_reputation)
        
        # Calculate new reputation
        new_score, new_positive, new_total = calculator.update_reputation_score(
            db_reputation.positive_reports,
            db_reputation.total_reports,
            request.new_report_verified
        )
        
        # Determine community standing based on score and total reports
        if new_total < 10:
            standing = "new"
        elif new_score > 0.8 and new_total > 50:
            standing = "expert"
        elif new_score > 0.6 and new_total > 20:
            standing = "verified"
        elif new_score > 0.4:
            standing = "trusted"
        else:
            standing = "new"
        
        # Update database record
        db_reputation.trust_level = new_score
        db_reputation.positive_reports = new_positive
        db_reputation.total_reports = new_total
        db_reputation.community_standing = standing
        db_reputation.last_calculated_at = func.now()
        
        db.commit()
        db.refresh(db_reputation)
        
        # Create response
        response = ReputationResponse(
            user_id=db_reputation.user_id,
            trust_level=db_reputation.trust_level,
            positive_reports=db_reputation.positive_reports,
            total_reports=db_reputation.total_reports,
            community_standing=db_reputation.community_standing,
            last_calculated_at=db_reputation.last_calculated_at
        )
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating reputation: {str(e)}"
        )


@router.get("/reputation/{user_id}", response_model=ReputationResponse)
def get_user_reputation(user_id: int, db: Session = Depends(get_db)):
    """Retrieve a user's current reputation."""
    db_reputation = db.query(DBUserReputation).filter(
        DBUserReputation.user_id == user_id
    ).first()
    
    if not db_reputation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User reputation not found"
        )
    
    response = ReputationResponse(
        user_id=db_reputation.user_id,
        trust_level=db_reputation.trust_level,
        positive_reports=db_reputation.positive_reports,
        total_reports=db_reputation.total_reports,
        community_standing=db_reputation.community_standing,
        last_calculated_at=db_reputation.last_calculated_at
    )
    
    return response