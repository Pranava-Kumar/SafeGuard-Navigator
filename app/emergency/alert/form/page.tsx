/**
 * Emergency Alert Form Page
 * Provides a form for triggering emergency alerts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Send,
  User,
  MapPin,
  Clock,
  Bell,
  Building,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPhoneNumber } from "@/lib/utils";

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
    } catch (err: Error | unknown) {
      console.error('Error sending alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to send emergency alert');
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
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Send Emergency Alert</h1>
        <p className="text-muted-foreground">
          Trigger an alert to your emergency contacts and nearby services.
        </p>
      </div>

      <Card className="border-destructive bg-destructive/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <CardTitle className="text-destructive">
                In case of immediate danger, call 112
              </CardTitle>
              <p className="text-destructive/80">
                This is the national emergency number in India.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="destructive" size="lg" asChild>
              <a href="tel:112">
                <Phone className="mr-2 h-4 w-4" /> Call 112
              </a>
            </Button>
            <Button variant="destructive" size="lg" asChild>
              <a href="sms:112">
                <MessageCircle className="mr-2 h-4 w-4" /> Text 112
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {alertSent ? (
        <Card className="my-4 text-center">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Alert Sent Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your emergency alert has been sent to your selected contacts and
              nearby emergency services. Stay in a safe location if possible.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={handleReset}>Send Another Alert</Button>
            <Button variant="outline" onClick={() => router.push("/emergency/alerts")}>
              View All Alerts
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="my-4">
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Your Current Location</Label>
              <div className="flex items-center gap-2">
                <MapPin
                  className={`h-5 w-5 ${
                    userLocation ? "text-green-500" : "text-red-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {userLocation
                    ? `${userLocation[0].toFixed(6)}, ${userLocation[1].toFixed(6)}`
                    : "Location not available"}
                </span>
                {!userLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setUserLocation([
                              position.coords.latitude,
                              position.coords.longitude,
                            ]);
                          },
                          (error) => {
                            console.error("Error getting location:", error);
                            setError(
                              "Unable to get your location. Please enable location services."
                            );
                          }
                        );
                      }
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Location
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Emergency Message (Optional)</Label>
              <Input
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., I'm at..."
              />
              <p className="text-xs text-muted-foreground">
                A default message will be sent if you leave this blank.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Select Emergency Contacts</Label>
                <Button variant="outline" size="sm" onClick={handleAddContacts}>
                  Manage Contacts
                </Button>
              </div>
              {contacts.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t added any emergency contacts yet.
                  </p>
                  <Button size="sm" onClick={handleAddContacts}>
                    Add Contacts
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 rounded-md border">
                  <div className="flex items-center gap-2 border-b p-4">
                    <Checkbox
                      id="select-all"
                      checked={selectAllContacts}
                      onCheckedChange={(checked) => setSelectAllContacts(Boolean(checked))}
                    />
                    <Label htmlFor="select-all" className="font-medium">
                      Select All Contacts
                    </Label>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-2 p-4"
                      >
                        <Checkbox
                          id={`contact-${contact.id}`}
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() => handleContactSelect(contact.id)}
                        />
                        <div className="grid gap-1.5">
                          <Label
                            htmlFor={`contact-${contact.id}`}
                            className="font-medium"
                          >
                            {contact.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {formatPhoneNumber(contact.phone)}
                            {contact.relationship && ` • ${contact.relationship}`}
                            {!contact.isVerified && (
                              <span className="text-yellow-600"> • Not Verified</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="lg"
                  className="w-full"
                  disabled={loading || !userLocation}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Emergency Alert
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Emergency Alert</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately notify your selected contacts and
                    nearby emergency services. Are you sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTriggerAlert}>
                    Yes, Send Alert
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}