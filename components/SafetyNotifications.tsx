/**
 * SafetyNotifications Component
 * Provides real-time safety alerts and notifications to users
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Drawer,
  Divider,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Paper,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Notifications,
  NotificationsActive,
  Warning,
  Info,
  Error as ErrorIcon,
  CheckCircle,
  Close,
  Delete,
  LocationOn,
  AccessTime,
  NavigateNext,
  Settings,
  Visibility,
  VisibilityOff,
  NotificationsOff,
  Security
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'emergency' | 'incident' | 'alert' | 'update' | 'system';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actions?: {
    label: string;
    action: string;
    data?: Record<string, unknown>;
  }[];
  expiresAt?: string;
  source?: string;
}

interface NotificationPreferences {
  emergencyAlerts: boolean;
  safetyIncidents: boolean;
  routeUpdates: boolean;
  systemNotifications: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  notificationRadius: number; // in meters
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

interface SafetyNotificationsProps {
  userId?: string;
  initialOpen?: boolean;
  onClose?: () => void;
  standalone?: boolean;
}

const SafetyNotifications: React.FC<SafetyNotificationsProps> = ({
  userId,
  initialOpen = false,
  onClose,
  standalone = false
}) => {
  const router = useRouter();
  
  // State variables
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false);
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [showPreferences, setShowPreferences] = useState<boolean>(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emergencyAlerts: true,
    safetyIncidents: true,
    routeUpdates: true,
    systemNotifications: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    notificationRadius: 2000,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });
  
  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check consent first
      if (!consentGiven) {
        try {
          const consentResponse = await fetch('/api/auth/consent');
          if (consentResponse.ok) {
            const consentData = await consentResponse.json();
            if (consentData.consentSettings && consentData.consentSettings.personalized_recommendations) {
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
      
      // Fetch notifications from API
      const response = await fetch('/api/notifications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
      
      // Calculate unread count
      const unread = data.notifications.filter((notif: Notification) => !notif.read).length;
      setUnreadCount(unread);
      
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
      setLoading(false);
    }
  }, [consentGiven]);
  
  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }
      
      const data = await response.json();
      setPreferences(data.preferences);
    } catch (err: any) {
      console.error('Error fetching notification preferences:', err);
      // Use default preferences if fetch fails
    }
  }, []);
  
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      setSnackbarMessage('Failed to mark notification as read');
      setSnackbarOpen(true);
    }
  };
  
  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.filter(notif => notif.id !== notificationId)
      );
      
      // Update unread count if needed
      const deletedNotification = notifications.find(notif => notif.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      setSnackbarMessage('Notification deleted');
      setSnackbarOpen(true);
    } catch (err: any) {
      console.error('Error deleting notification:', err);
      setSnackbarMessage('Failed to delete notification');
      setSnackbarOpen(true);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      setSnackbarMessage('All notifications marked as read');
      setSnackbarOpen(true);
    } catch (err: unknown) {
      console.error('Error marking all notifications as read:', err);
      setSnackbarMessage('Failed to mark all notifications as read');
      setSnackbarOpen(true);
    }
  };
  
  // Handle notification action
  const handleNotificationAction = (notification: Notification, actionIndex: number) => {
    if (!notification.actions || !notification.actions[actionIndex]) return;
    
    const action = notification.actions[actionIndex];
    
    switch (action.action) {
      case 'view_map':
        if (notification.location) {
          router.push(`/map?lat=${notification.location.latitude}&lng=${notification.location.longitude}`);
        }
        break;
        
      case 'view_incident':
        if (action.data && action.data.incidentId) {
          router.push(`/incidents/${action.data.incidentId}`);
        }
        break;
        
      case 'view_route':
        if (action.data && action.data.routeId) {
          router.push(`/routes/${action.data.routeId}`);
        }
        break;
        
      case 'emergency_contacts':
        router.push('/profile/emergency-contacts');
        break;
        
      case 'dismiss':
        deleteNotification(notification.id);
        break;
        
      default:
        console.log('Unknown action:', action.action);
    }
    
    // Mark as read after action
    markAsRead(notification.id);
    
    // Close notification detail if open
    if (selectedNotification && selectedNotification.id === notification.id) {
      setSelectedNotification(null);
    }
  };
  
  // Save notification preferences
  const savePreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          preferences
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }
      
      setSnackbarMessage('Notification preferences saved');
      setSnackbarOpen(true);
      setShowPreferences(false);
    } catch (err: unknown) {
      console.error('Error saving notification preferences:', err);
      setSnackbarMessage('Failed to save notification preferences');
      setSnackbarOpen(true);
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
          personalized_recommendations: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update consent settings');
      }
      
      setConsentGiven(true);
      setShowConsentDialog(false);
      fetchNotifications();
    } catch (err: unknown) {
      console.error('Error updating consent:', err);
      setError(err instanceof Error ? err.message : 'Failed to update consent settings');
    }
  };
  
  // Toggle drawer open/close
  const toggleDrawer = () => {
    setIsOpen(prevState => !prevState);
    if (!isOpen) {
      fetchNotifications();
    } else if (onClose) {
      onClose();
    }
  };
  
  // Initialize component
  useEffect(() => {
    // Check if user has already given consent
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/auth/consent');
        if (response.ok) {
          const data = await response.json();
          if (data.consentSettings && data.consentSettings.personalized_recommendations) {
            setConsentGiven(true);
          }
        }
      } catch {
        // If error, we'll show consent dialog when needed
      }
    };
    
    checkConsent();
    fetchPreferences();
    
    if (isOpen) {
      fetchNotifications();
    }
    
    // Set up WebSocket connection for real-time notifications
    const setupWebSocket = () => {
      const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/notifications/ws`);
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
      };
      
      socket.onmessage = (event: MessageEvent) => {
        try {
          const data: { type: string; notification: Notification } = JSON.parse(event.data as string);
          
          if (data.type === 'notification') {
            // Add new notification to state
            setNotifications(prevNotifications => [data.notification, ...prevNotifications]);
            
            // Update unread count
            setUnreadCount(prevCount => prevCount + 1);
            
            // Show snackbar for new notification
            setSnackbarMessage(`New notification: ${data.notification.title}`);
            setSnackbarOpen(true);
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed');
        // Attempt to reconnect after a delay
        setTimeout(setupWebSocket, 5000);
      };
      
      return socket;
    };
    
    const socket = setupWebSocket();
    
    // Clean up WebSocket connection on unmount
    return () => {
      socket.close();
    };
  }, [fetchNotifications, fetchPreferences, isOpen]);
  
  // Get icon based on notification type and severity
  const getNotificationIcon = (notification: Notification) => {
    const { type, severity } = notification;
    
    if (type === 'emergency') {
      return <ErrorIcon color="error" />;
    }
    
    if (type === 'incident') {
      return severity === 'critical' || severity === 'high' 
        ? <Warning color="error" /> 
        : severity === 'medium' 
          ? <Warning color="warning" /> 
          : <Info color="info" />;
    }
    
    if (type === 'alert') {
      return severity === 'critical' || severity === 'high' 
        ? <NotificationsActive color="error" /> 
        : <Notifications color="primary" />;
    }
    
    if (type === 'update') {
      return <Info color="primary" />;
    }
    
    return <Info color="action" />;
  };
  
  // Get color based on notification severity
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      case 'info':
      default:
        return 'info';
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Render notification list
  const renderNotificationList = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading notifications...
          </Typography>
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <NotificationsOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You don't have any notifications at the moment
          </Typography>
        </Box>
      );
    }
    
    return (
      <List sx={{ width: '100%', p: 0 }}>
        {notifications.map((notification) => (
          <React.Fragment key={notification.id}>
            <ListItem 
              alignItems="flex-start"
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': { bgcolor: 'action.selected' },
                cursor: 'pointer'
              }}
              onClick={() => {
                setSelectedNotification(notification);
                if (!notification.read) {
                  markAsRead(notification.id);
                }
              }}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                >
                  <Delete />
                </IconButton>
              }
            >
              <ListItemIcon>
                {getNotificationIcon(notification)}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: notification.read ? 'normal' : 'bold',
                        mr: 1,
                        flexGrow: 1
                      }}
                    >
                      {notification.title}
                    </Typography>
                    
                    {!notification.read && (
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main',
                          mr: 1
                        }} 
                      />
                    )}
                    
                    <Chip 
                      label={notification.severity}
                      size="small"
                      color={getSeverityColor(notification.severity) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="text.primary"
                      sx={{ 
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        mb: 0.5
                      }}
                    >
                      {notification.message}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      {notification.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                          <LocationOn fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {notification.location.address || 'View location'}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime fontSize="small" sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  };
  
  // Render notification detail
  const renderNotificationDetail = () => {
    if (!selectedNotification) return null;
    
    return (
      <Dialog
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getNotificationIcon(selectedNotification)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {selectedNotification.title}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={selectedNotification.severity}
              size="small"
              color={getSeverityColor(selectedNotification.severity) as "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              {formatTimestamp(selectedNotification.timestamp)}
            </Typography>
          </Box>
          
          <Typography variant="body1" gutterBottom>
            {selectedNotification.message}
          </Typography>
          
          {selectedNotification.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <LocationOn color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {selectedNotification.location.address || 
                  `${selectedNotification.location.latitude.toFixed(6)}, ${selectedNotification.location.longitude.toFixed(6)}`}
              </Typography>
            </Box>
          )}
          
          {selectedNotification.source && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Source: {selectedNotification.source}
            </Typography>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSelectedNotification(null)}>
            Close
          </Button>
          
          {selectedNotification.actionable && selectedNotification.actions && selectedNotification.actions.length > 0 && (
            selectedNotification.actions.map((action, index) => (
              <Button 
                key={index}
                variant="contained" 
                color="primary"
                onClick={() => handleNotificationAction(selectedNotification, index)}
              >
                {action.label}
              </Button>
            ))
          )}
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render notification preferences
  const renderPreferences = () => {
    return (
      <Dialog
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Settings sx={{ mr: 1 }} />
            <Typography variant="h6">
              Notification Preferences
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Notification Types
          </Typography>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emergencyAlerts}
                  onChange={(e) => setPreferences(prev => ({ ...prev, emergencyAlerts: e.target.checked }))}
                  color="error"
                />
              }
              label="Emergency Alerts"
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -1 }}>
              Critical safety alerts that require immediate attention
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.safetyIncidents}
                  onChange={(e) => setPreferences(prev => ({ ...prev, safetyIncidents: e.target.checked }))}
                  color="warning"
                />
              }
              label="Safety Incidents"
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -1 }}>
              Reported safety issues in your area
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.routeUpdates}
                  onChange={(e) => setPreferences(prev => ({ ...prev, routeUpdates: e.target.checked }))}
                  color="info"
                />
              }
              label="Route Updates"
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -1 }}>
              Changes to your saved routes due to safety concerns
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.systemNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, systemNotifications: e.target.checked }))}
                />
              }
              label="System Notifications"
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: -1 }}>
              App updates and important system messages
            </Typography>
          </Paper>
          
          <Typography variant="subtitle2" gutterBottom>
            Delivery Methods
          </Typography>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.pushNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                />
              }
              label="Push Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                />
              }
              label="Email Notifications"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.smsNotifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                />
              }
              label="SMS Notifications"
            />
          </Paper>
          
          <Typography variant="subtitle2" gutterBottom>
            Location Settings
          </Typography>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Notification Radius: {preferences.notificationRadius / 1000} km
            </Typography>
            
            <Slider
              value={preferences.notificationRadius}
              min={500}
              max={10000}
              step={500}
              marks={[
                { value: 500, label: '0.5km' },
                { value: 5000, label: '5km' },
                { value: 10000, label: '10km' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value / 1000} km`}
              onChange={(_, newValue) => setPreferences(prev => ({ ...prev, notificationRadius: newValue as number }))}
            />
            
            <Typography variant="caption" color="text.secondary">
              You'll receive notifications about incidents within this distance from your location
            </Typography>
          </Paper>
          
          <Typography variant="subtitle2" gutterBottom>
            Quiet Hours
          </Typography>
          
          <Paper sx={{ p: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.quietHours.enabled}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    quietHours: {
                      ...prev.quietHours,
                      enabled: e.target.checked
                    }
                  }))}
                />
              }
              label="Enable Quiet Hours"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, ml: 4 }}>
              <TextField
                label="Start Time"
                type="time"
                value={preferences.quietHours.start}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours,
                    start: e.target.value
                  }
                }))}
                disabled={!preferences.quietHours.enabled}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                size="small"
                sx={{ mr: 2, width: 150 }}
              />
              
              <TextField
                label="End Time"
                type="time"
                value={preferences.quietHours.end}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  quietHours: {
                    ...prev.quietHours,
                    end: e.target.value
                  }
                }))}
                disabled={!preferences.quietHours.enabled}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                size="small"
                sx={{ width: 150 }}
              />
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4, mt: 1 }}>
              Only emergency alerts will be delivered during quiet hours
            </Typography>
          </Paper>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <AlertTitle>Privacy Notice</AlertTitle>
            Your notification preferences are stored in accordance with the DPDP Act 2023.
            You can update or delete these preferences at any time.
          </Alert>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowPreferences(false)}>
            Cancel
          </Button>
          
          <Button variant="contained" onClick={savePreferences}>
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render consent dialog
  const renderConsentDialog = () => {
    return (
      <Dialog
        open={showConsentDialog}
        onClose={() => setShowConsentDialog(false)}
      >
        <DialogTitle>Consent for Safety Notifications</DialogTitle>
        
        <DialogContent>
          <DialogContentText>
            To provide you with personalized safety notifications, we need your consent to process this data in accordance with the DPDP Act 2023.
          </DialogContentText>
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            By giving consent, you agree to:
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Receive personalized safety notifications based on your location" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Allow us to process your location data to provide relevant alerts" />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle fontSize="small" color="primary" />
              </ListItemIcon>
              <ListItemText primary="Receive notifications about safety incidents in your area" />
            </ListItem>
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            You can withdraw this consent at any time through your profile settings.
            For more information, please see our Privacy Policy.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowConsentDialog(false)}>
            Cancel
          </Button>
          
          <Button variant="contained" onClick={handleGiveConsent}>
            I Give Consent
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Main component render
  if (standalone) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Safety Notifications
        </Typography>
        
        {renderNotificationList()}
        {renderNotificationDetail()}
        {renderPreferences()}
        {renderConsentDialog()}
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnackbarOpen(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    );
  }
  
  return (
    <>
      <IconButton onClick={toggleDrawer} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <Notifications />
        </Badge>
      </IconButton>
      
      <Drawer
        anchor="right"
        open={isOpen}
        onClose={toggleDrawer}
        sx={{
          '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications
          </Typography>
          
          <Box>
            <Tooltip title="Notification settings">
              <IconButton onClick={() => setShowPreferences(true)} size="small" sx={{ mr: 1 }}>
                <Settings fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Mark all as read">
              <IconButton onClick={markAllAsRead} size="small" sx={{ mr: 1 }}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <IconButton onClick={toggleDrawer} size="small">
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Divider />
        
        {renderNotificationList()}
        {renderNotificationDetail()}
        {renderPreferences()}
        {renderConsentDialog()}
      </Drawer>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

const SafetyNotificationsComponent = SafetyNotifications;
export default SafetyNotificationsComponent;