/**
 * Emergency Alert Page
 * Allows users to trigger emergency alerts and manage emergency contacts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  MapPin,
  Send,
  X,
  Phone,
  MessageCircle,
  UserPlus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isVerified: boolean;
}

export default function EmergencyAlertPage() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [alertSent, setAlertSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({});

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

  // Handle add new contact
  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone || !newContact.relationship) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/emergency/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add emergency contact');
      }

      // Refresh contacts list
      await fetchEmergencyContacts();
      setAddContactOpen(false);
      setNewContact({});
    } catch (err: any) {
      console.error('Error adding contact:', err);
      setError(err.message || 'Failed to add emergency contact');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete contact
  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/emergency/contact/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete emergency contact');
      }

      // Refresh contacts list
      await fetchEmergencyContacts();

      // Remove from selected contacts if present
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      setError(err.message || 'Failed to delete emergency contact');
    }
  };

  // Reset alert state
  const handleReset = () => {
    setAlertSent(false);
    setMessage('');
    setSelectedContacts([]);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Emergency Alert</h1>

        <Card className="border border-destructive bg-destructive/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <h2 className="text-xl font-semibold">
                In case of immediate danger, call the national emergency number: <strong>112</strong>
              </h2>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="destructive"
                size="lg"
                asChild
              >
                <a href="tel:112">
                  <Phone className="h-5 w-5 mr-2" />
                  Call 112
                </a>
              </Button>

              <Button
                variant="destructive"
                size="lg"
                asChild
              >
                <a href="sms:112">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Text 112
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {alertSent ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Alert className="mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Alert Sent Successfully</AlertTitle>
              <AlertDescription>
                Your emergency alert has been sent to your selected contacts and nearby emergency services.
              </AlertDescription>
            </Alert>

            <p className="text-muted-foreground mb-6">
              Stay in a safe location if possible. Emergency services have been notified of your situation.
            </p>

            <Button
              variant="default"
              onClick={handleReset}
            >
              Send Another Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Send Emergency Alert</h2>

            <div className="mb-6">
              <Label className="text-muted-foreground mb-2 block">
                Your current location:
              </Label>

              <div className="flex items-center gap-2">
                <MapPin className={`h-5 w-5 ${userLocation ? 'text-green-500' : 'text-destructive'}`} />
                <span>
                  {userLocation
                    ? `${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`
                    : 'Location not available'}
                </span>

                {!userLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4"
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
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Location
                  </Button>
                )}
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="emergency-message">Emergency Message</Label>
              <Textarea
                id="emergency-message"
                placeholder="Describe your emergency situation (optional)"
                value={message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  Select Emergency Contacts to Alert:
                </h3>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddContactOpen(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>

              {contacts.length === 0 ? (
                <p className="text-muted-foreground">
                  You don&apos;t have any emergency contacts yet. Add contacts to notify them in case of emergency.
                </p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedContacts.includes(contact.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/50'
                        }`}
                      onClick={() => handleContactSelect(contact.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatPhoneNumber(contact.phone)}
                            {contact.relationship && ` • ${contact.relationship}`}
                            {!contact.isVerified && ` • Not Verified`}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              router.push(`/emergency/contacts/edit/${contact.id}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation();
                              handleDeleteContact(contact.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                variant="destructive"
                size="lg"
                disabled={loading || !userLocation}
                onClick={handleTriggerAlert}
                className="min-w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Emergency Alert
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onOpenChange={setAddContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Add Emergency Contact</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAddContactOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <Input
                  id="contact-name"
                  value={newContact.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, name: e.target.value })}
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact-phone">Phone Number</Label>
                <Input
                  id="contact-phone"
                  value={newContact.phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="mt-2"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This number will receive emergency alerts
                </p>
              </div>

              <div>
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={newContact.email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, email: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contact-relationship">Relationship</Label>
                <Input
                  id="contact-relationship"
                  value={newContact.relationship || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact({ ...newContact, relationship: e.target.value })}
                  className="mt-2"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  e.g. Parent, Spouse, Friend
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddContact}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}