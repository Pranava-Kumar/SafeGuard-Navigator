/**
 * UserProfile Component
 * Allows users to manage their profile, safety preferences, emergency contacts, and consent settings
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Container,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Switch,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Paper,
  Tooltip,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Person,
  Security,
  ContactPhone,
  Notifications,
  Settings,
  Edit,
  Delete,
  Add,
  Download,
  Visibility,
  VisibilityOff,
  Info,
  Warning,
  Check,
  Close,
  Help
} from '@mui/icons-material';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  safetyPreferences: {
    riskTolerance: number;
    notificationThreshold: number;
    autoReportIncidents: boolean;
    shareLocationWithEmergencyContacts: boolean;
    preferredTransportModes: string[];
  };
  consentSettings: {
    dataProcessing: boolean;
    locationSharing: boolean;
    crowdsourcing: boolean;
    personalizedRecommendations: boolean;
    analytics: boolean;
    marketing: boolean;
    lastUpdated: string;
  };
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isVerified: boolean;
  notifyOnEmergency: boolean;
  shareLocationWith: boolean;
}

interface UserProfileProps {
  initialTab?: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState<number>(initialTab);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedUserData, setEditedUserData] = useState<Partial<UserData>>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showExportDialog, setShowExportDialog] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [exportOptions, setExportOptions] = useState<{
    personalInfo: boolean;
    safetyPreferences: boolean;
    emergencyContacts: boolean;
    routeHistory: boolean;
    reportHistory: boolean;
  }>({ 
    personalInfo: true, 
    safetyPreferences: true, 
    emergencyContacts: true, 
    routeHistory: true, 
    reportHistory: true 
  });
  const [showAddContactDialog, setShowAddContactDialog] = useState<boolean>(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    notifyOnEmergency: true,
    shareLocationWith: true
  });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [consentHistory, setConsentHistory] = useState<{date: string; changes: string[]}[]>([]);
  const [showConsentHistory, setShowConsentHistory] = useState<boolean>(false);
  
  const router = useRouter();
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user profile data
        const userResponse = await fetch('/api/user/profile');
        if (!userResponse.ok) throw new Error('Failed to fetch user profile');
        
        const userData = await userResponse.json();
        setUserData(userData);
        
        // Fetch emergency contacts
        const contactsResponse = await fetch('/api/emergency/contact');
        if (!contactsResponse.ok) throw new Error('Failed to fetch emergency contacts');
        
        const contactsData = await contactsResponse.json();
        setEmergencyContacts(contactsData.contacts || []);
        
        // Fetch consent history
        const consentResponse = await fetch('/api/auth/consent');
        if (consentResponse.ok) {
          const consentData = await consentResponse.json();
          setConsentHistory(consentData.history || []);
        }
        
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Start editing user profile
  const handleStartEditing = () => {
    setEditedUserData(userData || {});
    setIsEditing(true);
  };
  
  // Cancel editing user profile
  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditedUserData({});
  };
  
  // Save user profile changes
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedUserData)
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
      setEditedUserData({});
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Update safety preferences
  const handleUpdateSafetyPreferences = async (preferences: Partial<UserData['safetyPreferences']>) => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user/safety-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) throw new Error('Failed to update safety preferences');
      
      const updatedData = await response.json();
      setUserData(prev => prev ? { ...prev, safetyPreferences: updatedData.safetyPreferences } : null);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error updating safety preferences:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Update consent settings
  const handleUpdateConsent = async (consentKey: keyof UserData['consentSettings'], value: boolean) => {
    if (!userData) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          [consentKey]: value
        })
      });
      
      if (!response.ok) throw new Error('Failed to update consent settings');
      
      const updatedData = await response.json();
      
      // Update local state
      setUserData(prev => prev ? { 
        ...prev, 
        consentSettings: {
          ...prev.consentSettings,
          [consentKey]: value,
          lastUpdated: new Date().toISOString()
        } 
      } : null);
      
      // Refresh consent history
      const historyResponse = await fetch('/api/auth/consent');
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setConsentHistory(historyData.history || []);
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error updating consent settings:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Handle adding a new emergency contact
  const handleAddContact = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/emergency/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });
      
      if (!response.ok) throw new Error('Failed to add emergency contact');
      
      const data = await response.json();
      setEmergencyContacts(prev => [...prev, data.contact]);
      setShowAddContactDialog(false);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        notifyOnEmergency: true,
        shareLocationWith: true
      });
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error adding emergency contact:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Handle editing an emergency contact
  const handleEditContact = (contact: EmergencyContact) => {
    setNewContact(contact);
    setEditingContactId(contact.id);
    setShowAddContactDialog(true);
  };
  
  // Handle saving edited emergency contact
  const handleSaveContact = async () => {
    if (!editingContactId) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/emergency/contact/${editingContactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newContact)
      });
      
      if (!response.ok) throw new Error('Failed to update emergency contact');
      
      const data = await response.json();
      setEmergencyContacts(prev => 
        prev.map(contact => contact.id === editingContactId ? data.contact : contact)
      );
      setShowAddContactDialog(false);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        relationship: '',
        notifyOnEmergency: true,
        shareLocationWith: true
      });
      setEditingContactId(null);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error updating emergency contact:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Handle deleting an emergency contact
  const handleDeleteContact = async (contactId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/emergency/contact/${contactId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete emergency contact');
      
      setEmergencyContacts(prev => prev.filter(contact => contact.id !== contactId));
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error deleting emergency contact:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Handle verifying an emergency contact
  const handleVerifyContact = async (contactId: string) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/emergency/contact/${contactId}/verify`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to send verification');
      
      setIsLoading(false);
      setError(null);
      // Show success message or update UI to indicate verification sent
    } catch (err: any) {
      console.error('Error verifying contact:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Handle data export
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/data-export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: exportFormat,
          dataTypes: Object.entries(exportOptions)
            .filter(([_, value]) => value)
            .map(([key]) => key),
          reason: 'user_requested'
        })
      });
      
      if (!response.ok) throw new Error('Failed to request data export');
      
      const data = await response.json();
      
      setShowExportDialog(false);
      setIsLoading(false);
      
      // Show success message with expected delivery time
      setError(`Data export requested successfully. You will receive an email with your data within 24 hours.`);
    } catch (err: any) {
      console.error('Error exporting data:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  // Handle account deletion request
  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/user/account', {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete account');
      
      setShowDeleteDialog(false);
      setIsLoading(false);
      
      // Redirect to logout
      router.push('/api/auth/logout');
    } catch (err: any) {
      console.error('Error deleting account:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  if (isLoading && !userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert 
          severity={error.includes('success') ? 'success' : 'error'} 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left sidebar - User info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={userData?.profileImage} 
                sx={{ width: 120, height: 120, mb: 2 }}
              >
                {userData?.name?.charAt(0) || 'U'}
              </Avatar>
              
              {!isEditing ? (
                <>
                  <Typography variant="h5" gutterBottom>{userData?.name}</Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {userData?.email}
                  </Typography>
                  {userData?.phone && (
                    <Typography variant="body2" color="text.secondary">
                      {userData.phone}
                    </Typography>
                  )}
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<Edit />} 
                    sx={{ mt: 2 }}
                    onClick={handleStartEditing}
                  >
                    Edit Profile
                  </Button>
                </>
              ) : (
                <>
                  <TextField
                    label="Name"
                    fullWidth
                    value={editedUserData.name || ''}
                    onChange={(e) => setEditedUserData({ ...editedUserData, name: e.target.value })}
                    margin="normal"
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    value={editedUserData.email || ''}
                    onChange={(e) => setEditedUserData({ ...editedUserData, email: e.target.value })}
                    margin="normal"
                    type="email"
                  />
                  <TextField
                    label="Phone"
                    fullWidth
                    value={editedUserData.phone || ''}
                    onChange={(e) => setEditedUserData({ ...editedUserData, phone: e.target.value })}
                    margin="normal"
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button 
                      variant="contained" 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleCancelEditing}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              )}
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Account Actions
            </Typography>
            
            <List>
              <ListItem button onClick={() => setShowExportDialog(true)}>
                <ListItemIcon>
                  <Download />
                </ListItemIcon>
                <ListItemText 
                  primary="Export My Data" 
                  secondary="Download all your personal data"
                />
              </ListItem>
              
              <ListItem button onClick={() => setShowDeleteDialog(true)}>
                <ListItemIcon>
                  <Delete color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Delete Account" 
                  secondary="Permanently delete your account and data"
                  primaryTypographyProps={{ color: 'error' }}
                />
              </ListItem>
            </List>
          </Card>
        </Grid>
        
        {/* Main content area */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 0 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Security />} label="Safety Preferences" />
              <Tab icon={<ContactPhone />} label="Emergency Contacts" />
              <Tab icon={<Visibility />} label="Privacy & Consent" />
            </Tabs>
            
            {/* Safety Preferences Tab */}
            {activeTab === 0 && userData && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Safety Preferences
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Risk Tolerance
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" sx={{ mr: 1, minWidth: 100 }}>
                        Low Risk
                      </Typography>
                      <Slider
                        value={userData.safetyPreferences.riskTolerance}
                        onChange={(_, value) => handleUpdateSafetyPreferences({ riskTolerance: value as number })}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        sx={{ mx: 2 }}
                      />
                      <Typography variant="body2" sx={{ ml: 1, minWidth: 100 }}>
                        High Risk
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      This setting determines how cautious the app will be when planning routes for you.
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Safety Alert Threshold
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" sx={{ mr: 1, minWidth: 100 }}>
                        Fewer Alerts
                      </Typography>
                      <Slider
                        value={userData.safetyPreferences.notificationThreshold}
                        onChange={(_, value) => handleUpdateSafetyPreferences({ notificationThreshold: value as number })}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        sx={{ mx: 2 }}
                      />
                      <Typography variant="body2" sx={{ ml: 1, minWidth: 100 }}>
                        More Alerts
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Controls how frequently you receive safety alerts while navigating.
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom>
                      Preferred Transport Modes
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {['walking', 'driving', 'transit', 'cycling'].map(mode => {
                        const isSelected = userData.safetyPreferences.preferredTransportModes.includes(mode);
                        return (
                          <Chip 
                            key={mode}
                            label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                            onClick={() => {
                              const updatedModes = isSelected
                                ? userData.safetyPreferences.preferredTransportModes.filter(m => m !== mode)
                                : [...userData.safetyPreferences.preferredTransportModes, mode];
                              handleUpdateSafetyPreferences({ preferredTransportModes: updatedModes });
                            }}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                          />
                        );
                      })}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.safetyPreferences.autoReportIncidents}
                          onChange={(e) => handleUpdateSafetyPreferences({ autoReportIncidents: e.target.checked })}
                        />
                      }
                      label="Automatically report safety incidents"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      When enabled, the app will automatically report safety incidents detected by your device sensors.
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={userData.safetyPreferences.shareLocationWithEmergencyContacts}
                          onChange={(e) => handleUpdateSafetyPreferences({ shareLocationWithEmergencyContacts: e.target.checked })}
                        />
                      }
                      label="Share location with emergency contacts during alerts"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      When enabled, your emergency contacts will receive your real-time location during emergency alerts.
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Emergency Contacts Tab */}
            {activeTab === 1 && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Emergency Contacts
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    startIcon={<Add />}
                    onClick={() => {
                      setNewContact({
                        name: '',
                        phone: '',
                        email: '',
                        relationship: '',
                        notifyOnEmergency: true,
                        shareLocationWith: true
                      });
                      setEditingContactId(null);
                      setShowAddContactDialog(true);
                    }}
                  >
                    Add Contact
                  </Button>
                </Box>
                
                {emergencyContacts.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No emergency contacts added yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add trusted contacts who can be notified in case of emergency
                    </Typography>
                  </Paper>
                ) : (
                  <List>
                    {emergencyContacts.map((contact) => (
                      <Paper key={contact.id} sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle1">
                              {contact.name}
                              {contact.isVerified && (
                                <Chip 
                                  icon={<Check />} 
                                  label="Verified" 
                                  size="small" 
                                  color="success" 
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              {contact.relationship}
                            </Typography>
                            
                            <Typography variant="body2">
                              {contact.phone}
                            </Typography>
                            
                            {contact.email && (
                              <Typography variant="body2">
                                {contact.email}
                              </Typography>
                            )}
                            
                            <Box sx={{ mt: 1 }}>
                              {contact.notifyOnEmergency && (
                                <Chip 
                                  label="Emergency Alerts" 
                                  size="small" 
                                  sx={{ mr: 1, mt: 0.5 }}
                                />
                              )}
                              
                              {contact.shareLocationWith && (
                                <Chip 
                                  label="Location Sharing" 
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </Box>
                          </Box>
                          
                          <Box>
                            <IconButton 
                              onClick={() => handleEditContact(contact)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              <Edit />
                            </IconButton>
                            
                            <IconButton 
                              onClick={() => handleDeleteContact(contact.id)}
                              size="small"
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        {!contact.isVerified && (
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1 }}
                            onClick={() => handleVerifyContact(contact.id)}
                          >
                            Send Verification
                          </Button>
                        )}
                      </Paper>
                    ))}
                  </List>
                )}
              </Box>
            )}
            
            {/* Privacy & Consent Tab */}
            {activeTab === 2 && userData && (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Privacy & Consent Settings
                  </Typography>
                  
                  <Button 
                    variant="outlined" 
                    startIcon={<Info />}
                    onClick={() => setShowConsentHistory(true)}
                  >
                    View Consent History
                  </Button>
                </Box>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Your privacy is important to us. These settings control how your data is used within the SafeRoute application.
                  You can change these settings at any time. All changes are logged for transparency and compliance with DPDP Act 2023.
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Data Processing for Safety Scoring"
                      secondary="Allow processing of your location and route data to calculate safety scores and provide safer routes"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={userData.consentSettings.dataProcessing}
                        onChange={(e) => handleUpdateConsent('dataProcessing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Location Sharing"
                      secondary="Allow sharing your location with emergency contacts during alerts and with authorities in emergencies"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={userData.consentSettings.locationSharing}
                        onChange={(e) => handleUpdateConsent('locationSharing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Crowdsourced Safety Data"
                      secondary="Contribute to and benefit from anonymized safety reports from other users"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={userData.consentSettings.crowdsourcing}
                        onChange={(e) => handleUpdateConsent('crowdsourcing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Personalized Recommendations"
                      secondary="Receive personalized safety recommendations based on your travel patterns"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={userData.consentSettings.personalizedRecommendations}
                        onChange={(e) => handleUpdateConsent('personalizedRecommendations', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Analytics & Improvement"
                      secondary="Allow anonymized usage data to be analyzed for app improvement"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={userData.consentSettings.analytics}
                        onChange={(e) => handleUpdateConsent('analytics', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemText 
                      primary="Marketing Communications"
                      secondary="Receive updates about new safety features and services"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={userData.consentSettings.marketing}
                        onChange={(e) => handleUpdateConsent('marketing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {new Date(userData.consentSettings.lastUpdated).toLocaleString()}
                  </Typography>
                  
                  <Tooltip title="All consent changes are logged and stored securely in compliance with DPDP Act 2023">
                    <IconButton size="small">
                      <Help />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddContactDialog} onClose={() => setShowAddContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingContactId ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={newContact.name || ''}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            label="Phone Number"
            fullWidth
            value={newContact.phone || ''}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            margin="normal"
            required
            helperText="This number will receive emergency alerts"
          />
          
          <TextField
            label="Email (Optional)"
            fullWidth
            value={newContact.email || ''}
            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
            margin="normal"
            type="email"
          />
          
          <TextField
            label="Relationship"
            fullWidth
            value={newContact.relationship || ''}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            margin="normal"
            required
            helperText="E.g., Family, Friend, Colleague"
          />
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={newContact.notifyOnEmergency}
                  onChange={(e) => setNewContact({ ...newContact, notifyOnEmergency: e.target.checked })}
                />
              }
              label="Notify during emergency alerts"
            />
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={newContact.shareLocationWith}
                  onChange={(e) => setNewContact({ ...newContact, shareLocationWith: e.target.checked })}
                />
              }
              label="Share my location during emergencies"
            />
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowAddContactDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={editingContactId ? handleSaveContact : handleAddContact}
            disabled={!newContact.name || !newContact.phone || !newContact.relationship}
          >
            {editingContactId ? 'Save Changes' : 'Add Contact'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Data Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Your Data</DialogTitle>
        
        <DialogContent>
          <DialogContentText paragraph>
            You can download all your personal data in compliance with DPDP Act 2023. 
            Select which data you want to include and your preferred format.
          </DialogContentText>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Data to Include:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.personalInfo}
                    onChange={(e) => setExportOptions({ ...exportOptions, personalInfo: e.target.checked })}
                  />
                }
                label="Personal Information"
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.safetyPreferences}
                    onChange={(e) => setExportOptions({ ...exportOptions, safetyPreferences: e.target.checked })}
                  />
                }
                label="Safety Preferences"
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.emergencyContacts}
                    onChange={(e) => setExportOptions({ ...exportOptions, emergencyContacts: e.target.checked })}
                  />
                }
                label="Emergency Contacts"
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.routeHistory}
                    onChange={(e) => setExportOptions({ ...exportOptions, routeHistory: e.target.checked })}
                  />
                }
                label="Route History"
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={exportOptions.reportHistory}
                    onChange={(e) => setExportOptions({ ...exportOptions, reportHistory: e.target.checked })}
                  />
                }
                label="Report History"
              />
            </Grid>
          </Grid>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Export Format:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant={exportFormat === 'json' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('json')}
            >
              JSON
            </Button>
            
            <Button 
              variant={exportFormat === 'csv' ? 'contained' : 'outlined'}
              onClick={() => setExportFormat('csv')}
            >
              CSV
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Your data will be prepared and sent to your registered email address within 24 hours.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleExportData}
            disabled={!Object.values(exportOptions).some(value => value)}
          >
            Request Export
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Your Account?</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            This action will permanently delete your account and all associated data. 
            This cannot be undone. Are you sure you want to proceed?
          </DialogContentText>
          
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            In compliance with DPDP Act 2023, we will permanently delete all your personal data 
            from our systems within 30 days of this request.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} autoFocus>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Consent History Dialog */}
      <Dialog open={showConsentHistory} onClose={() => setShowConsentHistory(false)} maxWidth="md" fullWidth>
        <DialogTitle>Consent Change History</DialogTitle>
        
        <DialogContent>
          <DialogContentText paragraph>
            In compliance with DPDP Act 2023, we maintain a complete history of all changes to your consent settings.
          </DialogContentText>
          
          {consentHistory.length === 0 ? (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
              No consent changes have been recorded yet.
            </Typography>
          ) : (
            <List>
              {consentHistory.map((entry, index) => (
                <ListItem key={index} divider={index < consentHistory.length - 1}>
                  <ListItemText
                    primary={new Date(entry.date).toLocaleString()}
                    secondary={
                      <>
                        {entry.changes.map((change, i) => (
                          <Typography key={i} variant="body2" component="div">
                            • {change}
                          </Typography>
                        ))}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowConsentHistory(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;