"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, Route, AlertTriangle, Clock, Calculator } from "lucide-react";

interface RouteInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoute: (routeData: RouteData) => void;
}

interface RouteData {
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  safetyScore: number;
  routeType: string;
}

export default function RouteInputModal({ isOpen, onClose, onSaveRoute }: RouteInputModalProps) {
  const [formData, setFormData] = useState({
    startLocation: "",
    endLocation: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<RouteData | null>(null);
  const [error, setError] = useState("");

  const handleAnalyzeRoute = async () => {
    if (!formData.startLocation || !formData.endLocation) {
      setError("Please fill in both start and end locations");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      // Simulate API call to analyze route
      // In a real app, this would call a geocoding and routing API
      setTimeout(() => {
        // Mock analysis results
        const mockResult: RouteData = {
          startLocation: formData.startLocation,
          endLocation: formData.endLocation,
          distance: Math.floor(Math.random() * 5000) + 1000, // 1-6 km
          duration: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
          safetyScore: Math.floor(Math.random() * 40) + 60, // 60-100
          routeType: Math.random() > 0.5 ? "safest" : "balanced"
        };
        
        setAnalysisResult(mockResult);
        setIsAnalyzing(false);
      }, 2000);
    } catch (err) {
      setError("Failed to analyze route. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleSaveRoute = () => {
    if (analysisResult) {
      onSaveRoute(analysisResult);
      onClose();
      // Reset form
      setFormData({ startLocation: "", endLocation: "" });
      setAnalysisResult(null);
    }
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: "Very Safe", color: "text-green-600", bgColor: "bg-green-50" };
    if (score >= 60) return { level: "Safe", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    if (score >= 40) return { level: "Moderate", color: "text-orange-600", bgColor: "bg-orange-50" };
    return { level: "Unsafe", color: "text-red-600", bgColor: "bg-red-50" };
  };

  if (!isOpen) return null;

  const safetyInfo = analysisResult ? getSafetyLevel(analysisResult.safetyScore) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Plan New Route
          </CardTitle>
          <CardDescription>
            Enter your route details to analyze safety and get recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startLocation">Start Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="startLocation"
                  type="text"
                  placeholder="Enter start location"
                  value={formData.startLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, startLocation: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endLocation">End Location</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="endLocation"
                  type="text"
                  placeholder="Enter destination"
                  value={formData.endLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, endLocation: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {!analysisResult ? (
            <Button 
              onClick={handleAnalyzeRoute} 
              className="w-full" 
              disabled={isAnalyzing || !formData.startLocation || !formData.endLocation}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing Route...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze Route
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-blue-900">Route Analysis Results</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(analysisResult.distance / 1000).toFixed(1)} km
                    </div>
                    <div className="text-xs text-gray-600">Distance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(analysisResult.duration / 60)} min
                    </div>
                    <div className="text-xs text-gray-600">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${safetyInfo?.color}`}>
                      {analysisResult.safetyScore}/100
                    </div>
                    <div className="text-xs text-gray-600">Safety Score</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {analysisResult.routeType}
                    </Badge>
                    <div className="text-xs text-gray-600 mt-1">Route Type</div>
                  </div>
                </div>

                <div className={`p-3 rounded-lg ${safetyInfo?.bgColor}`}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`h-4 w-4 ${safetyInfo?.color}`} />
                    <span className={`font-medium ${safetyInfo?.color}`}>
                      Safety Level: {safetyInfo?.level}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveRoute} className="flex-1">
                  Save Route
                </Button>
                <Button variant="outline" onClick={() => {
                  setAnalysisResult(null);
                  setError("");
                }}>
                  Re-analyze
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}