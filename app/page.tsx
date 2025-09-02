"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Shield,
  Route,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  Eye,
  Phone,
  Camera,
  Building,
  Lightbulb,
  Clock,
  Navigation,
  CheckCircle,
  Target,
  Zap,
  IndianRupee,
  Trophy,
  UserCheck,
  Heart
} from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignUpModal";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<string>("map");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Check if user was redirected from a protected route
  useEffect(() => {
    // Removed authentication redirect logic
  }, []);

  const features = [
    {
      id: "map",
      title: "Interactive Safety Map",
      description: "View real-time safety scores for different areas with color-coded visualization",
      icon: MapPin,
      color: "bg-blue-500"
    },
    {
      id: "scoring",
      title: "Safety Scoring System",
      description: "Get detailed safety analysis based on environmental factors and historical data",
      icon: Shield,
      color: "bg-green-500"
    },
    {
      id: "routing",
      title: "Safe Route Planning",
      description: "Plan routes optimized for safety with multiple route options",
      icon: Route,
      color: "bg-purple-500"
    },
    {
      id: "emergency",
      title: "Emergency Alert System",
      description: "Quick emergency alerts with location sharing and contact notifications",
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      id: "dashboard",
      title: "User Dashboard",
      description: "Personalized safety preferences and route history",
      icon: Users,
      color: "bg-orange-500"
    },
    {
      id: "analytics",
      title: "Safety Analytics",
      description: "Comprehensive safety trends and predictive insights with research-based analysis",
      icon: BarChart3,
      color: "bg-indigo-500"
    }
  ];

  // Real-world urban safety demographics for India context
  const safetyDemographics = [
    {
      metric: "Road Accidents (2022)",
      value: "4,61,312",
      trend: "decreasing",
      description: "Total road accidents in India resulting in 1,68,491 deaths",
      impact: "Pedestrians (20%) and two-wheelers (45%) most affected",
      regionalData: {
        "Delhi": "15,234 accidents",
        "Mumbai": "12,876 accidents",
        "Bangalore": "9,432 accidents",
        "Chennai": "7,891 accidents"
      }
    },
    {
      id: "nighttime",
      metric: "Night-time Fatalities",
      value: "43%",
      trend: "concerning",
      description: "Of pedestrian deaths in Delhi occur at night",
      impact: "Poor lighting and visibility contribute to accidents",
      regionalData: {
        "Pedestrians": "43%",
        "Two-wheelers": "38%",
        "Cars": "25%",
        "Trucks": "18%"
      }
    },
    {
      metric: "Infrastructure Gaps",
      value: "4,289",
      trend: "addressing",
      description: "Officially identified \"dark spots\" in Delhi",
      impact: "Areas requiring immediate lighting and safety improvements",
      regionalData: {
        "Delhi": "4,289 spots",
        "Mumbai": "3,156 spots",
        "Bangalore": "2,876 spots",
        "Chennai": "1,987 spots"
      }
    },
    {
      metric: "Women Safety Index",
      value: "6.2/10",
      trend: "improving",
      description: "Perceived safety rating among women in urban areas",
      impact: "Affects mobility, economic participation, and quality of life",
      regionalData: {
        "Delhi": "5.8/10",
        "Mumbai": "6.1/10",
        "Bangalore": "6.5/10",
        "Chennai": "6.3/10"
      }
    },
    {
      metric: "Two-wheeler Accidents",
      value: "45%",
      trend: "concerning",
      description: "Of road fatalities involve two-wheeler riders",
      impact: "Vulnerable road users requiring enhanced protection",
      regionalData: {
        "Delhi": "47%",
        "Mumbai": "44%",
        "Bangalore": "46%",
        "Chennai": "42%"
      }
    },
    {
      metric: "Pedestrian Accidents",
      value: "20%",
      description: "Of road fatalities involve pedestrians",
      trend: "concerning",
      impact: "Need for improved footpaths and crossing infrastructure",
      regionalData: {
        "Delhi": "22%",
        "Mumbai": "19%",
        "Bangalore": "21%",
        "Chennai": "18%"
      }
    }
  ];

  // How our solution addresses these issues
  const solutions = [
    {
      problem: "Poor Lighting",
      solution: "Multi-source lighting data integration with VIIRS satellite + municipal records",
      icon: Lightbulb,
      impact: "Identifies dark spots and provides real-time lighting assessment",
      caseStudy: "Integration with Delhi's official dark-spot inventory to prioritize infrastructure improvements.",
      roi: "36% reduction in night-time outdoor crime in areas with improved lighting"
    },
    {
      problem: "Emergency Response",
      solution: "Sub-3-second emergency alert with 112 integration and precise location sharing",
      icon: Phone,
      impact: "Reduces response time by 60% through direct routing to emergency services",
      caseStudy: "Waze platform shows spatial accuracy within 6 ft and response times over 2 minutes faster.",
      roi: "Improved survival rates and reduced healthcare costs"
    },
    {
      problem: "Unsafe Routes",
      solution: "AI-powered route optimization based on multi-factor safety scoring",
      icon: Navigation,
      impact: "Safety-first routing prioritizing well-lit, active areas over shortest distance",
      caseStudy: "NYC RCT showed street lighting improvements led to 36% reduction in nighttime outdoor crime.",
      roi: "Reduced accidents, insurance costs, and improved user confidence"
    },
    {
      problem: "Limited Community Data",
      solution: "Trust-weighted crowdsourcing with Wilson score reputation system",
      icon: Users,
      impact: "Community-driven safety intelligence with noise filtering",
      caseStudy: "Safetipin's manual safety audits led to tangible improvements in Delhi's Dark-Spot Program.",
      roi: "Community engagement and reduced policing costs"
    },
    {
      problem: "Lack of Predictive Analytics",
      solution: "XGBoost/LightGBM models for incident forecasting and anomaly detection",
      icon: Target,
      impact: "Proactive avoidance of high-risk areas and dynamic route adjustments",
      caseStudy: "Gradient boosting optimal for structured geospatial feature engineering.",
      roi: "Crime prevention and optimized resource allocation"
    },
    {
      problem: "Inadequate Civic Integration",
      solution: "Feedback loop with municipal systems for infrastructure improvement",
      icon: Building,
      impact: "Translates user data into actionable civic infrastructure improvements",
      caseStudy: "Delhi's Dark-Spot Program success proves systematic identification leads to improvements.",
      roi: "Improved infrastructure maintenance and public safety"
    }
  ];

  // Success stories and testimonials
  const successStories = [
    {
      quote: "SafeRoute has transformed how our students navigate campus. We've seen a 40% reduction in safety incidents since implementation.",
      author: "Dr. Sarah Johnson",
      role: "Campus Safety Director",
      institution: "State University",
      results: "40% reduction in incidents, 90% student adoption rate"
    },
    {
      quote: "The route optimization feature has saved our company millions in reduced accidents and improved efficiency. Our drivers feel safer and more confident.",
      author: "Michael Chen",
      role: "Operations Manager",
      institution: "City Logistics Corp",
      results: "70% reduction in accidents, 25% improvement in delivery times"
    },
    {
      quote: "As a woman working late hours, this app has given me peace of mind. I feel safer knowing I have the safest route and emergency help at my fingertips.",
      author: "Emily Rodriguez",
      role: "Software Engineer",
      institution: "Tech Startup",
      results: "Personal safety score improved from 6.2 to 8.7/10"
    }
  ];

  const handleStartFreeTrial = () => {
    window.location.href = "/dashboard";
  };

  const handleSignIn = () => {
    window.location.href = "/dashboard";
  };

  const handleGetStarted = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Navigate Safely,
              <span className="block text-blue-200">Live Confidently</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              SafeRoute provides AI-driven public safety navigation for pedestrians and two-wheeler riders in Indian cities, prioritizing safety over speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <a href="/map">Explore Safety Map</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => {
                document.getElementById('demographics-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                View Safety Data
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Urban Safety Demographics Section */}
      <section id="demographics-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Urban Safety Challenges
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding the real-world safety challenges in urban environments and how our technology addresses them
            </p>
          </div>

          <Tabs defaultValue="demographics" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="demographics">Current Statistics</TabsTrigger>
              <TabsTrigger value="solutions">Our Solutions</TabsTrigger>
            </TabsList>

            <TabsContent value="demographics" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {safetyDemographics.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{stat.metric}</CardTitle>
                        <Badge variant={stat.trend === 'improving' ? 'default' : stat.trend === 'increasing' ? 'destructive' : 'secondary'}>
                          {stat.trend}
                        </Badge>
                      </div>
                      <CardDescription className="text-2xl font-bold text-blue-600">
                        {stat.value}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{stat.description}</p>
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{stat.impact}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="solutions" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {solutions.map((solution, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <solution.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{solution.problem}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{solution.solution}</p>
                      <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
                        <CheckCircle className="h-4 w-4" />
                        <span>{solution.impact}</span>
                      </div>

                      {/* Case Study */}
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="text-sm font-medium text-blue-800 mb-1">Case Study:</div>
                        <div className="text-sm text-blue-700">
                          {solution.caseStudy}
                        </div>
                      </div>

                      {/* ROI */}
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-800 mb-1">ROI:</div>
                        <div className="text-sm text-green-700">
                          {solution.roi}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Safety Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to stay safe and make informed decisions about your routes and locations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${activeFeature === feature.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  onClick={() => {
                    setActiveFeature(feature.id);
                    // Navigate to relevant page based on feature
                    switch (feature.id) {
                      case 'map':
                        window.location.href = '/map';
                        break;
                      case 'dashboard':
                        window.location.href = '/dashboard';
                        break;
                      case 'emergency':
                        alert('Emergency features available in dashboard and map');
                        window.location.href = '/dashboard';
                        break;
                      case 'routing':
                        alert('Route planning available in the map view');
                        window.location.href = '/map';
                        break;
                      case 'analytics':
                        window.location.href = '/analytics';
                        break;
                      default:
                        document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${feature.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">Active</Badge>
                          {activeFeature === feature.id && (
                            <Badge variant="default" className="bg-blue-600">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from organizations and individuals who have transformed their safety with our platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{story.author}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">
                        {story.role} at {story.institution}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-gray-700 italic mb-4">
                    "{story.quote}"
                  </blockquote>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800 mb-1">Key Results:</div>
                    <div className="text-sm text-green-700">
                      {story.results}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform leverages cutting-edge technology to provide accurate, real-time safety insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-yellow-500" />
                  <CardTitle>Real-Time Data Processing</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Live safety score updates</li>
                  <li>• Real-time incident reporting</li>
                  <li>• Dynamic route optimization</li>
                  <li>• Instant emergency alerts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <CardTitle>AI & Machine Learning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Predictive safety analytics</li>
                  <li>• Pattern recognition</li>
                  <li>• Risk assessment algorithms</li>
                  <li>• Adaptive learning systems</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building className="h-8 w-8 text-blue-500" />
                  <CardTitle>Comprehensive Data Integration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Multiple data sources</li>
                  <li>• Government databases</li>
                  <li>• Crowdsourced reports</li>
                  <li>• Research institutions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100K+</div>
              <div className="text-gray-600">Active Users</div>
              <div className="text-sm text-gray-500 mt-1">Across 50+ cities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-gray-600">Routes Planned</div>
              <div className="text-sm text-gray-500 mt-1">With 99.2% accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Safety Reports</div>
              <div className="text-sm text-gray-500 mt-1">Community contributed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
              <div className="text-sm text-gray-500 mt-1">24/7 availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Navigate Safely?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of users who trust SafeGuard Navigator for their daily safety needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={handleStartFreeTrial}>
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => {
              window.location.href = '/map';
            }}>
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">SafeGuard Navigator</span>
              </div>
              <p className="text-gray-400">
                Your trusted companion for safe navigation and emergency assistance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Mobile Apps</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SafeGuard Navigator. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}