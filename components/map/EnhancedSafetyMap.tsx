"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  MapPin, 
  Navigation, 
  Lightbulb, 
  Users, 
  AlertTriangle, 
  Route, 
  Eye, 
  Clock, 
  Target,
  Zap,
  IndianRupee,
  Trophy,
  UserCheck,
  Heart
} from "lucide-react";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

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

interface SafetyScore {
  id: string;
  latitude: number;
  longitude: number;
  score: number;
  factors: string;
  timestamp: string;
}

interface SafetyFactors {
  people?: { level: string; score: number; description: string } | string;
  timeOfDay?: string;
  lighting?: { level: string; score: number; description: string } | string;
  traffic?: { level: string; score: number; description: string } | string;
  police?: { level: string; score: number; description: string };
  policePresence?: string;
  crime?: { level: string; score: number; description: string };
  crimeRate?: string;
  emergency?: { level: string; score: number; description: string };
  cctv?: { level: string; score: number; description: string };
  maintenance?: { level: string; score: number; description: string };
}

interface EnhancedSafetyMapProps {
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (location: [number, number]) => void;
  onPlanRoute?: (location: [number, number]) => void;
  onReportIssue?: (location: [number, number]) => void;
  className?: string;
  enablePopups?: boolean;
  showSafetyCircles?: boolean;
}

