/**
 * Emergency Alert Form Page
 * Provides a form for triggering emergency alerts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Warning,
  MyLocation,
  Send,
  Phone,
  Message
} from '@mui/icons-material';
import { formatPhoneNumber } from '@/lib/utils';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isVerified: boolean;
}

export default function EmergencyAlertFormPage() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectAllContacts, setSelectAllContacts] = useState<boolean>(false);

  // Get user's location and emergency contacts on page load
  useEffect(() => {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enable location services.');
        }
      );
    }

    // Fetch emergency contacts
    fetchEmergencyContacts();
  }, []);

  // Fetch emergency contacts from API
  const fetchEmergencyContacts = async () => {
    try {
      const response = await fetch('/api/emergency/contact');
      if (!response.ok) throw new Error('Failed to fetch emergency contacts');

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load your emergency contacts');
    }
  };

  // Handle contact selection
  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  // Handle select all contacts
  useEffect(() => {
    if (selectAllContacts) {
      setSelectedContacts(contacts.map(contact => contact.id));
    } else if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    }
  }, [selectAllContacts]);

  // Update selectAllContacts when all contacts are manually selected/deselected
  useEffect(() => {
    if (contacts.length > 0 && selectedContacts.length === contacts.length) {
      setSelectAllContacts(true);
    } else if (selectAllContacts && selectedContacts.length !== contacts.length) {
      setSelectAllContacts(false);
    }
  }, [selectedContacts, contacts]);

  // Handle emergency alert trigger
  const handleTriggerAlert = async () => {
    if (!userLocation) {
      setError('Location is required to send an emergency alert');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            latitude: userLocation[0],
            longitude: userLocation[1]
          },
          message: message.trim() || 'I need help! This is an emergency alert.',
          contactIds: selectedContacts.length > 0 ? selectedContacts : undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send emergency alert');
      }

      setAlertSent(true);
    } catch (err: any) {
      console.error('Error sending alert:', err);
      setError(err.message || 'Failed to send emergency alert');
    } finally {
      setLoading(false);
    }
  };

  // Reset alert state
  const handleReset = () => {
    setAlertSent(false);
    setMessage('');
    setSelectedContacts([]);
    setSelectAllContacts(false);
  };

  // Handle add contacts
  const handleAddContacts = () => {
    router.push('/emergency/contacts');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Send Emergency Alert
        </Typography>

        <Paper
          sx={{
            p: 2,
            mt: 2,
            bgcolor: 'error.light',
            color: 'error.contrastText',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning sx={{ mr: 1, fontSize: 30 }} />
            <Typography variant="h6">
              In case of immediate danger, call the national emergency number: <strong>112</strong>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              href="tel:112"
              startIcon={<Phone />}
              sx={{ mr: 2 }}
            >
              Call 112
            </Button>

            <Button
              variant="contained"
              color="error"
              size="large"
              href="sms:112"
              startIcon={<Message />}
            >
              Text 112
            </Button>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {alertSent ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Alert Sent Successfully</AlertTitle>
            Your emergency alert has been sent to your selected contacts and nearby emergency services.
          </Alert>

          <Typography variant="body1" paragraph>
            Stay in a safe location if possible. Emergency services have been notified of your situation.
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReset}
              sx={{ mr: 2 }}
            >
              Send Another Alert
            </Button>

            <Button
              variant="outlined"
              onClick={() => router.push('/emergency/alerts')}
            >
              View All Alerts
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Your current location:
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MyLocation sx={{ mr: 1, color: userLocation ? 'success.main' : 'error.main' }} />
              <Typography>
                {userLocation
                  ? `${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`
                  : 'Location not available'}
              </Typography>

              {!userLocation && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<MyLocation />}
                  sx={{ ml: 2 }}
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          setUserLocation([position.coords.latitude, position.coords.longitude]);
                        },
                        (error) => {
                          console.error('Error getting location:', error);
                          setError('Unable to get your location. Please enable location services.');
                        }
                      );
                    }
                  }}
                >
                  Get Location
                </Button>
              )}
            </Box>
          </Box>

          <TextField
            label="Emergency Message"
            multiline
            rows={3}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your emergency situation (optional)"
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Select Emergency Contacts to Alert:
              </Typography>

              <Button
                variant="outlined"
                size="small"
                onClick={handleAddContacts}
              >
                Manage Contacts
              </Button>
            </Box>

            {contacts.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  You don't have any emergency contacts yet.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddContacts}
                >
                  Add Emergency Contacts
                </Button>
              </Box>
            ) : (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAllContacts}
                      onChange={(e) => setSelectAllContacts(e.target.checked)}
                    />
                  }
                  label="Select All Contacts"
                  sx={{ mb: 1 }}
                />

                <List sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  {contacts.map((contact) => (
                    <React.Fragment key={contact.id}>
                      <ListItem
                        onClick={() => handleContactSelect(contact.id)}
                        sx={{
                          py: 1,
                          backgroundColor: selectedContacts.includes(contact.id) ? 'action.selected' : 'transparent'
                        }}
                      >
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleContactSelect(contact.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <ListItemText
                          primary={contact.name}
                          secondary={
                            <>
                              {formatPhoneNumber(contact.phone)}
                              {contact.relationship && ` • ${contact.relationship}`}
                              {!contact.isVerified && ` • Not Verified`}
                            </>
                          }
                        />
                      </ListItem>
                      {contacts.indexOf(contact) < contacts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<Send />}
              disabled={loading || !userLocation}
              onClick={handleTriggerAlert}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Emergency Alert'}
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}