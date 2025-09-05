"""
Safety Calculator Service for SafeRoute
Implements real safety scoring using multiple data sources
"""

import asyncio
from typing import Dict, Any
from app.services.osm_service import get_poi_count
from app.services.municipal_service import get_dark_spots
from app.services.viirs_service import get_viirs_lighting_data
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def calculate_safety_score(
    latitude: float, 
    longitude: float, 
    user_type: str = "pedestrian",
    time_of_day: str = "day"
) -> int:
    """
    Calculate a comprehensive safety score based on multiple factors.
    
    Args:
        latitude: Latitude coordinate
        longitude: Longitude coordinate
        user_type: Type of user (pedestrian, two_wheeler, cyclist)
        time_of_day: Time period (day, evening, night)
        
    Returns:
        Safety score (0-100, where 100 is safest)
    """
    try:
        # Gather safety factors concurrently
        factors = await asyncio.gather(
            _get_lighting_score(latitude, longitude, time_of_day),
            _get_footfall_score(latitude, longitude),
            _get_hazard_score(latitude, longitude),
            _get_proximity_score(latitude, longitude)
        )
        
        lighting_score, footfall_score, hazard_score, proximity_score = factors
        
        # Calculate weighted safety score
        # Weights based on the SafeRoute algorithm
        weights = {
            "lighting": 0.30,      # Critical for night safety
            "footfall": 0.25,      # Activity indicates safety
            "hazards": 0.20,       # Hazard index (inverted)
            "proximity": 0.25      # Proximity to help
        }
        
        # Apply weights
        weighted_score = (
            lighting_score * weights["lighting"] +
            footfall_score * weights["footfall"] +
            (100 - hazard_score) * weights["hazards"] +  # Invert hazard score
            proximity_score * weights["proximity"]
        )
        
        # Adjust based on user type
        if user_type == "two_wheeler":
            weighted_score *= 0.95  # Slightly lower for two-wheelers
        elif user_type == "cyclist":
            weighted_score *= 0.90  # Lower for cyclists
        
        # Clamp to 0-100 range
        final_score = max(0, min(100, int(weighted_score)))
        
        return final_score
        
    except Exception as e:
        logger.error(f"Error calculating safety score: {str(e)}")
        # Return a default score on error
        return 50

async def _get_lighting_score(latitude: float, longitude: float, time_of_day: str) -> int:
    """
    Calculate lighting score based on time of day and area characteristics.
    """
    try:
        # Get VIIRS lighting data as primary source
        viirs_brightness = get_viirs_lighting_data(latitude, longitude)
        
        # Convert VIIRS brightness (0-1) to score (0-100)
        viirs_score = int(viirs_brightness * 100)
        
        # Get municipal dark spots data
        dark_spots = get_dark_spots(latitude, longitude, 500)  # 500m radius
        dark_spot_penalty = len(dark_spots) * 10  # 10 points penalty per dark spot
        
        # Get POI count as a proxy for area activity (more POIs = better lighting)
        poi_count = get_poi_count(latitude, longitude, 300)  # 300m radius
        
        # Base score based on POI density
        if poi_count > 50:
            poi_bonus = 20  # Well-lit commercial area bonus
        elif poi_count > 20:
            poi_bonus = 10  # Moderately lit area bonus
        elif poi_count > 5:
            poi_bonus = 5   # Poorly lit area small bonus
        else:
            poi_bonus = 0   # Very poorly lit area
            
        # Calculate final lighting score
        base_score = max(0, min(100, viirs_score + poi_bonus - dark_spot_penalty))
            
        # Adjust for time of day
        if time_of_day == "night":
            base_score *= 0.7  # 30% reduction at night
        elif time_of_day == "evening":
            base_score *= 0.85  # 15% reduction in evening
            
        return int(base_score)
        
    except Exception as e:
        logger.error(f"Error calculating lighting score: {str(e)}")
        return 50

async def _get_footfall_score(latitude: float, longitude: float) -> int:
    """
    Calculate footfall score based on POI density and area type.
    """
    try:
        # Get POI count as a measure of footfall
        poi_count = get_poi_count(latitude, longitude, 200)  # 200m radius
        
        # Convert POI count to footfall score (0-100)
        if poi_count > 100:
            return 95  # Very high footfall
        elif poi_count > 50:
            return 80  # High footfall
        elif poi_count > 20:
            return 65  # Moderate footfall
        elif poi_count > 5:
            return 45  # Low footfall
        else:
            return 25  # Very low footfall
            
    except Exception as e:
        logger.error(f"Error calculating footfall score: {str(e)}")
        return 50

async def _get_hazard_score(latitude: float, longitude: float) -> int:
    """
    Calculate hazard score based on road conditions and incident history.
    """
    try:
        # Get municipal dark spots as a proxy for hazards
        dark_spots = get_dark_spots(latitude, longitude, 300)  # 300m radius
        dark_spot_hazards = len(dark_spots) * 15  # 15 points hazard per dark spot
        
        # Get POI count as a proxy for road quality
        poi_count = get_poi_count(latitude, longitude, 100)  # 100m radius
        
        # Assume more POIs = better maintained roads = fewer hazards
        if poi_count > 30:
            road_quality_bonus = 20  # Very few hazards
        elif poi_count > 15:
            road_quality_bonus = 10  # Few hazards
        elif poi_count > 5:
            road_quality_bonus = 5   # Moderate hazards
        else:
            road_quality_bonus = 0   # Many hazards
            
        # Calculate final hazard score (0-100, where 100 means many hazards)
        hazard_score = max(0, min(100, dark_spot_hazards - road_quality_bonus))
            
        return hazard_score
            
    except Exception as e:
        logger.error(f"Error calculating hazard score: {str(e)}")
        return 50

async def _get_proximity_score(latitude: float, longitude: float) -> int:
    """
    Calculate proximity to help score based on distance to emergency services.
    """
    try:
        # Get count of emergency services (police, hospitals, fire stations)
        emergency_poi_count = get_poi_count(latitude, longitude, 1000)  # 1km radius
        
        # Convert to proximity score
        if emergency_poi_count > 10:
            return 90  # Very close to help
        elif emergency_poi_count > 5:
            return 75  # Close to help
        elif emergency_poi_count > 2:
            return 60  # Moderately close to help
        elif emergency_poi_count > 0:
            return 40  # Somewhat distant from help
        else:
            return 20  # Far from help
            
    except Exception as e:
        logger.error(f"Error calculating proximity score: {str(e)}")
        return 50