import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import TruckLogo from '../common/TruckLogo';
import { 
  Truck, 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Home,
  Package,
  FileText,
  Users,
  BarChart3,
  Bell,
  ChevronDown 
} from 'lucide-react';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'provider': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'customer': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  if (!isAuthenticated) {
    return (
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <TruckLogo className="h-20 w-20" showFull={true} />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <TruckLogo className="h-20 w-20" showFull={true} />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user.role === 'admin' && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/providers"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Providers
                </Link>
                <Link
                  to="/admin/users"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Users
                </Link>
                <Link
                  to="/admin/documents"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Documents
                </Link>
                <Link
                  to="/admin/bookings"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Bookings
                </Link>
                <Link
                  to="/admin/trucks"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Trucks
                </Link>
              </>
            )}

            {user.role === 'customer' && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/bookings"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Bookings
                </Link>
                <Link
                  to="/find-trucks"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Find Trucks
                </Link>
              </>
            )}

            {user.role === 'provider' && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/trucks"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Trucks
                </Link>
                <Link
                  to="/bookings"
                  className="text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                >
                  Bookings
                </Link>
              </>
            )}

            {/* Notifications */}
            <NotificationBell />

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user?.role)}`}>
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </button>

              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 dark:ring-gray-600 z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button and notifications */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationBell />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500 p-2"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              {/* User info */}
              <div className="flex items-center px-3 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-2">
                <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Mobile navigation links - Improved touch targets */}
              <Link
                to="/dashboard"
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>

              {user.role === 'admin' && (
                <>
                  <Link
                    to="/admin/users"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Users
                  </Link>
                  <Link
                    to="/admin/providers"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Providers
                  </Link>
                  <Link
                    to="/admin/documents"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Documents
                  </Link>
                  <Link
                    to="/admin/bookings"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                  <Link
                    to="/admin/trucks"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Trucks
                  </Link>
                  <Link
                    to="/admin/analytics"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                </>
              )}

              {user.role === 'customer' && (
                <>
                  <Link
                    to="/bookings"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/find-trucks"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Find Trucks
                  </Link>
                </>
              )}

              {user.role === 'provider' && (
                <>
                  <Link
                    to="/trucks"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Trucks
                  </Link>
                  <Link
                    to="/bookings"
                    className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bookings
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>

              <Link
                to="/settings"
                className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-accent-500 transition-colors hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors rounded-lg mt-2 border-t border-gray-200 dark:border-gray-700 pt-3"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for profile dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
