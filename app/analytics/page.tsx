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
  Navigation
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AnalyticsPage() {
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

  const insights = [
    {
      title: "Safety Score Improvement",
      description: "Overall city safety has improved by 15% over the past quarter",
      impact: "Positive",
      color: "bg-blue-50 text-blue-900 border-blue-200"
    },
    {
      title: "Increased User Engagement",
      description: "Community participation in safety reporting has increased significantly",
      impact: "Positive",
      color: "bg-green-50 text-green-900 border-green-200"
    },
    {
      title: "Faster Emergency Response",
      description: "Average response time has decreased by 20% due to better route optimization",
      impact: "Positive",
      color: "bg-purple-50 text-purple-900 border-purple-200"
    },
    {
      title: "Night-time Safety Concerns",
      description: "35% more incidents reported between 9 PM and 6 AM",
      impact: "Warning",
      color: "bg-yellow-50 text-yellow-900 border-yellow-200"
    }
  ];

  return (
    <ProtectedRoute>
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
                    <Link href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                    <Link href="/about" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</Link>
                    <Link href="/map" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Map</Link>
                    <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                    <Link href="/analytics" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Analytics</Link>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm">
                  <span className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Export Data
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Analytics Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Analytics</h1>
            <p className="text-gray-600">Comprehensive insights into safety patterns and trends for pedestrians and two-wheeler riders</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {analyticsData.map((metric, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    <div className="p-2 rounded-lg bg-blue-100">
                      <metric.icon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change} from last month
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Multi-Factor Safety Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Multi-Factor Safety Analysis
                </CardTitle>
                <CardDescription>Detailed breakdown of safety factors contributing to overall scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {safetyFactors.map((factor, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="p-1.5 rounded-md bg-blue-100 mr-2">
                            <factor.icon className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{factor.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 mr-2">{factor.score}/100</span>
                          <span className={`text-xs ${factor.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {factor.change}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${factor.color}`} 
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Demographics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  User Demographics
                </CardTitle>
                <CardDescription>Breakdown of user types and engagement patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Demographic visualization coming soon</p>
                    <p className="text-gray-500 text-sm mt-2">User distribution by type and location</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">65%</div>
                    <div className="text-xs text-gray-600">Pedestrians</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">35%</div>
                    <div className="text-xs text-gray-600">Two-wheelers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Safety Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Safety Trends Over Time
                </CardTitle>
                <CardDescription>Historical safety data and predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Time series chart coming soon</p>
                    <p className="text-gray-500 text-sm mt-2">Monthly safety score trends</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Safety scores across different neighborhoods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Heatmap visualization coming soon</p>
                    <p className="text-gray-500 text-sm mt-2">Geographic safety distribution</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Key Insights & Recommendations
              </CardTitle>
              <CardDescription>Important findings from recent safety data analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${insight.color}`}>
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{insight.title}</h3>
                        <p className="text-sm mt-1">{insight.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${insight.impact === 'Positive' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {insight.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button variant="outline">
                  <Navigation className="h-4 w-4 mr-2" />
                  View Detailed Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}