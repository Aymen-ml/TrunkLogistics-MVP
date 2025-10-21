import React from 'react';
import { Shield, Award, Clock, TrendingUp, Users, CheckCircle } from 'lucide-react';

/**
 * Trust Badge Component
 * Displays professional indicators for B2B platform
 */
export const TrustBadges = () => {
  const badges = [
    {
      icon: Shield,
      label: 'Secure Platform',
      description: 'End-to-end encryption',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50'
    },
    {
      icon: Award,
      label: 'Verified Providers',
      description: 'Background checked',
      color: 'text-accent-600',
      bgColor: 'bg-accent-50'
    },
    {
      icon: Clock,
      label: '24/7 Support',
      description: 'Always available',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'Real-time Tracking',
      description: 'Live updates',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div 
            key={index}
            className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className={`${badge.bgColor} dark:bg-gray-700 p-3 rounded-full mb-2`}>
              <Icon className={`h-6 w-6 ${badge.color} dark:text-gray-300`} />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-center">
              {badge.label}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
              {badge.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Stats Badge Component
 * Shows key metrics for business impact
 */
export const StatsBadges = ({ stats }) => {
  const defaultStats = [
    {
      label: 'Active Providers',
      value: stats?.providers || '150+',
      icon: Users,
      change: '+12%',
      positive: true
    },
    {
      label: 'Completed Deliveries',
      value: stats?.deliveries || '2,500+',
      icon: CheckCircle,
      change: '+23%',
      positive: true
    },
    {
      label: 'Avg Response Time',
      value: stats?.responseTime || '< 2 hrs',
      icon: Clock,
      change: '-15%',
      positive: true
    },
    {
      label: 'Customer Satisfaction',
      value: stats?.satisfaction || '98%',
      icon: TrendingUp,
      change: '+5%',
      positive: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {defaultStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              {stat.change && (
                <span className={`text-xs font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Verification Badge Component
 * Shows verification status for providers
 */
export const VerificationBadge = ({ verified, type = 'provider' }) => {
  if (!verified) return null;

  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
      <CheckCircle className="h-3 w-3 mr-1" />
      Verified {type === 'provider' ? 'Provider' : 'Business'}
    </div>
  );
};
