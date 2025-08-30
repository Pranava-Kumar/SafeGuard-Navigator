"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Clock, 
  Users, 
  Phone, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: 'police' | 'medical' | 'family' | 'friend';
}

interface EmergencyAlertData {
  type: 'medical' | 'police' | 'fire' | 'personal';
  location: [number, number];
  message: string;
  contacts: string[];
  timestamp: Date;
}

interface EmergencyAlertProps {
  userLocation?: [number, number] | null;
  onAlertTriggered?: (alertData: EmergencyAlertData) => void;
}

export default function EmergencyAlert({ 
  userLocation = null, 
  onAlertTriggered 
}: EmergencyAlertProps) {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertType, setAlertType] = useState<EmergencyAlertData['type']>('personal');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState<'idle' | 'sending' | 'sent' | 'confirmed' | 'error'>('idle');
  const [alertId, setAlertId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const emergencyContacts: EmergencyContact[] = [
    { id: 'police', name: 'Police Emergency', number: '911', type: 'police' },
    { id: 'medical', name: 'Medical Emergency', number: '911', type: 'medical' },
    { id: 'family', name: 'Family Contact', number: '+1-234-567-8900', type: 'family' },
    { id: 'friend', name: 'Friend Contact', number: '+1-234-567-8901', type: 'friend' },
  ];

  const alertTypes = [
    { value: 'medical', label: 'Medical Emergency', icon: '🏥', color: 'bg-red-500' },
    { value: 'police', label: 'Police Assistance', icon: '👮', color: 'bg-blue-500' },
    { value: 'fire', label: 'Fire Emergency', icon: '🔥', color: 'bg-orange-500' },
    { value: 'personal', label: 'Personal Safety', icon: '🛡️', color: 'bg-purple-500' },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (alertStatus === 'sent' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && alertStatus === 'sent') {
      setAlertStatus('confirmed');
    }
    return () => clearInterval(interval);
  }, [alertStatus, countdown]);

  const triggerEmergencyAlert = async () => {
    if (!userLocation) {
      alert('Location not available. Please enable location services.');
      return;
    }

    if (selectedContacts.length === 0) {
      alert('Please select at least one emergency contact.');
      return;
    }

    setIsSending(true);
    setAlertStatus('sending');

    try {
      const alertData: EmergencyAlertData = {
        type: alertType,
        location: userLocation,
        message: customMessage || `Emergency alert triggered at ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}`,
        contacts: selectedContacts,
        timestamp: new Date()
      };

      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alertData),
      });

      if (response.ok) {
        const result = await response.json();
        setAlertId(result.alert_id);
        setAlertStatus('sent');
        setCountdown(5);
        onAlertTriggered?.(alertData);
        
        // Auto-confirm after countdown
        setTimeout(() => {
          setAlertStatus('confirmed');
          setTimeout(() => {
            setIsAlertActive(false);
            resetAlertForm();
          }, 2000);
        }, 5000);
      } else {
        throw new Error('Failed to send emergency alert');
      }

    } catch (error) {
      console.error('Error sending emergency alert:', error);
      setAlertStatus('error');
      setTimeout(() => {
        setAlertStatus('idle');
      }, 3000);
    } finally {
      setIsSending(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const resetAlertForm = () => {
    setAlertType('personal');
    setCustomMessage('');
    setSelectedContacts([]);
    setAlertStatus('idle');
    setAlertId(null);
    setCountdown(5);
  };

  const cancelAlert = () => {
    setIsAlertActive(false);
    resetAlertForm();
  };

  if (!isAlertActive) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsAlertActive(true)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105 animate-pulse"
          size="lg"
        >
          <AlertTriangle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  const getAlertStatusContent = () => {
    switch (alertStatus) {
      case 'sending':
        return (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sending Emergency Alert</h3>
            <p className="text-gray-600">Notifying emergency contacts...</p>
          </div>
        );

      case 'sent':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Alert Sent Successfully</h3>
            <p className="text-gray-600 mb-2">Emergency alert has been sent to your contacts.</p>
            <p className="text-sm text-gray-500">Auto-confirming in {countdown} seconds...</p>
            <div className="mt-4">
              <Button onClick={() => setAlertStatus('confirmed')} variant="outline">
                Confirm Now
              </Button>
            </div>
          </div>
        );

      case 'confirmed':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Emergency Alert Confirmed</h3>
            <p className="text-gray-600">Help is on the way. Stay safe and remain calm.</p>
            <div className="mt-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Alert ID: {alertId}
              </Badge>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Send Alert</h3>
            <p className="text-gray-600 mb-4">Please check your connection and try again.</p>
            <Button onClick={() => setAlertStatus('idle')} variant="outline">
              Try Again
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Emergency Type
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {alertTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAlertType(type.value as EmergencyAlertData['type'])}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      alertType === type.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-medium text-sm">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Emergency Contacts
              </Label>
              <div className="space-y-2">
                {emergencyContacts.map(contact => (
                  <label key={contact.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleContact(contact.id)}
                      className="mr-3 h-4 w-4 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.number}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {contact.type}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="message" className="text-sm font-medium text-gray-700 mb-2 block">
                Custom Message (Optional)
              </Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add any additional information that might help..."
                className="w-full"
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <strong>Location Sharing:</strong> Your current location will be shared with selected contacts.
                  {userLocation && (
                    <div className="mt-1">
                      Coordinates: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={cancelAlert}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={triggerEmergencyAlert}
                disabled={isSending || selectedContacts.length === 0}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSending ? 'Sending...' : 'Send Emergency Alert'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              Emergency Alert
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelAlert}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>

          {getAlertStatusContent()}
        </div>
      </div>
    </div>
  );
}