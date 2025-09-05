"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Heart,
  Home,
  Hospital,
  Backpack,
  Users,
  ArrowRight,
  MapPin,
  Bell,
  Phone,
  Contact,
  Info,
  Lightbulb,
  Shield,
  Car,
  Locate,
  BookOpen,
  Star,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  featured?: boolean;
  color?: string;
}

export default function SafetyPage() {
  const [activeTip, setActiveTip] = useState(0);

  // Safety features
  const safetyFeatures: FeatureCard[] = [
    {
      id: 'safety-tips',
      title: 'Safety Tips',
      description: 'Browse through a collection of safety tips for various situations.',
      icon: <Lightbulb className="h-8 w-8" />,
      link: '/safety/tips',
      featured: true,
    },
    {
      id: 'safety-resources',
      title: 'Safety Resources',
      description: 'Access essential safety resources including emergency kit checklist, family plan, and first aid basics.',
      icon: <Backpack className="h-8 w-8" />,
      link: '/safety/resources',
      featured: true,
    },
    {
      id: 'safety-map',
      title: 'Safety Map',
      description: 'View a map of emergency services, safe zones, and hazards in your area.',
      icon: <MapPin className="h-8 w-8" />,
      link: '/safety/map',
      featured: true,
    },
    {
      id: 'emergency-hub',
      title: 'Emergency Hub',
      description: 'Access emergency services, alerts, and contacts in one place.',
      icon: <Hospital className="h-8 w-8" />,
      link: '/emergency',
    },
    {
      id: 'safe-routes',
      title: 'Safe Routes',
      description: 'Plan your journey with safety as the priority.',
      icon: <Car className="h-8 w-8" />,
      link: '/routes',
    },
    {
      id: 'safety-score',
      title: 'Safety Score',
      description: 'Check the safety score of different areas and routes.',
      icon: <Shield className="h-8 w-8" />,
      link: '/safety/score',
    },
  ];

  // Get featured features
  const featuredFeatures = safetyFeatures.filter(feature => feature.featured);
  
  // Get other features
  const otherFeatures = safetyFeatures.filter(feature => !feature.featured);

  // Safety tips for rotation
  const safetyTips = [
    {
      title: "Stay Aware of Your Surroundings",
      content: "Always be conscious of your environment, especially in unfamiliar areas. Trust your instincts if something feels wrong."
    },
    {
      title: "Share Your Location",
      content: "Let someone know your plans and expected return time. Use location sharing apps when traveling alone."
    },
    {
      title: "Emergency Contacts",
      content: "Keep a list of emergency contacts easily accessible on your phone and in your wallet or bag."
    },
    {
      title: "Well-Lit Paths",
      content: "When walking at night, stick to well-lit areas and avoid shortcuts through dark alleys or parking lots."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900">Safety Hub</h1>
            <p className="mt-2 text-gray-600">
              Your central resource for safety information, emergency preparedness, and safety-focused navigation.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Reminder */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <AlertTriangle className="h-10 w-10 text-red-600 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-red-800 mb-2">
                Emergency Helpline: <strong>112</strong>
              </h2>
              <p className="text-red-700">
                In case of immediate danger or emergency, call the national emergency number.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 md:ml-auto">
              <Button asChild variant="destructive">
                <a href="tel:112">
                  <Phone className="h-4 w-4 mr-2" />
                  Call 112
                </a>
              </Button>
              <Button asChild variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                <a href="sms:112">
                  <Contact className="h-4 w-4 mr-2" />
                  Text 112
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Safety Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredFeatures.map((feature) => (
              <Card key={feature.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                    <div className="text-blue-600">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={feature.link}>
                      Explore
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Tip Rotation */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                Safety Tip of the Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {safetyTips[activeTip].title}
                </h3>
                <p className="text-gray-600">
                  {safetyTips[activeTip].content}
                </p>
                <div className="flex justify-center mt-6 space-x-2">
                  {safetyTips.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTip(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === activeTip ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-label={`View tip ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Other Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Safety Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherFeatures.map((feature) => (
              <Card key={feature.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mb-3">
                    <div className="text-green-600">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-md">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {feature.description}
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href={feature.link}>
                      Learn More
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Safety Matters</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Why Safety Preparedness is Important</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Being prepared for emergencies can make a significant difference in ensuring your safety and the safety of your loved ones. SafeRoute provides you with the tools and resources you need to:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Stay informed about potential hazards in your area</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create and maintain emergency preparedness plans</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Navigate safely through unfamiliar areas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Quickly access emergency services when needed</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Share your location with trusted contacts during emergencies</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Learn essential safety skills and knowledge</span>
                  </li>
                </ul>
                <Button asChild className="w-full mt-6">
                  <Link href="/safety/resources">
                    Explore Safety Resources
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How SafeRoute Helps You Stay Safe</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Our platform is designed with your safety in mind, offering features that help you:
                </p>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Locate className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Safe Navigation</h4>
                      <p className="text-sm text-gray-600">
                        Plan routes that prioritize your safety based on real-time data and community reports.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Bell className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Emergency Alerts</h4>
                      <p className="text-sm text-gray-600">
                        Send your location and status to emergency contacts with a single tap.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Safety Map</h4>
                      <p className="text-sm text-gray-600">
                        Visualize emergency services, safe zones, and potential hazards in your area.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Lightbulb className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Safety Knowledge</h4>
                      <p className="text-sm text-gray-600">
                        Access a comprehensive library of safety tips and resources.
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full mt-6" variant="outline">
                  <Link href="/routes">
                    Try Safe Navigation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Safety Statistics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Safety Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">87%</p>
                <p className="text-sm text-gray-600">Safer Routes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">12.5K</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">245</p>
                <p className="text-sm text-gray-600">Lives Impacted</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">User Rating</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-6 md:mb-0">
                <h3 className="text-2xl font-bold mb-2">Start Your Safety Journey Today</h3>
                <p className="text-blue-100 max-w-2xl">
                  Explore our safety resources, create your emergency plan, and learn how to navigate safely. Your safety is our priority.
                </p>
              </div>
              <Button asChild variant="secondary" size="lg">
                <Link href="/safety/tips">
                  Explore Safety Tips
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            These safety resources are provided for informational purposes only and should not replace professional advice or training.
            In case of emergency, always call the national emergency number: <strong className="text-red-600">112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}