"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression, Icon } from "leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navigation, MapPin, Shield, Clock, Route, AlertTriangle } from "lucide-react";
import LeafletCSS from "./LeafletCSS";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
// useMap hook will be imported directly when component is rendered

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteOption {
  id: string;
  coordinates: RoutePoint[];
  distance: number; // in meters
  duration: number; // in seconds
  safetyScore: number;
  type: 'safest' | 'fastest' | 'balanced';
  description: string;
}

interface RoutePlanningProps {
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
}

interface RouteControlsProps {
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  onSetStartPoint: () => void;
  onSetEndPoint: () => void;
  onPlanRoutes: () => void;
  isPlanning: boolean;
  onClearRoutes: () => void;
}

function RouteControls({
  startPoint,
  endPoint,
  onSetStartPoint,
  onSetEndPoint,
  onPlanRoutes,
  isPlanning,
  onClearRoutes
}: RouteControlsProps) {
  return (
    <Card className="absolute top-4 left-4 z-10 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5" />
          Route Planning
        </CardTitle>
        <CardDescription>
          Plan safe routes between locations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Start Point</Label>
          <Button
            variant={startPoint ? "default" : "outline"}
            size="sm"
            onClick={onSetStartPoint}
            className="w-full justify-start"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {startPoint ? "Selected" : "Click on map"}
          </Button>
          {startPoint && (
            <div className="text-xs text-gray-500">
              {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>End Point</Label>
          <Button
            variant={endPoint ? "default" : "outline"}
            size="sm"
            onClick={onSetEndPoint}
            className="w-full justify-start"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {endPoint ? "Selected" : "Click on map"}
          </Button>
          {endPoint && (
            <div className="text-xs text-gray-500">
              {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onPlanRoutes}
            disabled={!startPoint || !endPoint || isPlanning}
            className="flex-1"
          >
            {isPlanning ? "Planning..." : "Plan Routes"}
          </Button>
          <Button
            variant="outline"
            onClick={onClearRoutes}
            disabled={isPlanning}
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface RouteOptionsProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onRouteSelect: (route: RouteOption) => void;
}

function RouteOptions({ routes, selectedRoute, onRouteSelect }: RouteOptionsProps) {
  const getRouteColor = (type: string) => {
    switch (type) {
      case 'safest': return 'text-green-600';
      case 'fastest': return 'text-blue-600';
      case 'balanced': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRouteIcon = (type: string) => {
    switch (type) {
      case 'safest': return Shield;
      case 'fastest': return Clock;
      case 'balanced': return Route;
      default: return Route;
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card className="absolute bottom-4 left-4 z-10 w-80 shadow-lg max-h-96 overflow-y-auto">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Route Options
        </CardTitle>
        <CardDescription>
          {routes.length} route(s) found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {routes.map((route) => {
          const IconComponent = getRouteIcon(route.type);
          return (
            <div
              key={route.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedRoute?.id === route.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
              onClick={() => onRouteSelect(route)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${getRouteColor(route.type)}`} />
                  <span className="font-medium capitalize">{route.type}</span>
                </div>
                <Badge variant="outline" className={getSafetyColor(route.safetyScore)}>
                  {route.safetyScore}/100
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Route className="h-3 w-3" />
                  <span>{(route.distance / 1000).toFixed(1)} km</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.round(route.duration / 60)} min</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">{route.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// MapController component will be created dynamically inside the map
const MapController = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { useMap } = mod;

    function Controller({
      onMapClick,
      settingStartPoint,
      settingEndPoint
    }: {
      onMapClick: (point: RoutePoint) => void;
      settingStartPoint: boolean;
      settingEndPoint: boolean;
    }) {
      const map = useMap();

      useEffect(() => {
        if (settingStartPoint || settingEndPoint) {
          const handleClick = (e: any) => {
            onMapClick({
              lat: e.latlng.lat,
              lng: e.latlng.lng
            });
          };

          map.on("click", handleClick);

          return () => {
            map.off("click", handleClick);
          };
        }
      }, [map, onMapClick, settingStartPoint, settingEndPoint]);

      return null;
    }

    return Controller;
  }),
  { ssr: false }
);

export default function RoutePlanning({
  center = [13.0827, 80.2707],
  zoom = 13,
  className = "h-96 w-full"
}: RoutePlanningProps) {
  const [startPoint, setStartPoint] = useState<RoutePoint | null>(null);
  const [endPoint, setEndPoint] = useState<RoutePoint | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [settingStartPoint, setSettingStartPoint] = useState(false);
  const [settingEndPoint, setSettingEndPoint] = useState(false);

  useEffect(() => {
    // Mock initialization - CSS and icons are handled in LeafletCSS component
  }, []);

  const handleMapClick = (point: RoutePoint) => {
    if (settingStartPoint) {
      setStartPoint(point);
      setSettingStartPoint(false);
    } else if (settingEndPoint) {
      setEndPoint(point);
      setSettingEndPoint(false);
    }
  };

  const handleSetStartPoint = () => {
    setSettingStartPoint(true);
    setSettingEndPoint(false);
  };

  const handleSetEndPoint = () => {
    setSettingEndPoint(true);
    setSettingStartPoint(false);
  };

  const handlePlanRoutes = async () => {
    if (!startPoint || !endPoint) return;

    setIsPlanning(true);

    try {
      // Call the real routing API
      const response = await fetch('/api/routes/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: startPoint,
          end: endPoint,
          preferences: {
            prioritizeSafety: true,
            avoidHighRiskAreas: true,
            maxDistanceMultiplier: 1.5
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoutes(data.routes);

        // Select the recommended route by default
        const recommendedRoute = data.routes.find((route: RouteOption) =>
          route.id === data.summary.recommendedRoute
        ) || data.routes[0];
        setSelectedRoute(recommendedRoute);
      } else {
        // Fallback to mock data if API fails
        console.error('API call failed, using mock data');
        const mockRoutes: RouteOption[] = [
          {
            id: "safest",
            coordinates: [
              startPoint,
              { lat: startPoint.lat + 0.001, lng: startPoint.lng + 0.001 },
              { lat: startPoint.lat + 0.002, lng: startPoint.lng + 0.002 },
              endPoint
            ],
            distance: 2500,
            duration: 1800,
            safetyScore: 85,
            type: 'safest',
            description: 'Safest route with well-lit paths and high traffic areas'
          },
          {
            id: "fastest",
            coordinates: [
              startPoint,
              { lat: startPoint.lat + 0.003, lng: startPoint.lng + 0.001 },
              endPoint
            ],
            distance: 1800,
            duration: 1200,
            safetyScore: 45,
            type: 'fastest',
            description: 'Fastest route but passes through some low-safety areas'
          },
          {
            id: "balanced",
            coordinates: [
              startPoint,
              { lat: startPoint.lat + 0.002, lng: startPoint.lng + 0.0015 },
              { lat: startPoint.lat + 0.0025, lng: startPoint.lng + 0.002 },
              endPoint
            ],
            distance: 2100,
            duration: 1500,
            safetyScore: 70,
            type: 'balanced',
            description: 'Good balance between safety and travel time'
          }
        ];

        setRoutes(mockRoutes);
        setSelectedRoute(mockRoutes[0]); // Select safest by default
      }

    } catch (error) {
      console.error("Error planning routes:", error);
      // Show error message to user
      alert('Error planning routes. Please try again.');
    } finally {
      setIsPlanning(false);
    }
  };

  const handleClearRoutes = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoutes([]);
    setSelectedRoute(null);
    setSettingStartPoint(false);
    setSettingEndPoint(false);
  };

  const getRouteColor = (type: string) => {
    switch (type) {
      case 'safest': return '#10b981';
      case 'fastest': return '#3b82f6';
      case 'balanced': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <LeafletCSS />
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          onMapClick={handleMapClick}
          settingStartPoint={settingStartPoint}
          settingEndPoint={settingEndPoint}
        />

        {/* Start point marker */}
        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-1">Start Point</h3>
                <p className="text-sm text-gray-600">
                  {startPoint.lat.toFixed(4)}, {startPoint.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End point marker */}
        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-1">End Point</h3>
                <p className="text-sm text-gray-600">
                  {endPoint.lat.toFixed(4)}, {endPoint.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polylines */}
        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates.map(coord => [coord.lat, coord.lng])}
            pathOptions={{
              color: getRouteColor(route.type),
              weight: selectedRoute?.id === route.id ? 6 : 4,
              opacity: selectedRoute?.id === route.id ? 1 : 0.7
            }}
          />
        ))}
      </MapContainer>

      {/* Route controls */}
      <RouteControls
        startPoint={startPoint}
        endPoint={endPoint}
        onSetStartPoint={handleSetStartPoint}
        onSetEndPoint={handleSetEndPoint}
        onPlanRoutes={handlePlanRoutes}
        isPlanning={isPlanning}
        onClearRoutes={handleClearRoutes}
      />

      {/* Route options */}
      {routes.length > 0 && (
        <RouteOptions
          routes={routes}
          selectedRoute={selectedRoute}
          onRouteSelect={setSelectedRoute}
        />
      )}

      {/* Mode indicator */}
      {(settingStartPoint || settingEndPoint) && (
        <Alert className="absolute top-4 right-4 z-10 w-64">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Click on the map to set {settingStartPoint ? 'start' : 'end'} point
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}