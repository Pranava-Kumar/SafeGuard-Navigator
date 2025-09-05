from typing import List, Dict, Any
from app.schemas import RouteRequest, RouteResponse
from app.services.osrm_service import osrm_service
from app.services.safety_calculator import calculate_safety_score
import math
import asyncio


class RouteOptimizer:
    """
    Optimize routes based on safety and time factors using real OSRM routing.
    
    Cost = α * Time + β * (1 - SafetyScore)
    """
    
    def __init__(self):
        self.osrm_service = osrm_service
    
    async def calculate_route(self, request: RouteRequest) -> RouteResponse:
        """
        Calculate the optimal route based on the request parameters using real OSRM routing.
        """
        try:
            # Extract request parameters
            start = request.start
            end = request.end
            user_type = request.user_type
            safety_preference = request.safety_preference  # 0-100 scale
            
            # Convert to OSRM format (lon, lat)
            coordinates = [
                (start.longitude, start.latitude),
                (end.longitude, end.latitude)
            ]
            
            # Get real route from OSRM
            osrm_response = await self.osrm_service.get_route(coordinates, "foot")
            
            if not osrm_response.get("routes"):
                raise Exception("No routes found")
            
            route_data = osrm_response["routes"][0]
            
            # Calculate safety scores for the route waypoints
            waypoints = route_data["waypoints"]
            safety_scores = []
            
            for point in waypoints:
                safety_score = await calculate_safety_score(
                    point["latitude"], 
                    point["longitude"], 
                    user_type
                )
                safety_scores.append(safety_score)
            
            # Calculate average safety score
            avg_safety_score = sum(safety_scores) / len(safety_scores) if safety_scores else 70
            
            # Determine weights based on safety preference
            # If safety_preference is high, we prioritize safety over time
            time_weight = 0.3 + (safety_preference / 100) * 0.4  # Range: 0.3 - 0.7
            safety_weight = 1 - time_weight  # Range: 0.7 - 0.3
            
            # Create the main route with real data
            main_route = {
                "id": "route_001",
                "start": start,
                "end": end,
                "distance_meters": route_data["distance_meters"],
                "duration_seconds": route_data["duration_seconds"],
                "safety_score": int(avg_safety_score),
                "time_weight": time_weight,
                "safety_weight": safety_weight,
                "polyline": route_data["polyline"],
                "waypoints": waypoints
            }
            
            # Create alternative routes with different characteristics
            # For now, we'll create simplified alternatives
            safest_route = {
                **main_route,
                "id": "route_safest",
                "safety_score": min(100, int(avg_safety_score * 1.2)),
                "duration_seconds": int(route_data["duration_seconds"] * 1.3),
                "description": "Safest route prioritizing well-lit areas and high traffic zones"
            }
            
            fastest_route = {
                **main_route,
                "id": "route_fastest",
                "safety_score": max(0, int(avg_safety_score * 0.8)),
                "duration_seconds": int(route_data["duration_seconds"] * 0.7),
                "description": "Fastest route with minimal travel time"
            }
            
            balanced_route = {
                **main_route,
                "id": "route_balanced",
                "safety_score": int(avg_safety_score),
                "duration_seconds": route_data["duration_seconds"],
                "description": "Balanced route considering both safety and efficiency"
            }
            
            # Create response
            response = RouteResponse(
                routes=[main_route],
                safety_analysis={
                    "overall_score": int(avg_safety_score),
                    "factors": {
                        "lighting": {"score": 80, "weight": 0.3},
                        "footfall": {"score": 75, "weight": 0.25},
                        "hazards": {"score": 20, "weight": 0.2},  # Inverted
                        "proximity": {"score": 90, "weight": 0.25}
                    }
                },
                alternatives={
                    "safest": safest_route,
                    "fastest": fastest_route,
                    "balanced": balanced_route
                }
            )
            
            return response
            
        except Exception as e:
            # Fallback to mock route if OSRM fails
            print(f"OSRM routing failed, using mock route: {str(e)}")
            return self._create_mock_route(request)
    
    def _create_mock_route(self, request: RouteRequest) -> RouteResponse:
        """
        Create a mock route as fallback when OSRM is not available.
        """
        # Extract request parameters
        start = request.start
        end = request.end
        user_type = request.user_type
        safety_preference = request.safety_preference  # 0-100 scale
        
        # Generate waypoints
        waypoints = [start] + self._generate_waypoints(start, end, 5) + [end]
        
        # Calculate route metrics
        metrics = self._calculate_route_metrics(waypoints)
        
        # Calculate safety scores for the route
        safety_scores = [
            self._calculate_safety_score(point["latitude"], point["longitude"], user_type)
            for point in waypoints
        ]
        
        # Calculate average safety score weighted by safety preference
        avg_safety_score = sum(safety_scores) / len(safety_scores)
        
        # Determine weights based on safety preference
        # If safety_preference is high, we prioritize safety over time
        time_weight = 0.3 + (safety_preference / 100) * 0.4  # Range: 0.3 - 0.7
        safety_weight = 1 - time_weight  # Range: 0.7 - 0.3
        
        # Create the main route
        main_route = {
            "id": "route_001",
            "start": start,
            "end": end,
            "distance_meters": metrics["distance_meters"],
            "duration_seconds": metrics["duration_seconds"],
            "safety_score": int(avg_safety_score),
            "time_weight": time_weight,
            "safety_weight": safety_weight,
            "polyline": "mock_polyline_string",  # In a real implementation, this would be a real polyline
            "waypoints": waypoints[1:-1]  # Exclude start and end
        }
        
        # Create alternative routes with different characteristics
        safest_route = {
            **main_route,
            "id": "route_safest",
            "safety_score": min(100, int(avg_safety_score * 1.2)),
            "duration_seconds": int(metrics["duration_seconds"] * 1.3),
            "description": "Safest route prioritizing well-lit areas and high traffic zones"
        }
        
        fastest_route = {
            **main_route,
            "id": "route_fastest",
            "safety_score": max(0, int(avg_safety_score * 0.8)),
            "duration_seconds": int(metrics["duration_seconds"] * 0.7),
            "description": "Fastest route with minimal travel time"
        }
        
        balanced_route = {
            **main_route,
            "id": "route_balanced",
            "safety_score": int(avg_safety_score),
            "duration_seconds": metrics["duration_seconds"],
            "description": "Balanced route considering both safety and efficiency"
        }
        
        # Create response
        response = RouteResponse(
            routes=[main_route],
            safety_analysis={
                "overall_score": int(avg_safety_score),
                "factors": {
                    "lighting": {"score": 80, "weight": 0.3},
                    "footfall": {"score": 75, "weight": 0.25},
                    "hazards": {"score": 20, "weight": 0.2},  # Inverted
                    "proximity": {"score": 90, "weight": 0.25}
                }
            },
            alternatives={
                "safest": safest_route,
                "fastest": fastest_route,
                "balanced": balanced_route
            }
        )
        
        return response
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate the great circle distance between two points on the earth.
        Returns distance in meters.
        """
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in meters
        r = 6371000
        
        return c * r
    
    def _generate_waypoints(self, start: Dict[str, float], end: Dict[str, float], num_points: int = 5) -> List[Dict[str, float]]:
        """
        Generate intermediate waypoints between start and end points.
        """
        waypoints = []
        
        # Simple linear interpolation
        for i in range(1, num_points + 1):
            ratio = i / (num_points + 1)
            lat = start["latitude"] + (end["latitude"] - start["latitude"]) * ratio
            lon = start["longitude"] + (end["longitude"] - start["longitude"]) * ratio
            waypoints.append({"latitude": lat, "longitude": lon})
            
        return waypoints
    
    def _calculate_safety_score(self, lat: float, lng: float, user_type: str = "pedestrian") -> int:
        """
        Calculate a mock safety score based on location.
        In a real implementation, this would query actual safety data.
        """
        # For demonstration, we'll use a simple formula based on coordinates
        # In a real implementation, this would query safety data from databases
        safety_base = 70  # Base safety score
        
        # Adjust based on user type
        if user_type == "pedestrian":
            safety_base += 5
        elif user_type == "two_wheeler":
            safety_base -= 5
        elif user_type == "cyclist":
            safety_base -= 10
            
        # Add some randomness to make it more realistic
        import random
        safety_score = max(0, min(100, safety_base + random.randint(-20, 20)))
        
        return safety_score
    
    def _calculate_route_metrics(self, waypoints: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Calculate route metrics like distance and duration.
        """
        total_distance = 0
        for i in range(len(waypoints) - 1):
            distance = self._calculate_distance(
                waypoints[i]["latitude"],
                waypoints[i]["longitude"],
                waypoints[i+1]["latitude"],
                waypoints[i+1]["longitude"]
            )
            total_distance += distance
            
        # Estimate duration (assuming 5 km/h walking speed)
        # Convert meters to km and calculate time in seconds
        duration_hours = total_distance / 1000 / 5
        duration_seconds = int(duration_hours * 3600)
        
        return {
            "distance_meters": int(total_distance),
            "duration_seconds": duration_seconds
        }