import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CustomerDashboard from './CustomerDashboard';
import ProviderDashboard from './ProviderDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  switch (user.role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'provider':
      return <ProviderDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invalid Role</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">Your account role is not recognized.</p>
          </div>
        </div>
      );
  }
};

export default DashboardRouter;
