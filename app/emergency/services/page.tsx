/**
 * Emergency Services Page
 * Displays emergency services information and contacts
 * Compliant with DPDP Act 2023
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import EmergencyServices from '@/components/EmergencyServices';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertTriangle,
  Phone
} from 'lucide-react';

export default function EmergencyServicesPage() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Get user's location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Handle emergency service selection
  const handleServiceSelect = (service: any) => {
    // Navigate to directions or show on map
    router.push(`/map?lat=${service.location.latitude}&lng=${service.location.longitude}&name=${encodeURIComponent(service.name)}`);
  };

  // Handle emergency trigger
  const handleEmergencyTrigger = (location: [number, number], contactIds?: string[]) => {
    // Navigate to emergency alert page
    router.push('/emergency/alert');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Emergency Services
        </h1>

        <p className="text-muted-foreground mb-4">
          Find and contact emergency services near you. You can also manage your emergency contacts and trigger emergency alerts.
        </p>

        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              <p className="font-medium">
                In case of emergency, call the national emergency number: <strong>112</strong>
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={() => window.location.href = 'tel:112'}
            >
              <Phone className="mr-2 h-4 w-4" />
              Call Now
            </Button>
          </div>
        </Card>
      </div>

      <EmergencyServices
        initialLocation={userLocation || undefined}
        onServiceSelect={handleServiceSelect}
        onEmergencyTrigger={handleEmergencyTrigger}
      />
    </div>
  );
}