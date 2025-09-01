/**
 * SafetyNavigation Component
 * Navigation interface for SafeRoute application
 * Allows users to plan routes with safety prioritization
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  MyLocation, 
  LocationOn, 
  DirectionsWalk, 
  DirectionsCar, 
  DirectionsTransit, 
  Security, 
  Warning, 
  Info, 
  ArrowBack, 
  ArrowForward, 
  Visibility, 
  VisibilityOff, 
  Refresh 
} from 'lucide-react';
import SafetyMap from './SafetyMap';

// Safety score color mapping
const getSafetyColor = (score: number) => {
  if (score >= 80) return '#4CAF50'; // Green for high safety
  if (score >= 60) return '#FFC107'; // Yellow for medium safety
  return '#F44336'; // Red for low safety
};

// Safety level text mapping
const getSafetyLevelText = (score: number) => {
  if (score >= 80) return 'High Safety';
  if (score >= 60) return 'Medium Safety';
  return 'Low Safety';
};

interface Location {
  placeId?: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface RouteSegment {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distance: number;
  duration: number;
  safetyScore: number;
  warnings?: string[];
  instructions: string;
}

interface Route {
  id: string;
  origin: Location;
  destination: Location;
  distance: number;
  duration: number;
  safetyScore: number;
  path: { lat: number; lng: number }[];
  segments: RouteSegment[];
  warnings: string[];
  alternativeRoutes?: Route[];
}

interface SafetyNavigationProps {
  initialOrigin?: Location | null;
  initialDestination?: Location | null;
}

const SafetyNavigation: React.FC<SafetyNavigationProps> = ({
  initialOrigin = null,
  initialDestination = null
}) => {
  const [origin, setOrigin] = useState<Location | null>(initialOrigin);
  const [destination, setDestination] = useState<Location | null>(initialDestination);
  const [originSearch, setOriginSearch] = useState<string>('');
  const [destinationSearch, setDestinationSearch] = useState<string>('');
  const [originSuggestions, setOriginSuggestions] = useState<Location[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState<boolean>(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState<boolean>(false);
  const [safetyPreference, setSafetyPreference] = useState<number>(70); // Default safety preference
  const [transportMode, setTransportMode] = useState<'walking' | 'driving' | 'transit'>('walking');
  const [route, setRoute] = useState<Route | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showRouteDetails, setShowRouteDetails] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  const router = useRouter();
  
  // Handle location search
  const handleLocationSearch = async (query: string, isOrigin: boolean) => {
    if (query.length < 3) {
      if (isOrigin) {
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
      } else {
        setDestinationSuggestions([]);
        setShowDestinationSuggestions(false);
      }
      return;
    }
    
    try {
      // Fetch location suggestions from API
      const response = await fetch(`/api/geocoding/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch location suggestions');
      
      const data: { locations: Location[] } = await response.json();
      
      if (isOrigin) {
        setOriginSuggestions(data.locations || []);
        setShowOriginSuggestions(true);
      } else {
        setDestinationSuggestions(data.locations || []);
        setShowDestinationSuggestions(true);
      }
    } catch (err: unknown) {
      console.error('Error searching locations:', err);
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };
  
  // Handle location selection
  const handleLocationSelect = (location: Location, isOrigin: boolean) => {
    if (isOrigin) {
      setOrigin(location);
      setOriginSearch(location.description);
      setShowOriginSuggestions(false);
    } else {
      setDestination(location);
      setDestinationSearch(location.description);
      setShowDestinationSuggestions(false);
    }
  };
  
  // Handle user's current location
  const handleUseCurrentLocation = (isOrigin: boolean) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocode to get address
            const response = await fetch(`/api/geocoding/reverse?lat=${latitude}&lng=${longitude}`);
            if (!response.ok) throw new Error('Failed to get address');
            
            const data: { address: string } = await response.json();
            const locationData: Location = {
              description: data.address || 'Current Location',
              latitude,
              longitude
            };
            
            if (isOrigin) {
              setOrigin(locationData);
              setOriginSearch(locationData.description);
            } else {
              setDestination(locationData);
              setDestinationSearch(locationData.description);
            }
          } catch (err: any) {
            console.error('Error getting address:', err);
            
            // Use coordinates as fallback
            const locationData: Location = {
              description: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              latitude,
              longitude
            };
            
            if (isOrigin) {
              setOrigin(locationData);
              setOriginSearch(locationData.description);
            } else {
              setDestination(locationData);
              setDestinationSearch(locationData.description);
            }
          }
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Could not get your location. Please check your browser permissions.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };
  
  // Calculate route when origin, destination, and preferences are set
  const calculateRoute = async () => {
    if (!origin || !destination) {
      setError('Please set both origin and destination');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate route from API
      const response = await fetch('/api/routing/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          origin: { latitude: origin.latitude, longitude: origin.longitude },
          destination: { latitude: destination.latitude, longitude: destination.longitude },
          safetyPreference,
          transportMode,
          includeAlternatives: true
        })
      });
      
      if (!response.ok) throw new Error('Failed to calculate route');
      
      const data: { route: Route } = await response.json();
      setRoute(data.route);
      setSelectedRouteIndex(0); // Select primary route
      
      setIsLoading(false);
    } catch (err: unknown) {
      console.error('Error calculating route:', err);
      if (err instanceof Error) {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };
  
  // Select alternative route
  const selectAlternativeRoute = (index: number) => {
    if (!route || !route.alternativeRoutes || index >= route.alternativeRoutes.length) {
      return;
    }
    
    if (index === -1) {
      // Select primary route
      setSelectedRouteIndex(0);
    } else {
      // Select alternative route
      setSelectedRouteIndex(index + 1);
    }
  };
  
  // Get currently selected route
  const getSelectedRoute = (): Route => {
    if (!route) return null as unknown as Route;
    
    if (selectedRouteIndex === 0) {
      return route;
    } else {
      return route.alternativeRoutes?.[selectedRouteIndex - 1] || route;
    }
  };
  
  // Start navigation
  const startNavigation = () => {
    setShowRouteDetails(true);
    setCurrentStep(0);
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    const selectedRoute = getSelectedRoute();
    if (currentStep < selectedRoute.segments.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Report safety issue
  const reportSafetyIssue = () => {
    const selectedRoute = getSelectedRoute();
    const currentSegment = selectedRoute.segments[currentStep];
    
    router.push(
      `/report?lat=${currentSegment.startLat}&lng=${currentSegment.startLng}&type=safety_issue`
    );
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Top navigation bar */}
      <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between">
        <h2 className="text-lg font-semibold">SafeRoute Navigation</h2>
        
        {showRouteDetails && (
          <Button 
            variant="outline" 
            className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
            onClick={() => setShowRouteDetails(false)}
          >
            <ArrowBack className="mr-2 h-4 w-4" />
            Back to Route
          </Button>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Route planning */}
        <Card className="w-[350px] flex flex-col overflow-auto rounded-none">
          {!showRouteDetails ? (
            // Route planning panel
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Plan Your Route</h3>
              
              {/* Origin input */}
              <div className="mb-4 relative">
                <Input
                  placeholder="Enter starting location"
                  value={originSearch}
                  onChange={(e) => {
                    setOriginSearch(e.target.value);
                    handleLocationSearch(e.target.value, true);
                  }}
                />
                
                {/* Origin suggestions */}
                {showOriginSuggestions && originSuggestions.length > 0 && (
                  <Card className="absolute w-full z-10 max-h-48 overflow-auto mt-1">
                    <CardContent className="p-2">
                      {originSuggestions.map((location, index) => (
                        <div 
                          key={index} 
                          className="flex items-center p-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleLocationSelect(location, true)}
                        >
                          <LocationOn className="mr-2 h-4 w-4" />
                          <span>{location.description}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Destination input */}
              <div className="mb-6 relative">
                <Input
                  placeholder="Enter destination"
                  value={destinationSearch}
                  onChange={(e) => {
                    setDestinationSearch(e.target.value);
                    handleLocationSearch(e.target.value, false);
                  }}
                />
                
                {/* Destination suggestions */}
                {showDestinationSuggestions && destinationSuggestions.length > 0 && (
                  <Card className="absolute w-full z-10 max-h-48 overflow-auto mt-1">
                    <CardContent className="p-2">
                      {destinationSuggestions.map((location, index) => (
                        <div 
                          key={index} 
                          className="flex items-center p-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleLocationSelect(location, false)}
                        >
                          <LocationOn className="mr-2 h-4 w-4" />
                          <span>{location.description}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              {/* Transport mode selection */}
              <div className="mb-6 flex justify-between gap-2">
                <Button
                  variant={transportMode === 'walking' ? 'default' : 'outline'}
                  onClick={() => setTransportMode('walking')}
                  className="flex-1"
                >
                  <DirectionsWalk className="mr-2 h-4 w-4" />
                  Walk
                </Button>
                
                <Button
                  variant={transportMode === 'driving' ? 'default' : 'outline'}
                  onClick={() => setTransportMode('driving')}
                  className="flex-1"
                >
                  <DirectionsCar className="mr-2 h-4 w-4" />
                  Drive
                </Button>
                
                <Button
                  variant={transportMode === 'transit' ? 'default' : 'outline'}
                  onClick={() => setTransportMode('transit')}
                  className="flex-1"
                >
                  <DirectionsTransit className="mr-2 h-4 w-4" />
                  Transit
                </Button>
              </div>
              
              {/* Safety preference slider */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">
                  Route Preference
                </h4>
                <div className="flex items-center">
                  <span className="text-xs mr-2">
                    Faster
                  </span>
                  <Slider
                    value={[safetyPreference]}
                    onValueChange={(value) => setSafetyPreference(value[0])}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <span className="text-xs ml-2">
                    Safer
                  </span>
                </div>
                <div className="text-xs text-center mt-2">
                  {safetyPreference < 30 ? 'Prioritizing speed over safety' :
                   safetyPreference < 70 ? 'Balanced safety and speed' :
                   'Prioritizing safety over speed'}
                </div>
              </div>
              
              {/* Calculate route button */}
              <Button
                className="w-full"
                size="lg"
                onClick={calculateRoute}
                disabled={!origin || !destination || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Calculating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Find Safe Route
                  </div>
                )}
              </Button>
              
              {/* Error message */}
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Route summary */}
              {route && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Route Options</h3>
                  
                  {/* Primary route */}
                  <Card 
                    className={`mb-4 cursor-pointer ${selectedRouteIndex === 0 ? 'border-2' : ''}`}
                    style={{ 
                      borderColor: selectedRouteIndex === 0 ? getSafetyColor(route.safetyScore) : undefined,
                      backgroundColor: selectedRouteIndex === 0 ? 'rgba(0, 0, 0, 0.03)' : undefined
                    }}
                    onClick={() => selectAlternativeRoute(-1)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Recommended Route</h4>
                        <Badge 
                          variant="default"
                          style={{ backgroundColor: getSafetyColor(route.safetyScore) }}
                        >
                          {getSafetyLevelText(route.safetyScore)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between mb-2 text-sm">
                        <span>
                          {Math.round(route.distance / 100) / 10} km
                        </span>
                        <span>
                          {Math.floor(route.duration / 60)} min
                        </span>
                        <span>
                          Safety: {route.safetyScore}/100
                        </span>
                      </div>
                      
                      {route.warnings.length > 0 && (
                        <div className="mt-2">
                          {route.warnings.map((warning, index) => (
                            <div key={index} className="text-sm text-destructive flex items-center">
                              <Warning className="mr-1 h-4 w-4" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Alternative routes */}
                  {route.alternativeRoutes && route.alternativeRoutes.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium mb-2">Alternatives</h4>
                      
                      {route.alternativeRoutes.map((altRoute, index) => (
                        <Card 
                          key={index}
                          className={`mb-2 cursor-pointer ${selectedRouteIndex === index + 1 ? 'border-2' : ''}`}
                          style={{ 
                            borderColor: selectedRouteIndex === index + 1 ? getSafetyColor(altRoute.safetyScore) : undefined,
                            backgroundColor: selectedRouteIndex === index + 1 ? 'rgba(0, 0, 0, 0.03)' : undefined
                          }}
                          onClick={() => selectAlternativeRoute(index)}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Alternative {index + 1}</span>
                              <Badge 
                                variant="default"
                                style={{ backgroundColor: getSafetyColor(altRoute.safetyScore) }}
                                className="text-xs"
                              >
                                {getSafetyLevelText(altRoute.safetyScore)}
                              </Badge>
                            </div>
                            
                            <div className="flex justify-between text-xs">
                              <span>
                                {Math.round(altRoute.distance / 100) / 10} km
                              </span>
                              <span>
                                {Math.floor(altRoute.duration / 60)} min
                              </span>
                              <span>
                                Safety: {altRoute.safetyScore}/100
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                  
                  {/* Start navigation button */}
                  <Button
                    className="w-full mt-4"
                    size="lg"
                    variant="secondary"
                    onClick={startNavigation}
                  >
                    Start Navigation
                  </Button>
                </div>
              )}
            </CardContent>
          ) : (
            // Turn-by-turn navigation panel
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              
              {route && (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground">
                      From: {origin?.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      To: {destination?.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {Math.round(getSelectedRoute().distance / 100) / 10} km
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(getSelectedRoute().duration / 60)} min
                      </p>
                    </div>
                    
                    <Badge 
                      variant="default"
                      style={{ backgroundColor: getSafetyColor(getSelectedRoute().safetyScore) }}
                    >
                      Safety: {getSelectedRoute().safetyScore}/100
                    </Badge>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  {/* Current navigation step */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      Step {currentStep + 1} of {getSelectedRoute().segments.length}
                    </h4>
                    
                    <Card 
                      className="p-4 border-2"
                      style={{ 
                        borderColor: getSafetyColor(getSelectedRoute().segments[currentStep].safetyScore)
                      }}
                    >
                      <h3 className="text-lg font-semibold">
                        {getSelectedRoute().segments[currentStep].instructions}
                      </h3>
                      
                      <div className="flex justify-between mt-2 text-sm">
                        <span>
                          {Math.round(getSelectedRoute().segments[currentStep].distance / 10) / 100} km
                        </span>
                        <span>
                          {Math.round(getSelectedRoute().segments[currentStep].duration / 6) / 10} min
                        </span>
                      </div>
                      
                      {getSelectedRoute().segments[currentStep].warnings && 
                       getSelectedRoute().segments[currentStep].warnings!.length > 0 && (
                        <div className="mt-2">
                          {getSelectedRoute().segments[currentStep].warnings!.map((warning, index) => (
                            <div key={index} className="text-sm text-destructive flex items-center">
                              <Warning className="mr-1 h-4 w-4" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-between items-center">
                        <Badge 
                          variant="default"
                          style={{ backgroundColor: getSafetyColor(getSelectedRoute().segments[currentStep].safetyScore) }}
                          className="text-xs"
                        >
                          <Security className="mr-1 h-3 w-3" />
                          Safety: {getSelectedRoute().segments[currentStep].safetyScore}/100
                        </Badge>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive"
                          onClick={reportSafetyIssue}
                        >
                          <Warning className="mr-1 h-3 w-3" />
                          Report Issue
                        </Button>
                      </div>
                    </Card>
                  </div>
                  
                  {/* Navigation controls */}
                  <div className="flex justify-between mb-4">
                    <Button
                      variant="outline"
                      disabled={currentStep === 0}
                      onClick={goToPreviousStep}
                    >
                      <ArrowBack className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    
                    <Button
                      disabled={currentStep === getSelectedRoute().segments.length - 1}
                      onClick={goToNextStep}
                    >
                      Next
                      <ArrowForward className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Upcoming steps preview */}
                  <h4 className="text-sm font-medium mb-2">Upcoming Steps</h4>
                  
                  <div className="space-y-2">
                    {getSelectedRoute().segments.slice(currentStep + 1, currentStep + 4).map((segment, index) => (
                      <div key={index} className="flex items-center p-2">
                        <div className="min-w-[36px]">
                          <Badge variant="secondary" className="min-w-[30px]">
                            {currentStep + index + 2}
                          </Badge>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm">{segment.instructions}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(segment.distance / 10) / 100} km · {Math.round(segment.duration / 6) / 10} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
        
        {/* Right panel - Map */}
        <div className="flex-1">
          <SafetyMap 
            initialPosition={origin ? [origin.latitude, origin.longitude] : undefined}
            showSafetyHeatmap={true}
            showIncidents={true}
            showSafetyZones={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SafetyNavigation;