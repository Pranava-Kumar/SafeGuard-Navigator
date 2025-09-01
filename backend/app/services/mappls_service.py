
import requests
from app.core.config import settings

MAPPLS_API_URL = "https://atlas.mappls.com/api/places/nearby/json"

def get_nearby_places_count(lat: float, lon: float, radius: int = 500) -> int:
    """
    Gets the number of nearby places from the Mappls API.
    """
    if not settings.MAPPLS_API_KEY:
        print("Mappls API key not configured.")
        return 0

    params = {
        "keywords": "all",
        "refLocation": f"{lat},{lon}",
        "radius": radius,
        "access_token": settings.MAPPLS_API_KEY,
    }

    try:
        response = requests.get(MAPPLS_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return len(data.get("suggestedLocations", []))
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Mappls data: {e}")
        return 0
    except Exception as e:
        print(f"Error processing Mappls data: {e}")
        return 0
