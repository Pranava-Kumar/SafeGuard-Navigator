/**
 * Emergency Contacts Page
 * Allows users to manage their emergency contacts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  UserPlus,
  Trash2,
  Edit,
  X,
  BadgeCheck,
  AlertTriangle,
  Send as SendIcon,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EmergencyContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [addContactOpen, setAddContactOpen] = useState<boolean>(false);
  const [editContactOpen, setEditContactOpen] = useState<boolean>(false);
  const [currentContact, setCurrentContact] = useState<Partial<EmergencyContact>>({});
  const [verificationSent, setVerificationSent] = useState<boolean>(false);

  // Fetch emergency contacts on page load
  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  // Fetch emergency contacts from API
  const fetchEmergencyContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emergency/contact');
      if (!response.ok) throw new Error('Failed to fetch emergency contacts');

      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load your emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  // Handle add new contact
  const handleAddContact = async () => {
    if (!currentContact.name || !currentContact.phone || !currentContact.relationship) {
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
        body: JSON.stringify(currentContact),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add emergency contact');
      }

      // Refresh contacts list
      await fetchEmergencyContacts();
      setAddContactOpen(false);
      setCurrentContact({});
    } catch (err: any) {
      console.error('Error adding contact:', err);
      setError(err.message || 'Failed to add emergency contact');
    } finally {
      setLoading(false);
    }
  };

  // Handle update contact
  const handleUpdateContact = async () => {
    if (!currentContact.id || !currentContact.name || !currentContact.phone || !currentContact.relationship) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/emergency/contact/${currentContact.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentContact.name,
          phone: currentContact.phone,
          email: currentContact.email,
          relationship: currentContact.relationship
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update emergency contact');
      }

      // Refresh contacts list
      await fetchEmergencyContacts();
      setEditContactOpen(false);
      setCurrentContact({});
    } catch (err: any) {
      console.error('Error updating contact:', err);
      setError(err.message || 'Failed to update emergency contact');
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
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      setError(err.message || 'Failed to delete emergency contact');
    }
  };

  // Handle send verification
  const handleSendVerification = async (contactId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/emergency/contact/${contactId}/verify`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send verification');
      }

      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err: any) {
      console.error('Error sending verification:', err);
      setError(err.message || 'Failed to send verification');
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog with contact data
  const openEditDialog = (contact: EmergencyContact) => {
    setCurrentContact(contact);
    setEditContactOpen(true);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emergency Contacts</h1>
        <p className="text-muted-foreground">
          Manage your emergency contacts. These contacts will be notified in case you trigger an emergency alert.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {verificationSent && (
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Verification Sent</AlertTitle>
          <AlertDescription>A verification message has been sent to the contact.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Contacts</h2>
            <Button
              onClick={() => {
                setCurrentContact({});
                setAddContactOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {loading && contacts.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">You don&apos;t have any emergency contacts yet.</p>
              <p className="text-muted-foreground text-sm">Add contacts to notify them in case of emergency.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{contact.name}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {contact.isVerified ? (
                                <Badge variant="default" className="flex items-center gap-1">
                                  <BadgeCheck className="h-3 w-3" />
                                  Verified
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Not Verified
                                </Badge>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {contact.isVerified ? "Verified Contact" : "Not Verified"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="text-sm text-muted-foreground mt-1">
                        <span>{formatPhoneNumber(contact.phone)}</span>
                        {contact.email && (
                          <span className="ml-1">• {contact.email}</span>
                        )}
                        {contact.relationship && (
                          <span className="ml-1">• {contact.relationship}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      {!contact.isVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendVerification(contact.id)}
                          className="mr-1"
                        >
                          <SendIcon className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(contact)}
                        className="mr-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Info</AlertTitle>
              <AlertDescription>Your contact will receive a verification message when added.</AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="add-contact-name">Name</Label>
                <Input
                  id="add-contact-name"
                  value={currentContact.name || ''}
                  onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="add-contact-phone">Phone Number</Label>
                <Input
                  id="add-contact-phone"
                  value={currentContact.phone || ''}
                  onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                  className="mt-1"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This number will receive emergency alerts
                </p>
              </div>

              <div>
                <Label htmlFor="add-contact-email">Email</Label>
                <Input
                  id="add-contact-email"
                  type="email"
                  value={currentContact.email || ''}
                  onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="add-contact-relationship">Relationship</Label>
                <Input
                  id="add-contact-relationship"
                  value={currentContact.relationship || ''}
                  onChange={(e) => setCurrentContact({ ...currentContact, relationship: e.target.value })}
                  className="mt-1"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  e.g. Parent, Spouse, Friend
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddContactOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddContact}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={editContactOpen} onOpenChange={setEditContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Edit Emergency Contact</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditContactOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="edit-contact-name">Name</Label>
              <Input
                id="edit-contact-name"
                value={currentContact.name || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-contact-phone">Phone Number</Label>
              <Input
                id="edit-contact-phone"
                value={currentContact.phone || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                className="mt-1"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                {currentContact.isVerified ? "Changing phone number will require re-verification" : "This number will receive emergency alerts"}
              </p>
            </div>

            <div>
              <Label htmlFor="edit-contact-email">Email</Label>
              <Input
                id="edit-contact-email"
                type="email"
                value={currentContact.email || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, email: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-contact-relationship">Relationship</Label>
              <Input
                id="edit-contact-relationship"
                value={currentContact.relationship || ''}
                onChange={(e) => setCurrentContact({ ...currentContact, relationship: e.target.value })}
                className="mt-1"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                e.g. Parent, Spouse, Friend
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditContactOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpdateContact}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Contact'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}