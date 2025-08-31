"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, MapPin, Navigation } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MapPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">{t('common.appName')}</span>
                </div>
                <div className="hidden md:block ml-10">
                  <div className="flex items-baseline space-x-4">
                    <a href={`/${locale}`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.home')}</a>
                    <a href={`/${locale}/about`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.about')}</a>
                    <a href={`/${locale}/map`} className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.map')}</a>
                    <a href={`/${locale}/dashboard`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.dashboard')}</a>
                    <a href={`/${locale}/analytics`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.analytics')}</a>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <div className="flex space-x-2">
                  <Button 
                    variant={locale === 'en' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => window.location.href = '/en/map'}
                  >
                    EN
                  </Button>
                  <Button 
                    variant={locale === 'ta' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => window.location.href = '/ta/map'}
                  >
                    தமிழ்
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Map Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('map.title')}</h1>
            <p className="text-gray-600">{t('map.description')}</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>{t('map.interactiveMap')}</CardTitle>
                  <CardDescription>{t('map.mapDescription')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">{t('map.loadingMap')}</p>
                  <p className="text-gray-500 text-sm mt-2">{t('map.mapImplementation')}</p>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('map.features.realTimeSafety')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600">{t('map.features.realTimeSafetyDesc')}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('map.features.routePlanning')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600">{t('map.features.routePlanningDesc')}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{t('map.features.emergencyAlerts')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600">{t('map.features.emergencyAlertsDesc')}</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}