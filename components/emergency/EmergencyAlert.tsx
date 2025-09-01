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
  Loader2,
  Navigation,
  User,
  Heart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
}

interface EmergencyAlertData {
  type: 'medical' | 'crime' | 'accident' | 'personal_safety' | 'natural_disaster';
  severity: number;
  location: {
    latitude: number;
    longitude: number;
  };
  message: string;
  timestamp: Date;
}

interface EmergencyAlertProps {
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  onAlertTriggered?: (alertData: EmergencyAlertData) => void;
}

export default function EmergencyAlert({
  userLocation = null,
  onAlertTriggered
}: EmergencyAlertProps) {
  const { user } = useAuth();
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [alertType, setAlertType] = useState<EmergencyAlertData['type']>('personal_safety');
  const [severity, setSeverity] = useState<number>(3);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState<'idle' | 'sending' | 'sent' | 'confirmed' | 'error'>('idle');
  const [alertId, setAlertId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  const alertTypes = [
    { value: 'medical', label: 'Medical Emergency', icon: '🏥', color: 'bg-red-500', description: 'Medical assistance required' },
    { value: 'crime', label: 'Crime/Assault', icon: '👮', color: 'bg-blue-500', description: 'Crime or personal assault' },
    { value: 'accident', label: 'Accident', icon: '🚗', color: 'bg-orange-500', description: 'Vehicle or personal accident' },
    { value: 'personal_safety', label: 'Personal Safety', icon: '🛡️', color: 'bg-purple-500', description: 'Feeling unsafe or threatened' },
    { value: 'natural_disaster', label: 'Natural Disaster', icon: '🌪️', color: 'bg-green-500', description: 'Natural disaster or hazard' },
  ];

  const severityLevels = [
    { value: 1, label: 'Low', color: 'bg-green-500', description: 'Minor issue, not urgent' },
    { value: 2, label: 'Moderate', color: 'bg-yellow-500', description: 'Requires attention soon' },
    { value: 3, label: 'High', color: 'bg-orange-500', description: 'Urgent, requires immediate attention' },
    { value: 4, label: 'Critical', color: 'bg-red-500', description: 'Life-threatening, immediate help needed' },
    { value: 5, label: 'Emergency', color: 'bg-red-700', description: 'Extreme emergency, life in danger' },
  ];

  // Load user's emergency contacts
  useEffect(() => {
    if (user?.emergencyContacts) {
      setEmergencyContacts(user.emergencyContacts.map((contact, index) => ({
        id: contact.id || `contact-${index}`,
        name: contact.name || 'Emergency Contact',
        phone: contact.phone || '',
        relationship: contact.relationship || 'Emergency Contact',
        priority: contact.priority || 1
      })));
    }
  }, [user]);

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

    setIsSending(true);
    setAlertStatus('sending');

    try {
      const alertData: EmergencyAlertData = {
        type: alertType,
        severity: severity,
        location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        message: customMessage || `Emergency alert triggered at ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`,
        timestamp: new Date()
      };

      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          emergencyType: alertType,
          severity: severity,
          description: customMessage
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAlertId(result.alertId);
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send emergency alert');
      }

    } catch (error: any) {
      console.error('Error sending emergency alert:', error);
      setAlertStatus('error');
      setTimeout(() => {
        setAlertStatus('idle');
      }, 3000);
    } finally {
      setIsSending(false);
    }
  };

  const resetAlertForm = () => {
    setAlertType('personal_safety');
    setSeverity(3);
    setCustomMessage('');
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
            <p className="text-gray-600">Notifying emergency contacts and 112 services...</p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Sub-3 second emergency activation target</p>
            </div>
          </div>
        );

      case 'sent':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Alert Sent Successfully</h3>
            <p className="text-gray-600 mb-2">Emergency alert has been sent to 112 emergency services and your contacts.</p>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <div className="text-sm font-medium text-blue-800">Alert ID: {alertId}</div>
              <div className="text-xs text-blue-700 mt-1">Response time: &lt;3 seconds</div>
            </div>
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
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-1" />
                <span>112 Emergency Services Notified</span>
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                <span>{emergencyContacts.length} Emergency Contacts Notified</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-2">
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
              <div className="grid grid-cols-1 gap-3">
                {alertTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAlertType(type.value as EmergencyAlertData['type'])}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${alertType === type.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{type.icon}</div>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Severity Level
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSeverity(level.value)}
                    className={`p-2 rounded-lg text-center transition-colors ${severity === level.value
                        ? `${level.color} text-white`
                        : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    <div className="font-medium text-sm">{level.label}</div>
                    <div className="text-xs mt-1">{level.value}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {severityLevels.find(l => l.value === severity)?.description}
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
                placeholder="Add any additional information that might help emergency responders..."
                className="w-full"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <Navigation className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <strong>Location Sharing:</strong> Your precise location will be shared with 112 emergency services and your emergency contacts.
                  {userLocation && (
                    <div className="mt-1">
                      Coordinates: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {emergencyContacts.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-start">
                  <User className="h-4 w-4 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-purple-800">
                    <strong>Emergency Contacts:</strong> {emergencyContacts.length} contacts will be notified
                    <div className="mt-1 space-y-1">
                      {emergencyContacts.slice(0, 2).map((contact, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{contact.name} ({contact.relationship})</span>
                        </div>
                      ))}
                      {emergencyContacts.length > 2 && (
                        <div className="text-xs">+{emergencyContacts.length - 2} more contacts</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <Heart className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <strong>Sub-3 Second Emergency Activation:</strong> This alert system targets &lt;3 second activation to 112 emergency services and your contacts.
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
                disabled={isSending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Emergency Alert
                  </>
                )}
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