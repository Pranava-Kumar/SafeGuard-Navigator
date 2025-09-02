"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  MapPin, 
  Navigation, 
  Clock, 
  Users, 
  AlertTriangle, 
  Heart,
  Target,
  BarChart3,
  Eye
} from "lucide-react";
import EnhancedSafetyMap from "@/components/map/EnhancedSafetyMap";

export default function RoutePlanningPage() {
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [routeData, setRouteData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      { lat: 13.0820, lng: 80.2700, safetyScore: 85 },
      { lat: 13.0750, lng: 80.2600, safetyScore: 92 },
      { lat: 13.0600, lng: 80.2500, safetyScore: 78 },
      { lat: 13.0450, lng: 80.2400, safetyScore: 88 }
    ],
    safetyFactors: {
      lighting: 85,
      footfall: 90,
      hazards: 15,
      proximityToHelp: 82
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
    ]
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
    if (!startLocation || !endLocation) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, we would geocode the locations
      // For now, we'll use fixed coordinates for demonstration
      const startCoords = { lat: 13.0827, lng: 80.2707 }; // Chennai central
      const endCoords = { lat: 13.0398, lng: 80.2342 }; // T Nagar
      
      const response = await fetch('/api/routes/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start: startCoords,
          end: endCoords,
          preferences: {
            safetyPreference: 75, // Prioritize safety
            timeOfTravel: 'evening',
            transportMode: 'walking'
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform the response to match the expected format
        const transformedData = {
          id: data.summary.recommendedRoute,
          start: startCoords,
          end: endCoords,
          distance: `${Math.round(data.routes[0].distance / 1000 * 100) / 100} km`,
          duration: `${Math.round(data.routes[0].duration / 60)} min`,
          safetyScore: data.routes[0].safetyScore,
          waypoints: data.routes[0].coordinates,
          safetyFactors: data.routes[0].safetyFactors,
          alternatives: data.routes.map((route: any) => ({
            id: route.id,
            name: route.type === 'safest' ? 'Safest Route' : route.type === 'fastest' ? 'Fastest Route' : 'Balanced Route',
            duration: `${Math.round(route.duration / 60)} min`,
            safetyScore: route.safetyScore,
            description: route.description
          }))
        };
        setRouteData(transformedData);
      } else {
        // Fallback to mock data if API fails
        setRouteData(mockRouteData);
      }
    } catch (error) {
      console.error('Error planning route:', error);
      // Fallback to mock data if API fails
      setRouteData(mockRouteData);
    } finally {
      setIsLoading(false);
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
                
                <Button 
                  className="w-full" 
                  onClick={handlePlanRoute}
                  disabled={isLoading || !startLocation || !endLocation}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

            {/* Safety Information */}
            {routeData && (
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
                        <span className="text-sm font-medium">{routeData.safetyFactors.lighting}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Footfall</span>
                        <span className="text-sm font-medium">{routeData.safetyFactors.footfall}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Hazards</span>
                        <span className="text-sm font-medium">{routeData.safetyFactors.hazards}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Proximity to Help</span>
                        <span className="text-sm font-medium">{routeData.safetyFactors.proximityToHelp}/100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSafetyColor(alt.safetyScore)}`}>
                            {alt.safetyScore}
                          </div>
                          <div className="text-xs text-gray-500">{alt.duration}</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2 w-full">
                        <Navigation className="h-3 w-3 mr-1" />
                        Use This Route
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Map and Route Visualization */}
          <div className="lg:col-span-2 h-[calc(100vh-12rem)]">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Route Visualization</CardTitle>
                <CardDescription>Interactive map showing your planned route and safety information</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="h-full">
                  <EnhancedSafetyMap 
                    onLocationSelect={handleLocationSelect}
                    onPlanRoute={handlePlanRouteFromMap}
                    onReportIssue={handleReportIssue}
                    className="h-full min-h-[400px]"
                    showSafetyCircles={false}
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