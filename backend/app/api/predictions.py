from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.utils import get_db
from app.services.ml.service import PredictionService
from app.schemas import (
    SafetyFactors,
    SafetyScoreRequest
)
from typing import Dict, Any

router = APIRouter()
prediction_service = PredictionService()


@router.post("/train")
def train_incident_model(db: Session = Depends(get_db)):
    """
    Train the incident prediction model using historical data.
    """
    try:
        results = prediction_service.train_incident_model(db)
        return {
            "message": "Model training completed successfully",
            "results": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model training failed: {str(e)}"
        )


@router.post("/forecast")
def forecast_incidents(
    location_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """
    Forecast incidents for a given location based on safety factors.
    """
    try:
        results = prediction_service.forecast_incidents(db, location_data)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Incident forecast failed: {str(e)}"
        )


@router.get("/anomalies")
def detect_anomalies(db: Session = Depends(get_db)):
    """
    Detect anomalies in safety patterns across all locations.
    """
    try:
        results = prediction_service.detect_safety_anomalies(db)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anomaly detection failed: {str(e)}"
        )


@router.get("/models")
def list_models():
    """
    List available prediction models.
    """
    try:
        import json
        with open("app/services/ml/model_registry.json", "r") as f:
            model_registry = json.load(f)
        return model_registry
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve model list: {str(e)}"
        )