"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Navigation, Lightbulb, Users, AlertTriangle, Route, Eye, Clock, Target } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SafetyMap from "@/components/map/SafetyMap";
import SafetyScoreDisplay from "@/components/map/SafetyScoreDisplay";

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [safetyScore, setSafetyScore] = useState<any | null>(null);

  const handleLocationSelect = async (location: [number, number]) => {
    setSelectedLocation(location);
    try {
      const response = await fetch(`/api/v1/safety/score?lat=${location[0]}&lon=${location[1]}`);
      if (response.ok) {
        const data = await response.json();
        setSafetyScore(data);
      } else {
        setSafetyScore(null);
      }
    } catch (error) {
      console.error("Error fetching safety score:", error);
      setSafetyScore(null);
    }
  };

  return (
    <ProtectedRoute>
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
                    <a href="/map" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Map</a>
                    <a href="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                    <a href="/analytics" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Analytics</a>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    English
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Map Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interactive Safety Map</h1>
            <p className="text-gray-600">Real-time safety information and route planning for pedestrians and two-wheeler riders</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Controls Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {safetyScore ? (
                <SafetyScoreDisplay score={safetyScore.score} factors={safetyScore.factors} />
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
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Map Area */}
            <div className="lg:col-span-3">
              <SafetyMap onLocationSelect={handleLocationSelect} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}