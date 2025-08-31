"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users, MapPin, AlertTriangle, BarChart3, Settings } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { user } = useAuth();

  const dashboardStats = [
    {
      title: t('dashboard.stats.routesTaken'),
      value: "47",
      icon: MapPin,
      color: "text-blue-600"
    },
    {
      title: t('dashboard.stats.safetyScore'),
      value: "8.4/10",
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: t('dashboard.stats.emergencyContacts'),
      value: "3",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: t('dashboard.stats.reportsSubmitted'),
      value: "12",
      icon: AlertTriangle,
      color: "text-orange-600"
    }
  ];

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
                    <a href={`/${locale}/map`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.map')}</a>
                    <a href={`/${locale}/dashboard`} className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.dashboard')}</a>
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
                    onClick={() => window.location.href = '/en/dashboard'}
                  >
                    EN
                  </Button>
                  <Button 
                    variant={locale === 'ta' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => window.location.href = '/ta/dashboard'}
                  >
                    தமிழ்
                  </Button>
                </div>
                
                {user && (
                  <span className="text-sm text-gray-600">
                    {t('auth.welcome')}, {user.firstName || user.email}!
                  </span>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
            <p className="text-gray-600">{t('dashboard.subtitle')}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardStats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recentActivity')}</CardTitle>
                <CardDescription>{t('dashboard.recentActivityDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{t('dashboard.activities.routePlanned')}</p>
                      <p className="text-xs text-gray-600">{t('dashboard.activities.routePlannedTime')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{t('dashboard.activities.safetyUpdate')}</p>
                      <p className="text-xs text-gray-600">{t('dashboard.activities.safetyUpdateTime')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">{t('dashboard.activities.reportSubmitted')}</p>
                      <p className="text-xs text-gray-600">{t('dashboard.activities.reportSubmittedTime')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.quickActions')}</CardTitle>
                <CardDescription>{t('dashboard.quickActionsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-20 flex-col space-y-2"
                    onClick={() => window.location.href = `/${locale}/map`}
                  >
                    <MapPin className="h-6 w-6" />
                    <span className="text-sm">{t('dashboard.actions.planRoute')}</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                  >
                    <AlertTriangle className="h-6 w-6" />
                    <span className="text-sm">{t('dashboard.actions.reportIncident')}</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    onClick={() => window.location.href = `/${locale}/analytics`}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">{t('dashboard.actions.viewAnalytics')}</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                  >
                    <Settings className="h-6 w-6" />
                    <span className="text-sm">{t('dashboard.actions.settings')}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Safety Score Overview */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t('dashboard.safetyOverview')}</CardTitle>
              <CardDescription>{t('dashboard.safetyOverviewDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div>
                  <div className="text-3xl font-bold text-green-600">8.4/10</div>
                  <p className="text-sm text-gray-600">{t('dashboard.yourSafetyScore')}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium text-gray-900">{t('dashboard.safetyStatus.excellent')}</p>
                  <p className="text-sm text-gray-600">{t('dashboard.safetyTip')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}