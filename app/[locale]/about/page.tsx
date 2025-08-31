"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, MapPin, Zap, Target, Award, Building, TrendingUp } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale();

  const impact = [
    {
      metric: "100K+",
      label: t('stats.activeUsers.label'),
      description: t('stats.activeUsers.detail')
    },
    {
      metric: "1M+", 
      label: t('stats.routesPlanned.label'),
      description: t('stats.routesPlanned.detail')
    },
    {
      metric: "40%",
      label: t('about.impact.incidentReduction'),
      description: t('about.impact.incidentReductionDesc')
    },
    {
      metric: "60%",
      label: t('about.impact.fasterResponse'),
      description: t('about.impact.fasterResponseDesc')
    }
  ];

  const teamMembers = [
    {
      name: t('about.team.founder.name'),
      role: t('about.team.founder.role'),
      bio: t('about.team.founder.bio'),
      expertise: ["Urban Planning", "Safety Systems", "AI/ML", "Smart Cities"]
    },
    {
      name: t('about.team.cto.name'),
      role: t('about.team.cto.role'),
      bio: t('about.team.cto.bio'),
      expertise: ["Geospatial Tech", "Real-time Systems", "Data Engineering", "Scalability"]
    },
    {
      name: t('about.team.safetyHead.name'),
      role: t('about.team.safetyHead.role'),
      bio: t('about.team.safetyHead.bio'),
      expertise: ["Criminology", "Data Science", "Research", "Statistics"]
    },
    {
      name: t('about.team.productLead.name'),
      role: t('about.team.productLead.role'),
      bio: t('about.team.productLead.bio'),
      expertise: ["UX Design", "Safety Systems", "User Research", "Product Strategy"]
    }
  ];

  const milestones = [
    {
      year: "2022",
      title: t('about.milestones.founded.title'),
      description: t('about.milestones.founded.description'),
      icon: Building
    },
    {
      year: "2023",
      title: t('about.milestones.seedFunding.title'),
      description: t('about.milestones.seedFunding.description'),
      icon: TrendingUp
    },
    {
      year: "2023",
      title: t('about.milestones.betaLaunch.title'),
      description: t('about.milestones.betaLaunch.description'),
      icon: MapPin
    },
    {
      year: "2024",
      title: t('about.milestones.globalLaunch.title'),
      description: t('about.milestones.globalLaunch.description'),
      icon: Target
    }
  ];

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
                  <a href={`/${locale}`} className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.home')}</a>
                  <a href={`/${locale}/about`} className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">{t('navigation.about')}</a>
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
                  onClick={() => window.location.href = '/en/about'}
                >
                  EN
                </Button>
                <Button 
                  variant={locale === 'ta' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => window.location.href = '/ta/about'}
                >
                  தமிழ்
                </Button>
              </div>
              <Button variant="outline" onClick={() => window.location.href = `/${locale}/dashboard`}>{t('auth.signIn')}</Button>
              <Button onClick={() => window.location.href = `/${locale}/dashboard`}>{t('auth.getStarted')}</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('about.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = `/${locale}/map`}>
                {t('about.explorePlatform')}
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => {
                document.getElementById('team-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {t('about.meetTeam')}
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.mission.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('about.mission.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
                <CardTitle>{t('about.values.safetyFirst.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('about.values.safetyFirst.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle>{t('about.values.communityDriven.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('about.values.communityDriven.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Zap className="h-12 w-12 text-purple-600" />
                </div>
                <CardTitle>{t('about.values.innovation.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('about.values.innovation.description')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.ourImpact')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.impactDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impact.map((item, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-blue-600">{item.metric}</CardTitle>
                  <CardDescription className="text-lg font-semibold">{item.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.teamTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.teamDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {member.expertise.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('about.ourJourney')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('about.journeyDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <milestone.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-blue-600 mb-2">{milestone.year}</Badge>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{milestone.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t('about.cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => window.location.href = `/${locale}/dashboard`}>
              {t('auth.getStarted')}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" onClick={() => window.location.href = `/${locale}/map`}>
              {t('about.learnMore')}
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
    </div>
  );
}