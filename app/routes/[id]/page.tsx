"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Eye,
  Share,
  Download
} from "lucide-react";
import SafetyScoreDisplay from "@/components/SafetyScoreCard";
import EnhancedSafetyMap from "@/components/map/EnhancedSafetyMap";

export default function RouteDetailsPage({ params }: { params: { id: string } }) {
  const [routeData, setRouteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock route data for demonstration
  const mockRouteData = {
    id: params.id || "route-123",
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
      proximity_to_help: 82
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
    polyline: "mock_polyline_data_for_map_rendering"
  };

  useEffect(() => {
    // Simulate fetching route data
    setTimeout(() => {
      setRouteData(mockRouteData);
      setLoading(false);
    }, 1000);
  }, [params.id]);

  const handleShareRoute = () => {
    // Implement share functionality
    navigator.clipboard.writeText(window.location.href);
    alert("Route link copied to clipboard!");
  };

  const handleDownloadRoute = () => {
    // Implement download functionality
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(routeData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `route-${routeData.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleReportIssue = (location: [number, number]) => {
    // Navigate to incident reporting with the selected location
    window.location.href = `/emergency/alert/form?lat=${location[0]}&lng=${location[1]}`;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading route details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">SafeRoute</span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                  <a href="/about" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</a>
                  <a href="/map" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Map</a>
                  <a href="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                  <a href="/routes" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Routes</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Route Details Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Route Details</h1>
              <p className="text-gray-600">Detailed information about your planned journey</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleShareRoute}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDownloadRoute}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {routeData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Route Information */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Journey Summary</CardTitle>
                  <CardDescription>Overview of your planned route</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{routeData.start.name}</div>
                      <div className="text-sm text-gray-600">Start Point</div>
                    </div>
                    <Navigation className="h-5 w-5 text-gray-400" />
                    <div className="text-right">
                      <div className="font-medium">{routeData.end.name}</div>
                      <div className="text-sm text-gray-600">Destination</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Target className="h-4 w-4 mr-1" />
                        Distance
                      </div>
                      <div className="text-lg font-bold">{routeData.distance}</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Clock className="h-4 w-4 mr-1" />
                        Duration
                      </div>
                      <div className="text-lg font-bold">{routeData.duration}</div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg border ${getSafetyColor(routeData.safetyScore)}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Safety Score</span>
                      <span className="text-2xl font-bold">{routeData.safetyScore}/100</span>
                    </div>
                    <div className="mt-2 text-sm font-medium">{getSafetyLevel(routeData.safetyScore)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Score Card */}
              <SafetyScoreDisplay 
                score={routeData.safetyScore} 
                factors={routeData.safetyFactors} 
              />

              {/* Alternative Routes */}
              <Card>
                <CardHeader>
                  <CardTitle>Alternative Routes</CardTitle>
                  <CardDescription>Other options with different safety profiles</CardDescription>
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
            </div>

            {/* Route Visualization */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Route Visualization</CardTitle>
                  <CardDescription>Interactive map showing your planned route and safety information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <EnhancedSafetyMap 
                      center={[routeData.start.lat, routeData.start.lng]}
                      onReportIssue={handleReportIssue}
                    />
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 flex items-center">
                      <Navigation className="h-4 w-4 mr-2" />
                      Route Instructions
                    </h3>
                    <ol className="mt-2 space-y-2 text-sm text-blue-800">
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                        <span>Head north on Main Street for 200 meters</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                        <span>Turn right onto Park Avenue</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                        <span>Continue straight for 1.5 km</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                        <span>Turn left onto Business Road</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">5</span>
                        <span>Your destination will be on the right</span>
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
              
              {/* Safety Tips */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Safety Tips for Your Journey
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                        <Shield className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Stay on well-lit paths, especially during evening hours</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                        <Users className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Walk in groups when possible, especially in less populated areas</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                        <Heart className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Keep emergency contacts readily accessible</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                        <BarChart3 className="h-3 w-3 text-green-600" />
                      </div>
                      <span>Check the route safety score before departure</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}