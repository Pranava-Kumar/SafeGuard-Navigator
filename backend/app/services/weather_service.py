
import requests

OPEN_METEO_API_URL = "https://api.open-meteo.com/v1/forecast"

def get_weather_conditions(lat: float, lon: float) -> dict:
    """
    Gets the current weather conditions from the Open-Meteo API.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "current_weather": True,
    }

    try:
        response = requests.get(OPEN_METEO_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data.get("current_weather", {})
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return {}
    except Exception as e:
        print(f"Error processing weather data: {e}")
        return {}
