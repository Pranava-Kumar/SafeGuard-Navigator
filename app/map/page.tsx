"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Navigation, Lightbulb, Users, AlertTriangle, Route, Eye, Clock, Target, BarChart3 } from "lucide-react";
import EnhancedSafetyMap from "@/components/map/EnhancedSafetyMap";
import SafetyScoreDisplay from "@/components/map/SafetyScoreDisplay";

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [safetyScore, setSafetyScore] = useState<any | null>(null);

  const handleLocationSelect = async (location: [number, number]) => {
    setSelectedLocation(location);
    try {
      const response = await fetch(`/api/safety/enhanced/v2?lat=${location[0]}&lng=${location[1]}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSafetyScore({
            score: data.data.score,
            factors: {
              lighting: data.data.factors.lighting || 50,
              footfall: data.data.factors.footfall || 50,
              hazards: data.data.factors.hazards || 50,
              proximity_to_help: data.data.factors.proximityToHelp || 50
            }
          });
        }
      } else {
        setSafetyScore(null);
      }
    } catch (error) {
      console.error("Error fetching safety score:", error);
      setSafetyScore(null);
    }
  };

  const handlePlanRoute = (location: [number, number]) => {
    // Navigate to route planning with the selected location
    window.location.href = `/routes?dest=${location[0]},${location[1]}`;
  };

  const handleReportIssue = (location: [number, number]) => {
    // Navigate to incident reporting with the selected location
    window.location.href = `/emergency/alert/form?lat=${location[0]}&lng=${location[1]}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Map Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Safety Map</h1>
          <p className="text-gray-600">Real-time safety information and route planning for pedestrians and two-wheeler riders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Map Controls Sidebar */}
          <div className="lg:col-span-1 space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {safetyScore ? (
              <div className="space-y-6">
                <SafetyScoreDisplay score={safetyScore.score} factors={safetyScore.factors} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => handlePlanRoute(selectedLocation!)}>
                      <Navigation className="h-4 w-4 mr-2" />
                      Plan Safe Route
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => handleReportIssue(selectedLocation!)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report Issue
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Target className="h-5 w-5 mr-2 text-blue-600" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Incidents (30 days)</span>
                        <span className="font-medium">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Nearby Services</span>
                        <span className="font-medium">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated</span>
                        <span className="font-medium">2 min ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    Select a location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Click on the map to see the safety score of a location.</p>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Very Safe (80-100)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Safe (60-79)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span>Moderate (40-59)</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span>Unsafe (0-39)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <EnhancedSafetyMap 
              onLocationSelect={handleLocationSelect} 
              onPlanRoute={handlePlanRoute}
              onReportIssue={handleReportIssue}
              className="h-full min-h-[500px] w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}