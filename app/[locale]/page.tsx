"use client";

import { useState } from "react";
import { useTranslations, useLocale } from 'next-intl';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, MapPin, Route, AlertTriangle, Users, BarChart3 } from "lucide-react";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignUpModal";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const t = useTranslations();
  const locale = useLocale();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const features = [
    {
      id: "map",
      title: t('features.interactiveMap.title'),
      description: t('features.interactiveMap.description'),
      icon: MapPin,
      color: "bg-blue-500"
    },
    {
      id: "scoring",
      title: t('features.safetyScoring.title'),
      description: t('features.safetyScoring.description'),
      icon: Shield,
      color: "bg-green-500"
    },
    {
      id: "routing",
      title: t('features.routePlanning.title'),
      description: t('features.routePlanning.description'),
      icon: Route,
      color: "bg-purple-500"
    },
    {
      id: "emergency",
      title: t('features.emergencyAlerts.title'),
      description: t('features.emergencyAlerts.description'),
      icon: AlertTriangle,
      color: "bg-red-500"
    },
    {
      id: "dashboard",
      title: t('features.userDashboard.title'),
      description: t('features.userDashboard.description'),
      icon: Users,
      color: "bg-orange-500"
    },
    {
      id: "analytics",
      title: t('features.safetyAnalytics.title'),
      description: t('features.safetyAnalytics.description'),
      icon: BarChart3,
      color: "bg-indigo-500"
    }
  ];

  const handleStartFreeTrial = () => {
    if (isAuthenticated) {
      window.location.href = `/${locale}/dashboard`;
    } else {
      setShowSignupModal(true);
    }
  };

  const handleSignIn = () => {
    setShowLoginModal(true);
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      window.location.href = `/${locale}/dashboard`;
    } else {
      setShowSignupModal(true);
    }
  };

  return (
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
                  <a href={`/${locale}`} className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.home')}</a>
                  <a href={`/${locale}/about`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.about')}</a>
                  <a href={`/${locale}/map`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.map')}</a>
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
                  onClick={() => window.location.href = '/en'}
                >
                  EN
                </Button>
                <Button 
                  variant={locale === 'ta' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => window.location.href = '/ta'}
                >
                  தமிழ்
                </Button>
              </div>
              
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    {t('auth.welcome')}, {user?.name}!
                  </span>
                  <Button variant="outline" onClick={logout}>
                    {t('auth.signOut')}
                  </Button>
                  <Button onClick={() => window.location.href = `/${locale}/dashboard`}>
                    {t('navigation.dashboard')}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleSignIn}>{t('auth.signIn')}</Button>
                  <Button onClick={handleGetStarted}>{t('auth.getStarted')}</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('hero.title')}
              <span className="block text-blue-200">{t('hero.subtitle')}</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <a href={`/${locale}/map`}>{t('hero.exploreMaps')}</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                {t('hero.viewSafetyData')}
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('sections.comprehensiveFeatures.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('sections.comprehensiveFeatures.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={feature.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                  onClick={() => {
                    switch(feature.id) {
                      case 'map':
                        window.location.href = `/${locale}/map`;
                        break;
                      case 'dashboard':
                        if (isAuthenticated) {
                          window.location.href = `/${locale}/dashboard`;
                        } else {
                          setShowLoginModal(true);
                        }
                        break;
                      case 'analytics':
                        window.location.href = `/${locale}/analytics`;
                        break;
                      default:
                        if (!isAuthenticated) {
                          setShowLoginModal(true);
                        }
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${feature.color}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <Badge variant="secondary">{t('common.status.active')}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100K+</div>
              <div className="text-gray-600">{t('stats.activeUsers.label')}</div>
              <div className="text-sm text-gray-500 mt-1">{t('stats.activeUsers.detail')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-gray-600">{t('stats.routesPlanned.label')}</div>
              <div className="text-sm text-gray-500 mt-1">{t('stats.routesPlanned.detail')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">{t('stats.safetyReports.label')}</div>
              <div className="text-sm text-gray-500 mt-1">{t('stats.safetyReports.detail')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">99.9%</div>
              <div className="text-gray-600">{t('stats.uptime.label')}</div>
              <div className="text-sm text-gray-500 mt-1">{t('stats.uptime.detail')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('cta.title')}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={handleStartFreeTrial}>
              {t('cta.startFreeTrial')}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => {
              window.location.href = `/${locale}/map`;
            }}>
              {t('cta.viewDemo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">{t('common.appName')}</span>
              </div>
              <p className="text-gray-400">
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.product.title')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('footer.product.features')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.product.pricing')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.company.title')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href={`/${locale}/about`} className="hover:text-white">{t('footer.company.about')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.company.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.support.title')}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t('footer.support.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-white">{t('footer.support.community')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {t('common.appName')}. {t('footer.copyright')}</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <SignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
}