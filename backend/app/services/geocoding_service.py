"""
Geocoding Service for SafeRoute
Implements geocoding using OpenStreetMap Nominatim
"""

import requests
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Nominatim API base URL
NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org"

class GeocodingService:
    """Service for handling geocoding operations using OSM Nominatim"""
    
    def __init__(self):
        self.base_url = NOMINATIM_BASE_URL
        self.user_agent = "SafeRoute/1.0 (https://safeguardnavigators.vercel.app)"
        
    async def geocode(
        self,
        query: str,
        limit: int = 10,
        country_codes: Optional[List[str]] = None,
        viewbox: Optional[tuple] = None
    ) -> Dict[str, Any]:
        """
        Geocode a location query using Nominatim
        
        Args:
            query: Location query string
            limit: Maximum number of results to return
            country_codes: List of ISO country codes to restrict search
            viewbox: Bounding box to restrict search (min_lon, min_lat, max_lon, max_lat)
            
        Returns:
            Dictionary with geocoding results or error
        """
        try:
            # Validate query
            if not query or not query.strip():
                return {
                    "success": False,
                    "error": "Query parameter is required"
                }
                
            # Prepare parameters
            params = {
                "q": query.strip(),
                "format": "json",
                "limit": str(limit),
                "addressdetails": "1"
            }
            
            # Add country codes restriction
            if country_codes:
                params["countrycodes"] = ",".join(country_codes)
                
            # Add viewbox restriction
            if viewbox and len(viewbox) == 4:
                params["viewbox"] = f"{viewbox[0]},{viewbox[1]},{viewbox[2]},{viewbox[3]}"
                
            # Set headers
            headers = {
                "User-Agent": self.user_agent
            }
            
            # Make request to Nominatim
            url = f"{self.base_url}/search"
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            # Check response
            if response.status_code == 200:
                results = response.json()
                
                # Transform results to our format
                transformed_results = []
                for result in results:
                    try:
                        # Extract coordinates
                        lat = float(result.get("lat", 0))
                        lon = float(result.get("lon", 0))
                        
                        # Extract address details
                        address = result.get("address", {})
                        
                        # Create transformed result
                        transformed_result = {
                            "place_id": result.get("place_id"),
                            "osm_id": result.get("osm_id"),
                            "osm_type": result.get("osm_type"),
                            "name": self._extract_name(result),
                            "display_name": result.get("display_name", ""),
                            "latitude": lat,
                            "longitude": lon,
                            "bounding_box": self._parse_bounding_box(result.get("boundingbox")),
                            "importance": result.get("importance", 0),
                            "type": result.get("type", ""),
                            "category": result.get("class", ""),
                            "address": {
                                "house_number": address.get("house_number"),
                                "road": address.get("road") or address.get("pedestrian") or address.get("footway"),
                                "neighborhood": address.get("neighbourhood") or address.get("suburb"),
                                "city": address.get("city") or address.get("town") or address.get("village"),
                                "state": address.get("state"),
                                "postcode": address.get("postcode"),
                                "country": address.get("country"),
                                "country_code": address.get("country_code", "").upper()
                            }
                        }
                        
                        transformed_results.append(transformed_result)
                    except (ValueError, TypeError) as e:
                        logger.warning(f"Error parsing geocoding result: {e}")
                        continue
                
                return {
                    "success": True,
                    "results": transformed_results
                }
            else:
                return {
                    "success": False,
                    "error": f"Nominatim API error: {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Geocoding request timed out"
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making geocoding request: {e}")
            return {
                "success": False,
                "error": f"Network error during geocoding: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Unexpected error in geocoding: {e}")
            return {
                "success": False,
                "error": f"Internal error during geocoding: {str(e)}"
            }
    
    async def reverse_geocode(
        self,
        latitude: float,
        longitude: float,
        zoom: int = 18
    ) -> Dict[str, Any]:
        """
        Reverse geocode coordinates to get address information
        
        Args:
            latitude: Latitude coordinate
            longitude: Longitude coordinate
            zoom: Zoom level (0-18, higher = more detailed)
            
        Returns:
            Dictionary with reverse geocoding result or error
        """
        try:
            # Validate coordinates
            if latitude < -90 or latitude > 90 or longitude < -180 or longitude > 180:
                return {
                    "success": False,
                    "error": "Invalid coordinates"
                }
                
            # Prepare parameters
            params = {
                "lat": str(latitude),
                "lon": str(longitude),
                "format": "json",
                "addressdetails": "1",
                "zoom": str(zoom)
            }
            
            # Set headers
            headers = {
                "User-Agent": self.user_agent
            }
            
            # Make request to Nominatim
            url = f"{self.base_url}/reverse"
            response = requests.get(url, params=params, headers=headers, timeout=10)
            
            # Check response
            if response.status_code == 200:
                result = response.json()
                
                # Check if result contains address
                if "address" not in result:
                    return {
                        "success": False,
                        "error": "No address found for coordinates"
                    }
                
                # Transform result to our format
                address = result.get("address", {})
                lat = float(result.get("lat", latitude))
                lon = float(result.get("lon", longitude))
                
                transformed_result = {
                    "place_id": result.get("place_id"),
                    "osm_id": result.get("osm_id"),
                    "osm_type": result.get("osm_type"),
                    "name": self._extract_name(result),
                    "display_name": result.get("display_name", ""),
                    "latitude": lat,
                    "longitude": lon,
                    "bounding_box": self._parse_bounding_box(result.get("boundingbox")),
                    "importance": result.get("importance", 0),
                    "type": result.get("type", ""),
                    "category": result.get("class", ""),
                    "address": {
                        "house_number": address.get("house_number"),
                        "road": address.get("road") or address.get("pedestrian") or address.get("footway"),
                        "neighborhood": address.get("neighbourhood") or address.get("suburb"),
                        "city": address.get("city") or address.get("town") or address.get("village"),
                        "state": address.get("state"),
                        "postcode": address.get("postcode"),
                        "country": address.get("country"),
                        "country_code": address.get("country_code", "").upper()
                    }
                }
                
                return {
                    "success": True,
                    "result": transformed_result
                }
            else:
                return {
                    "success": False,
                    "error": f"Nominatim API error: {response.status_code}"
                }
                
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Reverse geocoding request timed out"
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making reverse geocoding request: {e}")
            return {
                "success": False,
                "error": f"Network error during reverse geocoding: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Unexpected error in reverse geocoding: {e}")
            return {
                "success": False,
                "error": f"Internal error during reverse geocoding: {str(e)}"
            }
    
    def _extract_name(self, result: Dict[str, Any]) -> str:
        """
        Extract a meaningful name from a Nominatim result
        
        Args:
            result: Nominatim result dictionary
            
        Returns:
            Extracted name
        """
        # Try to get namedetails name
        namedetails = result.get("namedetails", {})
        if namedetails.get("name"):
            return namedetails["name"]
            
        # Try to get address name
        address = result.get("address", {})
        if address.get("name"):
            return address["name"]
            
        # Use first part of display name
        display_name = result.get("display_name", "")
        if display_name:
            return display_name.split(",")[0].strip()
            
        # Fallback to generic name
        return "Unnamed Location"
    
    def _parse_bounding_box(self, bounding_box: Optional[List[str]]) -> Optional[List[float]]:
        """
        Parse bounding box from Nominatim format to our format
        
        Args:
            bounding_box: Bounding box from Nominatim (list of strings)
            
        Returns:
            Parsed bounding box (min_lat, min_lng, max_lat, max_lng) or None
        """
        if not bounding_box or len(bounding_box) != 4:
            return None
            
        try:
            # Nominatim format: [min_lat, max_lat, min_lng, max_lng]
            min_lat = float(bounding_box[0])
            max_lat = float(bounding_box[1])
            min_lng = float(bounding_box[2])
            max_lng = float(bounding_box[3])
            
            # Convert to our format: [min_lng, min_lat, max_lng, max_lat]
            return [min_lng, min_lat, max_lng, max_lat]
        except (ValueError, TypeError):
            return None

# Global instance
geocoding_service = GeocodingService()