"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, MapPin, Zap, Building, Lightbulb, Navigation } from "lucide-react";

export default function AboutPage() {
  const impact = [
    {
      metric: "25%",
      label: "Reduction in Low-lit Exposure",
      description: "Target outcome for route safety improvement"
    },
    {
      metric: "+30%",
      label: "Self-Reported Safety Perception",
      description: "User confidence improvement with SafeRoute"
    },
    {
      metric: "<3s",
      label: "112/SOS Activation",
      description: "Sub-3-second emergency response activation"
    },
    {
      metric: "90%",
      label: "Report Verification Rate",
      description: "Trust-weighted crowdsourced accuracy"
    }
  ];

  const teamMembers = [
    {
      name: "Pranava Kumar",
      role: "Team Lead",
      bio: "Infosys PALS TechZooka Hackathon 2025 participant leading the SafeGuard Navigators team.",
      expertise: ["AI/ML", "Geospatial Systems", "Urban Safety", "Next.js"]
    },
    {
      name: "Sam Daniel J",
      role: "Backend Developer",
      bio: "Full-stack developer specializing in real-time safety data processing and microservices.",
      expertise: ["Python", "FastAPI", "PostgreSQL", "Kafka"]
    },
    {
      name: "Muhilan M",
      role: "Frontend Developer",
      bio: "UI/UX specialist focused on intuitive safety systems for diverse user needs.",
      expertise: ["React", "Next.js", "Tailwind CSS", "Shadcn UI"]
    },
    {
      name: "Mrs. Chinchu Nair",
      role: "Mentor",
      description: "Assistant Professor, Department of CSE guiding the team's technical approach.",
      expertise: ["Computer Science", "Software Engineering", "Education"]
    }
  ];

  const milestones = [
    {
      year: "2025",
      title: "Hackathon Participation",
      description: "Participating in Infosys PALS TechZooka Hackathon 2025 with SafeRoute solution.",
      icon: Building
    },
    {
      year: "2025",
      title: "AI-Driven Safety Scoring",
      description: "Developing multi-factor SafetyScore algorithm prioritizing pedestrian and two-wheeler safety.",
      icon: Lightbulb
    },
    {
      year: "2025",
      title: "DPDP Act 2023 Compliance",
      description: "Implementing India's Digital Personal Data Protection Act compliance framework.",
      icon: Shield
    },
    {
      year: "2025",
      title: "Trust-Weighted Crowdsourcing",
      description: "Building Wilson score-based reputation system for community safety intelligence.",
      icon: Users
    }
  ];

  const coreValues = [
    {
      title: "Safety First",
      description: "Prioritizing user safety and protection above all else in route planning and navigation.",
      icon: Shield
    },
    {
      title: "India-First Design",
      description: "Tailored specifically for Indian urban contexts with regulatory compliance and language support.",
      icon: MapPin
    },
    {
      title: "Community Intelligence",
      description: "Leveraging trust-weighted crowdsourcing for real-time, verifiable safety insights.",
      icon: Users
    },
    {
      title: "Privacy-Preserving AI",
      description: "On-device processing and data minimization to protect user privacy and comply with DPDP Act.",
      icon: Zap
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
                  <Link href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
                  <Link href="/about" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</Link>
                  <Link href="/map" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Map</Link>
                  <Link href="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                  <Link href="/analytics" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Analytics</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>Sign In</Button>
              <Button onClick={() => window.location.href = "/dashboard"}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About SafeRoute
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Building AI Runways for Safer Urban Mobility in India through intelligent navigation for pedestrians and two-wheeler riders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = "/map"}>
                Explore Safety Map
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => {
                document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Meet the Team
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600">
              To address India&apos;s severe road safety crisis by building intelligent navigation that prioritizes personal safety over speed for vulnerable road users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <value.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              India&apos;s Road Safety Crisis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Addressing the urgent need for safety-first navigation in Indian urban contexts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">The Challenge</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">4,61,312 Road Accidents (2022)</h4>
                    <p className="text-gray-600">Resulting in 1,68,491 deaths with 65% affecting vulnerable road users</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">43% Night-time Fatalities</h4>
                    <p className="text-gray-600">Of pedestrian deaths in Delhi occur at night due to poor lighting</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">4,289 Dark Spots</h4>
                    <p className="text-gray-600">Officially identified in Delhi, creating perception and reality of unsafe routes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Solution</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Multi-Factor SafetyScore</h4>
                    <p className="text-gray-600">Algorithm combining lighting, footfall, hazards, and proximity to help</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Trust-Weighted Crowdsourcing</h4>
                    <p className="text-gray-600">Wilson score-based reputation system filtering noisy/malicious reports</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">DPDP Act 2023 Compliance</h4>
                    <p className="text-gray-600">Explicit consent flows and user rights mechanisms for data privacy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Measurable Impact Targets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to creating tangible safety improvements for Indian urban communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impact.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-blue-600">{item.metric}</CardTitle>
                  <CardDescription className="text-lg font-semibold">{item.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team-section" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              SafeGuard Navigators Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dedicated team building AI-driven public safety navigation for the Infosys PALS TechZooka Hackathon 2025
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{member.bio || member.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise && member.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hackathon Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our mission to build AI Runways for Safer Urban Mobility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <milestone.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-blue-600 mb-2">{milestone.year}</Badge>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade architecture designed for scalability and real-time safety intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-blue-600" />
                  Frontend & Mobile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Next.js 15+ with App Router</li>
                  <li>• React 19+</li>
                  <li>• TypeScript 5+</li>
                  <li>• Tailwind CSS v4+</li>
                  <li>• Shadcn UI & Magic UI</li>
                  <li>• Mappls SDK for Indian addresses</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-600" />
                  Backend & AI/ML
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• FastAPI (Python) for ML services</li>
                  <li>• NestJS (TypeScript) for microservices</li>
                  <li>• PostgreSQL + PostGIS for geospatial data</li>
                  <li>• XGBoost/LightGBM for safety prediction</li>
                  <li>• Kafka/RabbitMQ for event streaming</li>
                  <li>• OSRM for route optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• DPDP Act 2023 compliant architecture</li>
                  <li>• JWT with refresh tokens</li>
                  <li>• AES-256 encryption at rest</li>
                  <li>• TLS 1.3 for data in transit</li>
                  <li>• Data minimization principles</li>
                  <li>• India data residency requirements</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Us in Building Safer Cities
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Be part of the movement to make urban navigation safer for pedestrians and two-wheeler riders in India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = "/dashboard"}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => window.location.href = "/map"}>
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
                <span className="ml-2 text-xl font-bold">SafeRoute</span>
              </div>
              <p className="text-gray-400">
                AI-driven public safety navigation for pedestrians and two-wheeler riders in Indian cities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hackathon</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About Team</a></li>
                <li><a href="#" className="hover:text-white">Solution Document</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SafeGuard Navigators. All rights reserved. | Infosys PALS TechZooka Hackathon 2025</p>
          </div>
        </div>
      </footer>
    </div>
  );
}