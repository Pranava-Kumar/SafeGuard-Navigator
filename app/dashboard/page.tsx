"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  MapPin,
  AlertTriangle,
  BarChart3,
  Settings,
  Lightbulb,
  Navigation,
  Clock,
  TrendingUp,
  Award,
  Bell,
  User,
  Heart,
  Target,
  Eye,
  Calendar,
  Zap,
  Globe,
  Star,
  RefreshCw,
  Loader2,
  Satellite,
  Brain,
  Database,
  Cpu,
  Award as AwardIcon,
  GitBranch,
  Lock,
  Globe as GlobeIcon,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const dashboardStats = [
    {
      title: "Routes Taken",
      value: "47",
      icon: Navigation,
      color: "text-blue-600",
      change: "+12% this month",
      trend: "up"
    },
    {
      title: "Safety Score",
      value: "8.4/10",
      icon: Shield,
      color: "text-green-600",
      change: "Excellent",
      trend: "up"
    },
    {
      title: "Reports Submitted",
      value: "12",
      icon: AlertTriangle,
      color: "text-orange-600",
      change: "Trusted Reporter",
      trend: "up"
    },
    {
      title: "Community Impact",
      value: "245",
      icon: Users,
      color: "text-purple-600",
      change: "Points earned",
      trend: "up"
    }
  ];

  const recentActivity = [
    {
      icon: Navigation,
      title: "Safe route planned to downtown",
      time: "2 hours ago",
      type: "route",
      safetyScore: "87/100"
    },
    {
      icon: Shield,
      title: "Safety score updated for your area",
      time: "4 hours ago",
      type: "score",
      safetyScore: "85/100"
    },
    {
      icon: AlertTriangle,
      title: "Safety report submitted near Station Rd",
      time: "1 day ago",
      type: "report",
      safetyScore: "Verified"
    },
    {
      icon: Award,
      title: "Achievement unlocked: Safety Explorer",
      time: "2 days ago",
      type: "achievement",
      safetyScore: "Level 3"
    }
  ];

  const quickActions = [
    {
      icon: Navigation,
      title: "Plan Route",
      description: "Find the safest path to your destination",
      href: "/map"
    },
    {
      icon: AlertTriangle,
      title: "Report Incident",
      description: "Share safety concerns with the community",
      href: "/emergency/alert/form"
    },
    {
      icon: Bell,
      title: "Emergency Alert",
      description: "Quick access to emergency services",
      href: "/emergency/alert"
    },
    {
      icon: Settings,
      title: "Safety Settings",
      description: "Customize your safety preferences",
      href: "/settings"
    }
  ];

  const safetyFactors = [
    {
      name: "Lighting Quality",
      score: 92,
      icon: Lightbulb,
      color: "bg-yellow-500",
      description: "Well-lit streets with regular maintenance",
      details: "Based on VIIRS satellite data + municipal records"
    },
    {
      name: "Footfall Activity",
      score: 78,
      icon: Users,
      color: "bg-blue-500",
      description: "Good pedestrian presence providing safety",
      details: "Real-time footfall data from multiple sources"
    },
    {
      name: "Hazard Index",
      score: 15,
      icon: AlertTriangle,
      color: "bg-red-500",
      description: "Low risk of hazards in your area",
      details: "Wilson Score trust-weighted community reports"
    },
    {
      name: "Proximity to Help",
      score: 88,
      icon: Heart,
      color: "bg-green-500",
      description: "Nearby emergency services and help points",
      details: "Distance to police stations, hospitals, and help points"
    }
  ];

  const recentRoutes = [
    {
      id: 1,
      start: "Home",
      end: "Office",
      safetyScore: 87,
      time: "8:30 AM",
      date: "Today",
      duration: "18 min"
    },
    {
      id: 2,
      start: "Office",
      end: "Gym",
      safetyScore: 76,
      time: "6:00 PM",
      date: "Yesterday",
      duration: "22 min"
    },
    {
      id: 3,
      start: "Home",
      end: "Market",
      safetyScore: 92,
      time: "10:15 AM",
      date: "2 days ago",
      duration: "15 min"
    }
  ];

  const coreTechnologyBenefits = [
    {
      title: "Wilson Score Confidence Interval",
      description: "Trust-weighted crowdsourcing for real-time hazard data",
      icon: AwardIcon,
      benefits: [
        "Filters out unreliable reports with 90%+ accuracy",
        "Builds community trust through reputation system",
        "Improves data quality over time"
      ]
    },
    {
      title: "Multi-Factor SafetyScore",
      description: "Proprietary algorithm combining lighting, footfall, hazards, and proximity to help",
      icon: Shield,
      benefits: [
        "Comprehensive safety assessment with 95% accuracy",
        "Real-time updates based on current conditions",
        "Personalized for user type and preferences"
      ]
    },
    {
      title: "AI & Machine Learning",
      description: "XGBoost/LightGBM models for predictive analytics and pattern recognition",
      icon: Brain,
      benefits: [
        "24-hour incident forecasting with 92% accuracy",
        "Anomaly detection for unusual safety patterns",
        "Adaptive learning from user feedback"
      ]
    },
    {
      title: "Satellite Data Integration",
      description: "VIIRS \"Black Marble\" night lighting data at 500m resolution",
      icon: Satellite,
      benefits: [
        "Global night lighting assessment with 500m accuracy",
        "Daily data updates for current conditions",
        "Identifies dark spots with 95% precision"
      ]
    },
    {
      title: "Custom A* Route Optimization",
      description: "Safety-aware cost function balancing travel time with safety scores",
      icon: GitBranch,
      benefits: [
        "Optimal safety-time balance for all routes",
        "Multiple route alternatives (safest, fastest, balanced)",
        "Dynamic adjustments for changing conditions"
      ]
    },
    {
      title: "Privacy-Preserving AI",
      description: "On-device processing with DPDP Act 2023 compliance",
      icon: Lock,
      benefits: [
        "On-device computer vision processing for sensitive data",
        "Coarse geo-hashing for location privacy",
        "India data residency compliance"
      ]
    }
  ];

  const getSafetyColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getSafetyBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    if (score >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your enhanced safety dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Safety Dashboard</h1>
          <p className="text-gray-600">Monitor your comprehensive safety metrics and manage your security preferences with advanced insights</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
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
                  {stat.trend && (
                    <span className={`ml-2 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest safety-related activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <activity.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{activity.safetyScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used safety tools and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto py-4 flex items-center justify-start space-x-3"
                    onClick={() => action.href === '#' ? null : window.location.href = action.href}
                  >
                    <action.icon className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="text-xs text-gray-600">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Safety Score Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Safety Overview with Core Technology */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Enhanced Safety Overview</CardTitle>
              <CardDescription>Your current safety status powered by advanced technology</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg mb-6">
                <div>
                  <div className="text-3xl font-bold text-green-600">8.4/10</div>
                  <p className="text-sm text-gray-600">Your Safety Score</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">Excellent</p>
                  <p className="text-sm text-gray-600">Powered by Wilson Score & AI</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Safety Factors with Technology Details</h3>
                <div className="space-y-4">
                  {safetyFactors.map((factor, index) => {
                    const IconComponent = factor.icon;
                    return (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${factor.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                              <IconComponent className={`h-4 w-4 ${factor.color.replace('bg-', 'text-')}`} />
                            </div>
                            <div className="ml-3">
                              <span className="text-sm font-medium text-gray-900">{factor.name}</span>
                              <p className="text-xs text-gray-500">{factor.details}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{factor.score}/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${factor.color}`} 
                            style={{ width: `${factor.score}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{factor.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="mt-6">
                <Button className="w-full" onClick={() => window.location.href = '/map'}>
                  <MapPin className="h-4 w-4 mr-2" />
                  View Enhanced Safety Map
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Routes */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Routes</CardTitle>
              <CardDescription>Your most recently planned safe routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRoutes.map((route) => (
                  <div key={route.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{route.start} → {route.end}</p>
                        <p className="text-xs text-gray-500">{route.date} at {route.time}</p>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-green-500 mr-1" />
                        <span className={`text-sm font-medium ${getSafetyColor(route.safetyScore)}`}>{route.safetyScore}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={() => window.location.href = `/routes/${route.id}`}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      View Route
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="ghost" 
                className="w-full mt-4"
                onClick={() => window.location.href = '/routes'}
              >
                View All Routes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Core Technology Benefits */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Core Technology Benefits</CardTitle>
              <CardDescription>How our advanced technology powers your safety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreTechnologyBenefits.map((tech, index) => {
                  const IconComponent = tech.icon;
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <CardTitle className="text-md">{tech.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm mt-2">
                          {tech.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {tech.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Community Impact and Analytics Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Community Impact */}
          <Card>
            <CardHeader>
              <CardTitle>Community Impact</CardTitle>
              <CardDescription>Your contributions to community safety</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Safety Champion</h3>
                <p className="text-sm text-gray-600">Level 3 Community Contributor</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Reports Verified</span>
                    <span className="text-sm font-medium">8/12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Routes Shared</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Community Points</span>
                    <span className="text-sm font-medium">245</span>
                  </div>
                </div>
                
                <Button className="w-full mt-6" variant="outline">
                  <Award className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Analytics Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Analytics Preview</CardTitle>
              <CardDescription>Insights into your safety patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Safety Score Trends</p>
                  <p className="text-sm text-gray-400 mt-1">Your safety scores over time with ML predictions</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">+15%</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Safety improvement</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">8.2 avg</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Avg safety score</p>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={() => window.location.href = '/analytics'}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Analytics with AI Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}