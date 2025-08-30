"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Shield, 
  MapPin, 
  Clock, 
  Route, 
  AlertTriangle, 
  BarChart3,
  Settings,
  Activity,
  TrendingUp,
  Users,
  Phone,
  Navigation,
  Plus,
  Eye,
  AlertCircle,
  Zap,
  CheckCircle
} from "lucide-react";
import RouteInputModal from "@/components/dashboard/RouteInputModal";
import RouteDetailsModal from "@/components/dashboard/RouteDetailsModal";
import ContactsModal from "@/components/dashboard/ContactsModal";
import { useAuth } from "@/contexts/AuthContext";

interface SafetyPreference {
  riskTolerance: number;
  preferredFactors: {
    lighting: boolean;
    traffic: boolean;
    people: boolean;
    crime: boolean;
  };
  notificationSettings: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface RouteHistory {
  id: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  safetyScore: number;
  date: string;
  routeType: string;
}

interface EmergencyAlertHistory {
  id: string;
  type: string;
  location: string;
  status: string;
  date: string;
  contactsNotified: string[];
}

export default function DashboardPage() {
  return <Dashboard />;
}

function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [safetyPreferences, setSafetyPreferences] = useState<SafetyPreference>({
    riskTolerance: 50,
    preferredFactors: {
      lighting: true,
      traffic: true,
      people: true,
      crime: true
    },
    notificationSettings: {
      email: true,
      sms: true,
      push: true
    }
  });

  // Redirect to home if not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, isLoading]);

  const [routeHistory, setRouteHistory] = useState<RouteHistory[]>([]);

