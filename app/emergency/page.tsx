/**
 * Emergency Hub Page
 * Central hub for all emergency-related features
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Send,
  User,
  MapPin,
  Clock,
  Bell,
  Building
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function EmergencyHubPage() {
  const router = useRouter();
  const [activeAlerts, setActiveAlerts] = useState<number>(0);

  // Check for active alerts on page load
  useEffect(() => {
    fetchActiveAlerts();
  }, []);

  // Fetch active alerts count
  const fetchActiveAlerts = async () => {
    try {
      const response = await fetch('/api/emergency');
      if (!response.ok) throw new Error('Failed to fetch alerts');

      const data = await response.json();
      const activeCount = data.alerts?.filter((alert: any) => alert.status === 'active').length || 0;
      setActiveAlerts(activeCount);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Emergency Hub</h1>
        <p className="text-muted-foreground">
          Access emergency services, manage your emergency contacts, and send alerts in case of emergency.
        </p>
      </div>

      <div className="bg-destructive/10 border border-destructive rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <div>
            <h2 className="text-xl font-semibold mb-1">
              Emergency Helpline: <strong>112</strong>
            </h2>
            <p className="text-muted-foreground">
              In case of immediate danger or emergency, call the national emergency number.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-6">
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
      </div>

      {activeAlerts > 0 && (
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Emergency Alerts</AlertTitle>
          <AlertDescription>
            You have {activeAlerts} active emergency alert{activeAlerts !== 1 ? 's' : ''}.
            <Button
              variant="link"
              className="ml-2 p-0 h-auto"
              onClick={() => router.push('/emergency/alerts')}
            >
              View Alerts
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Emergency Alert Card */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Send className="h-6 w-6 text-destructive" />
              <h3 className="text-lg font-semibold">Emergency Alert</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-3">
              Send emergency alerts to your emergency contacts and nearby emergency services.
            </p>

            <p className="text-muted-foreground text-sm">
              Your alert will include your current location and optional message.
            </p>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => router.push('/emergency/alert/form')}
            >
              Send Alert
            </Button>
          </CardFooter>
        </Card>

        {/* Emergency Contacts Card */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Emergency Contacts</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-3">
              Manage your emergency contacts who will be notified in case of emergency.
            </p>

            <p className="text-muted-foreground text-sm">
              Add, edit, or remove contacts and verify their contact information.
            </p>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/emergency/contacts')}
            >
              Manage Contacts
            </Button>
          </CardFooter>
        </Card>

        {/* Emergency Services Card */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Emergency Services</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-3">
              Find emergency services near you, including hospitals, police stations, and fire stations.
            </p>

            <p className="text-muted-foreground text-sm">
              Get directions, contact information, and save your favorite services.
            </p>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/emergency/services')}
            >
              Find Services
            </Button>
          </CardFooter>
        </Card>

        {/* Alert History Card */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Alert History</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-3">
              View your active and past emergency alerts.
            </p>

            <p className="text-muted-foreground text-sm">
              Resolve active alerts and review past emergency situations.
            </p>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/emergency/alerts')}
            >
              View Alerts
            </Button>
          </CardFooter>
        </Card>

        {/* Safety Tips Card */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Safety Tips</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-3">
              Learn how to stay safe in various emergency situations.
            </p>

            <p className="text-muted-foreground text-sm">
              Access safety guidelines and emergency preparedness information.
            </p>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/safety/tips')}
            >
              View Tips
            </Button>
          </CardFooter>
        </Card>

        {/* Emergency Map Card */}
        <Card className="flex flex-col">
          <CardContent className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Emergency Map</h3>
            </div>

            <p className="text-muted-foreground text-sm mb-3">
              View emergency services and active alerts on an interactive map.
            </p>

            <p className="text-muted-foreground text-sm">
              Get directions to the nearest emergency services based on your location.
            </p>
          </CardContent>

          <CardFooter className="p-6 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/map?emergency=true')}
            >
              Open Map
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 pt-6 border-t">
        <p className="text-center text-sm text-muted-foreground">
          The emergency features are designed to assist in emergency situations, but should not replace calling emergency services directly in case of immediate danger.
        </p>
      </div>
    </div>
  );
}