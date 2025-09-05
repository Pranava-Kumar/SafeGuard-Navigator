
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class SafetyFactors(BaseModel):
    lighting: int
    footfall: int
    hazards: int
    proximity_to_help: int

class SafetyScore(BaseModel):
    id: int
    latitude: float
    longitude: float
    geohash: str
    overall_score: int
    confidence: float
    lighting_score: int
    footfall_score: int
    hazard_score: int
    proximity_score: int
    time_of_day: Optional[str] = None
    weather_condition: Optional[str] = None
    user_type: Optional[str] = None
    data_sources: Optional[Dict[str, Any]] = None
    factors: Optional[Dict[str, Any]] = None
    ai_predictions: Optional[Dict[str, Any]] = None
    timestamp: datetime
    expires_at: Optional[datetime] = None
