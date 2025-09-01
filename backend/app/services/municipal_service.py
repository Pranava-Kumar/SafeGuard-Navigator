
from typing import List, Dict, Any

# Mock data for municipal dark spots (in a real application, this would come from a database)
MOCK_DARK_SPOTS: List[Dict[str, Any]] = [
    {"lat": 12.9716, "lon": 77.5946, "city": "Bengaluru", "reason": "Poorly lit street"},
    {"lat": 13.0827, "lon": 80.2707, "city": "Chennai", "reason": "No streetlights"},
    {"lat": 19.0760, "lon": 72.8777, "city": "Mumbai", "reason": "Broken streetlights"},
]

def get_dark_spots(lat: float, lon: float, radius: int = 500) -> List[Dict[str, Any]]:
    """
    Gets a list of dark spots near a given location.
    This is a mock implementation.
    """
    dark_spots_nearby = []
    for spot in MOCK_DARK_SPOTS:
        # Simple distance calculation (not accurate, but good enough for a mock)
        distance = ((spot["lat"] - lat) ** 2 + (spot["lon"] - lon) ** 2) ** 0.5
        if distance * 111000 < radius:  # Approximate conversion from degrees to meters
            dark_spots_nearby.append(spot)
    return dark_spots_nearby
