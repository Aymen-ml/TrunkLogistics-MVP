import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';
import EmailVerificationBanner from '../common/EmailVerificationBanner';
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
  Bell
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
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 group-hover:text-blue-700" />
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Transport
                    </dt>
                    <dd className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {stats.transportBookings}
                    </dd>
                    <dd className="text-xs text-gray-500 dark:text-gray-400">
                      bookings
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
                <div className="ml-3 sm:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Rental
                    </dt>
                    <dd className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {stats.rentalBookings}
                    </dd>
                    <dd className="text-xs text-gray-500 dark:text-gray-400">
                      bookings
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Active
                    </dt>
                    <dd className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {stats.activeBookings}
                    </dd>
                    <dd className="text-xs text-gray-500 dark:text-gray-400">
                      in progress
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Spent
                    </dt>
                    <dd className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(stats.totalSpent)}
                    </dd>
                    <dd className="text-xs text-gray-500 dark:text-gray-400">
                      {stats.completedBookings} completed
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                </div>
                <div className="ml-3 sm:ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Upcoming
                    </dt>
                    <dd className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                      {stats.upcomingBookings}
                    </dd>
                    <dd className="text-xs text-gray-500 dark:text-gray-400">
                      Next 3 days
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Recent Bookings</h3>
              <Link
                to="/bookings"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentBookings.length === 0 ? (
              <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No bookings yet</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Start by finding trucks for your shipments.
                </p>
                <div className="mt-4 sm:mt-6">
                  <Link
                    to="/find-trucks"
                    className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent shadow-sm text-xs sm:text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Find Trucks
                  </Link>
                </div>
              </div>
            ) : (
              recentBookings.map((booking) => (
                <Link key={booking.id} to={`/bookings/${booking.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {booking.service_type === 'rental' 
                              ? (booking.work_address || 'Equipment Rental')
                              : `${booking.pickup_city} → ${booking.destination_city}`
                            }
                          </p>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <span>{formatDate(booking.pickup_date || booking.rental_start_datetime)}</span>
                            {booking.truck_license_plate && (
                              <>
                                <span>•</span>
                                <span>{booking.truck_license_plate}</span>
                              </>
                            )}
                            {booking.total_price && (
                              <>
                                <span>•</span>
                                <span>{formatCurrency(booking.total_price)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center ml-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(booking.status)
                        }`}>
                          {formatStatus(booking.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
