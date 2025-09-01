
import requests

OVERPASS_API_URL = "http://overpass-api.de/api/interpreter"

def get_poi_count(lat: float, lon: float, radius: int = 500) -> int:
    """
    Gets the number of POIs within a given radius of a location using the Overpass API.
    """
    query = f"""
        [out:json];
        (
            node(around:{radius},{lat},{lon})[amenity];
            way(around:{radius},{lat},{lon})[amenity];
            relation(around:{radius},{lat},{lon})[amenity];
            node(around:{radius},{lat},{lon})[shop];
            way(around:{radius},{lat},{lon})[shop];
            relation(around:{radius},{lat},{lon})[shop];
            node(around:{radius},{lat},{lon})[tourism];
            way(around:{radius},{lat},{lon})[tourism];
            relation(around:{radius},{lat},{lon})[tourism];
        );
        out count;
    """

    try:
        response = requests.post(OVERPASS_API_URL, data=query)
        response.raise_for_status()
        data = response.json()
        return int(data.get("elements", [{}])[0].get("tags", {}).get("total", 0))
    except requests.exceptions.RequestException as e:
        print(f"Error fetching OSM data: {e}")
        return 0
    except Exception as e:
        print(f"Error processing OSM data: {e}")
        return 0
