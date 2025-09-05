"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Search,
  AlertTriangle,
  Hospital,
  Flame,
  Shield,
  Waves,
  Zap,
  Car,
  Home,
  School,
  Briefcase,
  TreePine,
  Bookmark,
  BookmarkCheck,
  Filter,
  X,
  ChevronDown,
  Phone,
  BadgeCheck,
  ShieldCheck,
  Heart,
  Users,
  MapPin,
  Lightbulb,
  Plus,
  Minus,
  Check,
  Circle,
  Square,
  Star,
  Clock,
  User,
  Hash,
  Tag,
  Calendar,
  FileText,
  Info,
  HelpCircle,
  ExternalLink,
  Copy,
  Share2,
  Printer,
  Download,
  Settings,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Save,
  RotateCcw,
  RefreshCw,
  Loader2,
  AlertCircle
} from "lucide-react";

// Safety tip categories
const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: <Shield className="h-4 w-4" /> },
  { id: 'emergency', label: 'Emergency Response', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'medical', label: 'Medical Emergencies', icon: <Hospital className="h-4 w-4" /> },
  { id: 'fire', label: 'Fire Safety', icon: <Flame className="h-4 w-4" /> },
  { id: 'police', label: 'Crime & Security', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'natural', label: 'Natural Disasters', icon: <Waves className="h-4 w-4" /> },
  { id: 'home', label: 'Home Safety', icon: <Home className="h-4 w-4" /> },
  { id: 'travel', label: 'Travel Safety', icon: <Car className="h-4 w-4" /> },
  { id: 'public', label: 'Public Places', icon: <Users className="h-4 w-4" /> },
  { id: 'school', label: 'School Safety', icon: <School className="h-4 w-4" /> },
  { id: 'workplace', label: 'Workplace Safety', icon: <Briefcase className="h-4 w-4" /> },
  { id: 'outdoor', label: 'Outdoor Safety', icon: <TreePine className="h-4 w-4" /> },
  { id: 'pandemic', label: 'Pandemic Safety', icon: <Zap className="h-4 w-4" /> },
];

