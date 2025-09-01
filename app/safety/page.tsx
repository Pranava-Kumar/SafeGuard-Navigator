/**
 * Safety Hub Page
 * Central hub for all safety features including safety tips, resources, and map
 * Compliant with DPDP Act 2023
 */

'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Alert,
  AlertTitle,
} from '@mui/material';
import { 
  Warning, 
  Healing,
  Home,
  MedicalServices,
  Backpack,
  People,
  ArrowForward,
  LocalHospital,
  Map as MapIcon,
  Notifications,
  Phone,
  ContactPhone,
  Info,
  Lightbulb,
  Security,
  DirectionsCar,
  LocationOn,
  Shield,
} from '@mui/icons-material';
import Link from 'next/link';

// Interface for feature card
interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl?: string;
  link: string;
  featured?: boolean;
  color?: string;
}

// Safety features
const safetyFeatures: FeatureCard[] = [
  {
    id: 'safety-tips',
    title: 'Safety Tips',
    description: 'Browse through a collection of safety tips for various situations.',
    icon: <Lightbulb fontSize="large" />,
    imageUrl: '/images/safety-tips.jpg',
    link: '/safety/tips',
    featured: true,
    color: '#ff9800', // orange
  },
  {
    id: 'safety-resources',
    title: 'Safety Resources',
    description: 'Access essential safety resources including emergency kit checklist, family plan, and first aid basics.',
    icon: <Backpack fontSize="large" />,
    imageUrl: '/images/safety-resources.jpg',
    link: '/safety/resources',
    featured: true,
    color: '#2196f3', // blue
  },
  {
    id: 'safety-map',
    title: 'Safety Map',
    description: 'View a map of emergency services, safe zones, and hazards in your area.',
    icon: <MapIcon fontSize="large" />,
    imageUrl: '/images/safety-map.jpg',
    link: '/safety/map',
    featured: true,
    color: '#4caf50', // green
  },
  {
    id: 'emergency-hub',
    title: 'Emergency Hub',
    description: 'Access emergency services, alerts, and contacts in one place.',
    icon: <LocalHospital fontSize="large" />,
    imageUrl: '/images/emergency-hub.jpg',
    link: '/emergency',
    color: '#f44336', // red
  },
  {
    id: 'safe-routes',
    title: 'Safe Routes',
    description: 'Plan your journey with safety as the priority.',
    icon: <DirectionsCar fontSize="large" />,
    imageUrl: '/images/safe-routes.jpg',
    link: '/routes',
    color: '#9c27b0', // purple
  },
  {
    id: 'safety-score',
    title: 'Safety Score',
    description: 'Check the safety score of different areas and routes.',
    icon: <Shield fontSize="large" />,
    imageUrl: '/images/safety-score.jpg',
    link: '/safety/score',
    color: '#3f51b5', // indigo
  },
];

export default function SafetyPage() {
  // Get featured features
  const featuredFeatures = safetyFeatures.filter(feature => feature.featured);
  
  // Get other features
  const otherFeatures = safetyFeatures.filter(feature => !feature.featured);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Safety Hub
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Welcome to the Safety Hub, your central resource for safety information, emergency preparedness, and safety-focused navigation.
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
      
      {/* Featured Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Featured Safety Resources
        </Typography>
        
        <Grid container spacing={3}>
          {featuredFeatures.map((feature) => (
            <Grid item xs={12} md={4} key={feature.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component={Link} 
                  href={feature.link}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  {feature.imageUrl ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={feature.imageUrl}
                      alt={feature.title}
                    />
                  ) : (
                    <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: feature.color || 'primary.light' }}>
                      <Box sx={{ color: 'white' }}>{feature.icon}</Box>
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1, color: feature.color || 'primary.main' }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h2">
                        {feature.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Other Features */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          More Safety Features
        </Typography>
        
        <Grid container spacing={3}>
          {otherFeatures.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component={Link} 
                  href={feature.link}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box sx={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: feature.color || 'primary.light' }}>
                    <Box sx={{ color: 'white' }}>{feature.icon}</Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {feature.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Safety Overview */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Your Safety Matters
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Why Safety Preparedness is Important
              </Typography>
              
              <Typography variant="body2" paragraph>
                Being prepared for emergencies can make a significant difference in ensuring your safety and the safety of your loved ones. SafeGuard Navigators provides you with the tools and resources you need to:
              </Typography>
              
              <ul>
                <li>Stay informed about potential hazards in your area</li>
                <li>Create and maintain emergency preparedness plans</li>
                <li>Navigate safely through unfamiliar areas</li>
                <li>Quickly access emergency services when needed</li>
                <li>Share your location with trusted contacts during emergencies</li>
                <li>Learn essential safety skills and knowledge</li>
              </ul>
              
              <Button 
                variant="contained" 
                component={Link}
                href="/safety/resources"
                endIcon={<ArrowForward />}
                sx={{ mt: 2 }}
              >
                Explore Safety Resources
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                How SafeGuard Navigators Helps You Stay Safe
              </Typography>
              
              <Typography variant="body2" paragraph>
                Our platform is designed with your safety in mind, offering features that help you:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      <strong>Safe Navigation</strong>: Plan routes that prioritize your safety based on real-time data and community reports.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      <strong>Emergency Alerts</strong>: Send your location and status to emergency contacts with a single tap.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <MapIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      <strong>Safety Map</strong>: Visualize emergency services, safe zones, and potential hazards in your area.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Lightbulb sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body2">
                      <strong>Safety Knowledge</strong>: Access a comprehensive library of safety tips and resources.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Button 
                variant="contained" 
                component={Link}
                href="/routes"
                endIcon={<ArrowForward />}
                sx={{ mt: 2 }}
              >
                Try Safe Navigation
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Call to Action */}
      <Paper sx={{ p: 4, mb: 6, bgcolor: 'primary.light' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Start Your Safety Journey Today
            </Typography>
            
            <Typography variant="body1" paragraph>
              Explore our safety resources, create your emergency plan, and learn how to navigate safely. Your safety is our priority.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              href="/safety/tips"
              endIcon={<ArrowForward />}
            >
              Explore Safety Tips
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mt: 6, mb: 2 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          These safety resources are provided for informational purposes only and should not replace professional advice or training.
          In case of emergency, always call the national emergency number: <strong>112</strong>.
        </Typography>
      </Box>
    </Container>
  );
}