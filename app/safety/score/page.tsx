/**
 * Safety Score Page
 * Displays safety scores for different areas and routes
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
  TextField,
  Slider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
} from '@mui/material';
import { 
  Warning, 
  LocationOn,
  Search,
  Refresh,
  MyLocation,
  ArrowBack,
  Shield,
  DirectionsCar,
  Visibility,
  People,
  LightMode,
  Nightlight,
  Traffic,
  LocalPolice,
  HealthAndSafety,
  Info,
  Star,
  StarBorder,
  Map,
  History,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import Link from 'next/link';

// Interface for area safety score
interface AreaSafetyScore {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  overallScore: number;
  metrics: {
    crimeRate: number;
    lighting: number;
    crowdedness: number;
    trafficSafety: number;
    emergencyServices: number;
    visibility: number;
  };
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
  reportCount: number;
  isFavorite?: boolean;
}

// Interface for route safety score
interface RouteSafetyScore {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  overallScore: number;
  metrics: {
    crimeRate: number;
    lighting: number;
    crowdedness: number;
    trafficSafety: number;
    emergencyServices: number;
    visibility: number;
  };
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  distance: number;
  duration: number;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: string;
  reportCount: number;
  isFavorite?: boolean;
}

// Mock data for area safety scores
const mockAreaScores: AreaSafetyScore[] = [
  {
    id: 'area1',
    name: 'Central District',
    latitude: 28.6139,
    longitude: 77.2090,
    overallScore: 85,
    metrics: {
      crimeRate: 80,
      lighting: 90,
      crowdedness: 70,
      trafficSafety: 85,
      emergencyServices: 95,
      visibility: 90,
    },
    timeOfDay: {
      morning: 90,
      afternoon: 85,
      evening: 80,
      night: 70,
    },
    trend: 'improving',
    lastUpdated: '2023-06-15T10:30:00Z',
    reportCount: 1250,
    isFavorite: true,
  },
  {
    id: 'area2',
    name: 'North Sector',
    latitude: 28.7041,
    longitude: 77.1025,
    overallScore: 75,
    metrics: {
      crimeRate: 70,
      lighting: 80,
      crowdedness: 65,
      trafficSafety: 75,
      emergencyServices: 85,
      visibility: 75,
    },
    timeOfDay: {
      morning: 85,
      afternoon: 80,
      evening: 70,
      night: 60,
    },
    trend: 'stable',
    lastUpdated: '2023-06-14T14:45:00Z',
    reportCount: 980,
  },
  {
    id: 'area3',
    name: 'East End',
    latitude: 28.6292,
    longitude: 77.2789,
    overallScore: 65,
    metrics: {
      crimeRate: 60,
      lighting: 70,
      crowdedness: 75,
      trafficSafety: 65,
      emergencyServices: 70,
      visibility: 60,
    },
    timeOfDay: {
      morning: 75,
      afternoon: 70,
      evening: 60,
      night: 50,
    },
    trend: 'declining',
    lastUpdated: '2023-06-13T09:15:00Z',
    reportCount: 720,
  },
  {
    id: 'area4',
    name: 'South Market',
    latitude: 28.5355,
    longitude: 77.2410,
    overallScore: 80,
    metrics: {
      crimeRate: 75,
      lighting: 85,
      crowdedness: 60,
      trafficSafety: 80,
      emergencyServices: 90,
      visibility: 85,
    },
    timeOfDay: {
      morning: 85,
      afternoon: 80,
      evening: 75,
      night: 65,
    },
    trend: 'improving',
    lastUpdated: '2023-06-12T16:20:00Z',
    reportCount: 1050,
  },
  {
    id: 'area5',
    name: 'West Hills',
    latitude: 28.6129,
    longitude: 77.1575,
    overallScore: 70,
    metrics: {
      crimeRate: 65,
      lighting: 75,
      crowdedness: 80,
      trafficSafety: 70,
      emergencyServices: 75,
      visibility: 70,
    },
    timeOfDay: {
      morning: 80,
      afternoon: 75,
      evening: 65,
      night: 55,
    },
    trend: 'stable',
    lastUpdated: '2023-06-11T11:10:00Z',
    reportCount: 850,
  },
];

// Mock data for route safety scores
const mockRouteScores: RouteSafetyScore[] = [
  {
    id: 'route1',
    name: 'Central District to North Sector',
    startPoint: 'Central District',
    endPoint: 'North Sector',
    overallScore: 80,
    metrics: {
      crimeRate: 75,
      lighting: 85,
      crowdedness: 70,
      trafficSafety: 80,
      emergencyServices: 90,
      visibility: 85,
    },
    timeOfDay: {
      morning: 85,
      afternoon: 80,
      evening: 75,
      night: 65,
    },
    distance: 5.2,
    duration: 15,
    trend: 'stable',
    lastUpdated: '2023-06-15T10:30:00Z',
    reportCount: 950,
    isFavorite: true,
  },
  {
    id: 'route2',
    name: 'East End to South Market',
    startPoint: 'East End',
    endPoint: 'South Market',
    overallScore: 70,
    metrics: {
      crimeRate: 65,
      lighting: 75,
      crowdedness: 80,
      trafficSafety: 70,
      emergencyServices: 75,
      visibility: 70,
    },
    timeOfDay: {
      morning: 80,
      afternoon: 75,
      evening: 65,
      night: 55,
    },
    distance: 7.8,
    duration: 25,
    trend: 'improving',
    lastUpdated: '2023-06-14T14:45:00Z',
    reportCount: 780,
  },
  {
    id: 'route3',
    name: 'West Hills to Central District',
    startPoint: 'West Hills',
    endPoint: 'Central District',
    overallScore: 75,
    metrics: {
      crimeRate: 70,
      lighting: 80,
      crowdedness: 65,
      trafficSafety: 75,
      emergencyServices: 85,
      visibility: 75,
    },
    timeOfDay: {
      morning: 85,
      afternoon: 80,
      evening: 70,
      night: 60,
    },
    distance: 4.5,
    duration: 12,
    trend: 'declining',
    lastUpdated: '2023-06-13T09:15:00Z',
    reportCount: 620,
  },
];

// Score color mapping
const getScoreColor = (score: number) => {
  if (score >= 80) return 'success.main';
  if (score >= 60) return 'warning.main';
  return 'error.main';
};

// Trend icon mapping
const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
  switch (trend) {
    case 'improving':
      return <TrendingUp sx={{ color: 'success.main' }} />;
    case 'declining':
      return <TrendingDown sx={{ color: 'error.main' }} />;
    case 'stable':
      return <Divider orientation="horizontal" sx={{ width: 24 }} />;
    default:
      return null;
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SafetyScorePage() {
  // State for tab value
  const [tabValue, setTabValue] = useState(0);
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for minimum safety score filter
  const [minSafetyScore, setMinSafetyScore] = useState(0);
  
  // State for time of day filter
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for error
  const [error, setError] = useState<string | null>(null);
  
  // State for area scores
  const [areaScores, setAreaScores] = useState<AreaSafetyScore[]>(mockAreaScores);
  
  // State for route scores
  const [routeScores, setRouteScores] = useState<RouteSafetyScore[]>(mockRouteScores);
  
  // State for selected area
  const [selectedArea, setSelectedArea] = useState<AreaSafetyScore | null>(null);
  
  // State for selected route
  const [selectedRoute, setSelectedRoute] = useState<RouteSafetyScore | null>(null);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Handle minimum safety score change
  const handleMinSafetyScoreChange = (event: Event, newValue: number | number[]) => {
    setMinSafetyScore(newValue as number);
  };
  
  // Handle time of day change
  const handleTimeOfDayChange = (time: 'morning' | 'afternoon' | 'evening' | 'night') => {
    setTimeOfDay(time);
  };
  
  // Handle area selection
  const handleAreaSelect = (area: AreaSafetyScore) => {
    setSelectedArea(area);
    setSelectedRoute(null);
  };
  
  // Handle route selection
  const handleRouteSelect = (route: RouteSafetyScore) => {
    setSelectedRoute(route);
    setSelectedArea(null);
  };
  
  // Handle favorite toggle for area
  const handleAreaFavoriteToggle = (area: AreaSafetyScore) => {
    // In a real app, this would make an API call to update the favorite status
    setAreaScores((prev) =>
      prev.map((a) =>
        a.id === area.id ? { ...a, isFavorite: !a.isFavorite } : a
      )
    );
    
    if (selectedArea && selectedArea.id === area.id) {
      setSelectedArea({
        ...selectedArea,
        isFavorite: !selectedArea.isFavorite,
      });
    }
  };
  
  // Handle favorite toggle for route
  const handleRouteFavoriteToggle = (route: RouteSafetyScore) => {
    // In a real app, this would make an API call to update the favorite status
    setRouteScores((prev) =>
      prev.map((r) =>
        r.id === route.id ? { ...r, isFavorite: !r.isFavorite } : r
      )
    );
    
    if (selectedRoute && selectedRoute.id === route.id) {
      setSelectedRoute({
        ...selectedRoute,
        isFavorite: !selectedRoute.isFavorite,
      });
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    // In a real app, this would fetch fresh data from the API
    setTimeout(() => {
      setAreaScores(mockAreaScores);
      setRouteScores(mockRouteScores);
      setLoading(false);
    }, 1000);
  };
  
  // Filter area scores
  const filteredAreaScores = areaScores.filter((area) => {
    // Filter by search query
    if (
      searchQuery &&
      !area.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by minimum safety score
    if (area.overallScore < minSafetyScore) return false;
    
    return true;
  });
  
  // Sort area scores by overall score
  const sortedAreaScores = [...filteredAreaScores].sort((a, b) => b.overallScore - a.overallScore);
  
  // Filter route scores
  const filteredRouteScores = routeScores.filter((route) => {
    // Filter by search query
    if (
      searchQuery &&
      !route.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !route.startPoint.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !route.endPoint.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by minimum safety score
    if (route.overallScore < minSafetyScore) return false;
    
    return true;
  });
  
  // Sort route scores by overall score
  const sortedRouteScores = [...filteredRouteScores].sort((a, b) => b.overallScore - a.overallScore);
  
  // Initialize data on component mount
  useEffect(() => {
    // In a real app, this would fetch data from an API
    setTimeout(() => {
      setAreaScores(mockAreaScores);
      setRouteScores(mockRouteScores);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          component={Link} 
          href="/safety"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Safety Hub
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Safety Score
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Check the safety scores for different areas and routes. Safety scores are calculated based on various factors including crime rates, lighting, crowdedness, traffic safety, and proximity to emergency services.
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
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search areas or routes"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Typography id="safety-score-slider" gutterBottom>
              Minimum Safety Score: {minSafetyScore}
            </Typography>
            <Slider
              value={minSafetyScore}
              onChange={handleMinSafetyScoreChange}
              aria-labelledby="safety-score-slider"
              valueLabelDisplay="auto"
              step={5}
              marks
              min={0}
              max={100}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Time of Day:</Typography>
              
              <Tooltip title="Morning (6 AM - 12 PM)">
                <Chip
                  icon={<LightMode />}
                  label="Morning"
                  onClick={() => handleTimeOfDayChange('morning')}
                  color={timeOfDay === 'morning' ? 'primary' : 'default'}
                  variant={timeOfDay === 'morning' ? 'filled' : 'outlined'}
                />
              </Tooltip>
              
              <Tooltip title="Afternoon (12 PM - 5 PM)">
                <Chip
                  icon={<LightMode />}
                  label="Afternoon"
                  onClick={() => handleTimeOfDayChange('afternoon')}
                  color={timeOfDay === 'afternoon' ? 'primary' : 'default'}
                  variant={timeOfDay === 'afternoon' ? 'filled' : 'outlined'}
                />
              </Tooltip>
              
              <Tooltip title="Evening (5 PM - 9 PM)">
                <Chip
                  icon={<Nightlight />}
                  label="Evening"
                  onClick={() => handleTimeOfDayChange('evening')}
                  color={timeOfDay === 'evening' ? 'primary' : 'default'}
                  variant={timeOfDay === 'evening' ? 'filled' : 'outlined'}
                />
              </Tooltip>
              
              <Tooltip title="Night (9 PM - 6 AM)">
                <Chip
                  icon={<Nightlight />}
                  label="Night"
                  onClick={() => handleTimeOfDayChange('night')}
                  color={timeOfDay === 'night' ? 'primary' : 'default'}
                  variant={timeOfDay === 'night' ? 'filled' : 'outlined'}
                />
              </Tooltip>
              
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefresh} color="primary">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<LocationOn />} label="Areas" />
          <Tab icon={<DirectionsCar />} label="Routes" />
        </Tabs>
      </Box>
      
      {/* Content */}
      <Grid container spacing={3}>
        {/* List */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: 500, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            ) : tabValue === 0 ? (
              // Areas Tab
              sortedAreaScores.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No areas match your search criteria.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Area</TableCell>
                        <TableCell align="center">Safety Score</TableCell>
                        <TableCell align="center">{timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}</TableCell>
                        <TableCell align="center">Trend</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedAreaScores.map((area) => (
                        <TableRow 
                          key={area.id} 
                          hover 
                          onClick={() => handleAreaSelect(area)}
                          selected={selectedArea?.id === area.id}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn sx={{ mr: 1, color: getScoreColor(area.overallScore) }} />
                              <Typography variant="body1">
                                {area.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(area.overallScore),
                                }}
                              >
                                {area.overallScore}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(area.timeOfDay[timeOfDay]),
                                }}
                              >
                                {area.timeOfDay[timeOfDay]}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {getTrendIcon(area.trend)}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={area.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAreaFavoriteToggle(area);
                                }}
                                color={area.isFavorite ? 'warning' : 'default'}
                              >
                                {area.isFavorite ? <Star /> : <StarBorder />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View on map">
                              <IconButton 
                                component={Link} 
                                href={`/safety/map?area=${area.id}`}
                                onClick={(e) => e.stopPropagation()}
                                color="primary"
                              >
                                <Map />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : (
              // Routes Tab
              sortedRouteScores.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No routes match your search criteria.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Route</TableCell>
                        <TableCell align="center">Safety Score</TableCell>
                        <TableCell align="center">{timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}</TableCell>
                        <TableCell align="center">Distance</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sortedRouteScores.map((route) => (
                        <TableRow 
                          key={route.id} 
                          hover 
                          onClick={() => handleRouteSelect(route)}
                          selected={selectedRoute?.id === route.id}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DirectionsCar sx={{ mr: 1, color: getScoreColor(route.overallScore) }} />
                              <Box>
                                <Typography variant="body1">
                                  {route.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {route.startPoint} to {route.endPoint}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(route.overallScore),
                                }}
                              >
                                {route.overallScore}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(route.timeOfDay[timeOfDay]),
                                }}
                              >
                                {route.timeOfDay[timeOfDay]}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body1">
                              {route.distance} km
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {route.duration} min
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title={route.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRouteFavoriteToggle(route);
                                }}
                                color={route.isFavorite ? 'warning' : 'default'}
                              >
                                {route.isFavorite ? <Star /> : <StarBorder />}
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="View on map">
                              <IconButton 
                                component={Link} 
                                href={`/routes?route=${route.id}`}
                                onClick={(e) => e.stopPropagation()}
                                color="primary"
                              >
                                <Map />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            )}
          </Paper>
        </Grid>
        
        {/* Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: 500, overflow: 'auto' }}>
            {selectedArea ? (
              // Area Details
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">{selectedArea.name}</Typography>
                  
                  <Box>
                    <Tooltip title={selectedArea.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                      <IconButton 
                        onClick={() => handleAreaFavoriteToggle(selectedArea)}
                        color={selectedArea.isFavorite ? 'warning' : 'default'}
                      >
                        {selectedArea.isFavorite ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="View on map">
                      <IconButton 
                        component={Link} 
                        href={`/safety/map?area=${selectedArea.id}`}
                        color="primary"
                      >
                        <Map />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Overall Safety Score
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Box 
                            sx={{ 
                              position: 'relative', 
                              display: 'inline-flex',
                              mr: 2,
                            }}
                          >
                            <CircularProgress 
                              variant="determinate" 
                              value={selectedArea.overallScore} 
                              size={80}
                              thickness={5}
                              sx={{ color: getScoreColor(selectedArea.overallScore) }}
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
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{ fontWeight: 'bold' }}
                              >
                                {selectedArea.overallScore}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getTrendIcon(selectedArea.trend)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {selectedArea.trend.charAt(0).toUpperCase() + selectedArea.trend.slice(1)}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              Based on {selectedArea.reportCount} reports
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              Last updated: {formatDate(selectedArea.lastUpdated)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Time of Day Safety
                        </Typography>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <LightMode sx={{ color: getScoreColor(selectedArea.timeOfDay.morning) }} />
                              <Typography variant="body2">Morning</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedArea.timeOfDay.morning),
                                }}
                              >
                                {selectedArea.timeOfDay.morning}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <LightMode sx={{ color: getScoreColor(selectedArea.timeOfDay.afternoon) }} />
                              <Typography variant="body2">Afternoon</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedArea.timeOfDay.afternoon),
                                }}
                              >
                                {selectedArea.timeOfDay.afternoon}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Nightlight sx={{ color: getScoreColor(selectedArea.timeOfDay.evening) }} />
                              <Typography variant="body2">Evening</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedArea.timeOfDay.evening),
                                }}
                              >
                                {selectedArea.timeOfDay.evening}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Nightlight sx={{ color: getScoreColor(selectedArea.timeOfDay.night) }} />
                              <Typography variant="body2">Night</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedArea.timeOfDay.night),
                                }}
                              >
                                {selectedArea.timeOfDay.night}%
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Safety Metrics
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocalPolice sx={{ mr: 1, color: getScoreColor(selectedArea.metrics.crimeRate) }} />
                            <Typography variant="body2">Crime Rate</Typography>
                          </Box>
                          <Rating 
                            value={selectedArea.metrics.crimeRate / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedArea.metrics.crimeRate) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LightMode sx={{ mr: 1, color: getScoreColor(selectedArea.metrics.lighting) }} />
                            <Typography variant="body2">Lighting</Typography>
                          </Box>
                          <Rating 
                            value={selectedArea.metrics.lighting / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedArea.metrics.lighting) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <People sx={{ mr: 1, color: getScoreColor(selectedArea.metrics.crowdedness) }} />
                            <Typography variant="body2">Crowdedness</Typography>
                          </Box>
                          <Rating 
                            value={selectedArea.metrics.crowdedness / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedArea.metrics.crowdedness) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Traffic sx={{ mr: 1, color: getScoreColor(selectedArea.metrics.trafficSafety) }} />
                            <Typography variant="body2">Traffic Safety</Typography>
                          </Box>
                          <Rating 
                            value={selectedArea.metrics.trafficSafety / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedArea.metrics.trafficSafety) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocalHospital sx={{ mr: 1, color: getScoreColor(selectedArea.metrics.emergencyServices) }} />
                            <Typography variant="body2">Emergency Services</Typography>
                          </Box>
                          <Rating 
                            value={selectedArea.metrics.emergencyServices / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedArea.metrics.emergencyServices) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Visibility sx={{ mr: 1, color: getScoreColor(selectedArea.metrics.visibility) }} />
                            <Typography variant="body2">Visibility</Typography>
                          </Box>
                          <Rating 
                            value={selectedArea.metrics.visibility / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedArea.metrics.visibility) }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    component={Link}
                    href={`/safety/map?area=${selectedArea.id}`}
                    startIcon={<Map />}
                    fullWidth
                  >
                    View on Safety Map
                  </Button>
                </Box>
              </Box>
            ) : selectedRoute ? (
              // Route Details
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">{selectedRoute.name}</Typography>
                  
                  <Box>
                    <Tooltip title={selectedRoute.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                      <IconButton 
                        onClick={() => handleRouteFavoriteToggle(selectedRoute)}
                        color={selectedRoute.isFavorite ? 'warning' : 'default'}
                      >
                        {selectedRoute.isFavorite ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="View on map">
                      <IconButton 
                        component={Link} 
                        href={`/routes?route=${selectedRoute.id}`}
                        color="primary"
                      >
                        <Map />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  {selectedRoute.startPoint} to {selectedRoute.endPoint}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Overall Safety Score
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          <Box 
                            sx={{ 
                              position: 'relative', 
                              display: 'inline-flex',
                              mr: 2,
                            }}
                          >
                            <CircularProgress 
                              variant="determinate" 
                              value={selectedRoute.overallScore} 
                              size={80}
                              thickness={5}
                              sx={{ color: getScoreColor(selectedRoute.overallScore) }}
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
                              }}
                            >
                              <Typography
                                variant="h6"
                                component="div"
                                sx={{ fontWeight: 'bold' }}
                              >
                                {selectedRoute.overallScore}%
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getTrendIcon(selectedRoute.trend)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {selectedRoute.trend.charAt(0).toUpperCase() + selectedRoute.trend.slice(1)}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              Based on {selectedRoute.reportCount} reports
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              Last updated: {formatDate(selectedRoute.lastUpdated)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Distance
                            </Typography>
                            <Typography variant="body1">
                              {selectedRoute.distance} km
                            </Typography>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" color="text.secondary" align="right">
                              Duration
                            </Typography>
                            <Typography variant="body1" align="right">
                              {selectedRoute.duration} min
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Time of Day Safety
                        </Typography>
                        
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <LightMode sx={{ color: getScoreColor(selectedRoute.timeOfDay.morning) }} />
                              <Typography variant="body2">Morning</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedRoute.timeOfDay.morning),
                                }}
                              >
                                {selectedRoute.timeOfDay.morning}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <LightMode sx={{ color: getScoreColor(selectedRoute.timeOfDay.afternoon) }} />
                              <Typography variant="body2">Afternoon</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedRoute.timeOfDay.afternoon),
                                }}
                              >
                                {selectedRoute.timeOfDay.afternoon}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Nightlight sx={{ color: getScoreColor(selectedRoute.timeOfDay.evening) }} />
                              <Typography variant="body2">Evening</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedRoute.timeOfDay.evening),
                                }}
                              >
                                {selectedRoute.timeOfDay.evening}%
                              </Typography>
                            </Box>
                          </Grid>
                          
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Nightlight sx={{ color: getScoreColor(selectedRoute.timeOfDay.night) }} />
                              <Typography variant="body2">Night</Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: getScoreColor(selectedRoute.timeOfDay.night),
                                }}
                              >
                                {selectedRoute.timeOfDay.night}%
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Safety Metrics
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocalPolice sx={{ mr: 1, color: getScoreColor(selectedRoute.metrics.crimeRate) }} />
                            <Typography variant="body2">Crime Rate</Typography>
                          </Box>
                          <Rating 
                            value={selectedRoute.metrics.crimeRate / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedRoute.metrics.crimeRate) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LightMode sx={{ mr: 1, color: getScoreColor(selectedRoute.metrics.lighting) }} />
                            <Typography variant="body2">Lighting</Typography>
                          </Box>
                          <Rating 
                            value={selectedRoute.metrics.lighting / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedRoute.metrics.lighting) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <People sx={{ mr: 1, color: getScoreColor(selectedRoute.metrics.crowdedness) }} />
                            <Typography variant="body2">Crowdedness</Typography>
                          </Box>
                          <Rating 
                            value={selectedRoute.metrics.crowdedness / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedRoute.metrics.crowdedness) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Traffic sx={{ mr: 1, color: getScoreColor(selectedRoute.metrics.trafficSafety) }} />
                            <Typography variant="body2">Traffic Safety</Typography>
                          </Box>
                          <Rating 
                            value={selectedRoute.metrics.trafficSafety / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedRoute.metrics.trafficSafety) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <LocalHospital sx={{ mr: 1, color: getScoreColor(selectedRoute.metrics.emergencyServices) }} />
                            <Typography variant="body2">Emergency Services</Typography>
                          </Box>
                          <Rating 
                            value={selectedRoute.metrics.emergencyServices / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedRoute.metrics.emergencyServices) }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Visibility sx={{ mr: 1, color: getScoreColor(selectedRoute.metrics.visibility) }} />
                            <Typography variant="body2">Visibility</Typography>
                          </Box>
                          <Rating 
                            value={selectedRoute.metrics.visibility / 20} 
                            readOnly 
                            precision={0.5} 
                            sx={{ color: getScoreColor(selectedRoute.metrics.visibility) }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    component={Link}
                    href={`/routes?route=${selectedRoute.id}`}
                    startIcon={<DirectionsCar />}
                    fullWidth
                  >
                    View Route Details
                  </Button>
                </Box>
              </Box>
            ) : (
              // No selection
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Shield sx={{ fontSize: 80, color: 'primary.light', mb: 2 }} />
                
                <Typography variant="h6" gutterBottom align="center">
                  Select an area or route to view detailed safety information
                </Typography>
                
                <Typography variant="body1" align="center" color="text.secondary">
                  Safety scores are calculated based on various factors including crime rates, lighting, crowdedness, traffic safety, and proximity to emergency services.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4 }}>
        <Alert severity="info">
          <Typography variant="subtitle1" gutterBottom>
            How Safety Scores are Calculated
          </Typography>
          
          <Typography variant="body2" paragraph>
            Safety scores are calculated using a combination of the following factors:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <LocalPolice sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Crime Rate</strong>: Historical crime data and recent incidents reported in the area.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <LightMode sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Lighting</strong>: Availability and quality of street lighting, especially important at night.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Crowdedness</strong>: Population density and typical crowd levels throughout the day.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Traffic sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Traffic Safety</strong>: Road conditions, traffic volume, and accident history.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Emergency Services</strong>: Proximity and response time of police, fire, and medical services.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Visibility sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Visibility</strong>: Line of sight, presence of blind spots, and overall visibility in the area.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Safety scores are updated regularly based on new data and user reports. The scores may vary by time of day and are intended to provide a general indication of safety, not a guarantee.
          </Typography>
        </Alert>
      </Box>
      
      <Box sx={{ mt: 6, mb: 2 }}>
        <Divider />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          These safety scores are provided for informational purposes only and should not replace personal judgment or awareness of your surroundings.
          In case of emergency, always call the national emergency number: <strong>112</strong>.
        </Typography>
      </Box>
    </Container>
  );
}