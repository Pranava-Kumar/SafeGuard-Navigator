"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, MapPin, Route, AlertTriangle, BarChart3, Target, Zap, CheckCircle, Award, Building, Lightbulb, Phone, Navigation, TrendingUp, Eye, Camera } from "lucide-react";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Founder & CEO",
      bio: "PhD in Urban Safety Engineering with 15+ years experience in smart city solutions. Former lead safety architect at major tech companies. Passionate about leveraging technology to create safer urban environments for all communities.",
      image: "/api/placeholder/150/150",
      expertise: ["Urban Planning", "Safety Systems", "AI/ML", "Smart Cities"],
      story: "After witnessing a close friend's assault in a poorly lit campus area, Dr. Chen dedicated her career to developing technology-driven safety solutions. Her research in predictive safety modeling at MIT laid the foundation for SafeGuard Navigator's AI algorithms.",
      education: "PhD Urban Safety Engineering - MIT, MS Civil Engineering - Stanford University",
      achievements: ["Named Top 40 Under 40 in Tech Innovation", "Published 50+ research papers", "3 patents in safety systems"]
    },
    {
      name: "Michael Rodriguez",
      role: "CTO",
      bio: "Expert in geospatial technology and real-time data processing. Led engineering teams at multiple mapping and navigation startups.",
      image: "/api/placeholder/150/150",
      expertise: ["Geospatial Tech", "Real-time Systems", "Data Engineering", "Scalability"]
    },
    {
      name: "Priya Patel",
      role: "Head of Safety Research",
      bio: "Criminologist and data scientist specializing in urban safety patterns. Published researcher with expertise in predictive policing.",
      image: "/api/placeholder/150/150",
      expertise: ["Criminology", "Data Science", "Research", "Statistics"]
    },
    {
      name: "David Kim",
      role: "Lead Product Designer",
      bio: "UX/UI designer focused on safety-critical applications. Former design lead at public safety technology companies.",
      image: "/api/placeholder/150/150",
      expertise: ["UX Design", "Safety Systems", "User Research", "Product Strategy"]
    }
  ];

  const milestones = [
    {
      year: "2022",
      title: "Company Founded",
      description: "SafeGuard Navigator was founded with a mission to make urban spaces safer through technology.",
      icon: Building
    },
    {
      year: "2023",
      title: "Seed Funding",
      description: "Raised $5M in seed funding from top-tier VCs to build out the technology platform.",
      icon: TrendingUp
    },
    {
      year: "2023",
      title: "Beta Launch",
      description: "Launched beta version in 3 major cities with 10,000+ early adopters.",
      icon: MapPin
    },
    {
      year: "2024",
      title: "Series A",
      description: "Secured $20M Series A funding to expand globally and enhance AI capabilities.",
      icon: Zap
    },
    {
      year: "2024",
      title: "Global Launch",
      description: "Official launch in 50+ cities across 15 countries with 100K+ active users.",
      icon: Target
    },
    {
      year: "2025",
      title: "AI Integration",
      description: "Advanced AI predictive models deployed for proactive safety recommendations.",
      icon: Lightbulb
    }
  ];

  const technologies = [
    {
      name: "Real-time Processing",
      description: "Process millions of data points in real-time to provide instant safety updates",
      icon: Zap
    },
    {
      name: "Machine Learning",
      description: "Advanced ML models predict safety patterns and identify potential risks",
      icon: Target
    },
    {
      name: "Geospatial Analysis",
      description: "Precise location-based analysis using advanced mapping technologies",
      icon: MapPin
    },
    {
      name: "Data Integration",
      description: "Aggregate data from multiple sources including government, crowdsourced, and IoT devices",
      icon: Eye
    },
    {
      name: "Mobile Technology",
      description: "Native mobile apps with offline capabilities and real-time notifications",
      icon: Phone
    },
    {
      name: "Cloud Infrastructure",
      description: "Scalable cloud architecture ensuring 99.9% uptime and global availability",
      icon: Building
    }
  ];

  const impact = [
    {
      metric: "100K+",
      label: "Active Users",
      description: "Across 50+ cities worldwide"
    },
    {
      metric: "1M+",
      label: "Routes Planned",
      description: "With 99.2% safety accuracy"
    },
    {
      metric: "40%",
      label: "Incident Reduction",
      description: "In areas with active user participation"
    },
    {
      metric: "60%",
      label: "Faster Response",
      description: "Emergency response time improvement"
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
                <span className="ml-2 text-xl font-bold text-gray-900">SafeGuard Navigator</span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <a href="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                  <a href="/about" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</a>
                  <a href="/map" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Map</a>
                  <a href="/dashboard" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                  <a href="/analytics" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Analytics</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>Sign In</Button>
              <Button onClick={() => window.location.href = '/dashboard'}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About SafeGuard Navigator
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              We're on a mission to make urban spaces safer for everyone through innovative technology and community-driven solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = '/map'}>
                Explore Platform
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => {
                document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Meet Our Team
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
              To create safer urban environments by leveraging cutting-edge technology, real-time data, and community engagement. We believe everyone deserves to feel safe in their city, and we're building the tools to make that a reality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle>Safety First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every decision we make and every feature we build is focused on improving urban safety and saving lives.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We believe in the power of community. Our platform thrives on user participation and collective safety awareness.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Zap className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We're constantly pushing the boundaries of what's possible with safety technology and AI-driven insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Founder's Story Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Founder's Story
              </h2>
              <p className="text-xl text-gray-600">
                The personal journey that inspired SafeGuard Navigator
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                  SC
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Dr. Sarah Chen</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "The idea for SafeGuard Navigator wasn't born in a boardroom or during a brainstorming session. It was born from a moment of helplessness that changed my life forever."
                </p>
                <div className="space-y-4 text-gray-600">
                  <p>
                    In 2018, while pursuing her PhD at MIT, Dr. Chen's close friend became a victim of assault in a poorly lit area of their campus. Despite being just blocks away, emergency response was delayed, and the incident could have been prevented with better safety infrastructure and real-time awareness.
                  </p>
                  <p>
                    This traumatic experience sparked a mission: to leverage technology to create safer urban environments. Dr. Chen redirected her research from general urban planning to focus specifically on predictive safety modeling and real-time risk assessment.
                  </p>
                  <p>
                    After years of research and development at MIT and Stanford, Dr. Chen assembled a team of experts who shared her vision. Together, they transformed academic research into a practical, life-saving platform that's now protecting communities across 50+ cities worldwide.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card className="bg-white p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-yellow-500" />
                      The Turning Point
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      "I realized that safety shouldn't be a privilege but a fundamental right. Technology could bridge the gap between existing infrastructure and the safety we all deserve."
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-blue-500" />
                      The Vision
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      "Imagine a world where everyone can navigate their city with confidence, knowing they have the safest route and instant access to help when needed. That's the world we're building."
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-purple-500" />
                      The Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      "We're not just building an app; we're creating a movement. A movement where technology serves humanity's most basic need - the need to feel safe."
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Measurable results that demonstrate our commitment to creating safer urban environments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impact.map((item, index) => (
              <Card key={index} className="text-center">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {technologies.map((tech, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <tech.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{tech.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{tech.description}</p>
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
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Led by experts in urban safety, technology, and product design
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  
                  {/* Show additional details for founder */}
                  {member.role === "Founder & CEO" && (
                    <div className="space-y-3 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 mb-1">Education:</div>
                        <div className="text-sm text-blue-700">{member.education}</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-800 mb-1">Key Achievements:</div>
                        <ul className="text-sm text-green-700 space-y-1">
                          {member.achievements?.map((achievement, achIndex) => (
                            <li key={achIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, skillIndex) => (
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
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our mission to create safer urban environments
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-blue-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-1/2 pr-8">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <milestone.icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                            <Badge variant="outline" className="text-blue-600">{milestone.year}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2 pl-8"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <Tabs defaultValue="integrity" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
              <TabsTrigger value="integrity">Integrity</TabsTrigger>
              <TabsTrigger value="innovation">Innovation</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
              <TabsTrigger value="excellence">Excellence</TabsTrigger>
            </TabsList>

            <TabsContent value="integrity" className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    Integrity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We operate with complete transparency and honesty. Our safety data is accurate, our algorithms are fair, and our commitment to user privacy is unwavering.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Transparent data sourcing and processing</li>
                    <li>• Unbiased safety algorithms</li>
                    <li>• Strong privacy protection</li>
                    <li>• Ethical AI development practices</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="innovation" className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lightbulb className="h-6 w-6 text-yellow-600" />
                    Innovation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We constantly push the boundaries of what's possible in safety technology. We invest heavily in R&D and are always exploring new ways to leverage technology for public safety.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Continuous R&D investment</li>
                    <li>• Cutting-edge AI/ML adoption</li>
                    <li>• Rapid prototyping and iteration</li>
                    <li>• Forward-thinking technology stack</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-600" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We believe safety is a collective responsibility. Our platform thrives on community participation, and we actively engage with users, local authorities, and safety organizations.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Active user community engagement</li>
                    <li>• Partnerships with local authorities</li>
                    <li>• Collaborative safety initiatives</li>
                    <li>• Open feedback and improvement</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="excellence" className="mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Award className="h-6 w-6 text-purple-600" />
                    Excellence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    We strive for excellence in everything we do. From our user interface to our backend infrastructure, we maintain the highest standards of quality and reliability.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Rigorous quality assurance</li>
                    <li>• High system reliability</li>
                    <li>• Exceptional user experience</li>
                    <li>• Continuous improvement</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Us in Creating Safer Cities
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Be part of the movement that's making urban spaces safer for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = '/dashboard'}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => window.location.href = '/map'}>
              Learn More
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
    </div>
  );
}