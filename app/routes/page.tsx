"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  MapPin, 
  Navigation, 
  Clock, 
  Target,
  Loader2,
  Users,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Filter,
  Settings,
  Download,
  Share2,
  Star,
  Eye,
  EyeOff,
  Zap,
  Route
} from "lucide-react";
import EnhancedSafetyMap from "@/components/map/EnhancedSafetyMap";
import SafetyScoreDisplay from "@/components/map/SafetyScoreDisplay";

export default function EnhancedRoutePlanningPage() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeData, setRouteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentRoutes, setRecentRoutes] = useState<Array<{start: string, end: string, timestamp: number}>>([]);
  const [userPreferences, setUserPreferences] = useState({
    safetyPriority: 75,
    timeOfDay: "evening",
    weather: "clear",
    userType: "pedestrian",
    avoidHazards: true,
    preferWellLit: true
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [mapView, setMapView] = useState<"route" | "safety">("route");
  const [selectedRoute, setSelectedRoute] = useState<string>("balanced-1"); // Add this state

  // Load recent routes from localStorage
  useEffect(() => {
    const savedRoutes = localStorage.getItem("recentRoutes");
    if (savedRoutes) {
      try {
        const routes = JSON.parse(savedRoutes);
        // Sort by timestamp (most recent first) and limit to 10
        const sorted = routes.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 10);
        setRecentRoutes(sorted);
      } catch (e) {
        console.error("Error parsing recent routes", e);
      }
    }
    
    // Check if there's a destination parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const destParam = urlParams.get("dest");
    if (destParam) {
      const coords = destParam.split(",").map(Number);
      if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        // Reverse geocode these coordinates to get a readable address
        reverseGeocodeCoordinates(coords[0], coords[1]).then(address => {
          if (address) {
            setEndLocation(address);
          } else {
            setEndLocation(`Location at ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`);
          }
        });
      }
    }
  }, []);

  // Auto-save recent routes
  useEffect(() => {
    if (recentRoutes.length > 0) {
      localStorage.setItem("recentRoutes", JSON.stringify(recentRoutes));
    }
  }, [recentRoutes]);

  // Function to reverse geocode coordinates
  const reverseGeocodeCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(`/api/backend/geocoding/reverse-geocode?lat=${lat}&lon=${lng}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result) {
          return data.result.display_name || `${data.result.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error reverse geocoding coordinates:", error);
      return null;
    }
  };

  // Mock route data for demonstration
  const mockRouteData = {
    id: "route-123",
    start: {
      name: "Home",
      lat: 13.0827,
      lng: 80.2707
    },
    end: {
      name: "Office",
      lat: 13.0398,
      lng: 80.2342
    },
    distance: "5.2 km",
    duration: "18 min",
    safetyScore: 87,
    waypoints: [
      { latitude: 13.0820, longitude: 80.2700, safetyScore: 85 },
      { latitude: 13.0750, longitude: 80.2600, safetyScore: 92 },
      { latitude: 13.0600, longitude: 80.2500, safetyScore: 78 },
      { latitude: 13.0450, longitude: 80.2400, safetyScore: 88 }
    ],
    safetyFactors: {
      lighting: { score: 85, weight: 0.25 },
      footfall: { score: 90, weight: 0.30 },
      hazards: { score: 15, weight: 0.20 },
      proximity: { score: 82, weight: 0.25 }
    },
    // Define the three route options
    safest: {
      id: "safest-1",
      name: "Safest Route",
      type: "safest",
      duration: "22 min",
      safetyScore: 94,
      path: [
        [13.0827, 80.2707],
        [13.0820, 80.2700],
        [13.0750, 80.2600],
        [13.0600, 80.2500],
        [13.0450, 80.2400],
        [13.0398, 80.2342]
      ]
    },
    fastest: {
      id: "fastest-1",
      name: "Fastest Route",
      type: "fastest",
      duration: "15 min",
      safetyScore: 72,
      path: [
        [13.0827, 80.2707],
        [13.0700, 80.2600],
        [13.0500, 80.2400],
        [13.0398, 80.2342]
      ]
    },
    balanced: {
      id: "balanced-1",
      name: "Balanced Route",
      type: "balanced",
      duration: "18 min",
      safetyScore: 87,
      path: [
        [13.0827, 80.2707],
        [13.0750, 80.2600],
        [13.0550, 80.2500],
        [13.0450, 80.2400],
        [13.0398, 80.2342]
      ]
    },
    alternatives: [
      {
        id: "alt-1",
        name: "Fastest Route",
        duration: "15 min",
        safetyScore: 72,
        description: "Shorter but passes through less populated areas"
      },
      {
        id: "alt-2",
        name: "Safest Route",
        duration: "22 min",
        safetyScore: 94,
        description: "Well-lit with high footfall throughout"
      }
    ],
    metadata: {
      lastUpdated: new Date().toLocaleString(),
      dataSources: ["Satellite Data", "Community Reports", "Municipal Records"],
      confidence: "High"
    }
  };

  const handleLocationSelect = (location: [number, number]) => {
    // Handle location selection from the map
    console.log("Selected location:", location);
  };

  const handlePlanRouteFromMap = (location: [number, number]) => {
    // Handle route planning initiated from the map
    console.log("Plan route to:", location);
  };

  const handleReportIssue = (location: [number, number]) => {
    // Handle issue reporting from the map
    console.log("Report issue at:", location);
  };

  const handlePlanRoute = async () => {
    if (!startLocation || !endLocation) {
      setError("Please enter both start and end locations");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Save to recent routes with timestamp
      const newRoute = { start: startLocation, end: endLocation, timestamp: Date.now() };
      const updatedRoutes = [newRoute, ...recentRoutes.filter(route => 
        route.start !== startLocation || route.end !== endLocation
      )].slice(0, 10); // Keep only last 10 routes
      
      setRecentRoutes(updatedRoutes);
      
      const startResponse = await fetch(`/api/backend/geocoding/geocode?q=${encodeURIComponent(startLocation)}&countrycodes=IN`);
      let startCoords;
      
      if (startResponse.ok) {
        const startData = await startResponse.json();
        if (startData.success && startData.results && startData.results.length > 0) {
          const firstResult = startData.results[0];
          startCoords = { latitude: firstResult.latitude, longitude: firstResult.longitude };
        }
      }
      
      // If geocoding failed, use default Chennai coordinates
      if (!startCoords) {
        startCoords = { latitude: 13.0827, longitude: 80.2707 }; // Chennai central
      }
      
      // Geocode end location
      const endResponse = await fetch(`/api/backend/geocoding/geocode?q=${encodeURIComponent(endLocation)}&countrycodes=IN`);
      let endCoords;
      
      if (endResponse.ok) {
        const endData = await endResponse.json();
        if (endData.success && endData.results && endData.results.length > 0) {
          const firstResult = endData.results[0];
          endCoords = { latitude: firstResult.latitude, longitude: firstResult.longitude };
        }
      }
      
      // If geocoding failed, use default Chennai coordinates
      if (!endCoords) {
        endCoords = { latitude: 13.0398, longitude: 80.2342 }; // T Nagar
      }
      
      const response = await fetch(`/api/backend/routes/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start: startCoords,
          end: endCoords,
          user_type: userPreferences.userType,
          safety_preference: userPreferences.safetyPriority,
          time_of_day: userPreferences.timeOfDay,
          weather_condition: userPreferences.weather,
          avoid_factors: userPreferences.avoidHazards ? ["hazards"] : []
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform the response to match the expected format
        const route = data.routes[0];
        const transformedData = {
          id: route.id,
          start: {
            name: "Start Location",
            lat: route.start.latitude,
            lng: route.start.longitude
          },
          end: {
            name: "End Location", 
            lat: route.end.latitude,
            lng: route.end.longitude
          },
          distance: `${(route.distance_meters / 1000).toFixed(2)} km`,
          duration: `${Math.floor(route.duration_seconds / 60)} min ${route.duration_seconds % 60} sec`,
          safetyScore: route.safety_score,
          waypoints: route.waypoints,
          safetyFactors: data.safety_analysis.factors,
          // Define the three route options
          safest: {
            id: data.alternatives.safest.id,
            name: "Safest Route",
            type: "safest",
            duration: `${Math.floor(data.alternatives.safest.duration_seconds / 60)} min ${data.alternatives.safest.duration_seconds % 60} sec`,
            safetyScore: data.alternatives.safest.safety_score,
            path: data.alternatives.safest.waypoints ? data.alternatives.safest.waypoints.map((wp: any) => [wp.latitude, wp.longitude]) : []
          },
          fastest: {
            id: data.alternatives.fastest.id,
            name: "Fastest Route",
            type: "fastest",
            duration: `${Math.floor(data.alternatives.fastest.duration_seconds / 60)} min ${data.alternatives.fastest.duration_seconds % 60} sec`,
            safetyScore: data.alternatives.fastest.safety_score,
            path: data.alternatives.fastest.waypoints ? data.alternatives.fastest.waypoints.map((wp: any) => [wp.latitude, wp.longitude]) : []
          },
          balanced: {
            id: data.alternatives.balanced.id,
            name: "Balanced Route",
            type: "balanced",
            duration: `${Math.floor(data.alternatives.balanced.duration_seconds / 60)} min ${data.alternatives.balanced.duration_seconds % 60} sec`,
            safetyScore: data.alternatives.balanced.safety_score,
            path: data.alternatives.balanced.waypoints ? data.alternatives.balanced.waypoints.map((wp: any) => [wp.latitude, wp.longitude]) : []
          },
          alternatives: Object.entries(data.alternatives).map(([key, alt]: [string, any]) => ({
            id: alt.id,
            name: key.charAt(0).toUpperCase() + key.slice(1) + " Route",
            duration: `${Math.floor(alt.duration_seconds / 60)} min ${alt.duration_seconds % 60} sec`,
            safetyScore: alt.safety_score,
            description: alt.description || `Alternative ${key} route`
          })),
          metadata: {
            lastUpdated: new Date().toLocaleString(),
            dataSources: data.metadata?.dataSources || ["Satellite Data", "Community Reports", "Municipal Records"],
            confidence: data.metadata?.confidence || "High"
          }
        };
        
        setRouteData(transformedData);
        setSelectedRoute("balanced-1"); // Set balanced as default
      } else {
        // Fallback to mock data if API fails
        setRouteData(mockRouteData);
        setSelectedRoute("balanced-1"); // Set balanced as default
        setError("Using demo data due to API error");
      }
    } catch (error) {
      console.error('Error planning route:', error);
      // Fallback to mock data if API fails
      setRouteData(mockRouteData);
      setError("Using demo data due to network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
  };

  const handleUseRoute = (routeId: string) => {
    // Navigate to the specific route details page
    window.location.href = `/routes/${routeId}`;
  };

  const updateSelectedRoute = (routeId: string) => {
    if (routeData) {
      setRouteData({
        ...routeData,
        selectedRoute: routeId
      });
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return "Very Safe";
    if (score >= 60) return "Safe";
    if (score >= 40) return "Moderate";
    return "Unsafe";
  };

  const getSafetyBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    if (score >= 40) return "outline";
    return "destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Route Planning Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Planning</h1>
          <p className="text-gray-600">Plan your safest journey with real-time safety information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Route Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plan Your Route</CardTitle>
                <CardDescription>Enter start and end locations to find the safest path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="start"
                      placeholder="Enter start location"
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end">End Location</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="end"
                      placeholder="Enter destination"
                      value={endLocation}
                      onChange={(e) => setEndLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvancedOptions ? "Hide" : "Show"} Options
                  </Button>
                  <Badge variant="secondary">Safety Priority: {userPreferences.safetyPriority}%</Badge>
                </div>
                
                {showAdvancedOptions && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-gray-900">Route Preferences</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm">Safety Priority</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">Speed</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={userPreferences.safetyPriority}
                            onChange={(e) => setUserPreferences({...userPreferences, safetyPriority: parseInt(e.target.value)})}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-500">Safety</span>
                        </div>
                        <div className="text-right text-sm font-medium">{userPreferences.safetyPriority}%</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Time of Day</Label>
                        <select
                          value={userPreferences.timeOfDay}
                          onChange={(e) => setUserPreferences({...userPreferences, timeOfDay: e.target.value})}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                          <option value="night">Night</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-sm">Weather</Label>
                        <select
                          value={userPreferences.weather}
                          onChange={(e) => setUserPreferences({...userPreferences, weather: e.target.value})}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        >
                          <option value="clear">Clear</option>
                          <option value="rainy">Rainy</option>
                          <option value="foggy">Foggy</option>
                          <option value="stormy">Stormy</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label className="text-sm">User Type</Label>
                        <select
                          value={userPreferences.userType}
                          onChange={(e) => setUserPreferences({...userPreferences, userType: e.target.value})}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                        >
                          <option value="pedestrian">Pedestrian</option>
                          <option value="two_wheeler">Two-Wheeler Rider</option>
                          <option value="cyclist">Cyclist</option>
                          <option value="public_transport">Public Transport</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="avoidHazards"
                          checked={userPreferences.avoidHazards}
                          onChange={(e) => setUserPreferences({...userPreferences, avoidHazards: e.target.checked})}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <Label htmlFor="avoidHazards" className="text-sm">Avoid Known Hazards</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="preferWellLit"
                          checked={userPreferences.preferWellLit}
                          onChange={(e) => setUserPreferences({...userPreferences, preferWellLit: e.target.checked})}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                        <Label htmlFor="preferWellLit" className="text-sm">Prefer Well-Lit Areas</Label>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <Button 
                  className="w-full" 
                  onClick={handlePlanRoute}
                  disabled={isLoading || !startLocation || !endLocation}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Planning Route...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4 mr-2" />
                      Plan Safe Route
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Recent Routes */}
            {recentRoutes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Routes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentRoutes.map((route, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setStartLocation(route.start);
                          setEndLocation(route.end);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium truncate">{route.start}</div>
                            <div className="flex items-center text-gray-500 mt-1">
                              <Navigation className="h-3 w-3 mr-1" />
                              <span className="truncate">{route.end}</span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(route.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Information */}
            {routeData && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-blue-600" />
                      Route Safety
                    </CardTitle>
                    <CardDescription>Overall safety assessment for your planned route</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`p-4 rounded-lg border ${getSafetyColor(routeData.safetyScore)}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Safety Score</span>
                        <span className="text-2xl font-bold">{routeData.safetyScore}/100</span>
                      </div>
                      <div className="mt-2 text-sm font-medium">{getSafetyLevel(routeData.safetyScore)}</div>
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Distance</span>
                        <span className="text-sm font-medium">{routeData.distance}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="text-sm font-medium">{routeData.duration}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Waypoints</span>
                        <span className="text-sm font-medium">{routeData.waypoints.length}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Safety Factors</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Lighting</span>
                          <span className="text-sm font-medium">{routeData.safetyFactors.lighting.score}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Footfall</span>
                          <span className="text-sm font-medium">{routeData.safetyFactors.footfall.score}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Hazards</span>
                          <span className="text-sm font-medium">{routeData.safetyFactors.hazards.score}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Proximity to Help</span>
                          <span className="text-sm font-medium">{routeData.safetyFactors.proximity.score}/100</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">{routeData.metadata?.lastUpdated}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Confidence</span>
                        <Badge variant="secondary">{routeData.metadata?.confidence}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Route Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-blue-600" />
                      Route Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full">
                      <Navigation className="h-4 w-4 mr-2" />
                      Start Navigation
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Route
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Save Route
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Route Alternatives */}
            {routeData && routeData.alternatives && (
              <Card>
                <CardHeader>
                  <CardTitle>Alternative Routes</CardTitle>
                  <CardDescription>Other route options with different safety profiles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {routeData.alternatives.map((alt: any) => (
                    <div key={alt.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{alt.name}</h4>
                          <p className="text-xs text-gray-500">{alt.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getSafetyBadgeVariant(alt.safetyScore)}>
                            {alt.safetyScore} Safety
                          </Badge>
                          <div className="text-xs text-gray-500 mt-1">{alt.duration}</div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 w-full"
                        onClick={() => handleUseRoute(alt.id)}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Use This Route
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Route Selection Info */}
            {routeData && (
              <Card>
                <CardHeader>
                  <CardTitle>Route Information</CardTitle>
                  <CardDescription>Details about the currently selected route</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedRoute === "safest-1" && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Safest Route Selected</span>
                      </div>
                      <p className="mt-2 text-sm text-green-700">
                        This route prioritizes your safety above all else, avoiding poorly lit areas and 
                        ensuring high footfall throughout your journey. It may take longer but provides 
                        the highest level of personal security.
                      </p>
                    </div>
                  )}
                  {selectedRoute === "fastest-1" && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <Zap className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">Fastest Route Selected</span>
                      </div>
                      <p className="mt-2 text-sm text-blue-700">
                        This route gets you to your destination as quickly as possible. While still safe, 
                        it may pass through areas with less lighting or foot traffic to optimize for speed.
                      </p>
                    </div>
                  )}
                  {selectedRoute === "balanced-1" && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center">
                        <Route className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium text-purple-800">Balanced Route Selected</span>
                      </div>
                      <p className="mt-2 text-sm text-purple-700">
                        This route provides an optimal balance between safety and speed. It considers 
                        multiple factors to give you a secure journey without significantly increasing 
                        your travel time.
                      </p>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">How Routes Are Calculated</h4>
                    <p className="text-sm text-gray-600">
                      Our route algorithm uses real-time data including lighting conditions, footfall patterns, 
                      hazard reports, proximity to help services, and historical safety data to calculate 
                      the safest path for your journey.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="outline">Lighting: 25%</Badge>
                      <Badge variant="outline">Footfall: 30%</Badge>
                      <Badge variant="outline">Hazards: 20%</Badge>
                      <Badge variant="outline">Help Proximity: 25%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map and Route Visualization */}
          <div className="lg:col-span-2 h-[calc(100vh-12rem)]">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Route Visualization</CardTitle>
                    <CardDescription>Interactive map showing your planned route and safety information</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant={mapView === "route" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setMapView("route")}
                    >
                      <Route className="h-4 w-4 mr-1" />
                      Route
                    </Button>
                    <Button 
                      variant={mapView === "safety" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setMapView("safety")}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Safety
                    </Button>
                  </div>
                </div>
                {routeData && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button 
                      variant={selectedRoute === "safest-1" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRoute("safest-1")}
                      className="flex items-center"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Safest
                    </Button>
                    <Button 
                      variant={selectedRoute === "fastest-1" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRoute("fastest-1")}
                      className="flex items-center"
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Fastest
                    </Button>
                    <Button 
                      variant={selectedRoute === "balanced-1" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRoute("balanced-1")}
                      className="flex items-center"
                    >
                      <Route className="h-4 w-4 mr-1" />
                      Balanced
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="h-full">
                  <EnhancedSafetyMap 
                    onLocationSelect={handleLocationSelect}
                    onPlanRoute={handlePlanRouteFromMap}
                    onReportIssue={handleReportIssue}
                    className="h-full min-h-[400px]"
                    showSafetyCircles={mapView === "safety"}
                    routes={routeData ? [routeData.safest, routeData.fastest, routeData.balanced] : []}
                    selectedRoute={selectedRoute}
                    onRouteSelect={setSelectedRoute}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}