export default function EnhancedSafetyMap({ 
  center = [13.0827, 80.2707], 
  zoom = 13, 
  onLocationSelect,
  onPlanRoute,
  onReportIssue,
  className = "h-full w-full min-h-[400px]",
  enablePopups = true,
  showSafetyCircles = true
}: EnhancedSafetyMapProps) {
  const [safetyData, setSafetyData] = useState<SafetyScore[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [safetyScore, setSafetyScore] = useState<{ score: number; factors: SafetyFactors } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Set map loaded state
    setMapLoaded(true);
    
    // Fetch enhanced safety data from API
    const fetchSafetyData = async () => {
      try {
        // Try to fetch from the enhanced API endpoint
        const response = await fetch('/api/safety/enhanced/v2');
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
            id: "t-nagar",
            latitude: 13.0398,
            longitude: 80.2342,
            score: 65,
            factors: JSON.stringify({
              lighting: { level: "Moderate", score: 60, description: "Adequate lighting but some dark spots" },
              traffic: { level: "High", score: 75, description: "Very busy commercial area" },
              people: { level: "Very High", score: 90, description: "Excellent natural surveillance" },
              crime: { level: "Low", score: 70, description: "Generally safe with occasional petty theft" },
              police: { level: "Moderate", score: 65, description: "Police presence during peak hours" },
              cctv: { level: "Good", score: 70, description: "Good CCTV coverage in main streets" },
              emergency: { level: "Good", score: 75, description: "Good emergency response times" },
              maintenance: { level: "Moderate", score: 60, description: "Some areas need maintenance" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "anna-nagar",
            latitude: 13.0878,
            longitude: 80.2785,
            score: 82,
            factors: JSON.stringify({
              lighting: { level: "Good", score: 80, description: "Well-lit residential area" },
              traffic: { level: "Moderate", score: 65, description: "Moderate traffic with good road conditions" },
              people: { level: "High", score: 80, description: "Good residential presence" },
              crime: { level: "Very Low", score: 90, description: "Very low crime rate, safe area" },
              police: { level: "High", score: 85, description: "Regular police patrols and good response" },
              cctv: { level: "Moderate", score: 60, description: "Limited CCTV coverage" },
              emergency: { level: "Good", score: 80, description: "Good emergency response times" },
              maintenance: { level: "Good", score: 80, description: "Well-maintained residential area" }
            }),
            timestamp: new Date().toISOString()
          },
          {
            id: "guindy",
            latitude: 13.0102,
            longitude: 80.2155,
            score: 58,
            factors: JSON.stringify({
              lighting: { level: "Poor", score: 45, description: "Several dark spots, especially in residential areas" },
              traffic: { level: "Low", score: 50, description: "Low traffic, isolated areas" },
              people: { level: "Low", score: 40, description: "Low pedestrian presence during night hours" },
              crime: { level: "Moderate", score: 60, description: "Moderate crime rate, caution advised" },
              police: { level: "Moderate", score: 60, description: "Police presence but limited patrols" },
              cctv: { level: "Poor", score: 40, description: "Limited CCTV coverage" },
              emergency: { level: "Moderate", score: 60, description: "Average emergency response times" },
              maintenance: { level: "Moderate", score: 55, description: "Some areas need maintenance" }
            }),
            timestamp: new Date().toISOString()
          }
        ];
        setSafetyData(realisticSafetyData);
      } catch (error) {
        console.error("Failed to fetch safety data:", error);
        // Even if fetching fails, we can still show the map
      }
    };

    fetchSafetyData();
  }, []);

  const handleMapClick = async (e: any) => {
    const location: [number, number] = [e.latlng.lat, e.latlng.lng];
    setSelectedLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    
    // Fetch safety data for this specific location
    try {
      const response = await fetch(`/api/safety/enhanced/v2?lat=${location[0]}&lng=${location[1]}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSafetyScore({
            score: data.data.score,
            factors: data.data.factors
          });
        }
      } else {
        // Fallback to mock data if API fails
        setSafetyScore({
          score: 75,
          factors: {
            lighting: { level: "Good", score: 75, description: "Well-lit streets with regular maintenance" },
            traffic: { level: "High", score: 80, description: "Busy streets with good natural surveillance" },
            people: { level: "High", score: 80, description: "Good pedestrian presence providing safety" },
            crime: { level: "Low", score: 75, description: "Low crime rate, generally safe area" },
            police: { level: "High", score: 85, description: "Regular police presence and patrols" },
            cctv: { level: "Good", score: 75, description: "Good CCTV coverage in main areas" },
            emergency: { level: "Good", score: 80, description: "Good emergency response times" },
            maintenance: { level: "Good", score: 75, description: "Well-maintained public spaces" }
          }
        });
      }
    } catch (error) {
      console.error("Error fetching safety score:", error);
      // Fallback to mock data if API fails
      setSafetyScore({
        score: 75,
        factors: {
          lighting: { level: "Good", score: 75, description: "Well-lit streets with regular maintenance" },
          traffic: { level: "High", score: 80, description: "Busy streets with good natural surveillance" },
          people: { level: "High", score: 80, description: "Good pedestrian presence providing safety" },
          crime: { level: "Low", score: 75, description: "Low crime rate, generally safe area" },
          police: { level: "High", score: 85, description: "Regular police presence and patrols" },
          cctv: { level: "Good", score: 75, description: "Good CCTV coverage in main areas" },
          emergency: { level: "Good", score: 80, description: "Good emergency response times" },
          maintenance: { level: "Good", score: 75, description: "Well-maintained public spaces" }
        }
      });
    }
  };

  const handlePlanRouteForLocation = (location: [number, number]) => {
    if (onPlanRoute) {
      onPlanRoute(location);
    }
  };

  const handleReportIssueForLocation = (location: [number, number]) => {
    if (onReportIssue) {
      onReportIssue(location);
    }
  };

  // Function to get color based on safety score
  const getSafetyColor = (score: number) => {
    if (score >= 80) return "#10B981"; // green
    if (score >= 60) return "#F59E0B"; // yellow
    if (score >= 40) return "#F97316"; // orange
    return "#EF4444"; // red
  };

  // Function to get radius based on safety score (higher score = larger circle)
  const getRadius = (score: number) => {
    return 100 + (score / 100) * 400; // Radius between 100-500 meters
  };

  return (
  <div className={`${className} relative overflow-hidden rounded-lg`}>
    {mapLoaded ? (
      <MapContainer 
        center={center} 
        zoom={zoom} 
        className="h-full w-full"
        style={{ minHeight: '400px' }}
        whenReady={(map) => {
          // Add click handler when map is ready
          map.target.on('click', handleMapClick);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render safety data as circles on the map */}
        {showSafetyCircles && safetyData.map((point) => {
          const factors = JSON.parse(point.factors);
          return (
            <Circle
              key={point.id}
              center={[point.latitude, point.longitude]}
              radius={getRadius(point.score)}
              color={getSafetyColor(point.score)}
              fillColor={getSafetyColor(point.score)}
              fillOpacity={0.2}
              weight={2}
            >
              <Popup>
                <div className="min-w-48">
                  <h3 className="font-bold text-lg mb-1">
                    {point.id.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" style={{ color: getSafetyColor(point.score) }} />
                    <span className="font-semibold">Safety Score: {point.score}/100</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Lighting: {factors.lighting?.level || "N/A"}</div>
                    <div>People: {factors.people?.level || "N/A"}</div>
                    <div>Crime: {factors.crime?.level || "N/A"}</div>
                  </div>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Show safety info popup when a location is selected */}
        {enablePopups && selectedLocation && safetyScore && (
          <Marker position={selectedLocation}>
            <Popup>
              <div className="w-64">
                <h3 className="font-bold text-lg mb-2">Safety Information</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Safety Score</span>
                  <span className="text-xl font-bold">{safetyScore.score}/100</span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span>Lighting</span>
                    <span>{String(safetyScore.factors.lighting) || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Footfall</span>
                    <span>{String(safetyScore.factors.footfall) || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Incidents</span>
                    <span>{String(safetyScore.factors.crimeRate) || "N/A"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => handlePlanRouteForLocation(selectedLocation)}>
                    <Navigation className="h-4 w-4 mr-1" />
                    Plan Route
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleReportIssueForLocation(selectedLocation)}>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    ) : (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    )}
  </div>
);
}