/**
 * Emergency Services Page
 * Displays emergency services information and contacts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmergencyServices from '@/components/EmergencyServices';
import { Box, Typography, Container, Paper, Button } from '@mui/material';
import { Warning } from '@mui/icons-material';

export default function EmergencyServicesPage() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Get user's location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);
  
  // Handle emergency service selection
  const handleServiceSelect = (service: any) => {
    // Navigate to directions or show on map
    router.push(`/map?lat=${service.location.latitude}&lng=${service.location.longitude}&name=${encodeURIComponent(service.name)}`);
  };
  
  // Handle emergency trigger
  const handleEmergencyTrigger = (location: [number, number], contactIds?: string[]) => {
    // Navigate to emergency alert page
    router.push('/emergency/alert');
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Emergency Services
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Find and contact emergency services near you. You can also manage your emergency contacts and trigger emergency alerts.
        </Typography>
        
        <Paper 
          sx={{ 
            p: 2, 
            mt: 2, 
            bgcolor: 'error.light', 
            color: 'error.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1 }} />
            <Typography variant="body1">
              In case of emergency, call the national emergency number: <strong>112</strong>
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="error"
            href="tel:112"
          >
            Call Now
          </Button>
        </Paper>
      </Box>
      
      <EmergencyServices 
        initialLocation={userLocation || undefined}
        onServiceSelect={handleServiceSelect}
        onEmergencyTrigger={handleEmergencyTrigger}
      />
    </Container>
  );
}