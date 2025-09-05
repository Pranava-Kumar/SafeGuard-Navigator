"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Clock, 
  BarChart3, 
  Search, 
  Target,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  Filter,
  Eye,
  EyeOff,
  Info,
  Share2,
  Download,
  Star,
  TrendingUp,
  Users,
  Lightbulb,
  Heart,
  Settings
} from "lucide-react";
import EnhancedSafetyMap from "@/components/map/EnhancedSafetyMap";
import SafetyScoreDisplay from "@/components/map/SafetyScoreDisplay";

export default function EnhancedMapPage() {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [safetyScore, setSafetyScore] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{name: string, lat: number, lng: number, type: string}>>([]);
  const [recentLocations, setRecentLocations] = useState<Array<{name: string, lat: number, lng: number, timestamp: number}>>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);
  const [mapZoom, setMapZoom] = useState(13);
  const [showSafetyLayers, setShowSafetyLayers] = useState(true);
  const [showCrowdReports, setShowCrowdReports] = useState(true);
  const [timeFilter, setTimeFilter] = useState<"all" | "day" | "night">("all");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load recent locations from localStorage
  useEffect(() => {
    const savedLocations = localStorage.getItem("recentLocations");
    if (savedLocations) {
      try {
        const locations = JSON.parse(savedLocations);
        // Sort by timestamp (most recent first) and limit to 10
        const sorted = locations.sort((a: any, b: any) => b.timestamp - a.timestamp).slice(0, 10);
        setRecentLocations(sorted);
      } catch (e) {
        console.error("Error parsing recent locations", e);
      }
    }
  }, []);

  // Auto-save recent locations
  useEffect(() => {
    if (recentLocations.length > 0) {
      localStorage.setItem("recentLocations", JSON.stringify(recentLocations));
    }
  }, [recentLocations]);

  const handleLocationSelect = async (location: [number, number]) => {
    setSelectedLocation(location);
    setMapCenter(location);
    setLoading(true);
    setError(null);
    
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
            },
            metadata: {
              lastUpdated: new Date().toLocaleString(),
              dataSources: data.data.metadata?.dataSources || ["Satellite Data", "Community Reports"],
              confidence: data.data.metadata?.confidence || "High"
            }
          });
        } else {
          setError(data.error || "Failed to fetch safety data");
          setSafetyScore(null);
        }
      } else {
        setError("Failed to fetch safety data");
        setSafetyScore(null);
      }
    } catch (error) {
      console.error("Error fetching safety score:", error);
      setError("Network error while fetching safety data");
      setSafetyScore(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanRoute = (location: [number, number]) => {
    // Save to recent locations with timestamp
    const newLocation = {
      name: `Location at ${location[0].toFixed(4)}, ${location[1].toFixed(4)}`,
      lat: location[0],
      lng: location[1],
      timestamp: Date.now()
    };
    
    const updatedLocations = [newLocation, ...recentLocations.filter(loc => 
      loc.lat !== location[0] || loc.lng !== location[1]
    )].slice(0, 10); // Keep only last 10 locations
    
    setRecentLocations(updatedLocations);
    
    // Navigate to route planning with the selected location
    window.location.href = `/routes?dest=${location[0]},${location[1]}`;
  };

  const handleReportIssue = (location: [number, number]) => {
    // Save to recent locations with timestamp
    const newLocation = {
      name: `Reported: ${location[0].toFixed(4)}, ${location[1].toFixed(4)}`,
      lat: location[0],
      lng: location[1],
      timestamp: Date.now()
    };
    
    const updatedLocations = [newLocation, ...recentLocations.filter(loc => 
      loc.lat !== location[0] || loc.lng !== location[1]
    )].slice(0, 10); // Keep only last 10 locations
    
    setRecentLocations(updatedLocations);
    
    // Navigate to incident reporting with the selected location
    window.location.href = `/emergency/alert/form?lat=${location[0]}&lng=${location[1]}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const response = await fetch(`/api/backend/geocoding/geocode?q=${encodeURIComponent(searchQuery)}&countrycodes=IN`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.results && data.results.length > 0) {
          // Format results
          const results = data.results.map((result: any) => ({
            name: result.display_name || `${result.name}, ${result.state}`,
            lat: result.latitude,
            lng: result.longitude,
            type: result.type || "location"
          }));
          
          setSearchResults(results);
        } else {
          setError("No locations found. Please try a different search term.");
        }
      } else {
        setError("Error searching for locations. Please try again.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setError("Network error while searching for locations");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/backend/geocoding/geocode?q=${encodeURIComponent(query)}&countrycodes=IN&limit=5`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.results && data.results.length > 0) {
            const results = data.results.map((result: any) => ({
              name: result.display_name || `${result.name}, ${result.state}`,
              lat: result.latitude,
              lng: result.longitude,
              type: result.type || "location"
            }));
            
            setSearchResults(results);
          } else {
            setSearchResults([]);
          }
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error with auto-search:", error);
        setSearchResults([]);
      }
    }, 300); // 300ms debounce
  };

  const selectSearchResult = (location: {lat: number, lng: number}) => {
    setSelectedLocation([location.lat, location.lng]);
    setMapCenter([location.lat, location.lng]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const addToRecentLocations = (location: [number, number], name: string) => {
    const newLocation = {
      name,
      lat: location[0],
      lng: location[1],
      timestamp: Date.now()
    };
    
    const updatedLocations = [newLocation, ...recentLocations.filter(loc => 
      loc.lat !== location[0] || loc.lng !== location[1]
    )].slice(0, 10); // Keep only last 10 locations
    
    setRecentLocations(updatedLocations);
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: "Very Safe", color: "green" };
    if (score >= 60) return { level: "Safe", color: "yellow" };
    if (score >= 40) return { level: "Moderate", color: "orange" };
    return { level: "Unsafe", color: "red" };
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "residential": return <Home className="h-4 w-4" />;
      case "commercial": return <Building className="h-4 w-4" />;
      case "park": return <TreePine className="h-4 w-4" />;
      case "hospital": return <Hospital className="h-4 w-4" />;
      case "police": return <Shield className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
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
            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Search className="h-5 w-5 mr-2 text-blue-600" />
                  Search Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for a location..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleAutoSearch(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectSearchResult({ lat: result.lat, lng: result.lng })}
                          className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0 text-sm flex items-center"
                        >
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="truncate">{result.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </form>
                
                {error && (
                  <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-600" />
                  Map Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMapZoom(mapZoom + 1)}
                    disabled={mapZoom >= 18}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMapZoom(mapZoom - 1)}
                    disabled={mapZoom <= 5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setMapCenter([13.0827, 80.2707]);
                      setMapZoom(13);
                    }}
                  >
                    <Locate className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Safety Layers</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSafetyLayers(!showSafetyLayers)}
                    >
                      {showSafetyLayers ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Community Reports</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowCrowdReports(!showCrowdReports)}
                    >
                      {showCrowdReports ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm block mb-2">Time Filter</label>
                  <div className="flex space-x-2">
                    <Button 
                      variant={timeFilter === "all" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTimeFilter("all")}
                      className="flex-1"
                    >
                      All
                    </Button>
                    <Button 
                      variant={timeFilter === "day" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTimeFilter("day")}
                      className="flex-1"
                    >
                      Day
                    </Button>
                    <Button 
                      variant={timeFilter === "night" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setTimeFilter("night")}
                      className="flex-1"
                    >
                      Night
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    Recent Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {recentLocations.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedLocation([location.lat, location.lng]);
                          setMapCenter([location.lat, location.lng]);
                        }}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="truncate">{location.name}</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(location.timestamp).toLocaleDateString()}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Information Panel */}

            {/* Safety Information Panel */}
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
                  <span>Loading safety data...</span>
                </CardContent>
              </Card>
            ) : safetyScore ? (
              <div className="space-y-6">
                <SafetyScoreDisplay score={safetyScore.score} factors={safetyScore.factors} />
                
                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Info className="h-5 w-5 mr-2 text-blue-600" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coordinates</span>
                      <span className="font-medium">
                        {selectedLocation?.[0].toFixed(6)}, {selectedLocation?.[1].toFixed(6)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">{safetyScore.metadata?.lastUpdated}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Confidence</span>
                      <Badge variant="secondary">{safetyScore.metadata?.confidence}</Badge>
                    </div>
                    <div className="pt-2">
                      <span className="text-sm text-gray-600">Data Sources:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {safetyScore.metadata?.dataSources.map((source: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
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
                    <Button variant="outline" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Location
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
                        <span>Avg. Response Time</span>
                        <span className="font-medium">4.2 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Community Reports</span>
                        <span className="font-medium">24</span>
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
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Map Legend</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-4 rounded-full bg-green-200 border border-green-300 mr-2"></div>
                        <span>Safe Areas</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-4 rounded-full bg-yellow-200 border border-yellow-300 mr-2"></div>
                        <span>Moderate Areas</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-4 h-4 rounded-full bg-red-200 border border-red-300 mr-2"></div>
                        <span>Unsafe Areas</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3 relative">
            <EnhancedSafetyMap 
              center={mapCenter}
              zoom={mapZoom}
              onLocationSelect={handleLocationSelect} 
              onPlanRoute={handlePlanRoute}
              onReportIssue={handleReportIssue}
              className="h-full min-h-[500px] w-full"
              showSafetyCircles={showSafetyLayers}
            />
            
            {/* Map Overlay Controls */}
            <div className="absolute top-4 right-4 flex flex-col space-y-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/80 hover:bg-white"
                onClick={() => setShowSafetyLayers(!showSafetyLayers)}
              >
                {showSafetyLayers ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="bg-white/80 hover:bg-white"
                onClick={() => setShowCrowdReports(!showCrowdReports)}
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}