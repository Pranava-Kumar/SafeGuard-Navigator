"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Shield, 
  Users, 
  AlertTriangle, 
  Route, 
  Eye, 
  Target
} from "lucide-react";

interface RoutePlannerProps {
  className?: string;
  onPlanRoute?: (origin: string, destination: string) => void;
}

export default function RoutePlanner({ 
  className = "w-full", 
  onPlanRoute 
}: RoutePlannerProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);

  const handlePlanRoute = async () => {
    if (!origin || !destination) return;
    
    setIsPlanning(true);
    
    try {
      // Simulate route planning
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onPlanRoute) {
        onPlanRoute(origin, destination);
      } else {
        // Default navigation to routes page
        window.location.href = `/routes?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
      }
    } catch (error) {
      console.error("Error planning route:", error);
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="h-5 w-5 mr-2 text-blue-600" />
          Plan Safe Route
        </CardTitle>
        <CardDescription>
          Find the safest path to your destination with real-time safety insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="origin">Starting Point</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="origin"
              placeholder="Enter starting location"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination">Destination</Label>
          <div className="relative">
            <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="destination"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handlePlanRoute}
          disabled={isPlanning || !origin || !destination}
        >
          {isPlanning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Planning Route...
            </>
          ) : (
            <>
              <Route className="h-4 w-4 mr-2" />
              Plan Safe Route
            </>
          )}
        </Button>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Safety-First Routing</span>
          </div>
          <p className="text-xs text-blue-800 mt-1">
            Our algorithm prioritizes safety over speed, avoiding dark spots and isolated areas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}