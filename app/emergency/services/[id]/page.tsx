/**
 * Emergency Service Detail Page
 * Displays detailed information about a specific emergency service
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  Grid,
  Rating,
  IconButton
} from '@mui/material';
import { 
  Phone, 
  LocationOn, 
  AccessTime, 
  ArrowBack, 
  Directions, 
  Star, 
  StarBorder, 
  Favorite, 
  FavoriteBorder,
  Share,
  Map
} from '@mui/icons-material';
import { calculateDistance } from '@/lib/utils';

interface EmergencyService {
  id: string;
  name: string;
  type: string;
  phone: string;
  address: string;
  operatingHours: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  website?: string;
  rating?: number;
  isFavorite?: boolean;
  services?: string[];
  distance?: number;
}

export default function EmergencyServiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [service, setService] = useState<EmergencyService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  
  // Get user's location and service details on page load
  useEffect(() => {
    // Get location
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
    
    // Fetch service details
    if (params?.id) {
      fetchServiceDetails(params.id as string);
    }
  }, [params?.id]);
  
  // Fetch service details from API
  const fetchServiceDetails = async (serviceId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/emergency/services/${serviceId}`);
      if (!response.ok) throw new Error('Failed to fetch service details');
      
      const data = await response.json();
      
      // Calculate distance if user location is available
      if (userLocation && data.service?.location) {
        data.service.distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          data.service.location.latitude,
          data.service.location.longitude
        );
      }
      
      setService(data.service || null);
    } catch (err) {
      console.error('Error fetching service details:', err);
      setError('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!service) return;
    
    try {
      const response = await fetch(`/api/emergency/services/${service.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to update favorite status');
      
      // Update local state
      setService(prev => prev ? {...prev, isFavorite: !prev.isFavorite} : null);
    } catch (err) {
      console.error('Error updating favorite status:', err);
      setError('Failed to update favorite status');
    }
  };
  
  // Handle share
  const handleShare = async () => {
    if (!service) return;
    
    const shareData = {
      title: `Emergency Service: ${service.name}`,
      text: `Check out this emergency service: ${service.name}`,
      url: window.location.href,
    };
    
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };
  
  // Get directions
  const getDirections = () => {
    if (!service) return;
    
    router.push(`/map?lat=${service.location.latitude}&lng=${service.location.longitude}&name=${encodeURIComponent(service.name)}`);
  };
  
  // Call service
  const callService = () => {
    if (!service?.phone) return;
    
    window.location.href = `tel:${service.phone}`;
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading service details...
        </Typography>
      </Container>
    );
  }
  
  if (error || !service) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error || 'Service not found'}
        </Alert>
        
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />}
          onClick={() => router.push('/emergency/services')}
        >
          Back to Services
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />}
          onClick={() => router.push('/emergency/services')}
          sx={{ mb: 2 }}
        >
          Back to Services
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          {service.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            label={service.type} 
            color="primary" 
            size="small" 
          />
          
          {service.distance !== undefined && (
            <Chip 
              icon={<LocationOn fontSize="small" />}
              label={`${service.distance.toFixed(1)} km away`}
              size="small"
              variant="outlined"
            />
          )}
          
          {service.rating !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating 
                value={service.rating} 
                readOnly 
                precision={0.5}
                size="small"
                icon={<Star fontSize="inherit" />}
                emptyIcon={<StarBorder fontSize="inherit" />}
              />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                ({service.rating.toFixed(1)})
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid size={{xs:12, md:8}}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            
            <Typography variant="body1" paragraph>
              {service.description || `${service.name} provides emergency services in your area.`}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Contact Information
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {service.phone}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <LocationOn fontSize="small" sx={{ mr: 1, mt: 0.5, color: 'primary.main' }} />
              <Typography variant="body1">
                {service.address}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTime fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                {service.operatingHours || 'Open 24/7'}
              </Typography>
            </Box>
            
            {service.website && (
              <Button 
                variant="outlined" 
                href={service.website} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ mt: 2 }}
              >
                Visit Website
              </Button>
            )}
            
            {service.services && service.services.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Services Offered
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {service.services.map((item, index) => (
                    <Chip 
                      key={index}
                      label={item} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid  size={{ xs:12, md:4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Actions
            </Typography>
            
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<Phone />}
              onClick={callService}
              sx={{ mb: 2 }}
            >
              Call Now
            </Button>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<Directions />}
              onClick={getDirections}
              sx={{ mb: 2 }}
            >
              Get Directions
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Map />}
              onClick={getDirections}
              sx={{ mb: 2 }}
            >
              View on Map
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <IconButton onClick={toggleFavorite} color={service.isFavorite ? 'error' : 'default'}>
                {service.isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              
              <IconButton onClick={handleShare}>
                <Share />
              </IconButton>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Location
            </Typography>
            
            <Box 
              sx={{ 
                height: 200, 
                bgcolor: 'action.hover', 
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
              onClick={getDirections}
            >
              <Typography variant="body2" color="text.secondary">
                Click to view on map
              </Typography>
            </Box>
            
            <Typography variant="body2">
              Coordinates: {service.location.latitude.toFixed(6)}, {service.location.longitude.toFixed(6)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}