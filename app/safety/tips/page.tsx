/**
 * Safety Tips Page
 * Provides safety guidelines and emergency preparedness information
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import { 
  ExpandMore, 
  Search, 
  Warning, 
  LocalHospital, 
  LocalFireDepartment,
  LocalPolice,
  Flood,
  Bolt,
  Coronavirus,
  DirectionsCar,
  Home,
  Public,
  School,
  Work,
  NaturePeople,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';

// Safety tip categories
const CATEGORIES = [
  { id: 'emergency', label: 'Emergency Response', icon: <Warning color="error" /> },
  { id: 'medical', label: 'Medical Emergencies', icon: <LocalHospital color="error" /> },
  { id: 'fire', label: 'Fire Safety', icon: <LocalFireDepartment color="error" /> },
  { id: 'police', label: 'Crime & Security', icon: <LocalPolice color="primary" /> },
  { id: 'natural', label: 'Natural Disasters', icon: <Flood color="primary" /> },
  { id: 'home', label: 'Home Safety', icon: <Home color="primary" /> },
  { id: 'travel', label: 'Travel Safety', icon: <DirectionsCar color="primary" /> },
  { id: 'public', label: 'Public Places', icon: <Public color="primary" /> },
  { id: 'school', label: 'School Safety', icon: <School color="primary" /> },
  { id: 'workplace', label: 'Workplace Safety', icon: <Work color="primary" /> },
  { id: 'outdoor', label: 'Outdoor Safety', icon: <NaturePeople color="primary" /> },
  { id: 'pandemic', label: 'Pandemic Safety', icon: <Coronavirus color="primary" /> },
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
      'Don\'t overload outlets or extension cords',
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
      'Know the school\'s emergency response plan',
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

// Interface for safety tip
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
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Reset category when switching tabs
    if (newValue === 0) {
      setSelectedCategory('all');
    } else if (newValue === 1) {
      setSelectedCategory('saved');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Safety Tips & Guidelines
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Learn how to stay safe in various emergency situations and everyday life.
        </Typography>
      </Box>
      
      {/* Emergency Reminder */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'error.light', 
          color: 'error.contrastText',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Warning sx={{ mr: 2, fontSize: 40 }} />
          <Box>
            <Typography variant="h5" gutterBottom>
              Emergency Helpline: <strong>112</strong>
            </Typography>
            <Typography variant="body1">
              In case of immediate danger or emergency, call the national emergency number.
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab label="All Safety Tips" />
          <Tab 
            label={`Saved Tips (${savedTips.length})`} 
            disabled={savedTips.length === 0}
          />
        </Tabs>
      </Box>
      
      {/* Search and Filter */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search safety tips..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      {/* Categories */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Chip 
          label="All Categories" 
          onClick={() => setSelectedCategory('all')}
          color={selectedCategory === 'all' ? 'primary' : 'default'}
          variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
          sx={{ mb: 1 }}
        />
        
        {activeTab === 0 && CATEGORIES.map((category) => (
          <Chip 
            key={category.id}
            label={category.label}
            icon={category.icon}
            onClick={() => setSelectedCategory(category.id)}
            color={selectedCategory === category.id ? 'primary' : 'default'}
            variant={selectedCategory === category.id ? 'filled' : 'outlined'}
            sx={{ mb: 1 }}
          />
        ))}
        
        {activeTab === 1 && (
          <Chip 
            label="Saved Tips" 
            icon={<Bookmark />}
            color="primary"
            variant="filled"
            sx={{ mb: 1 }}
          />
        )}
      </Box>
      
      {/* Results count */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredTips.length} of {SAFETY_TIPS.length} safety tips
        </Typography>
      </Box>
      
      {/* Safety Tips */}
      {filteredTips.length > 0 ? (
        <Box>
          {filteredTips.map((tip) => {
            const category = CATEGORIES.find(c => c.id === tip.category);
            const isSaved = savedTips.includes(tip.id);
            
            return (
              <Accordion key={tip.id} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ mr: 2 }}>
                      {category?.icon}
                    </Box>
                    
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {tip.title}
                    </Typography>
                    
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(tip.id);
                      }}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {isSaved ? <Bookmark color="primary" /> : <BookmarkBorder />}
                    </Button>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <List>
                    {tip.content.map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Box 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 14,
                            }}
                          >
                            {index + 1}
                          </Box>
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tip.tags.map((tag) => (
                      <Chip 
                        key={tag} 
                        label={tag} 
                        size="small" 
                        variant="outlined"
                        onClick={() => setSearchQuery(tag)}
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No safety tips found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search or category filter
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </Button>
        </Paper>
      )}
      
      {/* Emergency Resources */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Emergency Resources
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="/images/emergency-kit.jpg"
                alt="Emergency Kit"
                sx={{ bgcolor: 'grey.300' }} // Placeholder if image not available
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Emergency Kit Checklist
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Essential items to include in your emergency preparedness kit.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  href="/safety/resources/emergency-kit"
                >
                  View Checklist
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="/images/emergency-plan.jpg"
                alt="Emergency Plan"
                sx={{ bgcolor: 'grey.300' }} // Placeholder if image not available
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Family Emergency Plan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a comprehensive emergency plan for your family.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  href="/safety/resources/family-plan"
                >
                  Create Plan
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image="/images/first-aid.jpg"
                alt="First Aid"
                sx={{ bgcolor: 'grey.300' }} // Placeholder if image not available
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  First Aid Basics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Learn essential first aid skills for common emergencies.
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  href="/safety/resources/first-aid"
                >
                  Learn First Aid
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ mt: 6, mb: 2 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          These safety tips are provided for informational purposes only and should not replace professional advice or training.
          In case of emergency, always call the national emergency number: <strong>112</strong>.
        </Typography>
      </Box>
    </Container>
  );
}