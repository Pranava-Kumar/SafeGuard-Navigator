"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Phone, 
  Mail, 
  UserPlus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Shield,
  CheckCircle,
  Clock,
  MapPin
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relationship: string;
  isEmergency: boolean;
  notificationPreferences: {
    sms: boolean;
    email: boolean;
    call: boolean;
  };
}

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "John Doe",
      phone: "+1234567890",
      email: "john@example.com",
      relationship: "Family",
      isEmergency: true,
      notificationPreferences: {
        sms: true,
        email: true,
        call: true
      }
    },
    {
      id: "2",
      name: "Jane Smith",
      phone: "+1234567891",
      email: "jane@example.com",
      relationship: "Friend",
      isEmergency: false,
      notificationPreferences: {
        sms: true,
        email: true,
        call: false
      }
    }
  ]);

  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    relationship: "",
    isEmergency: false,
    notificationPreferences: {
      sms: true,
      email: true,
      call: false
    }
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert("Please fill in at least name and phone number");
      return;
    }

    const contact: Contact = {
      id: `contact_${Date.now()}`,
      ...newContact
    };

    setContacts(prev => [...prev, contact]);
    setNewContact({
      name: "",
      phone: "",
      email: "",
      relationship: "",
      isEmergency: false,
      notificationPreferences: {
        sms: true,
        email: true,
        call: false
      }
    });
    setShowAddContactDialog(false);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setNewContact(contact);
  };

  const handleUpdateContact = () => {
    if (!editingContact) return;

    setContacts(prev => prev.map(contact => 
      contact.id === editingContact.id 
        ? { ...contact, ...newContact }
        : contact
    ));
    
    setEditingContact(null);
    setNewContact({
      name: "",
      phone: "",
      email: "",
      relationship: "",
      isEmergency: false,
      notificationPreferences: {
        sms: true,
        email: true,
        call: false
      }
    });
  };

  const handleDeleteContact = (contactId: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    }
  };

  const handleTestNotification = (contact: Contact) => {
    alert(`Test notification would be sent to ${contact.name} via SMS and Email`);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case "family": return "bg-blue-100 text-blue-800";
      case "friend": return "bg-green-100 text-green-800";
      case "work": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Emergency Contacts
              </CardTitle>
              <CardDescription>
                Manage your emergency contacts and their notification preferences
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emergency Contacts Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {contacts.filter(c => c.isEmergency).length}
                  </div>
                  <div className="text-sm text-gray-600">Emergency Contacts</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {contacts.filter(c => c.notificationPreferences.sms).length}
                  </div>
                  <div className="text-sm text-gray-600">SMS Notifications</div>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {contacts.filter(c => c.notificationPreferences.email).length}
                  </div>
                  <div className="text-sm text-gray-600">Email Notifications</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Add Contact Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Your Contacts</h3>
            <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>
                    Add a new emergency contact and configure their notification preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter full name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relationship">Relationship</Label>
                    <Input
                      id="relationship"
                      type="text"
                      placeholder="Family, Friend, Work, etc."
                      value={newContact.relationship}
                      onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isEmergency"
                      checked={newContact.isEmergency}
                      onChange={(e) => setNewContact(prev => ({ ...prev, isEmergency: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isEmergency">Emergency Contact</Label>
                  </div>
                  <div className="space-y-3">
                    <Label>Notification Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="sms"
                          checked={newContact.notificationPreferences.sms}
                          onChange={(e) => setNewContact(prev => ({
                            ...prev,
                            notificationPreferences: {
                              ...prev.notificationPreferences,
                              sms: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="sms">SMS Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="email-notif"
                          checked={newContact.notificationPreferences.email}
                          onChange={(e) => setNewContact(prev => ({
                            ...prev,
                            notificationPreferences: {
                              ...prev.notificationPreferences,
                              email: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="email-notif">Email Notifications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="call"
                          checked={newContact.notificationPreferences.call}
                          onChange={(e) => setNewContact(prev => ({
                            ...prev,
                            notificationPreferences: {
                              ...prev.notificationPreferences,
                              call: e.target.checked
                            }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="call">Voice Call</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddContact} className="flex-1">
                      Add Contact
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddContactDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Contacts List */}
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No contacts added yet</p>
                <p className="text-sm text-gray-400 mt-2">Add emergency contacts to enable notifications</p>
              </div>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{contact.name}</span>
                          {contact.isEmergency && (
                            <Badge variant="destructive" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Emergency
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRelationshipColor(contact.relationship)}`}
                          >
                            {contact.relationship}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{contact.email}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contact.notificationPreferences.sms && (
                          <Badge variant="outline" className="text-xs">
                            SMS
                          </Badge>
                        )}
                        {contact.notificationPreferences.email && (
                          <Badge variant="outline" className="text-xs">
                            Email
                          </Badge>
                        )}
                        {contact.notificationPreferences.call && (
                          <Badge variant="outline" className="text-xs">
                            Call
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTestNotification(contact)}
                      >
                        Test Notification
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditContact(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Edit Contact Dialog */}
          <Dialog open={!!editingContact} onOpenChange={() => setEditingContact(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogDescription>
                  Update contact information and notification preferences
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-relationship">Relationship</Label>
                  <Input
                    id="edit-relationship"
                    type="text"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-isEmergency"
                    checked={newContact.isEmergency}
                    onChange={(e) => setNewContact(prev => ({ ...prev, isEmergency: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="edit-isEmergency">Emergency Contact</Label>
                </div>
                <div className="space-y-3">
                  <Label>Notification Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-sms"
                        checked={newContact.notificationPreferences.sms}
                        onChange={(e) => setNewContact(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            sms: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="edit-sms">SMS Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-email-notif"
                        checked={newContact.notificationPreferences.email}
                        onChange={(e) => setNewContact(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            email: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="edit-email-notif">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="edit-call"
                        checked={newContact.notificationPreferences.call}
                        onChange={(e) => setNewContact(prev => ({
                          ...prev,
                          notificationPreferences: {
                            ...prev.notificationPreferences,
                            call: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="edit-call">Voice Call</Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateContact} className="flex-1">
                    Update Contact
                  </Button>
                  <Button variant="outline" onClick={() => setEditingContact(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Emergency Instructions */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              In case of emergency, your emergency contacts will be notified automatically via SMS and email. 
              Make sure to keep your contact information up to date.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}