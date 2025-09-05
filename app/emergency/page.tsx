/**
 * Emergency Hub Page
 * Central hub for all emergency-related features
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Send,
  User,
  MapPin,
  Clock,
  Bell,
  Building,
  Shield,
  Heart,
  Users,
  FileText,
  Zap,
  Home,
  Car,
  Waves,
  Umbrella,
  Battery,
  Wifi,
  Radio,
  HeartPulse,
  Lightbulb,
  Navigation,
  Eye,
  CheckCircle,
  Loader2,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Star,
  Award,
  ThumbsUp,
  Share2,
  Flag,
  Calendar,
  Contact,
  Info,
  Settings,
  HelpCircle,
  Printer,
  Download,
  RefreshCw,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  Video,
  Image,
  Paperclip,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isVerified: boolean;
}

interface EmergencyService {
  id: string;
  name: string;
  type: string;
  distance: string;
  responseTime: string;
  rating: number;
}

interface EmergencyPlan {
  id: string;
  name: string;
  lastUpdated: string;
  status: 'active' | 'draft' | 'completed';
  steps: number;
  completedSteps: number;
}

export default function EmergencyHubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeAlerts, setActiveAlerts] = useState<number>(0);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [plans, setPlans] = useState<EmergencyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [location, setLocation] = useState<[number, number] | null>(null);

  // Check for active alerts on page load
  useEffect(() => {
    Promise.all([
      fetchActiveAlerts(),
      fetchEmergencyContacts(),
      fetchNearbyServices(),
      fetchEmergencyPlans()
    ]).finally(() => setLoading(false));
    
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Fetch active alerts count
  const fetchActiveAlerts = async () => {
    try {
      const response = await fetch('/api/emergency');
      if (!response.ok) throw new Error('Failed to fetch alerts');

      const data = await response.json();
      const activeCount = data.alerts?.filter((alert: { status: string }) => alert.status === 'active').length || 0;
      setActiveAlerts(activeCount);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  // Fetch emergency contacts
  const fetchEmergencyContacts = async () => {
    try {
      const response = await fetch('/api/emergency/contact');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    }
  };

  // Fetch nearby emergency services
  const fetchNearbyServices = async () => {
    try {
      // Mock data for demonstration
      const mockServices: EmergencyService[] = [
        {
          id: "1",
          name: "City Hospital",
          type: "Hospital",
          distance: "1.2 km",
          responseTime: "5 min",
          rating: 4.8
        },
        {
          id: "2",
          name: "Central Police Station",
          type: "Police",
          distance: "800 m",
          responseTime: "3 min",
          rating: 4.5
        },
        {
          id: "3",
          name: "Fire Department",
          type: "Fire",
          distance: "1.5 km",
          responseTime: "6 min",
          rating: 4.7
        }
      ];
      setServices(mockServices);
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  // Fetch emergency plans
  const fetchEmergencyPlans = async () => {
    try {
      // Mock data for demonstration
      const mockPlans: EmergencyPlan[] = [
        {
          id: "1",
          name: "Family Emergency Plan",
          lastUpdated: "2023-06-15",
          status: "active",
          steps: 8,
          completedSteps: 6
        },
        {
          id: "2",
          name: "Workplace Safety Plan",
          lastUpdated: "2023-05-22",
          status: "completed",
          steps: 12,
          completedSteps: 12
        },
        {
          id: "3",
          name: "Travel Emergency Plan",
          status: "draft",
          lastUpdated: "2023-07-01",
          steps: 10,
          completedSteps: 3
        }
      ];
      setPlans(mockPlans);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  // Get safety tip based on time of day
  const getTimeBasedSafetyTip = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      return "Morning Safety: Inform someone of your route when traveling alone.";
    } else if (hour >= 12 && hour < 18) {
      return "Afternoon Safety: Stay hydrated and take breaks in shaded areas.";
    } else if (hour >= 18 && hour < 22) {
      return "Evening Safety: Stick to well-lit paths and stay aware of your surroundings.";
    } else {
      return "Night Safety: Avoid isolated areas and keep emergency contacts informed.";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading emergency hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Emergency Hub</h1>
            <p className="text-gray-600 mt-2">
              Access emergency services, manage your emergency contacts, and send alerts in case of emergency.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Helpline Banner */}
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-destructive flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-1">
                  Emergency Helpline: <strong>112</strong>
                </h2>
                <p className="text-gray-700">
                  In case of immediate danger or emergency, call the national emergency number.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 md:ml-auto">
              <Button
                variant="destructive"
                size="lg"
                asChild
                className="flex-1"
              >
                <a href="tel:112">
                  <Phone className="h-5 w-5 mr-2" />
                  Call 112
                </a>
              </Button>

              <Button
                variant="destructive"
                size="lg"
                asChild
                className="flex-1"
              >
                <a href="sms:112">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Text 112
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Active Alerts Notification */}
        {activeAlerts > 0 && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Active Emergency Alerts</AlertTitle>
            <AlertDescription>
              You have {activeAlerts} active emergency alert{activeAlerts !== 1 ? 's' : ''}.
              <Button
                variant="link"
                className="ml-2 p-0 h-auto"
                onClick={() => router.push('/emergency/alerts')}
              >
                View Alerts
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contacts</p>
                  <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Services</p>
                  <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Plans</p>
                  <p className="text-2xl font-bold text-gray-900">{plans.filter(p => p.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{activeAlerts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time-based Safety Tip */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <Lightbulb className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Safety Tip of the Day</h3>
                  <p className="text-gray-600 mt-1">{getTimeBasedSafetyTip()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Emergency Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Emergency Actions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Emergency Alert Card */}
                <Card className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-red-100">
                        <Send className="h-5 w-5 text-red-600" />
                      </div>
                      <CardTitle className="text-lg">Send Alert</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-gray-600 text-sm mb-4">
                      Send emergency alerts to your contacts and nearby services.
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Includes your location</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Instant notification</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => router.push('/emergency/alert/form')}
                    >
                      Send Alert
                    </Button>
                  </CardFooter>
                </Card>

                {/* Emergency Contacts Card */}
                <Card className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <CardTitle className="text-lg">Emergency Contacts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-gray-600 text-sm mb-4">
                      Manage your emergency contacts who will be notified.
                    </p>
                    <div className="text-sm text-gray-900 mb-2">
                      {contacts.length} contact{contacts.length !== 1 ? 's' : ''} saved
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      <span>{contacts.filter(c => c.isVerified).length} verified</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/emergency/contacts')}
                    >
                      Manage Contacts
                    </Button>
                  </CardFooter>
                </Card>

                {/* Emergency Services Card */}
                <Card className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-green-100">
                        <Building className="h-5 w-5 text-green-600" />
                      </div>
                      <CardTitle className="text-lg">Emergency Services</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-gray-600 text-sm mb-4">
                      Find emergency services near you with directions.
                    </p>
                    <div className="space-y-2">
                      {services.slice(0, 2).map((service) => (
                        <div key={service.id} className="flex items-center text-xs">
                          <span className="font-medium w-20 truncate">{service.type}:</span>
                          <span className="text-gray-600">{service.distance}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/emergency/services')}
                    >
                      Find Services
                    </Button>
                  </CardFooter>
                </Card>

                {/* Alert History Card */}
                <Card className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-purple-100">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">Alert History</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-gray-600 text-sm mb-4">
                      View your active and past emergency alerts.
                    </p>
                    <div className="text-sm text-gray-900">
                      {activeAlerts} active alert{activeAlerts !== 1 ? 's' : ''}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/emergency/alerts')}
                    >
                      View Alerts
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Emergency Plans */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Emergency Plans</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/emergency/plans')}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  New Plan
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{plan.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">Updated {plan.lastUpdated}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          plan.status === 'active' ? 'bg-green-100 text-green-800' :
                          plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{plan.completedSteps}/{plan.steps} steps</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(plan.completedSteps / plan.steps) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-3"
                        onClick={() => router.push(`/emergency/plans/${plan.id}`)}
                      >
                        {plan.status === 'active' ? 'Continue Plan' : 'View Details'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/safety/tips')}
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Safety Tips
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/map?emergency=true')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Emergency Map
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/emergency/checklist')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Emergency Checklist
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/emergency/guides')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Emergency Guides
                </Button>
              </CardContent>
            </Card>

            {/* Nearby Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-blue-500" />
                  Nearby Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
                        <p className="text-xs text-gray-500">{service.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-900">{service.distance}</p>
                        <p className="text-xs text-gray-500">{service.responseTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3"
                  onClick={() => router.push('/emergency/services')}
                >
                  View All Services
                </Button>
              </CardContent>
            </Card>

            {/* Emergency Kit Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HeartPulse className="h-5 w-5 mr-2 text-red-500" />
                  Emergency Kit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">First Aid Kit</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Flashlight</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Batteries</span>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Water</span>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full mt-3"
                  onClick={() => router.push('/safety/resources/emergency-kit')}
                >
                  Manage Kit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            The emergency features are designed to assist in emergency situations, but should not replace calling emergency services directly in case of immediate danger.
            Always call <strong className="text-red-600">112</strong> for immediate emergencies.
          </p>
        </div>
      </div>
    </div>
  );
}