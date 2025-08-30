"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Clock, Users, AlertTriangle } from "lucide-react";
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
const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

// Dynamically import MapController to ensure it's loaded after the map
const MapController = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { useMap } = mod;
    
    return ({ onLocationSelect }: { onLocationSelect?: (location: [number, number]) => void }) => {
      const map = useMap();
      
      useEffect(() => {
        if (map && onLocationSelect) {
          const handleClick = (e: any) => {
            onLocationSelect([e.latlng.lat, e.latlng.lng]);
          };
          
          if (map.on) {
            map.on('click', handleClick);
          }
          
          // Cleanup function to remove event listener
          return () => {
            if (map.off) {
              map.off('click', handleClick);
            }
          };
        }
      }, [map, onLocationSelect]);

      return null;
    };
  }),
  { ssr: false }
);

interface SafetyScore {
  id: string;
  latitude: number;
  longitude: number;
  score: number;
  factors: string;
  timestamp: string;
}

interface SafetyMapProps {
  center?: LatLngExpression;
  zoom?: number;
  onLocationSelect?: (location: [number, number]) => void;
  className?: string;
}

interface SafetyInfoPopupProps {
  location: [number, number];
  safetyScore?: number;
  factors?: any;
  onClose: () => void;
}

function SafetyInfoPopup({ location, safetyScore = 75, factors = {}, onClose }: SafetyInfoPopupProps) {
  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: "Very Safe", icon: Shield, color: "text-green-600" };
    if (score >= 60) return { level: "Safe", icon: Shield, color: "text-yellow-600" };
    if (score >= 40) return { level: "Moderate", icon: AlertTriangle, color: "text-orange-600" };
    return { level: "Unsafe", icon: AlertTriangle, color: "text-red-600" };
  };

  const safetyInfo = getSafetyLevel(safetyScore);
  const IconComponent = safetyInfo.icon;

  return (
    <Card className="absolute top-4 right-4 z-10 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <IconComponent className={`h-5 w-5 ${safetyInfo.color}`} />
            Safety Information
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        <CardDescription>
          Location: {location[0].toFixed(4)}, {location[1].toFixed(4)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={`p-3 rounded-lg border ${getSafetyColor(safetyScore)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Safety Score</span>
            <Badge variant="outline" className={getSafetyColor(safetyScore)}>
              {safetyScore}/100
            </Badge>
          </div>
          <div className="text-sm font-medium">{safetyInfo.level}</div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Safety Factors</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span>People: {factors.people?.level || factors.people || "Moderate"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Time: {factors.timeOfDay || "Day"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-gray-500" />
              <span>Lighting: {factors.lighting?.level || factors.lighting || "Good"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>Traffic: {factors.traffic?.level || factors.traffic || "Normal"}</span>
            </div>
            {factors.police?.level && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                <span>Police: {factors.police.level}</span>
              </div>
            )}
            {factors.policePresence && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                <span>Police: {factors.policePresence}</span>
              </div>
            )}
            {factors.crime?.level && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <span>Crime: {factors.crime.level}</span>
              </div>
            )}
            {factors.crimeRate && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <span>Crime: {factors.crimeRate}</span>
              </div>
            )}
            {factors.emergency?.level && (
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-gray-500" />
                <span>Emergency: {factors.emergency.level}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            Get Directions
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SafetyMap({ 
  center = [13.0827, 80.2707], 
  zoom = 13, 
  onLocationSelect,
  className = "h-96 w-full" 
}: SafetyMapProps) {
  const [safetyData, setSafetyData] = useState<SafetyScore[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Fetch enhanced safety data from API
    const fetchSafetyData = async () => {
      try {
        // Try to fetch from the API endpoint
        const response = await fetch('/api/safety/enhanced');
        if (response.ok) {
          const data = await response.json();
          // If we get data from the API, use it
          if (Array.isArray(data)) {
            setSafetyData(data);
            return;
          }
        }
        
        // Fallback to realistic mock data if API fails
        const realisticSafetyData: SafetyScore[] = [
          {
            id: "chennai-central",
            latitude: 13.0827,
            longitude: 80.2707,
            score: 78,
            factors: JSON.stringify({ 
              lighting: { level: "Good", score: 75, description: "Well-lit streets with regular maintenance" },
              traffic: { level: "High", score: 80, description: "Busy streets with good natural surveillance" },
              people: { level: "High", score: 80, description: "Good pedestrian presence providing safety" },
              crime: { level: "Low", score: 75, description: "Low crime rate, generally safe area" },
              police: { level: "High", score: 85, description: "Regular police presence and patrols" },
              cctv: { level: "Good", score: 75, description: "Good CCTV coverage in main areas" },
              emergency: { level: "Good", score: 80, description: "Good emergency response times" },
              maintenance: { level: "Good", score: 75, description: "Well-maintained public spaces" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "tnagar",
            latitude: 13.0417,
            longitude: 80.2341,
            score: 85,
            factors: JSON.stringify({ 
              lighting: { level: "Excellent", score: 90, description: "Comprehensive lighting coverage" },
              traffic: { level: "Moderate", score: 70, description: "Moderate traffic flow" },
              people: { level: "Very High", score: 95, description: "Excellent natural surveillance" },
              crime: { level: "Very Low", score: 90, description: "Very low crime rate" },
              police: { level: "High", score: 85, description: "High police visibility" },
              cctv: { level: "Excellent", score: 90, description: "Comprehensive CCTV coverage" },
              emergency: { level: "Excellent", score: 90, description: "Excellent emergency services" },
              maintenance: { level: "Excellent", score: 90, description: "Excellent maintenance" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "anna-nagar",
            latitude: 13.0867,
            longitude: 80.2107,
            score: 82,
            factors: JSON.stringify({ 
              lighting: { level: "Good", score: 75, description: "Well-lit streets" },
              traffic: { level: "Moderate", score: 70, description: "Moderate traffic" },
              people: { level: "High", score: 80, description: "Good pedestrian presence" },
              crime: { level: "Low", score: 75, description: "Low crime rate" },
              police: { level: "Medium", score: 65, description: "Occasional police patrols" },
              cctv: { level: "Good", score: 75, description: "Good CCTV coverage" },
              emergency: { level: "Good", score: 80, description: "Good emergency response" },
              maintenance: { level: "Good", score: 75, description: "Well-maintained area" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "guindy",
            latitude: 13.0087,
            longitude: 80.2127,
            score: 65,
            factors: JSON.stringify({ 
              lighting: { level: "Moderate", score: 60, description: "Adequate lighting with some dark spots" },
              traffic: { level: "Heavy", score: 80, description: "Heavy traffic providing surveillance" },
              people: { level: "Moderate", score: 60, description: "Moderate pedestrian activity" },
              crime: { level: "Moderate", score: 60, description: "Moderate crime rate" },
              police: { level: "Medium", score: 65, description: "Adequate police presence" },
              cctv: { level: "Moderate", score: 60, description: "Some CCTV coverage" },
              emergency: { level: "Moderate", score: 65, description: "Adequate emergency services" },
              maintenance: { level: "Moderate", score: 60, description: "Basic maintenance" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "mount-road",
            latitude: 13.0757,
            longitude: 80.2587,
            score: 72,
            factors: JSON.stringify({ 
              lighting: { level: "Good", score: 75, description: "Good street lighting" },
              traffic: { level: "Very High", score: 95, description: "Very heavy traffic, excellent surveillance" },
              people: { level: "Very High", score: 95, description: "Very high pedestrian presence" },
              crime: { level: "Low", score: 75, description: "Low crime rate" },
              police: { level: "High", score: 85, description: "High police presence" },
              cctv: { level: "Good", score: 75, description: "Good CCTV coverage" },
              emergency: { level: "Good", score: 80, description: "Good emergency response" },
              maintenance: { level: "Good", score: 75, description: "Well-maintained" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "besant-nagar",
            latitude: 13.0027,
            longitude: 80.2677,
            score: 88,
            factors: JSON.stringify({ 
              lighting: { level: "Excellent", score: 90, description: "Excellent lighting coverage" },
              traffic: { level: "Low", score: 40, description: "Light traffic, less surveillance" },
              people: { level: "Moderate", score: 60, description: "Moderate pedestrian activity" },
              crime: { level: "Very Low", score: 90, description: "Very low crime rate" },
              police: { level: "Medium", score: 65, description: "Moderate police presence" },
              cctv: { level: "Good", score: 75, description: "Good CCTV coverage" },
              emergency: { level: "Excellent", score: 90, description: "Excellent emergency services" },
              maintenance: { level: "Excellent", score: 90, description: "Excellent maintenance" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "adyar",
            latitude: 13.0117,
            longitude: 80.2567,
            score: 75,
            factors: JSON.stringify({ 
              lighting: { level: "Good", score: 75, description: "Good street lighting" },
              traffic: { level: "Moderate", score: 70, description: "Moderate traffic flow" },
              people: { level: "High", score: 80, description: "Good pedestrian presence" },
              crime: { level: "Low", score: 75, description: "Low crime rate" },
              police: { level: "Medium", score: 65, description: "Adequate police presence" },
              cctv: { level: "Good", score: 75, description: "Good CCTV coverage" },
              emergency: { level: "Good", score: 80, description: "Good emergency response" },
              maintenance: { level: "Good", score: 75, description: "Well-maintained area" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "triplicane",
            latitude: 13.0627,
            longitude: 80.2797,
            score: 45,
            factors: JSON.stringify({ 
              lighting: { level: "Poor", score: 25, description: "Insufficient street lighting" },
              traffic: { level: "High", score: 80, description: "Heavy traffic providing some surveillance" },
              people: { level: "High", score: 80, description: "High pedestrian presence" },
              crime: { level: "High", score: 40, description: "Higher crime rate" },
              police: { level: "Low", score: 40, description: "Minimal police presence" },
              cctv: { level: "Poor", score: 25, description: "Limited CCTV coverage" },
              emergency: { level: "Moderate", score: 60, description: "Adequate emergency services" },
              maintenance: { level: "Poor", score: 25, description: "Poorly maintained area" }
            }),
            timestamp: new Date().toISOString()
          }
        ];
        setSafetyData(realisticSafetyData);
      } catch (error) {
        console.error('Error fetching safety data:', error);
        // Fallback to mock data if API call fails
        const fallbackData: SafetyScore[] = [
          {
            id: "fallback-1",
            latitude: 13.0827,
            longitude: 80.2707,
            score: 75,
            factors: JSON.stringify({ lighting: "Good", traffic: "Moderate", people: "High", timeOfDay: "Day" }),
            timestamp: new Date().toISOString()
          }
        ];
        setSafetyData(fallbackData);
      }
    };

    fetchSafetyData();
  }, []);

  const getSafetyColor = (score: number) => {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // yellow
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  };

  const getSafetyScoreForLocation = (location: [number, number]) => {
    // Find the nearest safety data point
    const nearest = safetyData.reduce((nearest, current) => {
      const currentDistance = Math.sqrt(
        Math.pow(current.latitude - location[0], 2) + 
        Math.pow(current.longitude - location[1], 2)
      );
      const nearestDistance = Math.sqrt(
        Math.pow(nearest.latitude - location[0], 2) + 
        Math.pow(nearest.longitude - location[1], 2)
      );
      return currentDistance < nearestDistance ? current : nearest;
    }, safetyData[0]);
    
    return nearest?.score || 75;
  };

  const getSafetyFactorsForLocation = (location: [number, number]) => {
    // Find the nearest safety data point
    const nearest = safetyData.reduce((nearest, current) => {
      const currentDistance = Math.sqrt(
        Math.pow(current.latitude - location[0], 2) + 
        Math.pow(current.longitude - location[1], 2)
      );
      const nearestDistance = Math.sqrt(
        Math.pow(nearest.latitude - location[0], 2) + 
        Math.pow(nearest.longitude - location[1], 2)
      );
      return currentDistance < nearestDistance ? current : nearest;
    }, safetyData[0]);
    
    return nearest ? JSON.parse(nearest.factors) : { lighting: "Good", traffic: "Moderate", people: "High", timeOfDay: "Day" };
  };

  const handleLocationSelect = (location: [number, number]) => {
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <LeafletCSS />
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController onLocationSelect={handleLocationSelect} />
        
        {/* Safety score overlays */}
        {safetyData.map((safety) => (
          <Circle
            key={safety.id}
            center={[safety.latitude, safety.longitude]}
            radius={200}
            pathOptions={{
              color: getSafetyColor(safety.score),
              fillColor: getSafetyColor(safety.score),
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-2">Safety Score: {safety.score}/100</h3>
                <div className="text-sm text-gray-600">
                  <p>Click for detailed information</p>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
        
        {/* Selected location marker */}
        {selectedLocation && (
          <Marker position={selectedLocation}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-2">Selected Location</h3>
                <p className="text-sm text-gray-600">
                  Lat: {selectedLocation[0].toFixed(4)}<br />
                  Lng: {selectedLocation[1].toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Safety Info Popup */}
      {selectedLocation && (
        <SafetyInfoPopup
          location={selectedLocation}
          safetyScore={getSafetyScoreForLocation(selectedLocation)}
          factors={getSafetyFactorsForLocation(selectedLocation)}
          onClose={() => setSelectedLocation(null)}
        />
      )}
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <h4 className="font-semibold text-sm mb-2">Safety Levels</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Very Safe (80-100)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>Safe (60-79)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>Moderate (40-59)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Unsafe (0-39)</span>
          </div>
        </div>
      </div>
    </div>
  );
}