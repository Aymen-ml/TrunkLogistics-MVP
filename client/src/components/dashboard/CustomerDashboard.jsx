import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';
import EmailVerificationBanner from '../common/EmailVerificationBanner';
import { TrustBadges } from '../common/TrustBadges';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Search,
  TrendingUp,
  MapPin,
  User,
  Settings,
  DollarSign,
  Calendar,
  Bell,
  ArrowRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { formatCurrency } from '../../utils/currency';

const CustomerDashboard = () => {
  usePageTitle('Customer Dashboard');
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0,
    upcomingBookings: 0,
    transportBookings: 0,
    rentalBookings: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent bookings and all bookings for stats separately
      const [recentBookingsResponse, allBookingsResponse] = await Promise.all([
        apiClient.get('/bookings?limit=5'),
        apiClient.get('/bookings?limit=1000') // Get all bookings for accurate stats
      ]);

      const recentBookings = recentBookingsResponse.data.data.bookings || [];
      const allBookings = allBookingsResponse.data.data.bookings || [];
      
      setRecentBookings(recentBookings);

      // Calculate stats from all bookings
      const completedBookings = allBookings.filter(b => b.status === 'completed');
      const totalSpent = completedBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      const upcomingBookings = allBookings.filter(b => {
        const pickupDate = new Date(b.pickup_date || b.rental_start_datetime);
        const today = new Date();
        const threeDaysFromNow = new Date(today.getTime() + (3 * 24 * 60 * 60 * 1000));
        return pickupDate >= today && pickupDate <= threeDaysFromNow && ['approved', 'confirmed'].includes(b.status);
      }).length;
      
      const transportBookings = allBookings.filter(b => b.service_type === 'transport').length;
      const rentalBookings = allBookings.filter(b => b.service_type === 'rental').length;
      
      const stats = {
        totalBookings: allBookings.length,
        activeBookings: allBookings.filter(b => ['confirmed', 'in_transit', 'active'].includes(b.status)).length,
        completedBookings: completedBookings.length,
        pendingBookings: allBookings.filter(b => ['pending_review', 'approved'].includes(b.status)).length,
        totalSpent: totalSpent,
        upcomingBookings: upcomingBookings,
        transportBookings: transportBookings,
        rentalBookings: rentalBookings
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty data on error to prevent crashes
      setRecentBookings([]);
      setStats({
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        totalSpent: 0,
        upcomingBookings: 0,
        transportBookings: 0,
        rentalBookings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'approved': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'confirmed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in_transit': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'rejected': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user.firstName}!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your bookings and find the perfect trucks for your shipments.
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mb-6 sm:mb-8">
          <TrustBadges />
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/find-trucks?serviceType=rental"
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 group-hover:text-orange-700" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Find Equipment</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Monthly equipment rentals</p>
                </div>
              </div>
            </Link>

            <Link
              to="/find-trucks?serviceType=transport"
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 group-hover:text-accent-500 transition-colors" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Find Trucks</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Search available trucks</p>
                </div>
              </div>
            </Link>

            <Link
              to="/bookings/new"
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 group-hover:text-green-700" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">New Booking</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Create a new shipment</p>
                </div>
              </div>
            </Link>

            <Link
              to="/bookings"
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 group-hover:text-purple-700" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">My Bookings</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">View all bookings</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
                {/* Stats Cards - Enhanced with gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Bookings */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <Package className="h-8 w-8" />
                </div>
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                Total Bookings
              </dt>
              <dd className="text-3xl font-bold">
                {stats.totalBookings}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                {stats.activeBookings} active now
              </div>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <Activity className="h-8 w-8" />
                </div>
                <Zap className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                Active Bookings
              </dt>
              <dd className="text-3xl font-bold">
                {stats.activeBookings}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                In progress
              </div>
            </div>
          </div>

          {/* Completed Bookings */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <Target className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                Completed
              </dt>
              <dd className="text-3xl font-bold">
                {stats.completedBookings}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}% completion rate
              </div>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-gradient-to-br from-orange-500 to-accent-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <DollarSign className="h-8 w-8" />
                </div>
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                Total Spent
              </dt>
              <dd className="text-3xl font-bold">
                {formatCurrency(stats.totalSpent)}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                On completed bookings
              </div>
            </div>
          </div>
        </div>

        {/* Service Type Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary-600" />
              Transportation Services
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</span>
                <span className="text-2xl font-bold text-primary-600">{stats.transportBookings}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.transportBookings / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.totalBookings > 0 ? Math.round((stats.transportBookings / stats.totalBookings) * 100) : 0}% of total bookings
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Equipment Rental
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</span>
                <span className="text-2xl font-bold text-orange-600">{stats.rentalBookings}</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-accent-600 transition-all duration-500"
                  style={{ width: `${stats.totalBookings > 0 ? (stats.rentalBookings / stats.totalBookings) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stats.totalBookings > 0 ? Math.round((stats.rentalBookings / stats.totalBookings) * 100) : 0}% of total bookings
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Bookings</h2>
              <Link 
                to="/bookings" 
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No bookings yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating your first booking.</p>
                <div className="mt-6">
                  <Link
                    to="/new-booking"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Booking
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Service Type
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {booking.service_type === 'transport' ? (
                                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                                ) : (
                                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                                )}
                              </div>
                              <div className="ml-3 sm:ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {booking.service_type === 'transport' ? 'Transportation' : 'Equipment Rental'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {formatStatus(booking.status)}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(booking.service_type === 'transport' ? booking.pickup_date : booking.rental_start_date)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(booking.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
