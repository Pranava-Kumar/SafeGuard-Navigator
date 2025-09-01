/**
 * EmergencyServices Component
 * Provides information about nearby emergency services and quick access to emergency contacts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  LocalHospital,
  LocalPolice,
  Fireplace,
  Phone,
  DirectionsCar,
  MyLocation,
  LocationOn,
  Info,
  Star,
  StarBorder,
  Directions,
  Share,
  Search,
  Close,
  Add,
  Edit,
  Delete,
  Call,
  Message,
  AccessTime,
  Public,
  Warning,
  ContactPhone,
  ContactEmergency,
  Refresh,
  ArrowBack
} from 'lucide-react';

// Interfaces
interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire' | 'ambulance' | 'roadside' | 'women_helpline' | 'disaster' | 'other';
  phone: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // in kilometers
  operatingHours?: string;
  website?: string;
  services?: string[];
  rating?: number;
  isFavorite?: boolean;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isVerified: boolean;
  priority: number;
}

interface EmergencyServicesProps {
  initialLocation?: [number, number];
  onServiceSelect?: (service: EmergencyService) => void;
  onEmergencyTrigger?: (location: [number, number], contactIds?: string[]) => void;
}

const EmergencyServices: React.FC<EmergencyServicesProps> = ({
  initialLocation,
  onServiceSelect,
  onEmergencyTrigger
}) => {
  const router = useRouter();
  
  // State variables
  const [location, setLocation] = useState<[number, number] | null>(
    initialLocation || null
  );
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);
  const [showAddContactDialog, setShowAddContactDialog] = useState<boolean>(false);
  const [showEditContactDialog, setShowEditContactDialog] = useState<boolean>(false);
  const [showDeleteContactDialog, setShowDeleteContactDialog] = useState<boolean>(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState<boolean>(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    priority: 1
  });
  const [editContact, setEditContact] = useState<EmergencyContact | null>(null);
  const [deleteContact, setDeleteContact] = useState<EmergencyContact | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [radius, setRadius] = useState<number>(5); // in kilometers
  
  // Service type filters
  const serviceTypes = [
    { value: 'all', label: 'All Services', icon: <Info /> },
    { value: 'hospital', label: 'Hospitals', icon: <LocalHospital /> },
    { value: 'police', label: 'Police Stations', icon: <LocalPolice /> },
    { value: 'fire', label: 'Fire Stations', icon: <Fireplace /> },
    { value: 'ambulance', label: 'Ambulance Services', icon: <DirectionsCar /> },
    { value: 'women_helpline', label: 'Women Helplines', icon: <ContactPhone /> },
    { value: 'roadside', label: 'Roadside Assistance', icon: <DirectionsCar /> },
    { value: 'disaster', label: 'Disaster Management', icon: <Warning /> },
  ];
  
  // Fetch user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setLocation(userLocation);
          fetchNearbyServices(userLocation, radius);
          setLoading(false);
        },
        (err: GeolocationPositionError) => {
          console.error('Error getting location:', err);
          setError('Could not get your location. Please check your browser permissions.');
          setLoading(false);
          
          // If initial location is provided, use it as fallback
          if (initialLocation) {
            setLocation(initialLocation);
            fetchNearbyServices(initialLocation, radius);
          }
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      
      // If initial location is provided, use it as fallback
      if (initialLocation) {
        setLocation(initialLocation);
        fetchNearbyServices(initialLocation, radius);
      }
    }
  };
  
  // Fetch nearby emergency services
  const fetchNearbyServices = async (location: [number, number], radius: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/emergency/services?lat=${location[0]}&lng=${location[1]}&radius=${radius}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch emergency services');
      }
      
      const data: { services: EmergencyService[] } = await response.json();
      setServices(data.services);
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error fetching emergency services:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to load emergency services');
      } else {
        setError('Failed to load emergency services');
      }
      setLoading(false);
    }
  };
  
  // Fetch user's emergency contacts
  const fetchEmergencyContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/emergency/contact');
      
      if (!response.ok) {
        throw new Error('Failed to fetch emergency contacts');
      }
      
      const data: { contacts: EmergencyContact[] } = await response.json();
      setContacts(data.contacts);
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error fetching emergency contacts:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to load emergency contacts');
      } else {
        setError('Failed to load emergency contacts');
      }
      setLoading(false);
    }
  };
  
  // Add emergency contact
  const addEmergencyContact = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!newContact.name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      
      if (!newContact.phone.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }
      
      // Add contact
      const response = await fetch('/api/emergency/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add emergency contact');
      }
      
      // Reset form and close dialog
      setNewContact({
        name: '',
        phone: '',
        relationship: '',
        priority: 1
      });
      
      setShowAddContactDialog(false);
      
      // Refresh contacts
      fetchEmergencyContacts();
      
      // Show success message
      setSnackbarMessage('Emergency contact added successfully');
      setSnackbarOpen(true);
      
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error adding emergency contact:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to add emergency contact');
      } else {
        setError('Failed to add emergency contact');
      }
      setLoading(false);
    }
  };
  
  // Update emergency contact
  const updateEmergencyContact = async () => {
    try {
      if (!editContact) return;
      
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!editContact.name.trim()) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      
      if (!editContact.phone.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }
      
      // Update contact
      const response = await fetch(`/api/emergency/contact/${editContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editContact.name,
          phone: editContact.phone,
          relationship: editContact.relationship,
          priority: editContact.priority
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update emergency contact');
      }
      
      // Reset form and close dialog
      setEditContact(null);
      setShowEditContactDialog(false);
      
      // Refresh contacts
      fetchEmergencyContacts();
      
      // Show success message
      setSnackbarMessage('Emergency contact updated successfully');
      setSnackbarOpen(true);
      
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error updating emergency contact:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to update emergency contact');
      } else {
        setError('Failed to update emergency contact');
      }
      setLoading(false);
    }
  };
  
  // Delete emergency contact
  const deleteEmergencyContact = async () => {
    try {
      if (!deleteContact) return;
      
      setLoading(true);
      setError(null);
      
      // Delete contact
      const response = await fetch(`/api/emergency/contact/${deleteContact.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete emergency contact');
      }
      
      // Reset form and close dialog
      setDeleteContact(null);
      setShowDeleteContactDialog(false);
      
      // Refresh contacts
      fetchEmergencyContacts();
      
      // Show success message
      setSnackbarMessage('Emergency contact deleted successfully');
      setSnackbarOpen(true);
      
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error deleting emergency contact:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to delete emergency contact');
      } else {
        setError('Failed to delete emergency contact');
      }
      setLoading(false);
    }
  };
  
  // Verify emergency contact
  const verifyEmergencyContact = async (contactId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verify contact
      const response = await fetch(`/api/emergency/contact/${contactId}/verify`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }
      
      // Show success message
      setSnackbarMessage('Verification code sent successfully');
      setSnackbarOpen(true);
      
      setLoading(false);
    } catch (err: unknown) {
      console.error('Error verifying emergency contact:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to send verification code');
      } else {
        setError('Failed to send verification code');
      }
      setLoading(false);
    }
  };
  
  // Trigger emergency alert
  const triggerEmergencyAlert = async () => {
    try {
      if (!location) {
        setError('Location is required to trigger emergency alert');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Trigger alert
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: {
            latitude: location[0],
            longitude: location[1]
          },
          contactIds: selectedContacts.length > 0 ? selectedContacts : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger emergency alert');
      }
      
      const data: { alertId: string } = await response.json();
      
      // Reset form and close dialog
      setSelectedContacts([]);
      setShowEmergencyDialog(false);
      
      // Show success message
      setSnackbarMessage('Emergency alert triggered successfully');
      setSnackbarOpen(true);
      
      // Call the onEmergencyTrigger callback if provided
      if (onEmergencyTrigger) {
        onEmergencyTrigger(location, selectedContacts);
      }
      
      setLoading(false);
      
      // Navigate to alert details page
      router.push(`/emergency/alert/${data.alertId}`);
    } catch (err: unknown) {
      console.error('Error triggering emergency alert:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to trigger emergency alert');
      } else {
        setError('Failed to trigger emergency alert');
      }
      setLoading(false);
    }
  };
  
  // Toggle favorite service
  const toggleFavoriteService = async (serviceId: string) => {
    try {
      // Find the service
      const service = services.find(s => s.id === serviceId);
      if (!service) return;
      
      // Toggle favorite status
      const updatedService = { ...service, isFavorite: !service.isFavorite };
      
      // Update services list
      setServices(prevServices =>
        prevServices.map(s =>
          s.id === serviceId ? updatedService : s
        )
      );
      
      // Update in backend
      const response = await fetch(`/api/emergency/services/${serviceId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isFavorite: updatedService.isFavorite })
      });
      
      if (!response.ok) {
        // Revert changes if request fails
        setServices(prevServices =>
          prevServices.map(s =>
            s.id === serviceId ? service : s
          )
        );
        throw new Error('Failed to update favorite status');
      }
    } catch (err: unknown) {
      console.error('Error updating favorite status:', err);
      if (err instanceof Error) {
        setSnackbarMessage(err.message || 'Failed to update favorite status');
      } else {
        setSnackbarMessage('Failed to update favorite status');
      }
      setSnackbarOpen(true);
    }
  };
  
  // Format phone number for display
  const formatPhoneNumber = (phone: string) => {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `${cleaned.slice(0, 1)}-${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else {
      return phone;
    }
  };
  
  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };
  
  // Get icon for service type
  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <LocalHospital />;
      case 'police':
        return <LocalPolice />;
      case 'fire':
        return <Fireplace />;
      case 'ambulance':
        return <DirectionsCar />;
      case 'roadside':
        return <DirectionsCar />;
      case 'women_helpline':
        return <ContactPhone />;
      case 'disaster':
        return <Warning />;
      default:
        return <Info />;
    }
  };
  
  // Initialize component
  useEffect(() => {
    getCurrentLocation();
    fetchEmergencyContacts();
  }, []);
  
  // Update services when location or radius changes
  useEffect(() => {
    if (location) {
      fetchNearbyServices(location, radius);
    }
  }, [location, radius]);
  
  // Filter services based on search query and active tab
  const filteredServices = services.filter(service => {
    // Filter by search query
    const matchesSearch = searchQuery
      ? service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.address.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Filter by service type (tab)
    const serviceType = serviceTypes[activeTab].value;
    const matchesType = serviceType === 'all' || service.type === serviceType;
    
    return matchesSearch && matchesType;
  });
  
  // Sort services by distance
  const sortedServices = [...filteredServices].sort((a, b) => {
    return (a.distance || 0) - (b.distance || 0);
  });
  
  // Render service list
  const renderServiceList = () => {
    if (loading && services.length === 0) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <p className="ml-2">
            Loading emergency services...
          </p>
        </div>
      );
    }
    
    if (error && services.length === 0) {
      return (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (sortedServices.length === 0) {
      return (
        <div className="flex flex-col items-center py-8">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No emergency services found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Try increasing the search radius or changing your location
          </p>
          <Button 
            onClick={() => getCurrentLocation()}
          >
            <Refresh className="mr-2 h-4 w-4" />
            Refresh Location
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedServices.map((service) => (
          <Card 
            key={service.id}
            className="h-full flex flex-col"
          >
            <CardContent className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className={`rounded-full p-2 mr-2 ${
                    service.type === 'hospital' ? 'bg-red-500' :
                    service.type === 'police' ? 'bg-blue-500' :
                    service.type === 'fire' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}>
                    {getServiceIcon(service.type)}
                  </div>
                  <h4 className="font-semibold">{service.name}</h4>
                </div>
                
                <Button 
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFavoriteService(service.id)}
                >
                  {service.isFavorite ? <Star className="h-4 w-4 fill-yellow-500" /> : <StarBorder className="h-4 w-4" />}
                </Button>
              </div>
              
              <Badge 
                variant="secondary"
                className="mb-2"
              >
                {serviceTypes.find(t => t.value === service.type)?.label || service.type}
              </Badge>
              
              <div className="flex items-center mb-1">
                <LocationOn className="h-4 w-4 mr-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {service.address}
                </p>
              </div>
              
              <div className="flex items-center mb-1">
                <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                <p className="text-sm">
                  {formatPhoneNumber(service.phone)}
                </p>
              </div>
              
              {service.operatingHours && (
                <div className="flex items-center mb-1">
                  <AccessTime className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {service.operatingHours}
                  </p>
                </div>
              )}
              
              {service.distance !== undefined && (
                <div className="flex items-center mb-1">
                  <MyLocation className="h-4 w-4 mr-1 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {service.distance < 1 
                      ? `${(service.distance * 1000).toFixed(0)} meters away` 
                      : `${service.distance.toFixed(1)} km away`}
                  </p>
                </div>
              )}
              
              {service.services && service.services.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">
                    Services:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {service.services.map((s, index) => (
                      <Badge key={index} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            
            <div className="flex p-4 pt-0">
              <Button 
                size="sm"
                variant="outline"
                className="mr-2"
                onClick={() => window.location.href = `tel:${service.phone}`}
              >
                <Call className="mr-1 h-4 w-4" />
                Call
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                className="mr-2"
                onClick={() => {
                  if (onServiceSelect) {
                    onServiceSelect(service);
                  } else {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${service.location.latitude},${service.location.longitude}`,
                      '_blank'
                    );
                  }
                }}
              >
                <Directions className="mr-1 h-4 w-4" />
                Directions
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => setSelectedService(service)}
              >
                <Info className="mr-1 h-4 w-4" />
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render service details
  const renderServiceDetails = () => {
    if (!selectedService) return null;
    
    return (
      <Box>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => setSelectedService(null)}
          sx={{ mb: 2 }}
        >
          Back to Services
        </Button>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  bgcolor: 
                    selectedService.type === 'hospital' ? 'error.main' :
                    selectedService.type === 'police' ? 'primary.main' :
                    selectedService.type === 'fire' ? 'warning.main' :
                    'info.main',
                  width: 56,
                  height: 56,
                  mr: 2
                }}
              >
                {getServiceIcon(selectedService.type)}
              </Avatar>
              
              <Box>
                <Typography variant="h5" gutterBottom>
                  {selectedService.name}
                </Typography>
                
                <Chip 
                  label={serviceTypes.find(t => t.value === selectedService.type)?.label || selectedService.type} 
                  size="small"
                  color={
                    selectedService.type === 'hospital' ? 'error' :
                    selectedService.type === 'police' ? 'primary' :
                    selectedService.type === 'fire' ? 'warning' :
                    'info'
                  }
                />
              </Box>
            </Box>
            
            <IconButton 
              onClick={() => toggleFavoriteService(selectedService.id)}
              color={selectedService.isFavorite ? 'primary' : 'default'}
            >
              {selectedService.isFavorite ? <Star /> : <StarBorder />}
            </IconButton>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Phone color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Phone Number" 
                    secondary={
                      <Typography 
                        component="a" 
                        href={`tel:${selectedService.phone}`}
                        color="primary"
                      >
                        {formatPhoneNumber(selectedService.phone)}
                      </Typography>
                    } 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Address" 
                    secondary={selectedService.address} 
                  />
                </ListItem>
                
                {selectedService.operatingHours && (
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Operating Hours" 
                      secondary={selectedService.operatingHours} 
                    />
                  </ListItem>
                )}
                
                {selectedService.website && (
                  <ListItem>
                    <ListItemIcon>
                      <Public color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Website" 
                      secondary={
                        <Typography 
                          component="a" 
                          href={selectedService.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="primary"
                        >
                          {selectedService.website}
                        </Typography>
                      } 
                    />
                  </ListItem>
                )}
                
                {selectedService.distance !== undefined && (
                  <ListItem>
                    <ListItemIcon>
                      <MyLocation color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Distance" 
                      secondary={
                        selectedService.distance < 1 
                          ? `${(selectedService.distance * 1000).toFixed(0)} meters away` 
                          : `${selectedService.distance.toFixed(1)} km away`
                      } 
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {selectedService.services && selectedService.services.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Services Offered
                  </Typography>
                  
                  <List dense>
                    {selectedService.services.map((service, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={service} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              <Box>
                <Typography variant="h6" gutterBottom>
                  Emergency Instructions
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    {selectedService.type === 'hospital' && "Call ahead if possible to inform them of your arrival and condition."}
                    {selectedService.type === 'police' && "In case of emergency, call the number directly instead of visiting in person."}
                    {selectedService.type === 'fire' && "Evacuate the area first, then call from a safe location."}
                    {selectedService.type === 'ambulance' && "Provide clear location details and nature of emergency when calling."}
                    {selectedService.type === 'roadside' && "Move to a safe location away from traffic before calling for assistance."}
                    {selectedService.type === 'women_helpline' && "Call from a safe location if possible. The helpline provides 24/7 assistance."}
                    {selectedService.type === 'disaster' && "Follow official evacuation instructions if provided. Stay tuned to emergency broadcasts."}
                  </Typography>
                </Alert>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<Call />}
              href={`tel:${selectedService.phone}`}
              color="primary"
            >
              Call Now
            </Button>
            
            <Box>
              <Button 
                startIcon={<Directions />}
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedService.location.latitude},${selectedService.location.longitude}`,
                    '_blank'
                  );
                }}
                sx={{ mr: 1 }}
              >
                Get Directions
              </Button>
              
              <Button 
                startIcon={<Share />}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${selectedService.name} - ${selectedService.address} - ${selectedService.phone}`
                  );
                  setSnackbarMessage('Contact information copied to clipboard');
                  setSnackbarOpen(true);
                }}
              >
                Share
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Render emergency contacts
  const renderEmergencyContacts = () => {
    if (loading && contacts.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading emergency contacts...
          </Typography>
        </Box>
      );
    }
    
    if (error && contacts.length === 0) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Your Emergency Contacts
          </Typography>
          
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setShowAddContactDialog(true)}
          >
            Add Contact
          </Button>
        </Box>
        
        {contacts.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <ContactEmergency sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No emergency contacts added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add trusted contacts who should be notified in case of emergency
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={() => setShowAddContactDialog(true)}
            >
              Add Emergency Contact
            </Button>
          </Paper>
        ) : (
          <List>
            {contacts
              .sort((a, b) => a.priority - b.priority)
              .map((contact) => (
                <Paper key={contact.id} sx={{ mb: 2 }}>
                  <ListItem
                    secondaryAction={
                      <Box>
                        <IconButton 
                          edge="end" 
                          onClick={() => {
                            setEditContact(contact);
                            setShowEditContactDialog(true);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <Edit />
                        </IconButton>
                        
                        <IconButton 
                          edge="end" 
                          onClick={() => {
                            setDeleteContact(contact);
                            setShowDeleteContactDialog(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <ContactPhone />
                      </Avatar>
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {contact.name}
                          {contact.isVerified ? (
                            <Tooltip title="Verified Contact">
                              <Chip 
                                label="Verified" 
                                size="small" 
                                color="success"
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          ) : (
                            <Tooltip title="Contact not verified">
                              <Chip 
                                label="Unverified" 
                                size="small" 
                                color="warning"
                                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                              />
                            </Tooltip>
                          )}
                          
                          <Chip 
                            label={`Priority ${contact.priority}`} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {formatPhoneNumber(contact.phone)}
                          </Typography>
                          
                          <Typography variant="caption" color="text.secondary">
                            {contact.relationship}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <Box sx={{ display: 'flex', p: 1, pl: 9 }}>
                    <Button 
                      size="small" 
                      startIcon={<Call />}
                      href={`tel:${contact.phone}`}
                      sx={{ mr: 1 }}
                    >
                      Call
                    </Button>
                    
                    <Button 
                      size="small" 
                      startIcon={<Message />}
                      href={`sms:${contact.phone}`}
                      sx={{ mr: 1 }}
                    >
                      Message
                    </Button>
                    
                    {!contact.isVerified && (
                      <Button 
                        size="small" 
                        color="warning"
                        onClick={() => verifyEmergencyContact(contact.id)}
                      >
                        Verify Contact
                      </Button>
                    )}
                  </Box>
                </Paper>
              ))}
          </List>
        )}
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Emergency SOS
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="body1" gutterBottom>
              In case of emergency, you can quickly alert your emergency contacts and nearby emergency services.
            </Typography>
            
            <Button 
              variant="contained" 
              color="error"
              size="large"
              fullWidth
              startIcon={<Warning />}
              onClick={() => setShowEmergencyDialog(true)}
              sx={{ mt: 2 }}
            >
              TRIGGER EMERGENCY ALERT
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  };
  
  // Render add contact dialog
  const renderAddContactDialog = () => {
    return (
      <Dialog
        open={showAddContactDialog}
        onClose={() => setShowAddContactDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Emergency Contact</DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Name"
            fullWidth
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            label="Phone Number"
            fullWidth
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            margin="normal"
            required
            helperText="This number will be contacted in case of emergency"
          />
          
          <TextField
            label="Relationship"
            fullWidth
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            margin="normal"
            placeholder="e.g. Parent, Spouse, Friend"
          />
          
          <TextField
            label="Priority"
            type="number"
            fullWidth
            value={newContact.priority}
            onChange={(e) => setNewContact({ ...newContact, priority: parseInt(e.target.value) || 1 })}
            margin="normal"
            InputProps={{ inputProps: { min: 1, max: 10 } }}
            helperText="Lower number means higher priority (1 is highest)"
          />
          
          <DialogContentText sx={{ mt: 2 }}>
            By adding this contact, you confirm that you have the person's consent to be contacted in case of emergency.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowAddContactDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={addEmergencyContact}
            disabled={loading || !newContact.name.trim() || !newContact.phone.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Contact'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render edit contact dialog
  const renderEditContactDialog = () => {
    if (!editContact) return null;
    
    return (
      <Dialog
        open={showEditContactDialog}
        onClose={() => setShowEditContactDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Emergency Contact</DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            label="Name"
            fullWidth
            value={editContact.name}
            onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            label="Phone Number"
            fullWidth
            value={editContact.phone}
            onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            label="Relationship"
            fullWidth
            value={editContact.relationship}
            onChange={(e) => setEditContact({ ...editContact, relationship: e.target.value })}
            margin="normal"
          />
          
          <TextField
            label="Priority"
            type="number"
            fullWidth
            value={editContact.priority}
            onChange={(e) => setEditContact({ ...editContact, priority: parseInt(e.target.value) || 1 })}
            margin="normal"
            InputProps={{ inputProps: { min: 1, max: 10 } }}
            helperText="Lower number means higher priority (1 is highest)"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowEditContactDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={updateEmergencyContact}
            disabled={loading || !editContact.name.trim() || !editContact.phone.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Update Contact'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render delete contact dialog
  const renderDeleteContactDialog = () => {
    if (!deleteContact) return null;
    
    return (
      <Dialog
        open={showDeleteContactDialog}
        onClose={() => setShowDeleteContactDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Emergency Contact</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteContact.name} from your emergency contacts?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDeleteContactDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={deleteEmergencyContact}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render emergency dialog
  const renderEmergencyDialog = () => {
    return (
      <Dialog
        open={showEmergencyDialog}
        onClose={() => setShowEmergencyDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1 }} />
            Emergency Alert
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText sx={{ mt: 2, fontWeight: 'bold' }}>
            This will send an emergency alert with your current location to emergency services and your selected contacts.
          </DialogContentText>
          
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}
          
          {contacts.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select contacts to notify:
              </Typography>
              
              <List dense>
                {contacts
                  .sort((a, b) => a.priority - b.priority)
                  .map((contact) => (
                    <ListItem key={contact.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedContacts.includes(contact.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContacts([...selectedContacts, contact.id]);
                              } else {
                                setSelectedContacts(selectedContacts.filter(id => id !== contact.id));
                              }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">
                              {contact.name} {contact.isVerified ? '(Verified)' : '(Unverified)'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatPhoneNumber(contact.phone)} - {contact.relationship}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Button 
                  size="small" 
                  onClick={() => setSelectedContacts(contacts.map(c => c.id))}
                >
                  Select All
                </Button>
                
                <Button 
                  size="small" 
                  onClick={() => setSelectedContacts([])}
                >
                  Clear Selection
                </Button>
              </Box>
            </Box>
          )}
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            Only use this feature in genuine emergency situations.
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowEmergencyDialog(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            color="error"
            onClick={triggerEmergencyAlert}
            disabled={loading}
            sx={{ ml: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : 'CONFIRM EMERGENCY'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <div className="container mx-auto py-8">
      {/* Add Contact Dialog */}
      {renderAddContactDialog()}
      
      {/* Edit Contact Dialog */}
      {renderEditContactDialog()}
      
      {/* Delete Contact Dialog */}
      {renderDeleteContactDialog()}
      
      {/* Emergency Dialog */}
      {renderEmergencyDialog()}
      
      {/* Snackbar for notifications */}
      {/* We'll replace this with a custom notification system later */}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Emergency Services
        </h1>
        
        <Button 
          variant="destructive"
          onClick={() => setShowEmergencyDialog(true)}
        >
          <Warning className="mr-2 h-4 w-4" />
          Emergency SOS
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1">
          <Card className="mb-6">
            <div className="p-4 flex items-center">
              <Input
                placeholder="Search emergency services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mr-2"
              />
              
              <Button 
                variant="outline"
                onClick={getCurrentLocation}
              >
                <MyLocation className="mr-2 h-4 w-4" />
                Update Location
              </Button>
            </div>
            
            {/* We'll implement tabs differently */}
            <div className="border-b border-border p-2">
              <div className="flex overflow-x-auto">
                {serviceTypes.map((type, index) => (
                  <Button
                    key={type.value}
                    variant={activeTab === index ? "default" : "ghost"}
                    className="mr-2"
                    onClick={() => setActiveTab(index)}
                  >
                    {type.icon}
                    <span className="ml-2">{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  {location ? (
                    `Showing services within ${radius} km of your location`
                  ) : (
                    'Location not available. Please enable location services.'
                  )}
                </p>
                
                {/* We'll implement radius selector differently */}
              </div>
              
              {selectedService ? renderServiceDetails() : renderServiceList()}
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="p-4">
            {renderEmergencyContacts()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmergencyServices;