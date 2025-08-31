"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AnalyticsPage() {
  const t = useTranslations();
  const locale = useLocale();

  const analyticsData = [
    {
      title: t('analytics.citywideSafety'),
      value: "7.8/10",
      change: "+0.3",
      trend: "up",
      description: t('analytics.citywideSafetyDesc')
    },
    {
      title: t('analytics.incidentReports'),
      value: "142",
      change: "-12%",
      trend: "down",
      description: t('analytics.incidentReportsDesc')
    },
    {
      title: t('analytics.activeUsers'),
      value: "12.5K",
      change: "+8%",
      trend: "up",
      description: t('analytics.activeUsersDesc')
    },
    {
      title: t('analytics.responseTime'),
      value: "4.2min",
      change: "-0.8min",
      trend: "down",
      description: t('analytics.responseTimeDesc')
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
                    <a href={`/${locale}/dashboard`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.dashboard')}</a>
                    <a href={`/${locale}/analytics`} className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.analytics')}</a>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <div className="flex space-x-2">
                  <Button 
                    variant={locale === 'en' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => window.location.href = '/en/analytics'}
                  >
                    EN
                  </Button>
                  <Button 
                    variant={locale === 'ta' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => window.location.href = '/ta/analytics'}
                  >
                    தமிழ்
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Analytics Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('analytics.title')}</h1>
            <p className="text-gray-600">{t('analytics.description')}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {analyticsData.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </CardTitle>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{metric.value}</div>
                  <div className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change} {t('analytics.fromLastMonth')}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Safety Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  {t('analytics.safetyTrends')}
                </CardTitle>
                <CardDescription>{t('analytics.safetyTrendsDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('analytics.chartPlaceholder')}</p>
                    <p className="text-gray-500 text-sm mt-2">{t('analytics.chartImplementation')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  {t('analytics.activityHeatmap')}
                </CardTitle>
                <CardDescription>{t('analytics.activityHeatmapDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">{t('analytics.heatmapPlaceholder')}</p>
                    <p className="text-gray-500 text-sm mt-2">{t('analytics.heatmapImplementation')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('analytics.keyInsights')}</CardTitle>
              <CardDescription>{t('analytics.keyInsightsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-900">{t('analytics.insights.safetyImprovement')}</p>
                    <p className="text-sm text-blue-700">{t('analytics.insights.safetyImprovementDesc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-green-900">{t('analytics.insights.userEngagement')}</p>
                    <p className="text-sm text-green-700">{t('analytics.insights.userEngagementDesc')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-yellow-900">{t('analytics.insights.emergencyResponse')}</p>
                    <p className="text-sm text-yellow-700">{t('analytics.insights.emergencyResponseDesc')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}