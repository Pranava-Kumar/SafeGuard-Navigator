"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Lightbulb, 
  Users, 
  MapPin, 
  AlertTriangle,
  Target,
  Clock,
  Navigation,
  Eye,
  User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { user } = useAuth();

  const analyticsData = [
    {
      title: "Citywide Safety",
      value: "7.8/10",
      change: "+0.3",
      trend: "up",
      description: "Overall safety score across all monitored areas",
      icon: Shield
    },
    {
      title: "Incident Reports",
      value: "142",
      change: "-12%",
      trend: "down",
      description: "Total incident reports submitted this month",
      icon: AlertTriangle
    },
    {
      title: "Active Users",
      value: "12.5K",
      change: "+8%",
      trend: "up",
      description: "Users actively using safety features",
      icon: Users
    },
    {
      title: "Response Time",
      value: "4.2min",
      change: "-0.8min",
      trend: "down",
      description: "Average emergency response time",
      icon: Clock
    }
  ];

  const safetyFactors = [
    {
      name: "Lighting Quality",
      score: 92,
      change: "+5%",
      trend: "up",
      icon: Lightbulb,
      color: "bg-yellow-500"
    },
    {
      name: "Footfall Activity",
      score: 78,
      change: "-2%",
      trend: "down",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      name: "Hazard Index",
      score: 15,
      change: "-8%",
      trend: "down",
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      name: "Proximity to Help",
      score: 88,
      change: "+3%",
      trend: "up",
      icon: Target,
      color: "bg-green-500"
    }
  ];

  const safetyInsights = [
    {
      title: "Safety Score Improvement",
      description: "Overall city safety has improved by 15% over the past quarter",
      impact: "Positive",
      color: "bg-blue-50 text-blue-900 border-blue-200",
      icon: TrendingUp
    },
    {
      title: "Increased User Engagement",
      description: "Community participation in safety reporting has increased significantly",
      impact: "Positive",
      color: "bg-green-50 text-green-900 border-green-200",
      icon: Users
    },
    {
      title: "Faster Emergency Response",
      description: "Average response time has decreased by 20% due to better route optimization",
      impact: "Positive",
      color: "bg-purple-50 text-purple-900 border-purple-200",
      icon: Navigation
    },
    {
      title: "Night-time Safety Concerns",
      description: "35% more incidents reported between 9 PM and 6 AM",
      impact: "Warning",
      color: "bg-yellow-50 text-yellow-900 border-yellow-200",
      icon: Clock
    }
  ];

  const quickActions = [
    {
      icon: MapPin,
      title: "View Safety Map",
      description: "Explore detailed safety information on the interactive map",
      action: "View Map",
      href: "/map"
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Access comprehensive safety analytics and trends",
      action: "View Reports",
      href: "#"
    },
    {
      icon: AlertTriangle,
      title: "Report Incident",
      description: "Submit a safety report for your area",
      action: "Report Now",
      href: "/emergency/alert/form"
    },
    {
      icon: Target,
      title: "Safety Recommendations",
      description: "Get personalized safety recommendations",
      action: "View Tips",
      href: "/safety/tips"
    }
  ];

  const safetyConcerns = [
    {
      title: "Poor Lighting Areas",
      description: "Several areas identified with inadequate street lighting",
      impact: "High Risk",
      color: "bg-red-50 text-red-900 border-red-200"
    },
    {
      title: "Low Footfall Zones",
      description: "Isolated areas with minimal pedestrian activity at night",
      impact: "Moderate Risk",
      color: "bg-yellow-50 text-yellow-900 border-yellow-200"
    },
    {
      title: "Recent Incident Clusters",
      description: "Increased incidents reported in specific neighborhoods",
      impact: "Moderate Risk",
      color: "bg-yellow-50 text-yellow-900 border-yellow-200"
    },
    {
      title: "Emergency Service Gaps",
      description: "Areas with longer response times to emergency calls",
      impact: "High Risk",
      color: "bg-red-50 text-red-900 border-red-200"
    }
  ];

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">SafeRoute</span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="/">Home</a>
                  <a href="/about" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</a>
                  <a href="/map" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Map</a>
                  <a href="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                  <a href="/analytics" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Analytics</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName || user?.email}!
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Analytics Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into urban safety patterns and trends</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analyticsData.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.change && (
                    <span className={`ml-2 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Safety Score Trends</CardTitle>
              <CardDescription>Historical safety scores across different areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Interactive chart visualization</p>
                  <p className="text-sm text-gray-400 mt-1">Historical data trends</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Incident Distribution</CardTitle>
              <CardDescription>Types and frequency of safety incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Real-time incident map</p>
                  <p className="text-sm text-gray-400 mt-1">Live data visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Safety Insights</CardTitle>
              <CardDescription>AI-powered analysis of safety patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safetyInsights.map((insight, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg bg-blue-100 mr-3">
                        <insight.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{insight.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${insight.color}`}>
                            {insight.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Immediate steps to improve safety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="p-2 rounded-lg bg-green-100 mr-3">
                        <action.icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => action.href === '#' ? null : window.location.href = action.href}>
                          {action.action}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Concerns */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Current Safety Concerns</CardTitle>
              <CardDescription>Areas and issues requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safetyConcerns.map((concern, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${concern.color}`}>
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900">{concern.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{concern.description}</p>
                        <p className="text-sm mt-2">{concern.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}