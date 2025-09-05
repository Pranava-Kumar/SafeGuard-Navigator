"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  User,
  Users as UsersIcon,
  Calendar,
  RefreshCw,
  Download,
  Loader2,
  Clock,
  Lightbulb,
  Target,
  Navigation,
  MapPin
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
      icon: UsersIcon
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
      color: "bg-yellow-500",
      description: "Well-lit streets with regular maintenance"
    },
    {
      name: "Footfall Activity",
      score: 78,
      change: "-2%",
      trend: "down",
      icon: UsersIcon,
      color: "bg-blue-500",
      description: "Good pedestrian presence providing safety"
    },
    {
      name: "Hazard Index",
      score: 15,
      change: "-8%",
      trend: "down",
      icon: AlertTriangle,
      color: "bg-red-500",
      description: "Low risk of hazards in your area"
    },
    {
      name: "Proximity to Help",
      score: 88,
      change: "+3%",
      trend: "up",
      icon: Target,
      color: "bg-green-500",
      description: "Nearby emergency services and help points"
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
      icon: UsersIcon
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

  const incidentTypes = [
    { type: "Street Lighting", count: 32, percentage: 22.5 },
    { type: "Potholes", count: 28, percentage: 19.7 },
    { type: "Unsafe Pedestrian Areas", count: 24, percentage: 16.9 },
    { type: "Traffic Violations", count: 18, percentage: 12.7 },
    { type: "Suspicious Activity", count: 15, percentage: 10.6 },
    { type: "Other", count: 25, percentage: 17.6 }
  ];

  const timeOfDayData = [
    { time: "6 AM - 9 AM", incidents: 12, color: "bg-blue-500" },
    { time: "9 AM - 12 PM", incidents: 18, color: "bg-green-500" },
    { time: "12 PM - 3 PM", incidents: 22, color: "bg-yellow-500" },
    { time: "3 PM - 6 PM", incidents: 28, color: "bg-orange-500" },
    { time: "6 PM - 9 PM", incidents: 35, color: "bg-red-500" },
    { time: "9 PM - 12 AM", incidents: 42, color: "bg-purple-500" },
    { time: "12 AM - 3 AM", incidents: 25, color: "bg-indigo-500" },
    { time: "3 AM - 6 AM", incidents: 15, color: "bg-pink-500" }
  ];

  const safetyTrendData = [
    { month: "Jan", score: 7.2 },
    { month: "Feb", score: 7.4 },
    { month: "Mar", score: 7.5 },
    { month: "Apr", score: 7.6 },
    { month: "May", score: 7.8 },
    { month: "Jun", score: 7.9 },
    { month: "Jul", score: 8.1 },
    { month: "Aug", score: 8.2 },
    { month: "Sep", score: 8.4 },
    { month: "Oct", score: 8.5 },
    { month: "Nov", score: 8.6 },
    { month: "Dec", score: 8.7 }
  ];

  const topAreas = [
    { area: "Downtown Core", score: 8.9, change: "+0.2" },
    { area: "University District", score: 8.7, change: "+0.1" },
    { area: "Business Park", score: 8.5, change: "-0.1" },
    { area: "Residential Zone A", score: 8.3, change: "+0.3" },
    { area: "Industrial Area", score: 7.8, change: "-0.2" }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <span className="text-green-600">↑</span>
    ) : (
      <span className="text-red-600">↓</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">

      {/* Analytics Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into urban safety patterns and trends</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("incidents")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "incidents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Incident Analysis
            </button>
            <button
              onClick={() => setActiveTab("trends")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "trends"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Trends & Patterns
            </button>
            <button
              onClick={() => setActiveTab("areas")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "areas"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Area Comparison
            </button>
          </nav>
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
                      {getTrendIcon(stat.trend)} {stat.change}
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
              <div className="h-64 flex items-center justify-center">
                <div className="w-full">
                  <div className="flex items-end h-48 space-x-1 mb-4">
                    {safetyTrendData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t hover:from-blue-600 hover:to-blue-400 transition-all"
                          style={{ height: `${(data.score / 10) * 100}%` }}
                        ></div>
                        <span className="text-xs text-gray-600 mt-1">{data.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
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
              <div className="h-64">
                <div className="space-y-3 h-full flex flex-col justify-center">
                  {incidentTypes.map((incident, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-24 text-sm text-gray-600 truncate">{incident.type}</div>
                      <div className="flex-1 ml-2">
                        <div className="flex items-center">
                          <div 
                            className="h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${incident.percentage}%` }}
                          ></div>
                          <span className="text-sm text-gray-600 ml-2 w-12">{incident.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Safety Factors and Time of Day Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Safety Factors Analysis</CardTitle>
              <CardDescription>Detailed breakdown of safety components</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safetyFactors.map((factor, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <factor.icon className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">{factor.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{factor.score}/100</span>
                        <span className={`text-xs ${factor.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {getTrendIcon(factor.trend)} {factor.change}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${factor.color}`} 
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{factor.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time of Day Analysis</CardTitle>
              <CardDescription>Incident frequency throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <div className="flex items-end justify-between h-48 space-x-1">
                  {timeOfDayData.map((timeSlot, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className={`w-full rounded-t ${timeSlot.color} hover:opacity-75 transition-opacity`}
                        style={{ height: `${(timeSlot.incidents / 50) * 100}%` }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-1 rotate-45 origin-left transform -translate-y-2 translate-x-2 w-20 text-left">
                        {timeSlot.time}
                      </span>
                    </div>
                  ))}
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
                        <p className="text-sm mt-2 font-medium">{concern.impact}</p>
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