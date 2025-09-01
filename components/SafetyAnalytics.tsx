/**
 * SafetyAnalytics Component
 * Provides data visualization and analytics for safety information
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  TrendingDown,
  Warning,
  Security,
  LocationOn,
  AccessTime,
  Info,
  Download,
  Share,
  Refresh,
  BarChart,
  PieChart,
  Timeline,
  Map,
  Visibility,
  Report
} from '@mui/icons-material';
import SafetyMap from './SafetyMap';

// Mock data interfaces - would be replaced with actual API data
interface SafetyTrend {
  date: string;
  safetyScore: number;
  incidentCount: number;
}

interface IncidentTypeData {
  type: string;
  count: number;
  percentage: number;
}

interface SafetyHotspot {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  safetyScore: number;
  incidentCount: number;
  mostCommonType: string;
}

interface SafetyAnalyticsProps {
  initialLocation?: [number, number];
  initialTimeRange?: string;
}

const SafetyAnalytics: React.FC<SafetyAnalyticsProps> = ({
  initialLocation,
  initialTimeRange = 'week'
}) => {
  const router = useRouter();
  
  // State variables
  const [location, setLocation] = useState<[number, number] | null>(initialLocation || null);
  const [locationName, setLocationName] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>(initialTimeRange);
  const [radius, setRadius] = useState<number>(1000); // meters
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [safetyTrends, setSafetyTrends] = useState<SafetyTrend[]>([]);
  const [incidentTypes, setIncidentTypes] = useState<IncidentTypeData[]>([]);
  const [safetyHotspots, setSafetyHotspots] = useState<SafetyHotspot[]>([]);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [dataLastUpdated, setDataLastUpdated] = useState<string>('');
  
  // Report type options for display
  const reportTypes = [
    { value: 'safety_issue', label: 'Safety Issue' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'theft', label: 'Theft or Robbery' },
    { value: 'infrastructure', label: 'Infrastructure Problem' },
    { value: 'lighting', label: 'Poor Lighting' },
    { value: 'suspicious_activity', label: 'Suspicious Activity' },
    { value: 'traffic_hazard', label: 'Traffic Hazard' },
    { value: 'other', label: 'Other' }
  ];
  
  // Time range options
  const timeRangeOptions = [
    { value: 'day', label: 'Last 24 Hours' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' }
  ];
  
  // Radius options
  const radiusOptions = [
    { value: 500, label: '500m' },
    { value: 1000, label: '1km' },
    { value: 2000, label: '2km' },
    { value: 5000, label: '5km' },
    { value: 10000, label: '10km' }
  ];
  
  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation([latitude, longitude]);
          
          try {
            // Reverse geocode to get address
            const response = await fetch(`/api/geocoding/reverse?lat=${latitude}&lng=${longitude}`);
            if (response.ok) {
              const data = await response.json();
              setLocationName(data.address || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            } else {
              setLocationName(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
          } catch (err) {
            console.error('Error getting address:', err);
            setLocationName(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          }
          
          // Fetch safety data for this location
          fetchSafetyData(latitude, longitude);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Could not get your location. Please check your browser permissions.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };
  
  // Fetch safety data for a location
  const fetchSafetyData = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check consent first
      if (!consentGiven) {
        try {
          const consentResponse = await fetch('/api/auth/consent');
          if (consentResponse.ok) {
            const consentData = await consentResponse.json();
            if (consentData.consentSettings && consentData.consentSettings.analytics) {
              setConsentGiven(true);
            } else {
              setShowConsentDialog(true);
              setLoading(false);
              return;
            }
          } else {
            setShowConsentDialog(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          setShowConsentDialog(true);
          setLoading(false);
          return;
        }
      }
      
      // Fetch safety score
      const scoreResponse = await fetch(
        `/api/safety/score?lat=${latitude}&lng=${longitude}&radius=${radius}`
      );
      
      if (!scoreResponse.ok) throw new Error('Failed to fetch safety score');
      
      const scoreData = await scoreResponse.json();
      setSafetyScore(scoreData.safetyScore);
      
      // Fetch safety trends
      const trendsResponse = await fetch(
        `/api/safety/trends?lat=${latitude}&lng=${longitude}&radius=${radius}&timeRange=${timeRange}`
      );
      
      if (!trendsResponse.ok) throw new Error('Failed to fetch safety trends');
      
      const trendsData = await trendsResponse.json();
      setSafetyTrends(trendsData.trends);
      
      // Fetch incident types
      const typesResponse = await fetch(
        `/api/reporting/types?lat=${latitude}&lng=${longitude}&radius=${radius}&timeRange=${timeRange}`
      );
      
      if (!typesResponse.ok) throw new Error('Failed to fetch incident types');
      
      const typesData = await typesResponse.json();
      setIncidentTypes(typesData.types);
      
      // Fetch safety hotspots
      const hotspotsResponse = await fetch(
        `/api/safety/hotspots?lat=${latitude}&lng=${longitude}&radius=${radius}&timeRange=${timeRange}`
      );
      
      if (!hotspotsResponse.ok) throw new Error('Failed to fetch safety hotspots');
      
      const hotspotsData = await hotspotsResponse.json();
      setSafetyHotspots(hotspotsData.hotspots);
      
      // Set last updated timestamp
      setDataLastUpdated(new Date().toLocaleString());
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching safety data:', err);
      setError(err.message || 'Failed to load safety data');
      setLoading(false);
    }
  };
  
  // Handle giving consent
  const handleGiveConsent = async () => {
    try {
      const response = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analytics: true
        })
      });
      
      if (!response.ok) throw new Error('Failed to update consent settings');
      
      setConsentGiven(true);
      setShowConsentDialog(false);
      
      // Fetch data if location is available
      if (location) {
        fetchSafetyData(location[0], location[1]);
      } else {
        getCurrentLocation();
      }
    } catch (err: any) {
      console.error('Error updating consent:', err);
      setError(err.message);
    }
  };
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newTimeRange = event.target.value as string;
    setTimeRange(newTimeRange);
    
    // Refetch data with new time range
    if (location) {
      fetchSafetyData(location[0], location[1]);
    }
  };
  
  // Handle radius change
  const handleRadiusChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newRadius = event.target.value as number;
    setRadius(newRadius);
    
    // Refetch data with new radius
    if (location) {
      fetchSafetyData(location[0], location[1]);
    }
  };
  
  // Handle refresh data
  const handleRefreshData = () => {
    if (location) {
      fetchSafetyData(location[0], location[1]);
    }
  };
  
  // Handle export data
  const handleExportData = async () => {
    try {
      if (!location) return;
      
      const response = await fetch(
        `/api/safety/export?lat=${location[0]}&lng=${location[1]}&radius=${radius}&timeRange=${timeRange}`,
        {
          method: 'POST'
        }
      );
      
      if (!response.ok) throw new Error('Failed to export data');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `safety_data_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error exporting data:', err);
      setError(err.message);
    }
  };
  
  // Initialize component
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      
      // Get location name
      const getLocationName = async () => {
        try {
          const response = await fetch(
            `/api/geocoding/reverse?lat=${initialLocation[0]}&lng=${initialLocation[1]}`
          );
          
          if (response.ok) {
            const data = await response.json();
            setLocationName(data.address || `${initialLocation[0].toFixed(6)}, ${initialLocation[1].toFixed(6)}`);
          } else {
            setLocationName(`${initialLocation[0].toFixed(6)}, ${initialLocation[1].toFixed(6)}`);
          }
        } catch (err) {
          setLocationName(`${initialLocation[0].toFixed(6)}, ${initialLocation[1].toFixed(6)}`);
        }
      };
      
      getLocationName();
      fetchSafetyData(initialLocation[0], initialLocation[1]);
    } else {
      getCurrentLocation();
    }
    
    // Check if user has already given consent
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/auth/consent');
        if (response.ok) {
          const data = await response.json();
          if (data.consentSettings && data.consentSettings.analytics) {
            setConsentGiven(true);
          }
        }
      } catch (err) {
        // If error, we'll show consent dialog when needed
      }
    };
    
    checkConsent();
  }, [initialLocation, initialTimeRange]);
  
  // Render safety score card
  const renderSafetyScoreCard = () => {
    if (!safetyScore) return null;
    
    const scoreColor = 
      safetyScore >= 80 ? 'success.main' :
      safetyScore >= 60 ? 'warning.main' : 'error.main';
    
    const scoreText = 
      safetyScore >= 80 ? 'Safe' :
      safetyScore >= 60 ? 'Moderate' : 'Unsafe';
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Overall Safety Score
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 3 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                width: 200,
                height: 200
              }}
            >
              <CircularProgress
                variant="determinate"
                value={safetyScore}
                size={200}
                thickness={5}
                sx={{ color: scoreColor }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h3" component="div" color={scoreColor}>
                  {safetyScore}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {scoreText}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" align="center">
            Safety score is calculated based on reported incidents, crime data, lighting, and other factors.
          </Typography>
        </CardContent>
      </Card>
    );
  };
  
  // Render safety trends chart
  const renderSafetyTrendsChart = () => {
    if (!safetyTrends || safetyTrends.length === 0) return null;
    
    // Calculate trend direction
    const firstScore = safetyTrends[0]?.safetyScore || 0;
    const lastScore = safetyTrends[safetyTrends.length - 1]?.safetyScore || 0;
    const trendDirection = lastScore >= firstScore ? 'up' : 'down';
    const trendPercentage = Math.abs(Math.round(((lastScore - firstScore) / firstScore) * 100));
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Safety Trends
            </Typography>
            
            <Chip 
              icon={trendDirection === 'up' ? <TrendingUp /> : <TrendingDown />}
              label={`${trendPercentage}% ${trendDirection === 'up' ? 'Safer' : 'Less Safe'}`}
              color={trendDirection === 'up' ? 'success' : 'error'}
              variant="outlined"
            />
          </Box>
          
          <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
            {/* This would be replaced with an actual chart component */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <Timeline sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Safety score trend over time would be displayed here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (Chart visualization would be implemented with a library like Chart.js or Recharts)
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {new Date(safetyTrends[0]?.date).toLocaleDateString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(safetyTrends[safetyTrends.length - 1]?.date).toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  // Render incident types chart
  const renderIncidentTypesChart = () => {
    if (!incidentTypes || incidentTypes.length === 0) return null;
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Incident Types
          </Typography>
          
          <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
            {/* This would be replaced with an actual chart component */}
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <PieChart sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Incident type distribution would be displayed here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (Chart visualization would be implemented with a library like Chart.js or Recharts)
              </Typography>
            </Box>
          </Box>
          
          <List dense sx={{ mt: 2 }}>
            {incidentTypes.slice(0, 5).map((type) => (
              <ListItem key={type.type} sx={{ py: 0.5 }}>
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">
                        {reportTypes.find(t => t.value === type.type)?.label || type.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {type.percentage}% ({type.count})
                      </Typography>
                    </Box>
                  } 
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };
  
  // Render safety hotspots
  const renderSafetyHotspots = () => {
    if (!safetyHotspots || safetyHotspots.length === 0) return null;
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Safety Hotspots
          </Typography>
          
          <List>
            {safetyHotspots.map((hotspot) => (
              <Paper key={hotspot.id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="error" sx={{ mr: 1 }} />
                    <Typography variant="subtitle2">
                      {hotspot.address || `${hotspot.latitude.toFixed(6)}, ${hotspot.longitude.toFixed(6)}`}
                    </Typography>
                  </Box>
                  
                  <Chip 
                    label={`Score: ${hotspot.safetyScore}`}
                    color={
                      hotspot.safetyScore >= 80 ? 'success' :
                      hotspot.safetyScore >= 60 ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Report fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {hotspot.incidentCount} incidents reported
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Most common: {reportTypes.find(t => t.value === hotspot.mostCommonType)?.label || hotspot.mostCommonType}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button 
                    size="small" 
                    onClick={() => router.push(`/analytics/hotspot?lat=${hotspot.latitude}&lng=${hotspot.longitude}`)}
                  >
                    View Details
                  </Button>
                </Box>
              </Paper>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Back button */}
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Safety Analytics
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {/* Location and filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  {locationName || 'No location selected'}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                onClick={getCurrentLocation}
                sx={{ mt: 1 }}
              >
                Use My Current Location
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="time-range-label">Time Range</InputLabel>
                    <Select
                      labelId="time-range-label"
                      value={timeRange}
                      label="Time Range"
                      onChange={handleTimeRangeChange}
                    >
                      {timeRangeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="radius-label">Radius</InputLabel>
                    <Select
                      labelId="radius-label"
                      value={radius}
                      label="Radius"
                      onChange={handleRadiusChange}
                    >
                      {radiusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {dataLastUpdated ? `Last updated: ${dataLastUpdated}` : ''}
            </Typography>
            
            <Box>
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefreshData} size="small" sx={{ mr: 1 }}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Export data">
                <IconButton onClick={handleExportData} size="small">
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading safety data...
          </Typography>
        </Box>
      ) : (
        <>
          {/* Tabs for different views */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="safety analytics tabs">
              <Tab label="Overview" icon={<BarChart />} iconPosition="start" />
              <Tab label="Map View" icon={<Map />} iconPosition="start" />
            </Tabs>
          </Box>
          
          {/* Tab content */}
          {activeTab === 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {renderSafetyScoreCard()}
                {renderSafetyTrendsChart()}
              </Grid>
              
              <Grid item xs={12} md={6}>
                {renderIncidentTypesChart()}
                {renderSafetyHotspots()}
              </Grid>
            </Grid>
          ) : (
            <Card sx={{ height: 600 }}>
              <CardContent sx={{ height: '100%', p: 0 }}>
                {location ? (
                  <SafetyMap 
                    initialPosition={location}
                    showHeatmap={true}
                    showSafetyZones={true}
                    showIncidents={true}
                    zoomLevel={13}
                    incidents={safetyHotspots.map(hotspot => ({
                      id: hotspot.id,
                      lat: hotspot.latitude,
                      lng: hotspot.longitude,
                      type: hotspot.mostCommonType,
                      severity: Math.floor((100 - hotspot.safetyScore) / 20) + 1 // Convert safety score to severity 1-5
                    }))}
                  />
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100%' 
                  }}>
                    <Typography variant="body1" color="text.secondary">
                      No location selected
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      {/* Consent Dialog */}
      <Dialog open={showConsentDialog} onClose={() => setShowConsentDialog(false)}>
        <DialogTitle>Consent for Safety Analytics</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            To view safety analytics, we need your consent to process this data in accordance with the DPDP Act 2023.
          </DialogContentText>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            By giving consent, you agree to:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Allow us to analyze safety data in your selected area" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Process anonymized incident reports to generate safety scores" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Use your location to provide relevant safety information" />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You can withdraw this consent at any time through your profile settings.
            For more information, please see our Privacy Policy.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => router.back()}>Cancel</Button>
          <Button variant="contained" onClick={handleGiveConsent}>
            I Give Consent
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SafetyAnalytics;