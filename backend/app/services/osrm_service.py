"""
OSRM Service for SafeRoute
Implements real routing using OSRM with Chennai OSM data
"""

import os
import subprocess
import time
import requests
from typing import List, Tuple, Dict, Any, Optional
from fastapi import HTTPException
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OSRMService:
    """Service for handling OSRM routing operations"""
    
    def __init__(self):
        self.osrm_host = os.getenv("OSRM_HOST", "http://localhost:5000")
        # Use correct path for Windows
        self.chennai_osm_file = "chennai.osm.pbf"
        self.osrm_data_path = "chennai.osrm"
        self.is_local_osrm = os.getenv("USE_LOCAL_OSRM", "true").lower() == "true"
        self.osrm_available = False
        
    def setup_osrm(self) -> bool:
        """
        Setup OSRM with Chennai data
        This should be run once during application startup
        """
        try:
            # Check if we should use local OSRM
            if not self.is_local_osrm:
                logger.info("Using external OSRM service")
                self.osrm_available = True
                return True
                
            if not os.path.exists(self.chennai_osm_file):
                logger.warning(f"Chennai OSM file not found at {self.chennai_osm_file}")
                logger.warning("OSRM service will not be available")
                self.osrm_available = False
                return False
                
            # Check if OSRM files already exist
            if os.path.exists(f"{self.osrm_data_path}.hsgr"):
                logger.info("OSRM data already processed")
                self.osrm_available = True
                return True
                
            logger.info("Processing Chennai OSM data for OSRM...")
            
            # Check if OSRM tools are available
            try:
                # Try to run OSRM extract with help flag to check if it exists
                result = subprocess.run(["../OSRM/osrm-extract", "--help"], 
                                      capture_output=True, timeout=5, cwd="..")
                if result.returncode != 0:
                    raise subprocess.CalledProcessError(result.returncode, "../OSRM/osrm-extract")
            except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
                logger.warning("OSRM tools not found. OSRM service will not be available.")
                logger.warning("Please install OSRM in the OSRM folder at project root.")
                self.osrm_available = False
                return False
            
            # Extract network data
            extract_cmd = [
                "../OSRM/osrm-extract",
                "-p", "profiles/foot.lua",  # Using foot profile for pedestrians
                self.chennai_osm_file
            ]
            
            result = subprocess.run(extract_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"OSRM extract failed: {result.stderr}")
                self.osrm_available = False
                return False
                
            # Prepare hierarchical data
            contract_cmd = ["../OSRM/osrm-contract", self.osrm_data_path]
            result = subprocess.run(contract_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"OSRM contract failed: {result.stderr}")
                self.osrm_available = False
                return False
                
            logger.info("OSRM setup completed successfully")
            self.osrm_available = True
            return True
            
        except Exception as e:
            logger.error(f"Error setting up OSRM: {str(e)}")
            self.osrm_available = False
            return False
    
    def start_osrm_server(self) -> bool:
        """
        Start OSRM routing server
        """
        # If not using local OSRM, return True
        if not self.is_local_osrm:
            return True
            
        # If OSRM is not available, return False
        if not self.osrm_available:
            return False
            
        try:
            if not os.path.exists(f"{self.osrm_data_path}.hsgr"):
                logger.warning("OSRM data not found, cannot start server")
                return False
                
            # Start OSRM server in background
            server_cmd = [
                "../OSRM/osrm-routed",
                "--algorithm", "mld",
                "--max-matching-size", "1000",
                self.osrm_data_path
            ]
            
            # Start server process
            process = subprocess.Popen(server_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            
            # Wait a moment for server to start
            time.sleep(5)
            
            # Check if server is responding
            try:
                response = requests.get(f"{self.osrm_host}/health", timeout=10)
                if response.status_code == 200:
                    logger.info("OSRM server started successfully")
                    return True
                else:
                    logger.error(f"OSRM server health check failed: {response.status_code}")
                    return False
            except requests.exceptions.RequestException as e:
                logger.error(f"OSRM server not responding: {str(e)}")
                return False
                
        except Exception as e:
            logger.error(f"Error starting OSRM server: {str(e)}")
            return False
    
    async def get_route(
        self, 
        coordinates: List[Tuple[float, float]], 
        profile: str = "foot"
    ) -> Dict[str, Any]:
        """
        Calculate route between coordinates using OSRM
        
        Args:
            coordinates: List of (longitude, latitude) tuples
            profile: Routing profile (foot, bicycle, car)
            
        Returns:
            Dictionary with route information
        """
        # Check if OSRM is available
        if not self.osrm_available and self.is_local_osrm:
            logger.warning("OSRM service is not available. Returning fallback response.")
            # Return a fallback response instead of raising an exception
            return {
                "routes": [{
                    "distance_meters": 0,
                    "duration_seconds": 0,
                    "waypoints": [],
                    "legs": [],
                    "polyline": "",
                    "summary": "OSRM not available"
                }]
            }
        
        try:
            # Validate coordinates
            if len(coordinates) < 2:
                raise HTTPException(
                    status_code=400,
                    detail="At least two coordinates required for routing"
                )
                
            # Format coordinates for OSRM
            coord_string = ";".join([f"{lon},{lat}" for lon, lat in coordinates])
            
            # Build URL
            url = f"{self.osrm_host}/route/v1/{profile}/{coord_string}"
            
            # Add parameters
            params = {
                "overview": "full",
                "geometries": "geojson",
                "steps": "true",
                "annotations": "true"
            }
            
            # Make request to OSRM
            response = requests.get(url, params=params, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "Ok":
                    return self._process_route_response(data)
                else:
                    logger.warning(f"OSRM routing failed: {data.get('message', 'Unknown error')}")
                    # Return fallback response
                    return {
                        "routes": [{
                            "distance_meters": 0,
                            "duration_seconds": 0,
                            "waypoints": [],
                            "legs": [],
                            "polyline": "",
                            "summary": "Routing failed"
                        }]
                    }
            elif response.status_code == 400:
                logger.warning("Invalid routing request")
                # Return fallback response
                return {
                    "routes": [{
                        "distance_meters": 0,
                        "duration_seconds": 0,
                        "waypoints": [],
                        "legs": [],
                        "polyline": "",
                        "summary": "Invalid request"
                    }]
                }
            else:
                logger.warning(f"OSRM service unavailable: {response.status_code}")
                # Return fallback response
                return {
                    "routes": [{
                        "distance_meters": 0,
                        "duration_seconds": 0,
                        "waypoints": [],
                        "legs": [],
                        "polyline": "",
                        "summary": "Service unavailable"
                    }]
                }
                
        except requests.exceptions.Timeout:
            logger.warning("OSRM service timeout")
            # Return fallback response
            return {
                "routes": [{
                    "distance_meters": 0,
                    "duration_seconds": 0,
                    "waypoints": [],
                    "legs": [],
                    "polyline": "",
                    "summary": "Service timeout"
                }]
            }
        except requests.exceptions.RequestException as e:
            logger.warning(f"OSRM service error: {str(e)}")
            # Return fallback response
            return {
                "routes": [{
                    "distance_meters": 0,
                    "duration_seconds": 0,
                    "waypoints": [],
                    "legs": [],
                    "polyline": "",
                    "summary": "Service error"
                }]
            }
        except Exception as e:
            logger.error(f"Unexpected error in get_route: {str(e)}")
            # Return fallback response
            return {
                "routes": [{
                    "distance_meters": 0,
                    "duration_seconds": 0,
                    "waypoints": [],
                    "legs": [],
                    "polyline": "",
                    "summary": "Internal error"
                }]
            }
    
    def _process_route_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process OSRM route response into our format
        """
        if not data.get("routes"):
            return {"routes": []}
            
        route = data["routes"][0]  # Get the first (best) route
        legs = route.get("legs", [])
        
        # Extract waypoints from geometry
        geometry = route.get("geometry", {}).get("coordinates", [])
        waypoints = [{"longitude": coord[0], "latitude": coord[1]} for coord in geometry]
        
        # Calculate total distance and duration
        total_distance = route.get("distance", 0)  # meters
        total_duration = route.get("duration", 0)  # seconds
        
        # Process legs for detailed information
        processed_legs = []
        for leg in legs:
            steps = []
            for step in leg.get("steps", []):
                steps.append({
                    "distance": step.get("distance", 0),
                    "duration": step.get("duration", 0),
                    "instruction": step.get("maneuver", {}).get("instruction", ""),
                    "way_name": step.get("name", ""),
                })
            
            processed_legs.append({
                "distance": leg.get("distance", 0),
                "duration": leg.get("duration", 0),
                "steps": steps
            })
        
        return {
            "routes": [{
                "distance_meters": total_distance,
                "duration_seconds": total_duration,
                "waypoints": waypoints,
                "legs": processed_legs,
                "polyline": route.get("geometry", ""),  # For map rendering
                "summary": route.get("legs", [{}])[0].get("summary", "")
            }]
        }
    
    async def get_table(
        self,
        coordinates: List[Tuple[float, float]],
        profile: str = "foot"
    ) -> Dict[str, Any]:
        """
        Calculate distance/duration matrix between coordinates
        
        Args:
            coordinates: List of (longitude, latitude) tuples
            profile: Routing profile
            
        Returns:
            Dictionary with matrix data
        """
        # Check if OSRM is available
        if not self.osrm_available and self.is_local_osrm:
            logger.warning("OSRM service is not available for matrix calculation. Returning fallback response.")
            # Return a fallback response instead of raising an exception
            return {
                "durations": [],
                "distances": [],
                "sources": [],
                "destinations": []
            }
            
        try:
            if len(coordinates) < 2:
                raise HTTPException(
                    status_code=400,
                    detail="At least two coordinates required for matrix calculation"
                )
                
            # Format coordinates for OSRM
            coord_string = ";".join([f"{lon},{lat}" for lon, lat in coordinates])
            
            # Build URL
            url = f"{self.osrm_host}/table/v1/{profile}/{coord_string}"
            
            # Add parameters
            params = {
                "annotations": "duration,distance"
            }
            
            # Make request to OSRM
            response = requests.get(url, params=params, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("code") == "Ok":
                    return self._process_table_response(data)
                else:
                    logger.warning(f"OSRM matrix calculation failed: {data.get('message', 'Unknown error')}")
                    # Return fallback response
                    return {
                        "durations": [],
                        "distances": [],
                        "sources": [],
                        "destinations": []
                    }
            else:
                logger.warning(f"OSRM service unavailable: {response.status_code}")
                # Return fallback response
                return {
                    "durations": [],
                    "distances": [],
                    "sources": [],
                    "destinations": []
                }
                
        except requests.exceptions.Timeout:
            logger.warning("OSRM service timeout for matrix calculation")
            # Return fallback response
            return {
                "durations": [],
                "distances": [],
                "sources": [],
                "destinations": []
            }
        except requests.exceptions.RequestException as e:
            logger.warning(f"OSRM service error for matrix calculation: {str(e)}")
            # Return fallback response
            return {
                "durations": [],
                "distances": [],
                "sources": [],
                "destinations": []
            }
        except Exception as e:
            logger.error(f"Unexpected error in get_table: {str(e)}")
            # Return fallback response
            return {
                "durations": [],
                "distances": [],
                "sources": [],
                "destinations": []
            }
    
    def _process_table_response(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process OSRM table response
        """
        durations = data.get("durations", [])
        distances = data.get("distances", [])
        
        return {
            "durations": durations,
            "distances": distances,
            "sources": data.get("sources", []),
            "destinations": data.get("destinations", [])
        }

# Global instance
osrm_service = OSRMService()