// Sample safety tips data
const SAFETY_TIPS = [
  {
    id: 1,
    title: 'What to do in a medical emergency',
    category: 'medical',
    content: [
      'Call emergency services (108) immediately',
      'Stay calm and provide clear information about the situation',
      'If trained, provide basic first aid until help arrives',
      'Keep the person comfortable and monitor their condition',
      'Have someone meet the emergency responders to guide them to the location',
      'Provide any relevant medical history or information about medications',
    ],
    tags: ['medical', 'emergency', 'first aid'],
  },
  {
    id: 2,
    title: 'Fire safety at home',
    category: 'fire',
    content: [
      'Install smoke detectors on every floor and test them monthly',
      'Create and practice a home fire escape plan with your family',
      'Keep fire extinguishers in accessible locations and know how to use them',
      'Never leave cooking unattended',
      'Keep flammable items away from heat sources',
      'Have your heating systems inspected annually',
      'Never smoke in bed or when drowsy',
      'Keep matches and lighters away from children',
    ],
    tags: ['fire', 'home', 'prevention'],
  },
  {
    id: 3,
    title: 'Staying safe during a flood',
    category: 'natural',
    content: [
      'Monitor weather alerts and evacuation orders',
      'Move to higher ground immediately if flooding is imminent',
      'Never walk, swim, or drive through flood waters',
      'Stay off bridges over fast-moving water',
      'Disconnect utilities if instructed to do so',
      'Prepare an emergency kit with essentials',
      'After a flood, avoid standing water which may be contaminated',
    ],
    tags: ['flood', 'natural disaster', 'evacuation'],
  },
  {
    id: 4,
    title: 'Personal safety in public places',
    category: 'public',
    content: [
      'Stay alert and aware of your surroundings',
      'Keep valuables secure and out of sight',
      'Trust your instincts if a situation feels unsafe',
      'Stay in well-lit, populated areas, especially at night',
      'Let someone know your location and expected return time',
      'Avoid displaying expensive items or large amounts of cash',
      'Be cautious when using ATMs or handling money in public',
    ],
    tags: ['public', 'personal safety', 'crime prevention'],
  },
  {
    id: 5,
    title: 'Road safety tips',
    category: 'travel',
    content: [
      'Always wear a seatbelt and ensure all passengers do the same',
      'Never drive under the influence of alcohol or drugs',
      'Avoid distractions like mobile phones while driving',
      'Observe speed limits and traffic rules',
      'Maintain a safe distance from other vehicles',
      'Adjust driving for weather and road conditions',
      'Ensure your vehicle is regularly serviced and maintained',
      'Take breaks during long journeys to avoid fatigue',
    ],
    tags: ['driving', 'road safety', 'travel'],
  },
  {
    id: 6,
    title: 'Earthquake preparedness',
    category: 'natural',
    content: [
      'Drop, cover, and hold on during an earthquake',
      'Stay away from windows, exterior walls, and heavy furniture',
      'If outdoors, move to an open area away from buildings and power lines',
      'If in a vehicle, pull over safely away from buildings and bridges',
      'After an earthquake, check for injuries and damage',
      'Be prepared for aftershocks',
      'Have an emergency kit ready with water, food, and first aid supplies',
    ],
    tags: ['earthquake', 'natural disaster', 'preparedness'],
  },
  {
    id: 7,
    title: 'Workplace emergency procedures',
    category: 'workplace',
    content: [
      'Familiarize yourself with workplace emergency exits and assembly points',
      'Know the location of fire extinguishers, first aid kits, and AEDs',
      'Participate in emergency drills and training',
      'Report safety hazards to appropriate personnel',
      'Keep emergency contact information updated',
      'Know how to shut off equipment in an emergency',
      'Follow evacuation procedures when alarms sound',
    ],
    tags: ['workplace', 'emergency procedures', 'evacuation'],
  },
  {
    id: 8,
    title: 'Child safety at home',
    category: 'home',
    content: [
      'Install safety gates at stairs and childproof locks on cabinets',
      'Keep small objects, cords, and plastic bags out of reach',
      'Secure furniture and TVs to prevent tipping',
      'Store medications, cleaning products, and chemicals in locked cabinets',
      'Cover electrical outlets and secure blind cords',
      'Set water heater temperature to prevent scalding',
      'Never leave young children unattended near water, even briefly',
      'Install smoke and carbon monoxide detectors',
    ],
    tags: ['child safety', 'home', 'childproofing'],
  },
  {
    id: 9,
    title: 'Outdoor hiking safety',
    category: 'outdoor',
    content: [
      'Research the trail and weather conditions before heading out',
      'Share your hiking plan with someone who is not joining you',
      'Carry essential supplies: water, food, first aid kit, map, compass',
      'Dress appropriately for the weather and wear proper footwear',
      'Stay on marked trails and be aware of wildlife',
      'Carry a fully charged mobile phone and a power bank',
      'Start early and plan to finish before dark',
      'Know basic wilderness first aid and emergency signals',
    ],
    tags: ['hiking', 'outdoor', 'wilderness'],
  },
  {
    id: 10,
    title: 'Electrical safety',
    category: 'home',
    content: [
      'Never use electrical appliances near water',
      'Inspect cords regularly for damage and replace if frayed',
      'Do not overload outlets or extension cords',
      'Unplug appliances when not in use',
      'Install ground fault circuit interrupters (GFCIs) in bathrooms and kitchens',
      'Keep electrical panels accessible and labeled',
      'Use the correct wattage bulbs in light fixtures',
      'Hire qualified electricians for repairs and installations',
    ],
    tags: ['electrical', 'home', 'fire prevention'],
  },
  {
    id: 11,
    title: 'School emergency procedures',
    category: 'school',
    content: [
      'Know the schools emergency response plan',
      'Familiarize yourself with evacuation routes and assembly areas',
      'Follow teacher and staff instructions during emergencies',
      'Report suspicious activities or persons to school authorities',
      'Keep emergency contact information updated with the school',
      'Discuss emergency procedures with children in an age-appropriate way',
      'Practice emergency scenarios at home to reinforce school training',
    ],
    tags: ['school', 'emergency procedures', 'children'],
  },
  {
    id: 12,
    title: 'COVID-19 safety measures',
    category: 'pandemic',
    content: [
      'Follow current public health guidelines and recommendations',
      'Practice good hand hygiene with frequent washing or sanitizing',
      'Maintain physical distancing in public settings when advised',
      'Wear masks in crowded or indoor settings when recommended',
      'Stay home when feeling unwell and get tested if symptomatic',
      'Keep vaccinations up to date as recommended by health authorities',
      'Ensure good ventilation in indoor spaces',
      'Clean and disinfect frequently touched surfaces regularly',
    ],
    tags: ['covid-19', 'pandemic', 'public health'],
  },
];

interface SafetyTip {
  id: number;
  title: string;
  category: string;
  content: string[];
  tags: string[];
}

