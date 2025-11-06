import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import TruckLogo from '../common/TruckLogo';
import LanguageSwitcher from '../common/LanguageSwitcher';
import {
  Truck,
  Package,
  Users,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Award,
  Zap,
  FileText,
  Building2,
  Headphones
} from 'lucide-react';

const LandingPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('transport');

  const tabs = [
    { id: 'transport', label: t('services.tabs.transport'), icon: Truck },
    { id: 'fleet', label: t('services.tabs.fleet'), icon: Users },
    { id: 'analytics', label: t('services.tabs.analytics'), icon: BarChart3 }
  ];

  const features = {
    transport: [
      {
        icon: Clock,
        title: t('services.transport.quick.title'),
        description: t('services.transport.quick.description')
      },
      {
        icon: Shield,
        title: t('services.transport.secure.title'),
        description: t('services.transport.secure.description')
      },
      {
        icon: CheckCircle,
        title: t('services.transport.price.title'),
        description: t('services.transport.price.description')
      }
    ],
    fleet: [
      {
        icon: Users,
        title: t('services.fleet.boss.title'),
        description: t('services.fleet.boss.description')
      },
      {
        icon: TrendingUp,
        title: t('services.fleet.grow.title'),
        description: t('services.fleet.grow.description')
      },
      {
        icon: Zap,
        title: t('services.fleet.easy.title'),
        description: t('services.fleet.easy.description')
      }
    ],
    analytics: [
      {
        icon: BarChart3,
        title: t('services.analytics.insights.title'),
        description: t('services.analytics.insights.description')
      },
      {
        icon: Award,
        title: t('services.analytics.tracking.title'),
        description: t('services.analytics.tracking.description')
      },
      {
        icon: CheckCircle,
        title: t('services.analytics.decisions.title'),
        description: t('services.analytics.decisions.description')
      }
    ]
  };

  const values = [
    {
      title: t('values.ambition.title'),
      description: t('values.ambition.description')
    },
    {
      title: t('values.transparency.title'),
      description: t('values.transparency.description')
    },
    {
      title: t('values.quality.title'),
      description: t('values.quality.description')
    },
    {
      title: t('values.performance.title'),
      description: t('values.performance.description')
    }
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <TruckLogo showFull={true} />
            </div>
            
            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              <button 
                onClick={() => scrollToSection('services')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                {t('nav.services')}
              </button>
              <button 
                onClick={() => scrollToSection('values')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                {t('nav.values')}
              </button>
              <button 
                onClick={() => scrollToSection('partners')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                {t('nav.partners')}
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                {t('nav.contact')}
              </button>
              <Link
                to="/about"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
              >
                {t('nav.about')}
              </Link>
            </div>

            {/* CTA Buttons & Language Switcher */}
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition"
                  >
                    {t('nav.signin')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition"
                  >
                    {t('nav.getStarted')}
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg transition"
                >
                  {t('nav.dashboard')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 dark:bg-orange-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-300 dark:bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-orange-200 dark:bg-orange-400 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-semibold mb-6 shadow-sm">
                <Shield className="h-4 w-4 mr-2" />
                {t('hero.badge')}
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                {t('hero.headline1')}<br />
                {t('hero.headline2')}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300">
                  {t('hero.headline3')}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                {t('hero.subheadline')}
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link
                  to={user ? "/dashboard" : "/register"}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                >
                  {user ? t('hero.ctaDashboard') : t('hero.ctaGetStarted')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-600 dark:hover:border-orange-500 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                  >
                    {t('hero.ctaSignIn')}
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap lg:justify-start justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                  {t('hero.trustVerified')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                  {t('hero.trustTracking')}
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-2" />
                  {t('hero.trustPricing')}
                </div>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div className="relative lg:block hidden">
              {/* Main Image Container */}
              <div className="relative">
                {/* Background Glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-orange-400 to-blue-500 rounded-3xl blur-3xl opacity-20"></div>
                
                {/* Hero Image - Oil Truck */}
                <div className="relative rounded-3xl shadow-2xl overflow-hidden group">
                  {/* Gradient Overlay for Brand Integration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/20 z-10 group-hover:opacity-75 transition-opacity duration-300"></div>
                  
                  {/* Main Hero Image */}
                  <img 
                    src="/hero-oil-truck.jpg" 
                    alt={t('hero.heroAlt')}
                    className="w-full h-auto object-cover rounded-3xl transform group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Your Needs Section with Tabs */}
      <section id="services" className="py-20 bg-white dark:bg-gray-900 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('services.title')}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-5 py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content with Image Mockup */}
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Features List */}
            <div className="space-y-8 order-2 lg:order-1">
              {features[activeTab].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* App Screenshot/Mockup */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Phone Frame */}
                <div className="relative">
                  {/* Phone border/frame */}
                  <div className="bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                    {/* Screen */}
                    <div className="bg-white dark:bg-gray-100 rounded-[2.5rem] overflow-hidden">
                      {/* Status Bar */}
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-white text-xs font-medium">9:41</span>
                        <div className="flex items-center space-x-1">
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                          <div className="h-2 w-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* App Content */}
                      <div className="p-6 space-y-6 bg-gray-50">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                              <Truck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="h-3 bg-gray-300 rounded w-20 mb-1"></div>
                              <div className="h-2 bg-gray-200 rounded w-16"></div>
                            </div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-blue-100"></div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <Package className="h-6 w-6 text-blue-600 mb-2" />
                            <div className="h-4 bg-gray-300 rounded w-12 mb-1"></div>
                            <div className="h-2 bg-gray-200 rounded w-16"></div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <Truck className="h-6 w-6 text-orange-600 mb-2" />
                            <div className="h-4 bg-gray-300 rounded w-12 mb-1"></div>
                            <div className="h-2 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500"></div>
                            <div className="flex-1">
                              <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                              <div className="h-2 bg-gray-200 rounded w-32"></div>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500"></div>
                            <div className="flex-1">
                              <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
                              <div className="h-2 bg-gray-200 rounded w-32"></div>
                            </div>
                            <Clock className="h-5 w-5 text-orange-500" />
                          </div>
                        </div>

                        {/* Bottom Navigation */}
                        <div className="flex items-center justify-around pt-4">
                          <div className="flex flex-col items-center">
                            <div className="h-6 w-6 rounded-lg bg-orange-600"></div>
                            <div className="h-1 bg-orange-600 rounded-full w-8 mt-1"></div>
                          </div>
                          <div className="h-6 w-6 rounded-lg bg-gray-300"></div>
                          <div className="h-6 w-6 rounded-lg bg-gray-300"></div>
                          <div className="h-6 w-6 rounded-lg bg-gray-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glow Effects */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-500 rounded-full opacity-20 blur-3xl"></div>
                  <div className="absolute -top-6 -left-6 w-40 h-40 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section id="values" className="py-20 bg-gray-50 dark:bg-gray-800/50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('values.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  index === 0 ? 'from-blue-500/10 to-indigo-500/10' :
                  index === 1 ? 'from-orange-500/10 to-red-500/10' :
                  index === 2 ? 'from-blue-600/10 to-cyan-500/10' :
                  'from-orange-600/10 to-amber-500/10'
                } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500 to-indigo-600' :
                    index === 1 ? 'from-orange-500 to-red-600' :
                    index === 2 ? 'from-blue-600 to-cyan-600' :
                    'from-orange-600 to-amber-600'
                  } shadow-lg`}>
                    {index === 0 && <TrendingUp className="h-7 w-7 text-white" />}
                    {index === 1 && <Shield className="h-7 w-7 text-white" />}
                    {index === 2 && <Award className="h-7 w-7 text-white" />}
                    {index === 3 && <Zap className="h-7 w-7 text-white" />}
                  </div>
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-orange-500 transition-all">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {value.description}
                  </p>
                </div>

                {/* Bottom Accent Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${
                  index === 0 ? 'from-blue-500 to-indigo-600' :
                  index === 1 ? 'from-orange-500 to-red-600' :
                  index === 2 ? 'from-blue-600 to-cyan-600' :
                  'from-orange-600 to-amber-600'
                } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section id="partners" className="py-20 bg-white dark:bg-gray-900 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('partners.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('partners.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Customers */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="mb-6">
                <Package className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('partners.customer.title')}
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">{t('partners.customer.benefit1')}</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">{t('partners.customer.benefit2')}</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">{t('partners.customer.benefit3')}</p>
                </div>
              </div>
              <Link
                to="/register"
                className="block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {t('partners.customer.cta')}
              </Link>
            </div>

            {/* For Providers */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="mb-6">
                <Truck className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('partners.provider.title')}
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">{t('partners.provider.benefit1')}</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">{t('partners.provider.benefit2')}</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-600 dark:text-gray-300">{t('partners.provider.benefit3')}</p>
                </div>
              </div>
              <Link
                to="/register?role=provider"
                className="block text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {t('partners.provider.cta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 dark:bg-black text-white py-16 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Column */}
            <div>
              <div className="mb-4">
                <TruckLogo className="h-12 w-12" showFull={true} variant="footer" />
              </div>
              <p className="text-gray-400 text-sm mb-6">
                {t('footer.tagline')}
              </p>
            </div>

            {/* Services Column */}
            <div>
              <h4 className="font-bold mb-4">{t('footer.services.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/trucks" className="text-gray-400 hover:text-white transition">{t('footer.services.transport')}</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition">{t('footer.services.fleet')}</Link></li>
                <li><Link to="/register" className="text-gray-400 hover:text-white transition">{t('footer.services.analytics')}</Link></li>
                <li><Link to="/register?role=provider" className="text-gray-400 hover:text-white transition">{t('footer.services.provider')}</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-bold mb-4">{t('footer.company.title')}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition">
                    {t('footer.company.about')}
                  </Link>
                </li>
                <li>
                  <button onClick={() => scrollToSection('values')} className="text-gray-400 hover:text-white transition text-left">
                    {t('footer.company.values')}
                  </button>
                </li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition">{t('footer.company.privacy')}</Link></li>
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition">{t('footer.company.terms')}</Link></li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h4 className="font-bold mb-4">{t('footer.contact.title')}</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <Mail className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${t('footer.contact.email')}`} className="text-gray-400 hover:text-white transition break-all">
                    {t('footer.contact.email')}
                  </a>
                </li>
                <li className="flex items-start">
                  <Phone className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <a href={`tel:${t('footer.contact.phone').replace(/\s/g, '')}`} className="text-gray-400 hover:text-white transition">
                    {t('footer.contact.phone')}
                  </a>
                </li>
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-400">
                    {t('footer.contact.location')}
                  </span>
                </li>
                <li className="flex items-start">
                  <Headphones className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <a href={`mailto:${t('footer.contact.email')}`} className="text-gray-400 hover:text-white transition">
                    {t('footer.contact.help')}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                {t('footer.copyright')}
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition">{t('footer.company.privacy')}</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition">{t('footer.company.terms')}</Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition">{t('footer.cookiePolicy')}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
