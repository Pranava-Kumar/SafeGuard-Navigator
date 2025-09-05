/**
 * SafetyMap Component
 * Main map interface for SafeRoute application
 * Displays safety information and navigation
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MyLocation, Navigation, Report, Warning } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Fix Leaflet icon issues in Next.js
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different safety levels
const safetyIcons = {
  high: L.icon({
    iconUrl: '/images/marker-safe.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  medium: L.icon({
    iconUrl: '/images/marker-medium.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  low: L.icon({
    iconUrl: '/images/marker-danger.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  incident: L.icon({
    iconUrl: '/images/marker-incident.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  emergency: L.icon({
    iconUrl: '/images/marker-emergency.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

// Safety score color mapping
const getSafetyColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green for high safety
  if (score >= 60) return '#FFC107'; // Yellow for medium safety
  return '#F44336'; // Red for low safety
};

// Location Control component to center map on user's location
function LocationControl({ onLocationFound }: { onLocationFound: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  const locateUser = () => {
    map.locate({ setView: true, maxZoom: 16 });
    
    map.on('locationfound', (e) => {
      onLocationFound(e.latlng.lat, e.latlng.lng);
    });
    
    map.on('locationerror', (e) => {
      console.error('Location error:', e.message);
      // Show error message to user
    });
  };
  
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '60px' }}>
      <div className="leaflet-control leaflet-bar">
        <Button 
          onClick={locateUser}
          className="m-2"
        >
          <MyLocation className="mr-2 h-4 w-4" />
          My Location
        </Button>
      </div>
    </div>
  );
}

// Safety Route component to display a route with safety information
function SafetyRoute({ route }: { route: { path: { lat: number; lng: number }[]; safetyScore: number } }) {
  const map = useMap();
  
  useEffect(() => {
    if (!route || !route.path || route.path.length === 0) return;
    
    // Create a polyline for the route
    const routeLine = L.polyline(
      route.path.map((point) => [point.lat, point.lng]),
      {
        color: getSafetyColor(route.safetyScore),
        weight: 5,
        opacity: 0.7
      }
    );
    
    // Add the route to the map
    routeLine.addTo(map);
    
    // Fit the map to the route bounds
    map.fitBounds(routeLine.getBounds());
    
    // Cleanup on unmount
    return () => {
      map.removeLayer(routeLine);
    };
  }, [map, route]);
  
  return null;
}

// Safety Heatmap component to display safety scores as a heatmap
function SafetyHeatmap({ safetyData }: { safetyData: { latitude: number; longitude: number; safetyScore: number }[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!safetyData || safetyData.length === 0) return;
    
    // Create heatmap data points
    const heatmapPoints = safetyData.map((point) => [
      point.latitude,
      point.longitude,
      (100 - point.safetyScore) / 100 // Invert score for heatmap intensity (lower safety = higher intensity)
    ]);
    
    // Create and add heatmap layer if window.L.heatLayer is available
    if (window.L && window.L.heatLayer) {
      const heatmapLayer = window.L.heatLayer(heatmapPoints, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: { 0.4: 'blue', 0.6: 'yellow', 0.8: 'orange', 1.0: 'red' }
      });
      
      heatmapLayer.addTo(map);
      
      // Cleanup on unmount
      return () => {
        map.removeLayer(heatmapLayer);
      };
    }
  }, [map, safetyData]);
  
  return null;
}

// Incident Markers component to display reported incidents
function IncidentMarkers({ incidents }: { incidents: { id: string; latitude: number; longitude: number; type: string; description: string; timestamp: string; reliabilityScore: number }[] }) {
  if (!incidents || incidents.length === 0) return null;
  
  return (
    <>
      {incidents.map((incident) => (
        <Marker 
          key={incident.id} 
          position={[incident.latitude, incident.longitude]}
          icon={safetyIcons.incident}
        >
          <Popup>
            <div>
              <h3>{incident.type}</h3>
              <p>{incident.description}</p>
              <p>Reported: {new Date(incident.timestamp).toLocaleString()}</p>
              <p>Reliability: {incident.reliabilityScore}%</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Safety Zones component to display safety circles
function SafetyZones({ zones }: { zones: { id: string; latitude: number; longitude: number; radius: number; safetyScore: number; name: string; description: string }[] }) {
  if (!zones || zones.length === 0) return null;
  
  return (
    <>
      {zones.map((zone) => (
        <Circle
          key={zone.id}
          center={[zone.latitude, zone.longitude]}
          radius={zone.radius}
          pathOptions={{
            color: getSafetyColor(zone.safetyScore),
            fillColor: getSafetyColor(zone.safetyScore),
            fillOpacity: 0.2
          }}
        >
          <Popup>
            <div>
              <h3>{zone.name}</h3>
              <p>Safety Score: {zone.safetyScore}/100</p>
              <p>{zone.description}</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}

// Main SafetyMap component
interface SafetyMapProps {
  initialPosition?: [number, number];
  initialZoom?: number;
  showSafetyHeatmap?: boolean;
  showIncidents?: boolean;
  showSafetyZones?: boolean;
}

interface Route {
  path: { lat: number; lng: number }[];
  safetyScore: number;
}

interface SafetyData {
  latitude: number;
  longitude: number;
  safetyScore: number;
}

interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  description: string;
  timestamp: string;
  reliabilityScore: number;
}

interface SafetyZone {
  id: string;
  latitude: number;
  longitude: number;
  radius: number;
  safetyScore: number;
  name: string;
  description: string;
}

const SafetyMap: React.FC<SafetyMapProps> = ({
  initialPosition = [28.6139, 77.2090], // Default to Delhi, India
  initialZoom = 13,
  showSafetyHeatmap = true,
  showIncidents = true,
  showSafetyZones = true
}) => {
  return (
    <ErrorBoundary>
      <SafetyMapContent 
        initialPosition={initialPosition}
        initialZoom={initialZoom}
        showSafetyHeatmap={showSafetyHeatmap}
        showIncidents={showIncidents}
        showSafetyZones={showSafetyZones}
      />
    </ErrorBoundary>
  );
};

const SafetyMapContent: React.FC<SafetyMapProps> = ({
  initialPosition = [28.6139, 77.2090], // Default to Delhi, India
  initialZoom = 13,
  showSafetyHeatmap = true,
  showIncidents = true,
  showSafetyZones = true
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [safetyData, setSafetyData] = useState<SafetyData[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [safetyZones, setSafetyZones] = useState<SafetyZone[]>([]);
  const [safetyPreference, setSafetyPreference] = useState<number>(70); // Default safety preference
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState<boolean>(false);
  
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  
  // Load safety data when component mounts
  useEffect(() => {
    const fetchSafetyData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch safety data from API
        const response = await fetch('/api/safety/data');
        if (!response.ok) throw new Error('Failed to fetch safety data');
        
        const data: { safetyData: SafetyData[] } = await response.json();
        setSafetyData(data.safetyData || []);
        
        setIsLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching safety data:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('An unknown error occurred while fetching safety data');
        }
        setIsLoading(false);
      }
    };
    
    fetchSafetyData();
  }, []);
  
  // Load incidents when component mounts
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        // Fetch incidents from API
        const response = await fetch('/api/reporting/incidents');
        if (!response.ok) throw new Error('Failed to fetch incidents');
        
        const data: { incidents: Incident[] } = await response.json();
        setIncidents(data.incidents || []);
      } catch (err: unknown) {
        console.error('Error fetching incidents:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('An unknown error occurred while fetching incidents');
        }
      }
    };
    
    if (showIncidents) {
      fetchIncidents();
    }
  }, [showIncidents]);
  
  // Load safety zones when component mounts
  useEffect(() => {
    const fetchSafetyZones = async () => {
      try {
        // Fetch safety zones from API
        const response = await fetch('/api/safety/zones');
        if (!response.ok) throw new Error('Failed to fetch safety zones');
        
        const data: { zones: SafetyZone[] } = await response.json();
        setSafetyZones(data.zones || []);
      } catch (err: unknown) {
        console.error('Error fetching safety zones:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('An unknown error occurred while fetching safety zones');
        }
      }
    };
    
    if (showSafetyZones) {
      fetchSafetyZones();
    }
  }, [showSafetyZones]);
  
  // Handle location found
  const handleLocationFound = (lat: number, lng: number) => {
    setUserLocation([lat, lng]);
  };
  
  // Handle map click to set destination
  const handleMapClick = (e: { latlng: { lat: number; lng: number } }) => {
    if (!userLocation) {
      setError('Please share your location first');
      return;
    }
    
    setDestination([e.latlng.lat, e.latlng.lng]);
  };
  
  // Calculate route when user location and destination are set
  useEffect(() => {
    const calculateRoute = async () => {
      if (!userLocation || !destination) return;
      
      try {
        setIsLoading(true);
        
        // Calculate route from API
        const response = await fetch('/api/routing/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            origin: { latitude: userLocation[0], longitude: userLocation[1] },
            destination: { latitude: destination[0], longitude: destination[1] },
            safetyPreference: safetyPreference
          })
        });
        
        if (!response.ok) throw new Error('Failed to calculate route');
        
        const data: { route: Route } = await response.json();
        setRoute(data.route);
        
        setIsLoading(false);
      } catch (err: unknown) {
        console.error('Error calculating route:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else if (typeof err === 'string') {
          setError(err);
        } else {
          setError('An unknown error occurred while calculating route');
        }
        setIsLoading(false);
      }
    };
    
    calculateRoute();
  }, [userLocation, destination, safetyPreference]);
  
  // Handle emergency button click
  const handleEmergency = () => {
    setShowEmergencyPanel(true);
  };
  
  // Trigger specific emergency alert
  const triggerEmergencyAlert = async (alertType: string) => {
    if (!userLocation) {
      setError('Cannot send alert without location. Please share your location.');
      return;
    }
    
    try {
      const response = await fetch('/api/emergency/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alertType,
          deviceId: 'web-app', // This should be a unique device identifier
          location: {
            latitude: userLocation[0],
            longitude: userLocation[1],
            time: new Date()
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to send emergency alert');
      
      const data: { alertId: string } = await response.json();
      
      // Show success message
      alert(`Emergency alert sent successfully. Alert ID: ${data.alertId}`);
      
      // Close emergency panel
      setShowEmergencyPanel(false);
    } catch (err: unknown) {
      console.error('Error sending emergency alert:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        setError('An unknown error occurred while sending emergency alert');
      }
          
  };
  
  // Handle report incident button click
  const handleReportIncident = () => {
    if (!userLocation) {
      setError('Please share your location first');
      return;
    }
    
    // Navigate to report incident page with location
    router.push(`/report?lat=${userLocation[0]}&lng=${userLocation[1]}`);
  };
  
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {error && (
        <Alert 
          variant="destructive"
          style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <MapContainer 
        center={initialPosition} 
        zoom={initialZoom} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        
        {/* Destination marker */}
        {destination && (
          <Marker 
            position={destination}
            icon={safetyIcons.medium}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}
        
        {/* Safety data visualization */}
        {showSafetyHeatmap && safetyData.length > 0 && (
          <SafetyHeatmap safetyData={safetyData} />
        )}
        
        {/* Incident markers */}
        {showIncidents && incidents.length > 0 && (
          <IncidentMarkers incidents={incidents} />
        )}
        
        {/* Safety zones */}
        {showSafetyZones && safetyZones.length > 0 && (
          <SafetyZones zones={safetyZones} />
        )}
        
        {/* Route display */}
        {route && (
          <SafetyRoute route={route} />
        )}
        
        {/* Location control */}
        <LocationControl onLocationFound={handleLocationFound} />
      </MapContainer>
      
      {/* Safety preference slider */}
      <Card 
        style={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20, 
          width: '300px',
          zIndex: 1000
        }}
      >
        <CardContent className="p-4">
          <div className="text-sm font-medium mb-2">
            Safety Preference
          </div>
          <div className="flex items-center">
            <div className="text-xs mr-2">
              Faster
            </div>
            <Slider
              value={[safetyPreference]}
              onValueChange={(value) => setSafetyPreference(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-xs ml-2">
              Safer
            </div>
          </div>
          <div className="text-xs text-center mt-2">
            {safetyPreference < 30 ? 'Prioritizing speed over safety' :
             safetyPreference < 70 ? 'Balanced safety and speed' :
             'Prioritizing safety over speed'}
          </div>
        </CardContent>
      </Card>
      
      {/* Action buttons */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 20, 
          right: 20, 
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <Button
          onClick={() => router.push('/navigation')}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Navigate
        </Button>
        
        <Button
          variant="secondary"
          onClick={handleReportIncident}
        >
          <Report className="mr-2 h-4 w-4" />
          Report Incident
        </Button>
        
        <Button
          variant="destructive"
          onClick={handleEmergency}
        >
          <Warning className="mr-2 h-4 w-4" />
          Emergency
        </Button>
      </div>
      
      {/* Emergency panel */}
      {showEmergencyPanel && (
        <Card 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '300px',
            zIndex: 2000
          }}
        >
          <CardContent className="p-6">
            <div className="text-lg font-semibold mb-4 text-center">
              Emergency Alert
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                variant="destructive"
                onClick={() => triggerEmergencyAlert('sos')}
              >
                SOS Emergency
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => triggerEmergencyAlert('medical')}
              >
                Medical Emergency
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => triggerEmergencyAlert('police')}
              >
                Police Emergency
              </Button>
              
              <Button
                variant="destructive"
                onClick={() => triggerEmergencyAlert('fire')}
              >
                Fire Emergency
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowEmergencyPanel(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1500
          }}
        >
          <Card>
            <CardContent className="p-5">
              <div>Loading...</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SafetyMap;