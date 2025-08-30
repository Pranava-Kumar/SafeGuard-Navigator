"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Route, MapPin, Navigation, Search, Filter, Calendar, TrendingUp, AlertTriangle } from "lucide-react";

interface RouteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRouteSelect?: (route: RouteHistoryItem) => void;
}

interface RouteHistoryItem {
  id: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  safetyScore: number;
  date: string;
  routeType: string;
  status: 'completed' | 'planned' | 'cancelled';
}

export default function RouteHistoryModal({ isOpen, onClose, onRouteSelect }: RouteHistoryModalProps) {
  const [routes, setRoutes] = useState<RouteHistoryItem[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  useEffect(() => {
    // Mock route history data
    const mockRoutes: RouteHistoryItem[] = [
      {
        id: "1",
        startLocation: "Home",
        endLocation: "Office",
        distance: 2500,
        duration: 1800,
        safetyScore: 85,
        date: "2024-01-15",
        routeType: "safest",
        status: "completed"
      },
      {
        id: "2",
        startLocation: "Office",
        endLocation: "Gym",
        distance: 1800,
        duration: 1200,
        safetyScore: 70,
        date: "2024-01-14",
        routeType: "balanced",
        status: "completed"
      },
      {
        id: "3",
        startLocation: "Gym",
        endLocation: "Home",
        distance: 2100,
        duration: 1500,
        safetyScore: 90,
        date: "2024-01-13",
        routeType: "safest",
        status: "completed"
      },
      {
        id: "4",
        startLocation: "Home",
        endLocation: "Airport",
        distance: 15000,
        duration: 3600,
        safetyScore: 65,
        date: "2024-01-12",
        routeType: "fastest",
        status: "completed"
      },
      {
        id: "5",
        startLocation: "Mall",
        endLocation: "Restaurant",
        distance: 800,
        duration: 600,
        safetyScore: 95,
        date: "2024-01-11",
        routeType: "safest",
        status: "completed"
      },
      {
        id: "6",
        startLocation: "Home",
        endLocation: "Hospital",
        distance: 3200,
        duration: 2400,
        safetyScore: 88,
        date: "2024-01-16",
        routeType: "safest",
        status: "planned"
      }
    ];

    setRoutes(mockRoutes);
    setFilteredRoutes(mockRoutes);
  }, []);

  useEffect(() => {
    let filtered = routes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(route => 
        route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.endLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(route => route.routeType === filterType);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(route => route.status === filterStatus);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "safety":
          return b.safetyScore - a.safetyScore;
        case "distance":
          return a.distance - b.distance;
        case "duration":
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    setFilteredRoutes(filtered);
  }, [routes, searchTerm, filterType, filterStatus, sortBy]);

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: "Very Safe", color: "text-green-600", bgColor: "bg-green-50" };
    if (score >= 60) return { level: "Safe", color: "text-yellow-600", bgColor: "bg-yellow-50" };
    if (score >= 40) return { level: "Moderate", color: "text-orange-600", bgColor: "bg-orange-50" };
    return { level: "Unsafe", color: "text-red-600", bgColor: "bg-red-50" };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-800">Planned</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRouteClick = (route: RouteHistoryItem) => {
    if (onRouteSelect) {
      onRouteSelect(route);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Route History
          </CardTitle>
          <CardDescription>
            View and manage your planned and completed routes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filters and Search */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Routes</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div>
                  <Label htmlFor="filterType">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="safest">Safest</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="fastest">Fastest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filterStatus">Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sortBy">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="distance">Distance</SelectItem>
                      <SelectItem value="duration">Duration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Routes List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-8">
                <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No routes found</p>
                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              filteredRoutes.map((route) => {
                const safetyInfo = getSafetyLevel(route.safetyScore);
                return (
                  <div 
                    key={route.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRouteClick(route)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">
                            {route.startLocation} → {route.endLocation}
                          </h4>
                          {getStatusBadge(route.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-500">Distance</div>
                            <div className="font-medium">{(route.distance / 1000).toFixed(1)} km</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Duration</div>
                            <div className="font-medium">{Math.round(route.duration / 60)} min</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Safety Score</div>
                            <div className={`font-medium ${safetyInfo.color}`}>
                              {route.safetyScore}/100
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">Date</div>
                            <div className="font-medium">{new Date(route.date).toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {route.routeType}
                          </Badge>
                          <div className={`px-2 py-1 rounded text-xs ${safetyInfo.bgColor} ${safetyInfo.color}`}>
                            {safetyInfo.level}
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Navigation className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Summary Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{filteredRoutes.length}</div>
                <div className="text-gray-500">Total Routes</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {filteredRoutes.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {filteredRoutes.filter(r => r.status === 'planned').length}
                </div>
                <div className="text-gray-500">Planned</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(filteredRoutes.reduce((sum, route) => sum + route.safetyScore, 0) / filteredRoutes.length) || 0}
                </div>
                <div className="text-gray-500">Avg Safety</div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}