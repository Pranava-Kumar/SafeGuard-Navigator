"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Route, 
  AlertTriangle, 
  Shield, 
  Users,
  Eye,
  Phone,
  Camera,
  Lightbulb,
  Activity,
  TrendingUp
} from "lucide-react";

interface RouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: {
    id: string;
    startLocation: string;
    endLocation: string;
    distance: number;
    duration: number;
    safetyScore: number;
    date: string;
    routeType: string;
  };
}

export default function RouteDetailsModal({ isOpen, onClose, routeData }: RouteDetailsModalProps) {
  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: "Very Safe", color: "text-green-600", bgColor: "bg-green-50", icon: Shield };
    if (score >= 60) return { level: "Safe", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: Shield };
    if (score >= 40) return { level: "Moderate", color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertTriangle };
    return { level: "Unsafe", color: "text-red-600", bgColor: "bg-red-50", icon: AlertTriangle };
  };

  const safetyInfo = getSafetyLevel(routeData.safetyScore);
  const SafetyIcon = safetyInfo.icon;

  // Mock detailed safety factors
  const safetyFactors = [
    { factor: "Lighting", score: 85, icon: Lightbulb },
    { factor: "Traffic", score: 70, icon: Activity },
    { factor: "Surveillance", score: 60, icon: Eye },
    { factor: "People Density", score: 75, icon: Users },
    { factor: "Emergency Access", score: 90, icon: Phone },
    { factor: "Crime Rate", score: 80, icon: AlertTriangle }
  ];

  // Mock route highlights
  const routeHighlights = [
    { type: "safety", description: "Well-lit main roads throughout", icon: Shield },
    { type: "warning", description: "Heavy traffic between 5-7 PM", icon: Activity },
    { type: "info", description: "Multiple emergency services nearby", icon: Phone },
    { type: "safety", description: "High CCTV coverage area", icon: Camera }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Route Details
              </CardTitle>
              <CardDescription>
                Comprehensive analysis of your route from {routeData.startLocation} to {routeData.endLocation}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Route Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(routeData.distance / 1000).toFixed(1)} km
              </div>
              <div className="text-sm text-gray-600">Distance</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(routeData.duration / 60)} min
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: safetyInfo.bgColor }}>
              <div className={`text-2xl font-bold ${safetyInfo.color}`}>
                {routeData.safetyScore}/100
              </div>
              <div className="text-sm text-gray-600">Safety Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Badge variant="outline" className="text-xs">
                {routeData.routeType}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">Route Type</div>
            </div>
          </div>

          {/* Safety Overview */}
          <div className={`p-4 rounded-lg ${safetyInfo.bgColor}`}>
            <div className="flex items-center gap-3 mb-3">
              <SafetyIcon className={`h-6 w-6 ${safetyInfo.color}`} />
              <div>
                <h3 className="font-semibold text-lg">Safety Assessment</h3>
                <p className={`text-sm ${safetyInfo.color}`}>
                  Overall safety level: {safetyInfo.level}
                </p>
              </div>
            </div>
            <Progress value={routeData.safetyScore} className="w-full h-2" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Safety Factors Breakdown */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Safety Factors Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {safetyFactors.map((factor, index) => {
                const FactorIcon = factor.icon;
                const getFactorColor = (score: number) => {
                  if (score >= 80) return "text-green-600";
                  if (score >= 60) return "text-yellow-600";
                  return "text-red-600";
                };
                const factorColor = getFactorColor(factor.score);
                
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <FactorIcon className={`h-5 w-5 ${factorColor}`} />
                      <span className="font-medium">{factor.factor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={factor.score} className="flex-1 h-2" />
                      <span className={`text-sm font-medium ${factorColor}`}>
                        {factor.score}%
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Route Highlights */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Route Highlights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routeHighlights.map((highlight, index) => {
                const getHighlightColor = (type: string) => {
                  switch (type) {
                    case "safety": return "text-green-600 bg-green-50";
                    case "warning": return "text-yellow-600 bg-yellow-50";
                    case "info": return "text-blue-600 bg-blue-50";
                    default: return "text-gray-600 bg-gray-50";
                  }
                };
                const HighlightIcon = highlight.icon;
                const highlightColor = getHighlightColor(highlight.type);
                
                return (
                  <Card key={index} className={`p-4 ${highlightColor.split(' ')[1]}`}>
                    <div className="flex items-start gap-3">
                      <HighlightIcon className={`h-5 w-5 mt-0.5 ${highlightColor.split(' ')[0]}`} />
                      <div>
                        <p className="text-sm font-medium">{highlight.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1">
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
            <Button variant="outline" className="flex-1">
              <MapPin className="h-4 w-4 mr-2" />
              View on Map
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}