  useEffect(() => {
    // Initialize with sample data only on client side
    setRouteHistory([
      {
        id: "1",
        startLocation: "Home",
        endLocation: "Office",
        distance: 2500,
        duration: 1800,
        safetyScore: 85,
        date: "2024-01-15",
        routeType: "safest"
      },
      {
        id: "2",
        startLocation: "Office",
        endLocation: "Gym",
        distance: 1800,
        duration: 1200,
        safetyScore: 70,
        date: "2024-01-14",
        routeType: "balanced"
      },
      {
        id: "3",
        startLocation: "Gym",
        endLocation: "Home",
        distance: 2100,
        duration: 1500,
        safetyScore: 90,
        date: "2024-01-13",
        routeType: "safest"
      }
    ]);

    // Initialize emergency history with sample data only on client side
    setEmergencyHistory([
      {
        id: "1",
        type: "personal",
        location: "Downtown Area",
        status: "resolved",
        date: "2024-01-10",
        contactsNotified: ["family", "friend"]
      }
    ]);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Modal states
  const [showRouteInputModal, setShowRouteInputModal] = useState(false);
  const [showRouteDetailsModal, setShowRouteDetailsModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteHistory | null>(null);
  const [emergencyHistory, setEmergencyHistory] = useState<EmergencyAlertHistory[]>([]);

  const handleAlertTriggered = (alertData: any) => {
    console.log("Emergency alert triggered:", alertData);
    // In a real app, this would update the emergency history
  };

  const handleSaveRoute = (routeData: any) => {
    const newRoute: RouteHistory = {
      id: `route_${Date.now()}`,
      startLocation: routeData.startLocation,
      endLocation: routeData.endLocation,
      distance: routeData.distance,
      duration: routeData.duration,
      safetyScore: routeData.safetyScore,
      date: new Date().toISOString().split('T')[0],
      routeType: routeData.routeType
    };
    
    setRouteHistory(prev => [newRoute, ...prev]);
  };

  const handleRouteClick = (route: RouteHistory) => {
    setSelectedRoute(route);
    setShowRouteDetailsModal(true);
  };

  const handleEmergencyAlert = () => {
    const newAlert: EmergencyAlertHistory = {
      id: `alert_${Date.now()}`,
      type: "personal",
      location: userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : "Unknown location",
      status: "active",
      date: new Date().toISOString().split('T')[0],
      contactsNotified: ["family", "friend"]
    };
    
    setEmergencyHistory(prev => [newAlert, ...prev]);
    alert("Emergency alert triggered! Your emergency contacts have been notified.");
  };

  const getSafetyLevel = (score: number) => {
    if (score >= 80) return { level: "Very Safe", color: "text-green-600" };
    if (score >= 60) return { level: "Safe", color: "text-yellow-600" };
    if (score >= 40) return { level: "Moderate", color: "text-orange-600" };
    return { level: "Unsafe", color: "text-red-600" };
  };

  const isPremiumUser = user?.role === 'premium' || user?.role === 'admin';
  const isAdminUser = user?.role === 'admin';

  const stats = {
    totalRoutes: routeHistory.length,
    averageSafetyScore: routeHistory.length > 0 ? Math.round(routeHistory.reduce((sum, route) => sum + (route?.safetyScore || 0), 0) / routeHistory.length) : 0,
    emergencyAlerts: emergencyHistory.length,
    safeRoutes: routeHistory.filter(route => route && route.safetyScore >= 70).length
  };

  

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
              <a href="/map" className="text-gray-500 hover:text-blue-600">Map</a>
              <a href="/dashboard" className="text-blue-600 font-medium">Dashboard</a>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SafeGuard Navigator!</h1>
              <p className="text-gray-600">Here's your safety overview and recent activity.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Guest User
              </Badge>
              {!isPremiumUser && (
                <Button size="sm" variant="outline" onClick={() => alert('Upgrade to Premium to access advanced features')}>
                  Upgrade to Premium
                </Button>
              )}
            </div>
          </div>
          {!isPremiumUser && (
            <Alert className="mt-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Upgrade to Premium to access advanced analytics, unlimited route planning, and priority emergency support.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Route className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Safety Score</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageSafetyScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Emergency Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.emergencyAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Safe Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.safeRoutes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="routes">Route History</TabsTrigger>
                <TabsTrigger value="alerts">Alert History</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Current Location */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Current Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userLocation ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Latitude:</span>
                            <span className="ml-2 font-medium">{userLocation[0].toFixed(4)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Longitude:</span>
                            <span className="ml-2 font-medium">{userLocation[1].toFixed(4)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Current Safety Score:</span>
                          <Badge variant="outline" className="text-green-600 bg-green-50">
                            78/100 - Safe
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                          <Button size="sm" variant="outline">
                            <MapPin className="h-4 w-4 mr-2" />
                            View on Map
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Location not available</p>
                        <Button size="sm" className="mt-2">Enable Location</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Recent Activity
                      </CardTitle>
                      <Button size="sm" onClick={() => setShowRouteInputModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Route
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {routeHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No routes planned yet</p>
                          <p className="text-sm text-gray-400 mt-2">Plan your first safe route to get started</p>
                          <Button className="mt-4" onClick={() => setShowRouteInputModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Plan Your First Route
                          </Button>
                        </div>
                      ) : (
                        routeHistory.slice(0, 3).map((route) => {
                          if (!route) return null;
                          const safetyInfo = getSafetyLevel(route.safetyScore);
                          return (
                            <div 
                              key={route.id} 
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleRouteClick(route)}
                            >
                              <div className="flex-1">
                                <div className="font-medium">{route.startLocation} → {route.endLocation}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(route.date).toLocaleDateString()} • {(route.distance / 1000).toFixed(1)} km
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className={safetyInfo.color}>
                                  {route.safetyScore}/100
                                </Badge>
                                <div className="text-xs text-gray-500 mt-1">{route.routeType}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="routes" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Route History</h3>
                    <p className="text-sm text-gray-600">Your recent route planning activity</p>
                  </div>
                  <Button onClick={() => setShowRouteInputModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Plan New Route
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {routeHistory.map((route) => {
                        if (!route) return null;
                        const safetyInfo = getSafetyLevel(route.safetyScore);
                        return (
                          <div 
                            key={route.id} 
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleRouteClick(route)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Route className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{route.startLocation} → {route.endLocation}</span>
                                <Badge variant="outline" className="text-xs">{route.routeType}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <span>Distance:</span>
                                  <span className="ml-1 font-medium">{(route.distance / 1000).toFixed(1)} km</span>
                                </div>
                                <div>
                                  <span>Duration:</span>
                                  <span className="ml-1 font-medium">{Math.round(route.duration / 60)} min</span>
                                </div>
                                <div>
                                  <span>Date:</span>
                                  <span className="ml-1 font-medium">{new Date(route.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium mb-1">Safety Score</div>
                              <Badge variant="outline" className={safetyInfo.color}>
                                {route.safetyScore}/100
                              </Badge>
                              <div className={`text-xs mt-1 ${safetyInfo.color}`}>
                                {safetyInfo.level}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Emergency Alert History</h3>
                    <p className="text-sm text-gray-600">Your emergency alert activity</p>
                  </div>
                  <Button onClick={handleEmergencyAlert} variant="destructive">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Trigger Emergency Alert
                  </Button>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    {emergencyHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No emergency alerts triggered</p>
                        <p className="text-sm text-gray-400 mt-2">Your emergency alert history will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {emergencyHistory.map((alert) => (
                          <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="font-medium capitalize">{alert.type} Emergency</span>
                                <Badge variant={alert.status === "resolved" ? "outline" : "default"}>
                                  {alert.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <span>Location:</span>
                                  <span className="ml-1 font-medium">{alert.location}</span>
                                </div>
                                <div>
                                  <span>Date:</span>
                                  <span className="ml-1 font-medium">{new Date(alert.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Contacts notified: {alert.contactsNotified.join(", ")}
                              </div>
                            </div>
                            <div className="text-right">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Safety Preferences</CardTitle>
                    <CardDescription>Customize your safety settings and preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Risk Tolerance: {safetyPreferences.riskTolerance}%
                        </label>
                        <Progress 
                          value={safetyPreferences.riskTolerance} 
                          className="w-full h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Conservative</span>
                          <span>Adventurous</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          Preferred Safety Factors
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(safetyPreferences.preferredFactors).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setSafetyPreferences(prev => ({
                                  ...prev,
                                  preferredFactors: {
                                    ...prev.preferredFactors,
                                    [key]: e.target.checked
                                  }
                                }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {key}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          Notification Settings
                        </label>
                        <div className="space-y-2">
                          {Object.entries(safetyPreferences.notificationSettings).map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => setSafetyPreferences(prev => ({
                                  ...prev,
                                  notificationSettings: {
                                    ...prev.notificationSettings,
                                    [key]: e.target.checked
                                  }
                                }))}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700 capitalize">
                                {key} notifications
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <Button>
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => setShowRouteInputModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Plan New Route
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/map'}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  View Safety Map
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleEmergencyAlert}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Emergency Alert
                </Button>
                {isPremiumUser && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/analytics'}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Advanced Analytics
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Premium Features */}
            {!isPremiumUser && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Shield className="h-5 w-5" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-yellow-800">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        Advanced Analytics
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        Unlimited Route Planning
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        Priority Emergency Support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        Custom Safety Reports
                      </li>
                    </ul>
                  </div>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Safety Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Safety Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">This Week</span>
                    <Badge variant="outline" className="text-green-600">
                      +5%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">This Month</span>
                    <Badge variant="outline" className="text-green-600">
                      +12%
                    </Badge>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Improving safety trend
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Manage Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Manage your emergency contacts and notification preferences
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setShowContactsModal(true)}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Contacts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RouteInputModal 
        isOpen={showRouteInputModal}
        onClose={() => setShowRouteInputModal(false)}
        onSaveRoute={handleSaveRoute}
      />

      <RouteDetailsModal
        isOpen={showRouteDetailsModal}
        onClose={() => setShowRouteDetailsModal(false)}
        routeData={selectedRoute}
      />

      <ContactsModal
        isOpen={showContactsModal}
        onClose={() => setShowContactsModal(false)}
      />
    </div>
  );
}