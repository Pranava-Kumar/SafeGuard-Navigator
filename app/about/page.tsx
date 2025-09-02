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
      role: "Team Leader, Dept of IT, Final year",
      bio: "Leading the SafeGuard Navigators team in the Infosys PALS TechZooka Hackathon 2025. Responsible for overall project architecture, AI/ML implementation, and geospatial systems.",
      expertise: ["AI/ML", "Geospatial Systems", "Urban Safety", "Next.js", "Python", "FastAPI"]
    },
    {
      name: "Sam Daniel J",
      role: "Team Member, Dept of CSE - DS&AI, Final Year",
      bio: "Handling backend systems, data pipelines, and infrastructure. Focused on real-time safety data processing and microservices architecture.",
      expertise: ["Python", "FastAPI", "PostgreSQL", "Kafka", "Data Engineering", "System Design"]
    },
    {
      name: "Muhilan M",
      role: "Team Member, Dept of CSE, Final Year",
      bio: "Specializing in creating intuitive safety systems with a focus on user experience. Leading the design efforts to ensure accessibility and usability for diverse user needs.",
      expertise: ["UI/UX Design", "React", "Next.js", "Tailwind CSS", "Shadcn UI", "Figma"]
    },
    {
      name: "Mrs. Chinchu Nair",
      role: "Mentor",
      description: "Assistant Professor, Department of CSE guiding the team's technical approach and providing academic mentorship.",
      expertise: ["Computer Science", "Software Engineering", "Education"]
    }
  ];

  const milestones = [
    {
      title: "Project Inception",
      year: "2025",
      description: "Team formation and ideation for the Infosys PALS TechZooka Hackathon",
      icon: Lightbulb
    },
    {
      title: "Solution Design",
      year: "2025",
      description: "Architecture planning and technology stack selection for SafeRoute platform",
      icon: Building
    },
    {
      title: "Prototype Development",
      year: "2025",
      description: "Implementation of core features including SafetyScore algorithm and routing engine",
      icon: Zap
    },
    {
      title: "Hackathon Submission",
      year: "2025",
      description: "Final submission for the Infosys PALS TechZooka Hackathon 2025",
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
      title: "Privacy-Preserving AI",
      description: "On-device processing and data minimization to protect user privacy and comply with DPDP Act.",
      icon: Zap
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjAuNSIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              About SafeRoute
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-fade-in-delay">
              Building AI Runways for Safer Urban Mobility in India through intelligent navigation for pedestrians and two-wheeler riders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-delay-2">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-transform" onClick={() => window.location.href = "/map"}>
                Explore Safety Map
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 transition-transform" onClick={() => {
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600">
              To address India&apos;s severe road safety crisis by building intelligent navigation that prioritizes personal safety over speed for vulnerable road users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {coreValues.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <MapPin className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              India&apos;s Road Safety Crisis
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Addressing the urgent need for safety-first navigation in Indian urban contexts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                The Challenge
              </h3>
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
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-xl shadow-lg border border-green-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                Our Solution
              </h3>
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
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Measurable Impact Targets
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to creating tangible safety improvements for Indian urban communities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impact.map((item, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
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

          {/* Mentor Highlight */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white shadow-xl border-2 border-indigo-500">
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-4xl flex-shrink-0 border-4 border-white shadow-lg">
                    {teamMembers[3].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <Badge variant="secondary" className="mb-4 bg-yellow-400 text-indigo-900 text-sm font-bold px-4 py-2 rounded-full">
                      MENTOR
                    </Badge>
                    <h3 className="text-3xl font-bold mb-2">{teamMembers[3].name}</h3>
                    <p className="text-xl mb-4 text-indigo-100">{teamMembers[3].role}</p>
                    <p className="text-lg mb-6">{teamMembers[3].description}</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {teamMembers[3].expertise && teamMembers[3].expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="bg-white text-indigo-700">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Team Leader Highlight */}
          <div className="mb-16">
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white shadow-xl border-2 border-blue-400">
              <div className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-white to-gray-200 rounded-full flex items-center justify-center text-blue-600 font-bold text-4xl flex-shrink-0 border-4 border-white shadow-lg">
                    {teamMembers[0].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <Badge variant="secondary" className="mb-4 bg-white text-blue-600 text-sm font-bold px-4 py-2 rounded-full">
                      TEAM LEADER
                    </Badge>
                    <h3 className="text-3xl font-bold mb-2">{teamMembers[0].name}</h3>
                    <p className="text-xl mb-4 text-blue-100">{teamMembers[0].role}</p>
                    <p className="text-lg mb-6">{teamMembers[0].bio}</p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {teamMembers[0].expertise && teamMembers[0].expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="secondary" className="bg-white text-blue-600">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Team Members */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.slice(1, 3).map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1 border-l-4 border-blue-400">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">{member.name}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{member.bio || member.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise && member.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
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

      {/* Technology Stack */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
              <Zap className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Technology Stack
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade architecture designed for scalability and real-time safety intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
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

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
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

            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-6 mx-auto">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Us in Building Safer Cities
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Be part of the movement to make urban navigation safer for pedestrians and two-wheeler riders in India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-transform" onClick={() => window.location.href = "/dashboard"}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 transition-transform" onClick={() => window.location.href = "/map"}>
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