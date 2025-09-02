/**
 * Safety Resources Hub Page
 * Central hub for all safety resources including emergency kit, family plan, and first aid
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
  ArrowBack,
  LocalHospital,
  Map,
  Notifications,
  Phone,
  ContactPhone,
  Info
} from '@mui/icons-material';
import Link from 'next/link';

// Interface for resource card
interface ResourceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl?: string;
  link: string;
  featured?: boolean;
}

// Safety resources
const safetyResources: ResourceCard[] = [
  {
    id: 'emergency-kit',
    title: 'Emergency Kit Checklist',
    description: 'Prepare an emergency kit with essential supplies for various emergency situations.',
    icon: <Backpack fontSize="large" />,
    imageUrl: '/images/emergency-kit.jpg',
    link: '/safety/resources/emergency-kit',
    featured: true,
  },
  {
    id: 'family-plan',
    title: 'Family Emergency Plan',
    description: 'Create a comprehensive emergency plan for your family to use in case of emergency.',
    icon: <People fontSize="large" />,
    imageUrl: '/images/family-plan.jpg',
    link: '/safety/resources/family-plan',
    featured: true,
  },
  {
    id: 'first-aid',
    title: 'First Aid Basics',
    description: 'Learn essential first aid techniques to help in emergency situations.',
    icon: <Healing fontSize="large" />,
    imageUrl: '/images/first-aid.jpg',
    link: '/safety/resources/first-aid',
    featured: true,
  },
  {
    id: 'emergency-services',
    title: 'Emergency Services',
    description: 'Find nearby emergency services and manage your emergency contacts.',
    icon: <LocalHospital fontSize="large" />,
    imageUrl: '/images/emergency-services.jpg',
    link: '/emergency',
  },
  {
    id: 'emergency-alerts',
    title: 'Emergency Alerts',
    description: 'Set up and manage emergency alerts for yourself and your emergency contacts.',
    icon: <Notifications fontSize="large" />,
    imageUrl: '/images/emergency-alerts.jpg',
    link: '/emergency/alert',
  },
  {
    id: 'emergency-contacts',
    title: 'Emergency Contacts',
    description: 'Manage your emergency contacts who will be notified in case of emergency.',
    icon: <ContactPhone fontSize="large" />,
    imageUrl: '/images/emergency-contacts.jpg',
    link: '/emergency/contacts',
  },
  {
    id: 'safety-tips',
    title: 'Safety Tips',
    description: 'Browse through a collection of safety tips for various situations.',
    icon: <Info fontSize="large" />,
    imageUrl: '/images/safety-tips.jpg',
    link: '/safety/tips',
  },
  {
    id: 'emergency-map',
    title: 'Emergency Map',
    description: 'View a map of emergency services and safe zones in your area.',
    icon: <Map fontSize="large" />,
    imageUrl: '/images/emergency-map.jpg',
    link: '/emergency/map',
  },
];

export default function SafetyResourcesPage() {
  // Get featured resources
  const featuredResources = safetyResources.filter(resource => resource.featured);
  
  // Get other resources
  const otherResources = safetyResources.filter(resource => !resource.featured);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          component={Link} 
          href="/safety/tips"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Safety Tips
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Safety Resources
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Access essential safety resources to help you prepare for and respond to emergency situations.
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
      
      {/* Featured Resources */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Essential Resources
        </Typography>
        
        <Grid container spacing={3}>
          {featuredResources.map((resource) => (
            <Grid item xs={12} md={4} key={resource.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component={Link} 
                  href={resource.link}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  {resource.imageUrl ? (
                    <CardMedia
                      component="img"
                      height="140"
                      image={resource.imageUrl}
                      alt={resource.title}
                    />
                  ) : (
                    <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.light' }}>
                      {resource.icon}
                    </Box>
                  )}
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        {resource.icon}
                      </Box>
                      <Typography variant="h6" component="h2">
                        {resource.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {resource.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Other Resources */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Additional Resources
        </Typography>
        
        <Grid container spacing={3}>
          {otherResources.map((resource) => (
            <Grid item xs={12} sm={6} md={3} key={resource.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea 
                  component={Link} 
                  href={resource.link}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        {resource.icon}
                      </Box>
                      <Typography variant="h6" component="h2">
                        {resource.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {resource.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Emergency Preparedness Tips */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Emergency Preparedness Tips
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>Be Prepared</AlertTitle>
          Being prepared for emergencies can make a significant difference in ensuring your safety and the safety of your loved ones.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Before an Emergency
              </Typography>
              
              <Typography variant="body2" paragraph>
                Take these steps to prepare before an emergency occurs:
              </Typography>
              
              <ul>
                <li>Create and maintain an emergency kit</li>
                <li>Develop a family emergency plan</li>
                <li>Learn basic first aid skills</li>
                <li>Know evacuation routes from your home and workplace</li>
                <li>Stay informed about potential hazards in your area</li>
                <li>Sign up for emergency alerts</li>
              </ul>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                During an Emergency
              </Typography>
              
              <Typography variant="body2" paragraph>
                Follow these guidelines during an emergency situation:
              </Typography>
              
              <ul>
                <li>Stay calm and assess the situation</li>
                <li>Call emergency services if necessary (112)</li>
                <li>Follow your emergency plan</li>
                <li>Listen to official information sources</li>
                <li>Evacuate if instructed to do so</li>
                <li>Help others if it&#39;s safe to do so</li>
              </ul>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                After an Emergency
              </Typography>
              
              <Typography variant="body2" paragraph>
                Take these steps after an emergency has passed:
              </Typography>
              
              <ul>
                <li>Check for injuries and provide first aid if needed</li>
                <li>Check your home for damage</li>
                <li>Contact your emergency contacts</li>
                <li>Listen for official information</li>
                <li>Document any damage for insurance purposes</li>
                <li>Replenish your emergency supplies</li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      {/* Call to Action */}
      <Paper sx={{ p: 4, mb: 6, bgcolor: 'primary.light' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              Don&#39;t Wait Until It&#39;s Too Late
            </Typography>
            
            <Typography variant="body1" paragraph>
              Take action now to prepare yourself and your loved ones for emergencies. Create your emergency kit, develop a family plan, and learn essential first aid skills today.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              component={Link}
              href="/safety/resources/emergency-kit"
              endIcon={<ArrowForward />}
            >
              Start with Emergency Kit
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