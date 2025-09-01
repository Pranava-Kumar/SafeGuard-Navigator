/**
 * Safety Map Page
 * Interactive map showing safety information, emergency services, and safe zones
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { 
  Warning, 
  LocationOn,
  LocalHospital,
  LocalPolice,
  Fireplace,
  School,
  Park,
  Store,
  Home,
  DirectionsCar,
  Layers,
  MyLocation,
  Search,
  FilterList,
  Info,
  Close,
  ArrowBack,
  Phone,
  Star,
  StarBorder,
  Refresh,
  Share,
  Map as MapIcon,
} from '@mui/icons-material';
import Link from 'next/link';

// Mock data for safety map points
interface SafetyPoint {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire' | 'school' | 'park' | 'store' | 'shelter' | 'hazard';
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  description?: string;
  safetyScore?: number;
  isFavorite?: boolean;
}

const mockSafetyPoints: SafetyPoint[] = [
  {
    id: 'hospital1',
    name: 'City General Hospital',
    type: 'hospital',
    latitude: 28.6139,
    longitude: 77.2090,
    address: '123 Healthcare Ave, New Delhi',
    phone: '+91-11-12345678',
    description: '24/7 emergency services available',
    safetyScore: 95,
  },
  {
    id: 'police1',
    name: 'Central Police Station',
    type: 'police',
    latitude: 28.6129,
    longitude: 77.2295,
    address: '456 Safety St, New Delhi',
    phone: '+91-11-23456789',
    description: 'Main police headquarters',
    safetyScore: 90,
  },
  {
    id: 'fire1',
    name: 'District Fire Station',
    type: 'fire',
    latitude: 28.6259,
    longitude: 77.2190,
    address: '789 Emergency Rd, New Delhi',
    phone: '+91-11-34567890',
    description: 'Fire and rescue services',
    safetyScore: 92,
  },
  {
    id: 'school1',
    name: 'Public School #5',
    type: 'school',
    latitude: 28.6339,
    longitude: 77.2290,
    address: '101 Education Blvd, New Delhi',
    description: 'Designated emergency shelter',
    safetyScore: 85,
  },
  {
    id: 'park1',
    name: 'Central Park',
    type: 'park',
    latitude: 28.6039,
    longitude: 77.2390,
    address: '202 Recreation Ave, New Delhi',
    description: 'Open space safe zone',
    safetyScore: 80,
  },
  {
    id: 'store1',
    name: 'SuperMart',
    type: 'store',
    latitude: 28.6239,
    longitude: 77.2490,
    address: '303 Shopping Lane, New Delhi',
    phone: '+91-11-45678901',
    description: 'Emergency supplies available',
    safetyScore: 75,
  },
];

// Type icons mapping
const typeIcons: Record<string, React.ReactNode> = {
  hospital: <LocalHospital />,
  police: <LocalPolice />,
  fire: <Fireplace />,
  school: <School />,
  park: <Park />,
  store: <Store />,
  shelter: <Home />,
  hazard: <Warning />,
};

// Type colors mapping
const typeColors: Record<string, string> = {
  hospital: '#f44336', // red
  police: '#3f51b5', // indigo
  fire: '#ff9800', // orange
  school: '#4caf50', // green
  park: '#8bc34a', // light green
  store: '#9c27b0', // purple
  shelter: '#2196f3', // blue
  hazard: '#ff5722', // deep orange
};

export default function SafetyMapPage() {
  // State for user location
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  // State for map filters
  const [filters, setFilters] = useState<{
    types: string[];
    searchQuery: string;
    showFavorites: boolean;
    minSafetyScore: number;
  }>({
    types: ['hospital', 'police', 'fire', 'school', 'park', 'store', 'shelter'],
    searchQuery: '',
    showFavorites: false,
    minSafetyScore: 0,
  });
  
  // State for selected point
  const [selectedPoint, setSelectedPoint] = useState<SafetyPoint | null>(null);
  
  // State for drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for error
  const [error, setError] = useState<string | null>(null);
  
  // State for safety points
  const [safetyPoints, setSafetyPoints] = useState<SafetyPoint[]>(mockSafetyPoints);
  
  // State for snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });
  
  // Get user location
  const getUserLocation = useCallback(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setError('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);
  
  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };
  
  // Convert degrees to radians
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };
  
  // Filter safety points
  const filteredPoints = safetyPoints.filter((point) => {
    // Filter by type
    if (!filters.types.includes(point.type)) return false;
    
    // Filter by search query
    if (
      filters.searchQuery &&
      !point.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
      !point.address.toLowerCase().includes(filters.searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by favorites
    if (filters.showFavorites && !point.isFavorite) return false;
    
    // Filter by safety score
    if (point.safetyScore && point.safetyScore < filters.minSafetyScore) return false;
    
    return true;
  });
  
  // Sort safety points by distance from user
  const sortedPoints = [...filteredPoints].sort((a, b) => {
    if (!userLocation) return 0;
    
    const distanceA = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      a.latitude,
      a.longitude
    );
    
    const distanceB = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      b.latitude,
      b.longitude
    );
    
    return distanceA - distanceB;
  });
  
  // Handle filter change
  const handleFilterChange = (type: string) => {
    setFilters((prev) => {
      const newTypes = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      
      return {
        ...prev,
        types: newTypes,
      };
    });
  };
  
  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: event.target.value,
    }));
  };
  
  // Handle favorites toggle
  const handleFavoritesToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      showFavorites: event.target.checked,
    }));
  };
  
  // Handle safety score change
  const handleSafetyScoreChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      minSafetyScore: Number(event.target.value),
    }));
  };
  
  // Handle point selection
  const handlePointSelect = (point: SafetyPoint) => {
    setSelectedPoint(point);
    setDrawerOpen(true);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (point: SafetyPoint) => {
    // In a real app, this would make an API call to update the favorite status
    setSafetyPoints((prev) =>
      prev.map((p) =>
        p.id === point.id ? { ...p, isFavorite: !p.isFavorite } : p
      )
    );
    
    if (selectedPoint && selectedPoint.id === point.id) {
      setSelectedPoint({
        ...selectedPoint,
        isFavorite: !selectedPoint.isFavorite,
      });
    }
    
    setSnackbar({
      open: true,
      message: `${point.name} ${!point.isFavorite ? 'added to' : 'removed from'} favorites`,
    });
  };
  
  // Handle share
  const handleShare = (point: SafetyPoint) => {
    // In a real app, this would use the Web Share API or a custom sharing solution
    if (navigator.share) {
      navigator.share({
        title: point.name,
        text: `Check out ${point.name} at ${point.address}`,
        url: `https://safeguardnavigators.com/safety/map?point=${point.id}`,
      }).catch((error) => {
        console.error('Error sharing:', error);
        setSnackbar({
          open: true,
          message: 'Unable to share. Please try again.',
        });
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareUrl = `https://safeguardnavigators.com/safety/map?point=${point.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard!',
        });
      }).catch((error) => {
        console.error('Error copying to clipboard:', error);
        setSnackbar({
          open: true,
          message: 'Unable to copy link. Please try again.',
        });
      });
    }
  };
  
  // Handle get directions
  const handleGetDirections = (point: SafetyPoint) => {
    // In a real app, this would open a maps app or a directions page
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
    window.open(url, '_blank');
  };
  
  // Handle call
  const handleCall = (phone: string) => {
    // In a real app, this would use the tel: protocol to initiate a call
    window.location.href = `tel:${phone}`;
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // In a real app, this would fetch fresh data from the API
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Map data refreshed',
      });
    }, 1000);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };
  
  // Initialize map on component mount
  useEffect(() => {
    getUserLocation();
    
    // In a real app, this would fetch safety points from an API
    setTimeout(() => {
      setSafetyPoints(mockSafetyPoints);
      setLoading(false);
    }, 1000);
    
    // Check for point ID in URL query params
    // In a real app, this would use Next.js router or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const pointId = urlParams.get('point');
    if (pointId) {
      const point = mockSafetyPoints.find((p) => p.id === pointId);
      if (point) {
        setSelectedPoint(point);
        setDrawerOpen(true);
      }
    }
  }, [getUserLocation]);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          component={Link} 
          href="/safety/resources"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Safety Resources
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Safety Map
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          View emergency services, safe zones, and hazards in your area. Use the filters to customize your view.
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
      
      {/* Map Controls */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search locations"
              variant="outlined"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.keys(typeIcons).map((type) => (
                <Chip
                  key={type}
                  icon={<Box sx={{ color: typeColors[type] }}>{typeIcons[type]}</Box>}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  onClick={() => handleFilterChange(type)}
                  color={filters.types.includes(type) ? 'primary' : 'default'}
                  variant={filters.types.includes(type) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showFavorites}
                    onChange={handleFavoritesToggle}
                    color="primary"
                  />
                }
                label="Favorites only"
              />
              
              <Tooltip title="Refresh map data">
                <IconButton onClick={handleRefresh} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Get my location">
                <IconButton onClick={getUserLocation} color="primary">
                  <MyLocation />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Map and List View */}
      <Grid container spacing={3}>
        {/* Map View (Placeholder) */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              height: 500, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              bgcolor: '#e0e0e0',
            }}
          >
            {loading ? (
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Loading map data...
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ maxWidth: '80%' }}>
                {error}
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={getUserLocation}
                  sx={{ mt: 1 }}
                >
                  Try Again
                </Button>
              </Alert>
            ) : (
              <>
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: '#e0e0e0' }}>
                  {/* In a real app, this would be a map component */}
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
                    Interactive Map Would Be Displayed Here
                  </Typography>
                  
                  {/* User location marker */}
                  {userLocation && (
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)',
                        color: 'primary.main',
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.5 },
                          '100%': { opacity: 1 },
                        },
                      }}
                    >
                      <Tooltip title="Your location">
                        <MyLocation sx={{ fontSize: 40 }} />
                      </Tooltip>
                    </Box>
                  )}
                  
                  {/* Safety point markers */}
                  {sortedPoints.map((point, index) => (
                    <Box 
                      key={point.id}
                      sx={{ 
                        position: 'absolute', 
                        top: `${20 + (index * 5)}%`, 
                        left: `${20 + (index * 10)}%`, 
                        color: typeColors[point.type],
                        cursor: 'pointer',
                      }}
                      onClick={() => handlePointSelect(point)}
                    >
                      <Tooltip title={point.name}>
                        <Box>
                          {typeIcons[point.type]}
                          {point.isFavorite && (
                            <Star 
                              sx={{ 
                                position: 'absolute', 
                                top: -10, 
                                right: -10, 
                                fontSize: 16,
                                color: 'warning.main',
                              }} 
                            />
                          )}
                        </Box>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
                
                {/* Map controls */}
                <Box sx={{ position: 'absolute', bottom: 16, right: 16 }}>
                  <Paper sx={{ borderRadius: '50%', boxShadow: 3 }}>
                    <IconButton color="primary" onClick={getUserLocation}>
                      <MyLocation />
                    </IconButton>
                  </Paper>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* List View */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: 500, overflow: 'auto' }}>
            <List>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : sortedPoints.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary="No results found" 
                    secondary="Try adjusting your filters or search query" 
                  />
                </ListItem>
              ) : (
                sortedPoints.map((point) => {
                  // Calculate distance from user
                  let distance = null;
                  if (userLocation) {
                    distance = calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      point.latitude,
                      point.longitude
                    );
                  }
                  
                  return (
                    <ListItem 
                      key={point.id} 
                      divider 
                      button 
                      onClick={() => handlePointSelect(point)}
                      selected={selectedPoint?.id === point.id}
                    >
                      <ListItemIcon sx={{ color: typeColors[point.type] }}>
                        {typeIcons[point.type]}
                      </ListItemIcon>
                      
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="subtitle1" component="span">
                              {point.name}
                            </Typography>
                            
                            {point.isFavorite && (
                              <Star sx={{ ml: 1, fontSize: 16, color: 'warning.main' }} />
                            )}
                          </Box>
                        } 
                        secondary={
                          <>
                            <Typography variant="body2" component="span" display="block">
                              {point.address}
                            </Typography>
                            
                            {distance !== null && (
                              <Typography variant="body2" component="span" color="text.secondary">
                                {distance.toFixed(2)} km away
                              </Typography>
                            )}
                            
                            {point.safetyScore && (
                              <Chip 
                                size="small" 
                                label={`Safety: ${point.safetyScore}%`} 
                                color={point.safetyScore > 80 ? 'success' : point.safetyScore > 50 ? 'warning' : 'error'}
                                sx={{ mt: 1, mr: 1 }}
                              />
                            )}
                          </>
                        } 
                      />
                      
                      <IconButton 
                        edge="end" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFavoriteToggle(point);
                        }}
                      >
                        {point.isFavorite ? <Star color="warning" /> : <StarBorder />}
                      </IconButton>
                    </ListItem>
                  );
                })
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Selected Point Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } },
        }}
      >
        {selectedPoint && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">{selectedPoint.name}</Typography>
              
              <IconButton onClick={() => setDrawerOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box sx={{ mr: 2, color: typeColors[selectedPoint.type] }}>
                {typeIcons[selectedPoint.type]}
              </Box>
              
              <Typography variant="subtitle1">
                {selectedPoint.type.charAt(0).toUpperCase() + selectedPoint.type.slice(1)}
              </Typography>
              
              {selectedPoint.safetyScore && (
                <Chip 
                  size="small" 
                  label={`Safety: ${selectedPoint.safetyScore}%`} 
                  color={selectedPoint.safetyScore > 80 ? 'success' : selectedPoint.safetyScore > 50 ? 'warning' : 'error'}
                  sx={{ ml: 'auto' }}
                />
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              <LocationOn sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
              {selectedPoint.address}
            </Typography>
            
            {selectedPoint.phone && (
              <Typography variant="body1" paragraph>
                <Phone sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                {selectedPoint.phone}
              </Typography>
            )}
            
            {selectedPoint.description && (
              <Typography variant="body1" paragraph>
                <Info sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                {selectedPoint.description}
              </Typography>
            )}
            
            {userLocation && (
              <Typography variant="body1" paragraph>
                <DirectionsCar sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                {calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  selectedPoint.latitude,
                  selectedPoint.longitude
                ).toFixed(2)} km away
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {selectedPoint.phone && (
                <Grid item xs={6}>
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    startIcon={<Phone />}
                    onClick={() => handleCall(selectedPoint.phone!)}
                  >
                    Call
                  </Button>
                </Grid>
              )}
              
              <Grid item xs={selectedPoint.phone ? 6 : 12}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<DirectionsCar />}
                  onClick={() => handleGetDirections(selectedPoint)}
                >
                  Directions
                </Button>
              </Grid>
              
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={selectedPoint.isFavorite ? <Star /> : <StarBorder />}
                  onClick={() => handleFavoriteToggle(selectedPoint)}
                >
                  {selectedPoint.isFavorite ? 'Unfavorite' : 'Favorite'}
                </Button>
              </Grid>
              
              <Grid item xs={6}>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  startIcon={<Share />}
                  onClick={() => handleShare(selectedPoint)}
                >
                  Share
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Drawer>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
        action={
          <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
            <Close fontSize="small" />
          </IconButton>
        }
      />
      
      <Box sx={{ mt: 6, mb: 2 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          This safety map is provided for informational purposes only and should not replace professional advice or training.
          In case of emergency, always call the national emergency number: <strong>112</strong>.
        </Typography>
      </Box>
    </Container>
  );
}