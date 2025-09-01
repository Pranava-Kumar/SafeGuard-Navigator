/**
 * Emergency Alerts Page
 * Displays active and past emergency alerts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  X,
  Map,
  Phone,
  Loader2
} from 'lucide-react';
import { getRelativeTimeString } from '@/lib/utils';

interface EmergencyAlert {
  id: string;
  userId: string;
  userName?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  message?: string;
  status: 'active' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: string;
  resolvedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmergencyAlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState<boolean>(false);
  const [currentAlert, setCurrentAlert] = useState<EmergencyAlert | null>(null);
  const [resolveReason, setResolveReason] = useState<string>('');

  // Fetch emergency alerts on page load
  useEffect(() => {
    fetchEmergencyAlerts();

    // Set up polling for active alerts
    const interval = setInterval(() => {
      fetchEmergencyAlerts();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch emergency alerts from API
  const fetchEmergencyAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/emergency');
      if (!response.ok) throw new Error('Failed to fetch emergency alerts');

      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load emergency alerts');
    } finally {
      setLoading(false);
    }
  };

  // Handle resolve alert
  const handleResolveAlert = async () => {
    if (!currentAlert) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/emergency/alert/${currentAlert.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'resolved',
          resolvedReason: resolveReason.trim() || 'Alert resolved by user'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to resolve emergency alert');
      }

      // Refresh alerts list
      await fetchEmergencyAlerts();
      setResolveDialogOpen(false);
      setCurrentAlert(null);
      setResolveReason('');
    } catch (err: any) {
      console.error('Error resolving alert:', err);
      setError(err.message || 'Failed to resolve emergency alert');
    } finally {
      setLoading(false);
    }
  };

  // Open resolve dialog
  const openResolveDialog = (alert: EmergencyAlert) => {
    setCurrentAlert(alert);
    setResolveDialogOpen(true);
  };

  // View alert on map
  const viewAlertOnMap = (alert: EmergencyAlert) => {
    router.push(`/map?lat=${alert.location.latitude}&lng=${alert.location.longitude}&alert=${alert.id}`);
  };

  // Get alert status badge
  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Resolved
        </Badge>
      );
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emergency Alerts</h1>
        <p className="text-muted-foreground">
          View and manage emergency alerts. Active alerts require immediate attention.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Alerts Section */}
      <div className="bg-card border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>

        {loading && alerts.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : alerts.filter(alert => alert.status === 'active').length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active emergency alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts
              .filter(alert => alert.status === 'active')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((alert) => (
                <div
                  key={alert.id}
                  className="border border-destructive bg-destructive/10 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">Emergency Alert</h3>
                        {getStatusBadge(alert.status)}
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 opacity-70" />
                          <span>{getRelativeTimeString(new Date(alert.createdAt))}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 opacity-70" />
                          <span>{alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}</span>
                        </div>

                        {alert.message && (
                          <p className="font-bold mt-2">"{alert.message}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={() => viewAlertOnMap(alert)}
                      >
                        <Map className="h-4 w-4" />
                        View on Map
                      </Button>

                      <Button
                        size="sm"
                        variant="default"
                        className="flex items-center gap-2"
                        onClick={() => openResolveDialog(alert)}
                      >
                        Resolve
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                        asChild
                      >
                        <a href="tel:112">
                          <Phone className="h-4 w-4" />
                          Call Emergency
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Past Alerts Section */}
      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Past Alerts</h2>

        {loading && alerts.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : alerts.filter(alert => alert.status === 'resolved').length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No past emergency alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts
              .filter(alert => alert.status === 'resolved')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((alert) => (
                <div
                  key={alert.id}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">Emergency Alert</h3>
                        {getStatusBadge(alert.status)}
                      </div>

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 opacity-70" />
                          <span>{getRelativeTimeString(new Date(alert.createdAt))}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 opacity-70" />
                          <span>{alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}</span>
                        </div>

                        {alert.message && (
                          <p className="mt-2">"{alert.message}"</p>
                        )}

                        {alert.resolvedReason && (
                          <p className="mt-2 text-green-600">
                            <strong>Resolved:</strong> {alert.resolvedReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => viewAlertOnMap(alert)}
                      >
                        <Map className="h-4 w-4" />
                        View on Map
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Resolve Alert Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Resolve Emergency Alert</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setResolveDialogOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Confirm Resolution</AlertTitle>
              <AlertDescription>
                Are you sure you want to resolve this emergency alert? This action cannot be undone.
              </AlertDescription>
            </Alert>

            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Resolution Reason</label>
              <Input
                placeholder="Provide a reason for resolving this alert (optional)"
                value={resolveReason}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setResolveReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolveAlert}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Resolve Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}