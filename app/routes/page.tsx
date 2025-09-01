/**
 * Routes Page
 * Displays safe navigation routes with safety scores
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { 
  Warning, 
  LocationOn,
  Search,
  Refresh,
  MyLocation,
  ArrowBack,
  DirectionsCar,
  DirectionsWalk,
  DirectionsBike,
  DirectionsTransit,
  Star,
  StarBorder,
  Map,
  History,
  Add,
  Delete,
  Edit,
  Save,
  Share,
  MoreVert,
  AccessTime,
  Shield,
  Speed,
  TrendingUp,
  TrendingDown,
  LocalPolice,
  LightMode,
  Nightlight,
  People,
  Traffic,
  Visibility,
  HealthAndSafety as LocalHospital,
  Info,
} from '@mui/icons-material';
import Link from 'next/link';

// Interface for route
interface Route {
  id: string;
  name: string;
  startPoint: {
    name: string;
    latitude: number;
    longitude: number;
  };
  endPoint: {
    name: string;
    latitude: number;
    longitude: number;
  };
  distance: number;
  duration: number;
  safetyScore: number;
  transportMode: 'walking' | 'cycling' | 'driving' | 'transit';
  waypoints: Array<{
    latitude: number;
    longitude: number;
    name?: string;
  }>;
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
  isRecent?: boolean;
}

// Interface for route history
interface RouteHistory {
  id: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  date: string;
  safetyScore: number;
  transportMode: 'walking' | 'cycling' | 'driving' | 'transit';
}

// Mock data for routes
const mockRoutes: Route[] = [
  {
    id: 'route1',
    name: 'Home to Office',
    startPoint: {
      name: 'Home',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    endPoint: {
      name: 'Office',
      latitude: 28.7041,
      longitude: 77.1025,
    },
    distance: 12.5,
    duration: 35,
    safetyScore: 85,
    transportMode: 'driving',
    waypoints: [
      {
        latitude: 28.6292,
        longitude: 77.2789,
        name: 'Checkpoint 1',
      },
      {
        latitude: 28.6355,
        longitude: 77.2210,
        name: 'Checkpoint 2',
      },
    ],
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
    isRecent: true,
  },
  {
    id: 'route2',
    name: 'Office to Shopping Mall',
    startPoint: {
      name: 'Office',
      latitude: 28.7041,
      longitude: 77.1025,
    },
    endPoint: {
      name: 'Shopping Mall',
      latitude: 28.6292,
      longitude: 77.2789,
    },
    distance: 8.7,
    duration: 25,
    safetyScore: 75,
    transportMode: 'transit',
    waypoints: [
      {
        latitude: 28.6355,
        longitude: 77.2210,
        name: 'Bus Stop',
      },
    ],
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
    isRecent: true,
  },
  {
    id: 'route3',
    name: 'Home to Park',
    startPoint: {
      name: 'Home',
      latitude: 28.6139,
      longitude: 77.2090,
    },
    endPoint: {
      name: 'City Park',
      latitude: 28.6129,
      longitude: 77.1575,
    },
    distance: 3.2,
    duration: 40,
    safetyScore: 90,
    transportMode: 'walking',
    waypoints: [],
    metrics: {
      crimeRate: 85,
      lighting: 95,
      crowdedness: 80,
      trafficSafety: 90,
      emergencyServices: 85,
      visibility: 95,
    },
    timeOfDay: {
      morning: 95,
      afternoon: 90,
      evening: 85,
      night: 75,
    },
    trend: 'improving',
    lastUpdated: '2023-06-13T09:15:00Z',
    reportCount: 720,
    isFavorite: true,
  },
  {
    id: 'route4',
    name: 'Shopping Mall to Restaurant',
    startPoint: {
      name: 'Shopping Mall',
      latitude: 28.6292,
      longitude: 77.2789,
    },
    endPoint: {
      name: 'Restaurant',
      latitude: 28.5355,
      longitude: 77.2410,
    },
    distance: 5.5,
    duration: 20,
    safetyScore: 80,
    transportMode: 'cycling',
    waypoints: [
      {
        latitude: 28.6000,
        longitude: 77.2500,
        name: 'Bike Lane',
      },
    ],
    metrics: {
      crimeRate: 75,
      lighting: 85,
      crowdedness: 70,
      trafficSafety: 80,
      emergencyServices: 85,
      visibility: 85,
    },
    timeOfDay: {
      morning: 85,
      afternoon: 80,
      evening: 75,
      night: 65,
    },
    trend: 'stable',
    lastUpdated: '2023-06-12T16:20:00Z',
    reportCount: 850,
  },
  {
    id: 'route5',
    name: 'Office to Gym',
    startPoint: {
      name: 'Office',
      latitude: 28.7041,
      longitude: 77.1025,
    },
    endPoint: {
      name: 'Gym',
      latitude: 28.6129,
      longitude: 77.1575,
    },
    distance: 4.8,
    duration: 15,
    safetyScore: 70,
    transportMode: 'driving',
    waypoints: [],
    metrics: {
      crimeRate: 65,
      lighting: 75,
      crowdedness: 70,
      trafficSafety: 70,
      emergencyServices: 75,
      visibility: 70,
    },
    timeOfDay: {
      morning: 75,
      afternoon: 70,
      evening: 65,
      night: 55,
    },
    trend: 'declining',
    lastUpdated: '2023-06-11T11:10:00Z',
    reportCount: 650,
  },
];

// Mock data for route history
const mockRouteHistory: RouteHistory[] = [
  {
    id: 'history1',
    routeName: 'Home to Office',
    startPoint: 'Home',
    endPoint: 'Office',
    date: '2023-06-15T08:30:00Z',
    safetyScore: 85,
    transportMode: 'driving',
  },
  {
    id: 'history2',
    routeName: 'Office to Shopping Mall',
    startPoint: 'Office',
    endPoint: 'Shopping Mall',
    date: '2023-06-14T17:45:00Z',
    safetyScore: 75,
    transportMode: 'transit',
  },
  {
    id: 'history3',
    routeName: 'Home to Park',
    startPoint: 'Home',
    endPoint: 'City Park',
    date: '2023-06-13T09:15:00Z',
    safetyScore: 90,
    transportMode: 'walking',
  },
  {
    id: 'history4',
    routeName: 'Shopping Mall to Restaurant',
    startPoint: 'Shopping Mall',
    endPoint: 'Restaurant',
    date: '2023-06-12T19:20:00Z',
    safetyScore: 80,
    transportMode: 'cycling',
  },
  {
    id: 'history5',
    routeName: 'Office to Gym',
    startPoint: 'Office',
    endPoint: 'Gym',
    date: '2023-06-11T18:10:00Z',
    safetyScore: 70,
    transportMode: 'driving',
  },
];

// Score color mapping
const getScoreColor = (score: number) => {
  if (score >= 80) return 'success.main';
  if (score >= 60) return 'warning.main';
  return 'error.main';
};

// Transport mode icon mapping
const getTransportModeIcon = (mode: 'walking' | 'cycling' | 'driving' | 'transit') => {
  switch (mode) {
    case 'walking':
      return <DirectionsWalk />;
    case 'cycling':
      return <DirectionsBike />;
    case 'driving':
      return <DirectionsCar />;
    case 'transit':
      return <DirectionsTransit />;
    default:
      return <DirectionsCar />;
  }
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

export default function RoutesPage() {
  // State for tab value
  const [tabValue, setTabValue] = useState(0);
  
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for minimum safety score filter
  const [minSafetyScore, setMinSafetyScore] = useState(0);
  
  // State for transport mode filter
  const [transportMode, setTransportMode] = useState<'all' | 'walking' | 'cycling' | 'driving' | 'transit'>('all');
  
  // State for time of day filter
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');
  
  // State for loading
  const [loading, setLoading] = useState(true);
  
  // State for error
  const [error, setError] = useState<string | null>(null);
  
  // State for routes
  const [routes, setRoutes] = useState<Route[]>(mockRoutes);
  
  // State for route history
  const [routeHistory, setRouteHistory] = useState<RouteHistory[]>(mockRouteHistory);
  
  // State for selected route
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  
  // State for new route dialog
  const [newRouteDialogOpen, setNewRouteDialogOpen] = useState(false);
  
  // State for route history dialog
  const [routeHistoryDialogOpen, setRouteHistoryDialogOpen] = useState(false);
  
  // State for new route form
  const [newRouteForm, setNewRouteForm] = useState({
    startPoint: '',
    endPoint: '',
    transportMode: 'driving' as 'walking' | 'cycling' | 'driving' | 'transit',
    prioritizeSafety: true,
  });
  
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
  
  // Handle transport mode change
  const handleTransportModeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setTransportMode(event.target.value as 'all' | 'walking' | 'cycling' | 'driving' | 'transit');
  };
  
  // Handle time of day change
  const handleTimeOfDayChange = (time: 'morning' | 'afternoon' | 'evening' | 'night') => {
    setTimeOfDay(time);
  };
  
  // Handle route selection
  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };
  
  // Handle favorite toggle
  const handleFavoriteToggle = (route: Route) => {
    // In a real app, this would make an API call to update the favorite status
    setRoutes((prev) =>
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
      setRoutes(mockRoutes);
      setRouteHistory(mockRouteHistory);
      setLoading(false);
    }, 1000);
  };
  
  // Handle new route dialog open
  const handleNewRouteDialogOpen = () => {
    setNewRouteDialogOpen(true);
  };
  
  // Handle new route dialog close
  const handleNewRouteDialogClose = () => {
    setNewRouteDialogOpen(false);
  };
  
  // Handle route history dialog open
  const handleRouteHistoryDialogOpen = () => {
    setRouteHistoryDialogOpen(true);
  };
  
  // Handle route history dialog close
  const handleRouteHistoryDialogClose = () => {
    setRouteHistoryDialogOpen(false);
  };
  
  // Handle new route form change
  const handleNewRouteFormChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setNewRouteForm({
      ...newRouteForm,
      [name as string]: value,
    });
  };
  
  // Handle new route submit
  const handleNewRouteSubmit = () => {
    // In a real app, this would make an API call to create a new route
    setLoading(true);
    setTimeout(() => {
      // Mock new route creation
      const newRoute: Route = {
        id: `route${routes.length + 1}`,
        name: `${newRouteForm.startPoint} to ${newRouteForm.endPoint}`,
        startPoint: {
          name: newRouteForm.startPoint,
          latitude: 28.6139,
          longitude: 77.2090,
        },
        endPoint: {
          name: newRouteForm.endPoint,
          latitude: 28.7041,
          longitude: 77.1025,
        },
        distance: 10.5,
        duration: 30,
        safetyScore: 80,
        transportMode: newRouteForm.transportMode,
        waypoints: [],
        metrics: {
          crimeRate: 75,
          lighting: 85,
          crowdedness: 70,
          trafficSafety: 80,
          emergencyServices: 85,
          visibility: 85,
        },
        timeOfDay: {
          morning: 85,
          afternoon: 80,
          evening: 75,
          night: 65,
        },
        trend: 'stable',
        lastUpdated: new Date().toISOString(),
        reportCount: 0,
        isRecent: true,
      };
      
      setRoutes([newRoute, ...routes]);
      setSelectedRoute(newRoute);
      setLoading(false);
      setNewRouteDialogOpen(false);
      
      // Reset form
      setNewRouteForm({
        startPoint: '',
        endPoint: '',
        transportMode: 'driving',
        prioritizeSafety: true,
      });
    }, 1000);
  };
  
  // Filter routes
  const filteredRoutes = routes.filter((route) => {
    // Filter by search query
    if (
      searchQuery &&
      !route.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !route.startPoint.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !route.endPoint.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // Filter by minimum safety score
    if (route.safetyScore < minSafetyScore) return false;
    
    // Filter by transport mode
    if (transportMode !== 'all' && route.transportMode !== transportMode) return false;
    
    return true;
  });
  
  // Sort routes by safety score
  const sortedRoutes = [...filteredRoutes].sort((a, b) => b.safetyScore - a.safetyScore);
  
  // Filter favorites
  const favoriteRoutes = sortedRoutes.filter((route) => route.isFavorite);
  
  // Filter recent routes
  const recentRoutes = sortedRoutes.filter((route) => route.isRecent);
  
  // Initialize data on component mount
  useEffect(() => {
    // In a real app, this would fetch data from an API
    setTimeout(() => {
      setRoutes(mockRoutes);
      setRouteHistory(mockRouteHistory);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button 
          component={Link} 
          href="/"
          startIcon={<ArrowBack />}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Safe Routes
        </Typography>
        
        <Typography variant="body1" gutterBottom>
          Plan your journey with safety in mind. Our routes are optimized for safety based on real-time data and user reports.
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
      
      {/* Actions */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleNewRouteDialogOpen}
        >
          Plan New Route
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<History />}
          onClick={handleRouteHistoryDialogOpen}
        >
          Route History
        </Button>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search routes"
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
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
          
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel id="transport-mode-label">Transport Mode</InputLabel>
              <Select
                labelId="transport-mode-label"
                value={transportMode}
                label="Transport Mode"
                onChange={handleTransportModeChange}
              >
                <MenuItem value="all">All Modes</MenuItem>
                <MenuItem value="walking">Walking</MenuItem>
                <MenuItem value="cycling">Cycling</MenuItem>
                <MenuItem value="driving">Driving</MenuItem>
                <MenuItem value="transit">Public Transit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
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
          <Tab icon={<DirectionsCar />} label="All Routes" />
          <Tab icon={<Star />} label="Favorites" />
          <Tab icon={<History />} label="Recent" />
        </Tabs>
      </Box>
      
      {/* Content */}
      <Grid container spacing={3}>
        {/* List */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ height: 600, overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ m: 2 }}>
                {error}
              </Alert>
            ) : tabValue === 0 ? (
              // All Routes Tab
              sortedRoutes.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    No routes match your search criteria.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {sortedRoutes.map((route) => (
                    <ListItem 
                      key={route.id} 
                      button 
                      onClick={() => handleRouteSelect(route)}
                      selected={selectedRoute?.id === route.id}
                      divider
                    >
                      <ListItemIcon>
                        {getTransportModeIcon(route.transportMode)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {route.name}
                            </Typography>
                            {route.isFavorite && (
                              <Star sx={{ ml: 1, color: 'warning.main', fontSize: 18 }} />
                            )}
                            {route.isRecent && (
                              <Chip 
                                label="Recent" 
                                size="small" 
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                color="primary"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {route.startPoint.name} to {route.endPoint.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mr: 2,
                                  color: getScoreColor(route.safetyScore),
                                }}
                              >
                                <Shield sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {route.safetyScore}%
                                </Typography>
                              </Box>
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mr: 2,
                                  color: 'text.secondary',
                                }}
                              >
                                <Speed sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {route.distance} km
                                </Typography>
                              </Box>
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: 'text.secondary',
                                }}
                              >
                                <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {route.duration} min
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Tooltip title={route.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(route);
                            }}
                            color={route.isFavorite ? 'warning' : 'default'}
                          >
                            {route.isFavorite ? <Star /> : <StarBorder />}
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )
            ) : tabValue === 1 ? (
              // Favorites Tab
              favoriteRoutes.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    You don't have any favorite routes yet.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {favoriteRoutes.map((route) => (
                    <ListItem 
                      key={route.id} 
                      button 
                      onClick={() => handleRouteSelect(route)}
                      selected={selectedRoute?.id === route.id}
                      divider
                    >
                      <ListItemIcon>
                        {getTransportModeIcon(route.transportMode)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {route.name}
                            </Typography>
                            {route.isRecent && (
                              <Chip 
                                label="Recent" 
                                size="small" 
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                color="primary"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {route.startPoint.name} to {route.endPoint.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mr: 2,
                                  color: getScoreColor(route.safetyScore),
                                }}
                              >
                                <Shield sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {route.safetyScore}%
                                </Typography>
                              </Box>
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mr: 2,
                                  color: 'text.secondary',
                                }}
                              >
                                <Speed sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {route.distance} km
                                </Typography>
                              </Box>
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: 'text.secondary',
                                }}
                              >
                                <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {route.duration} min
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Tooltip title="Remove from favorites">
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(route);
                            }}
                            color="warning"
                          >
                            <Star />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )
            ) : (
              // Recent Tab
              recentRoutes.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body1">
                    You don't have any recent routes.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {recentRoutes.map((route) => (
                    <ListItem 
                      key={route.id} 
                      button 
                      onClick={() => handleRouteSelect(route)}
                      selected={selectedRoute?.id === route.id}
                      divider
                    >
                      <ListItemIcon>
                        {getTransportModeIcon(route.transportMode)}
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">
                              {route.name}
                            </Typography>
                            {route.isFavorite && (
                              <Star sx={{ ml: 1, color: 'warning.main', fontSize: 18 }} />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {route.startPoint.name} to {route.endPoint.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mr: 2,
                                  color: getScoreColor(route.safetyScore),
                                }}
                              >
                                <Shield sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {route.safetyScore}%
                                </Typography>
                              </Box>
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mr: 2,
                                  color: 'text.secondary',
                                }}
                              >
                                <Speed sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {route.distance} km
                                </Typography>
                              </Box>
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: 'text.secondary',
                                }}
                              >
                                <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {route.duration} min
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Tooltip title={route.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(route);
                            }}
                            color={route.isFavorite ? 'warning' : 'default'}
                          >
                            {route.isFavorite ? <Star /> : <StarBorder />}
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )
            )}
          </Paper>
        </Grid>
        
        {/* Map and Details */}
        <Grid item xs={12} md={7}>
          {/* Map Placeholder */}
          <Paper 
            sx={{ 
              height: 300, 
              mb: 3, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              bgcolor: 'grey.100',
            }}
          >
            {selectedRoute ? (
              <Box sx={{ textAlign: 'center' }}>
                <Map sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="body1">
                  Interactive map showing the route from {selectedRoute.startPoint.name} to {selectedRoute.endPoint.name}
                </Typography>
                <Button 
                  variant="contained" 
                  component={Link}
                  href={`/map?route=${selectedRoute.id}`}
                  sx={{ mt: 2 }}
                >
                  Open Full Map
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Map sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
                <Typography variant="body1">
                  Select a route to view on the map
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Route Details */}
          <Paper sx={{ p: 3, height: 285, overflow: 'auto' }}>
            {selectedRoute ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">{selectedRoute.name}</Typography>
                  
                  <Box>
                    <Tooltip title={selectedRoute.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                      <IconButton 
                        onClick={() => handleFavoriteToggle(selectedRoute)}
                        color={selectedRoute.isFavorite ? 'warning' : 'default'}
                      >
                        {selectedRoute.isFavorite ? <Star /> : <StarBorder />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Share route">
                      <IconButton color="primary">
                        <Share />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Route Information
                        </Typography>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            From
                          </Typography>
                          <Typography variant="body1">
                            {selectedRoute.startPoint.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            To
                          </Typography>
                          <Typography variant="body1">
                            {selectedRoute.endPoint.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Transport Mode
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getTransportModeIcon(selectedRoute.transportMode)}
                            <Typography variant="body1" sx={{ ml: 1 }}>
                              {selectedRoute.transportMode.charAt(0).toUpperCase() + selectedRoute.transportMode.slice(1)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Distance
                          </Typography>
                          <Typography variant="body1">
                            {selectedRoute.distance} km
                          </Typography>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body1">
                            {selectedRoute.duration} min
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Safety Score
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
                              value={selectedRoute.safetyScore} 
                              size={60}
                              thickness={5}
                              sx={{ color: getScoreColor(selectedRoute.safetyScore) }}
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
                                {selectedRoute.safetyScore}%
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
                        
                        <Typography variant="body2" gutterBottom>
                          Safety by time of day:
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Tooltip title="Morning (6 AM - 12 PM)">
                            <Box sx={{ textAlign: 'center' }}>
                              <LightMode sx={{ color: getScoreColor(selectedRoute.timeOfDay.morning) }} />
                              <Typography variant="body2">
                                {selectedRoute.timeOfDay.morning}%
                              </Typography>
                            </Box>
                          </Tooltip>
                          
                          <Tooltip title="Afternoon (12 PM - 5 PM)">
                            <Box sx={{ textAlign: 'center' }}>
                              <LightMode sx={{ color: getScoreColor(selectedRoute.timeOfDay.afternoon) }} />
                              <Typography variant="body2">
                                {selectedRoute.timeOfDay.afternoon}%
                              </Typography>
                            </Box>
                          </Tooltip>
                          
                          <Tooltip title="Evening (5 PM - 9 PM)">
                            <Box sx={{ textAlign: 'center' }}>
                              <Nightlight sx={{ color: getScoreColor(selectedRoute.timeOfDay.evening) }} />
                              <Typography variant="body2">
                                {selectedRoute.timeOfDay.evening}%
                              </Typography>
                            </Box>
                          </Tooltip>
                          
                          <Tooltip title="Night (9 PM - 6 AM)">
                            <Box sx={{ textAlign: 'center' }}>
                              <Nightlight sx={{ color: getScoreColor(selectedRoute.timeOfDay.night) }} />
                              <Typography variant="body2">
                                {selectedRoute.timeOfDay.night}%
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    component={Link}
                    href={`/map?route=${selectedRoute.id}`}
                    startIcon={<Map />}
                    fullWidth
                  >
                    View on Map
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<DirectionsCar />}
                    fullWidth
                  >
                    Start Navigation
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Shield sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
                
                <Typography variant="h6" gutterBottom align="center">
                  Select a route to view details
                </Typography>
                
                <Typography variant="body1" align="center" color="text.secondary">
                  Our routes are optimized for safety based on real-time data and user reports.
                </Typography>
                
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={handleNewRouteDialogOpen}
                  sx={{ mt: 2 }}
                >
                  Plan New Route
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* New Route Dialog */}
      <Dialog open={newRouteDialogOpen} onClose={handleNewRouteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Plan New Route</DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Starting Point"
                name="startPoint"
                value={newRouteForm.startPoint}
                onChange={handleNewRouteFormChange}
                placeholder="Enter starting location"
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <Tooltip title="Use current location">
                      <IconButton size="small">
                        <MyLocation />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination"
                name="endPoint"
                value={newRouteForm.endPoint}
                onChange={handleNewRouteFormChange}
                placeholder="Enter destination"
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="transport-mode-label">Transport Mode</InputLabel>
                <Select
                  labelId="transport-mode-label"
                  name="transportMode"
                  value={newRouteForm.transportMode}
                  label="Transport Mode"
                  onChange={handleNewRouteFormChange}
                >
                  <MenuItem value="walking">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsWalk sx={{ mr: 1 }} />
                      Walking
                    </Box>
                  </MenuItem>
                  <MenuItem value="cycling">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsBike sx={{ mr: 1 }} />
                      Cycling
                    </Box>
                  </MenuItem>
                  <MenuItem value="driving">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsCar sx={{ mr: 1 }} />
                      Driving
                    </Box>
                  </MenuItem>
                  <MenuItem value="transit">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DirectionsTransit sx={{ mr: 1 }} />
                      Public Transit
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newRouteForm.prioritizeSafety}
                    onChange={(e) => setNewRouteForm({
                      ...newRouteForm,
                      prioritizeSafety: e.target.checked,
                    })}
                    color="primary"
                  />
                }
                label="Prioritize safety over speed"
              />
              <Tooltip title="When enabled, routes will be optimized for safety rather than shortest distance or time">
                <IconButton size="small">
                  <Info />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleNewRouteDialogClose}>Cancel</Button>
          <Button 
            onClick={handleNewRouteSubmit} 
            variant="contained" 
            disabled={!newRouteForm.startPoint || !newRouteForm.endPoint}
          >
            Plan Route
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Route History Dialog */}
      <Dialog open={routeHistoryDialogOpen} onClose={handleRouteHistoryDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Route History</DialogTitle>
        
        <DialogContent>
          {routeHistory.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                You don't have any route history yet.
              </Typography>
            </Box>
          ) : (
            <List>
              {routeHistory.map((history) => (
                <ListItem key={history.id} divider>
                  <ListItemIcon>
                    {getTransportModeIcon(history.transportMode)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography variant="body1">
                        {history.routeName}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {history.startPoint} to {history.endPoint}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mr: 2,
                              color: getScoreColor(history.safetyScore),
                            }}
                          >
                            <Shield sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {history.safetyScore}%
                            </Typography>
                          </Box>
                          
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: 'text.secondary',
                            }}
                          >
                            <AccessTime sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2">
                              {formatDate(history.date)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    }
                  />
                  
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Map />}
                    component={Link}
                    href={`/map?route=${history.id}`}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleRouteHistoryDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
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
                  <strong>Lighting</strong>: Street lighting quality and visibility during night hours.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <People sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Crowdedness</strong>: Population density and foot traffic in the area.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Traffic sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Traffic Safety</strong>: Road conditions, traffic signals, and accident history.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <LocalHospital sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Emergency Services</strong>: Proximity to police stations, hospitals, and fire stations.
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', mb: 1 }}>
                <Visibility sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Visibility</strong>: Line of sight, blind spots, and overall visibility along the route.
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Safety scores are updated in real-time based on user reports and official data sources. All data collection and processing is compliant with DPDP Act 2023.
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
}