export default function SafetyTipsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedTips, setSavedTips] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Load saved tips from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedSafetyTips');
    if (saved) {
      try {
        setSavedTips(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved tips', e);
      }
    }
  }, []);

  // Save tips to localStorage when they change
  useEffect(() => {
    localStorage.setItem('savedSafetyTips', JSON.stringify(savedTips));
  }, [savedTips]);

  // Filter tips based on search query and selected category
  const filteredTips = SAFETY_TIPS.filter((tip) => {
    const matchesSearch = 
      searchQuery === '' || 
      tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tip.content.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = 
      selectedCategory === 'all' || 
      tip.category === selectedCategory ||
      (selectedCategory === 'saved' && savedTips.includes(tip.id));
      
    return matchesSearch && matchesCategory;
  });
  
  // Toggle saved status of a tip
  const toggleSaved = (tipId: number) => {
    if (savedTips.includes(tipId)) {
      setSavedTips(savedTips.filter(id => id !== tipId));
    } else {
      setSavedTips([...savedTips, tipId]);
    }
  };
  
  // Handle tab change
  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
    
    // Reset category when switching tabs
    if (newValue === 0) {
      setSelectedCategory('all');
    } else if (newValue === 1) {
      setSelectedCategory('saved');
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setActiveTab(0);
  };

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category ? category.icon : <Shield className="h-4 w-4" />;
  };

  // Get category color
  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, string> = {
      emergency: 'text-red-600 bg-red-100',
      medical: 'text-red-600 bg-red-100',
      fire: 'text-red-600 bg-red-100',
      police: 'text-blue-600 bg-blue-100',
      natural: 'text-green-600 bg-green-100',
      home: 'text-purple-600 bg-purple-100',
      travel: 'text-indigo-600 bg-indigo-100',
      public: 'text-yellow-600 bg-yellow-100',
      school: 'text-pink-600 bg-pink-100',
      workplace: 'text-teal-600 bg-teal-100',
      outdoor: 'text-green-600 bg-green-100',
      pandemic: 'text-orange-600 bg-orange-100',
    };
    return colors[categoryId] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900">Safety Tips & Guidelines</h1>
            <p className="mt-2 text-gray-600">
              Learn how to stay safe in various emergency situations and everyday life.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Reminder */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-4">
              <AlertTriangle className="h-10 w-10 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-red-800 mb-1">
                  Emergency Helpline: <strong>112</strong>
                </h2>
                <p className="text-red-700">
                  In case of immediate danger or emergency, call the national emergency number.
                </p>
              </div>
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
                  <Phone className="h-4 w-4 mr-2" />
                  Text 112
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange(0)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 0
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Safety Tips
              </button>
              <button
                onClick={() => handleTabChange(1)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 1
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                disabled={savedTips.length === 0}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Saved Tips ({savedTips.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search safety tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="lg:hidden"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className={searchQuery || selectedCategory !== 'all' ? 'visible' : 'invisible'}
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <div className="lg:hidden mb-6 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Filter by Category</h3>
              <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center"
                >
                  {category.icon}
                  <span className="ml-1">{category.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden lg:block mb-6">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center"
              >
                {category.icon}
                <span className="ml-1">{category.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredTips.length} of {SAFETY_TIPS.length} safety tips
          </p>
        </div>

        {/* Safety Tips */}
        {filteredTips.length > 0 ? (
          <div className="space-y-4">
            {filteredTips.map((tip) => {
              const category = CATEGORIES.find(c => c.id === tip.category);
              const isSaved = savedTips.includes(tip.id);
              
              return (
                <Card key={tip.id} className="hover:shadow-md transition-shadow">
                  <Accordion type="single" collapsible>
                    <AccordionItem value={`tip-${tip.id}`} className="border-0">
                      <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center w-full">
                          <div className={`p-2 rounded-full ${getCategoryColor(tip.category)}`}>
                            {getCategoryIcon(tip.category)}
                          </div>
                          
                          <h3 className="text-lg font-medium text-gray-900 ml-3 flex-1 text-left">
                            {tip.title}
                          </h3>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSaved(tip.id);
                            }}
                            className="ml-2"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Bookmark className="h-5 w-5 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </AccordionTrigger>
                      
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-3">
                          {tip.content.map((item, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex-shrink-0 mt-1 w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <p className="ml-3 text-gray-700">{item}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {tip.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => setSearchQuery(tag)}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No safety tips found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or category filter
            </p>
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        )}

        {/* Emergency Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Emergency Kit Checklist</CardTitle>
                <CardDescription>
                  Essential items to include in your emergency preparedness kit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="/safety/resources/emergency-kit">
                    View Checklist
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Family Emergency Plan</CardTitle>
                <CardDescription>
                  Create a comprehensive emergency plan for your family.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="/safety/resources/family-plan">
                    Create Plan
                  </a>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <BadgeCheck className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>First Aid Basics</CardTitle>
                <CardDescription>
                  Learn essential first aid skills for common emergencies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a href="/safety/resources/first-aid">
                    Learn First Aid
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            These safety tips are provided for informational purposes only and should not replace professional advice or training.
            In case of emergency, always call the national emergency number: <strong className="text-red-600">112</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}