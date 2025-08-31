"use client";

import { useState } from "react";
import SafetyMap from "@/components/map/SafetyMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation, Shield, Clock, Users, AlertTriangle, Search } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function MapPageContent() {
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("day");

  const handleLocationSelect = (location: [number, number]) => {
    setSelectedLocation(location);
  };

  const safetyStats = [
    { label: "Very Safe Areas", count: 12, color: "bg-green-500" },
    { label: "Safe Areas", count: 8, color: "bg-yellow-500" },
    { label: "Moderate Areas", count: 5, color: "bg-orange-500" },
    { label: "Unsafe Areas", count: 3, color: "bg-red-500" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">SafeGuard Navigator</span>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-blue-600">Home</a>
              <a href="/map" className="text-blue-600 font-medium">Map</a>
              <a href="/dashboard" className="text-gray-500 hover:text-blue-600">Dashboard</a>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search">Address or Place</Label>
                  <div className="relative">
                    <Input
                      id="search"
                      placeholder="Enter location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="time">Time of Day</Label>
                  <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                      <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                      <SelectItem value="night">Night (10PM - 6AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Search Location
                </Button>
              </CardContent>
            </Card>

            {/* Safety Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Area Safety Stats
                </CardTitle>
                <CardDescription>
                  Current safety overview for visible area
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {safetyStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                      <span className="text-sm">{stat.label}</span>
                    </div>
                    <Badge variant="outline">{stat.count}</Badge>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Areas</span>
                    <Badge>28</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Navigation className="h-4 w-4 mr-2" />
                  Plan Route
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Incident
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  View History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Map Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Interactive Safety Map</CardTitle>
                    <CardDescription>
                      Click on any location to view detailed safety information
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Live Data
                    </Badge>
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96 lg:h-[600px]">
                  <SafetyMap
                    onLocationSelect={handleLocationSelect}
                    className="h-full w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Information Tabs */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Safety Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="factors">Factors</TabsTrigger>
                    <TabsTrigger value="routes">Routes</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Current Location</h4>
                        {selectedLocation ? (
                          <div className="text-sm text-gray-600">
                            <p>Latitude: {selectedLocation[0].toFixed(4)}</p>
                            <p>Longitude: {selectedLocation[1].toFixed(4)}</p>
                            <p className="mt-2">Safety Score: <span className="font-medium text-green-600">75/100</span></p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Click on the map to select a location</p>
                        )}
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Safety Tips</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Stay in well-lit areas at night</li>
                          <li>• Keep emergency contacts handy</li>
                          <li>• Share your location with friends</li>
                          <li>• Trust your instincts</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="factors" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Environmental Factors</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Lighting Conditions</span>
                            <Badge variant="outline">Good</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Traffic Density</span>
                            <Badge variant="outline">Moderate</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>People Density</span>
                            <Badge variant="outline">High</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Time-Based Factors</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Time of Day</span>
                            <Badge variant="outline">{timeOfDay}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Day of Week</span>
                            <Badge variant="outline">Weekday</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span>Season</span>
                            <Badge variant="outline">Summer</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="routes" className="space-y-4">
                    <div className="text-center py-8">
                      <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Route Planning</h4>
                      <p className="text-gray-500 mb-4">Plan safe routes between locations</p>
                      <Button>Plan a Route</Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reports" className="space-y-4">
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-600 mb-2">Incident Reports</h4>
                      <p className="text-gray-500 mb-4">View and report safety incidents</p>
                      <Button variant="outline">View Reports</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <MapPageContent />
    </ProtectedRoute>
  );
}