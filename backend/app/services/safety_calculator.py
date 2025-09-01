import numpy as np
from typing import Dict, Any
from app.schemas import SafetyScoreRequest, SafetyScoreResponse


class SafetyScoreCalculator:
    """
    Calculate safety scores based on multiple factors.
    
    SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
    """
    
    # Default weights for safety factors
    DEFAULT_WEIGHTS = {
        'lighting': 0.30,      # wL - Lighting Quality
        'footfall': 0.25,      # wF - Footfall & Activity  
        'hazards': 0.20,       # wH - Hazard Index (inverted)
        'proximity': 0.25      # wP - Proximity to Help
    }
    
    def calculate_score(self, request: SafetyScoreRequest) -> SafetyScoreResponse:
        """
        Calculate the overall safety score based on the provided factors.
        """
        # Extract factor scores from request
        lighting_score = request.factors.lighting.score
        footfall_score = request.factors.footfall.score
        hazard_score = request.factors.hazards.score
        proximity_score = request.factors.proximity.score
        
        # Get weights (use defaults if not provided)
        weights = request.weights if request.weights else self.DEFAULT_WEIGHTS
        
        # Calculate the overall score
        # Note: Hazard score is inverted (higher hazard = lower safety)
        overall_score = (
            weights['lighting'] * lighting_score +
            weights['footfall'] * footfall_score +
            weights['hazards'] * (100 - hazard_score) +
            weights['proximity'] * proximity_score
        )
        
        # Ensure score is within 0-100 range
        overall_score = max(0, min(100, overall_score))
        
        # Create response
        response = SafetyScoreResponse(
            overall_score=round(overall_score),
            factors=request.factors,
            weights=weights,
            confidence=request.confidence,
            timestamp=request.timestamp
        )
        
        return response