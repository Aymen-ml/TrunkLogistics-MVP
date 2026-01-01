import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerificationBanner from '../common/EmailVerificationBanner';
import { StatsBadges } from '../common/TrustBadges';
import { 
  Users, 
  Package, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  Truck,
  Building,
  Activity,
  Zap,
  ArrowRight,
  Target,
  DollarSign
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { formatCurrency } from '../../utils/currency';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalProviders: 0,
    pendingProviders: 0,
    totalBookings: 0,
    pendingBookings: 0,
    totalTrucks: 0,
    activeTrucks: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    transportBookings: 0,
    rentalBookings: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersResponse, providerUsersResponse, bookingsResponse, trucksResponse, documentsStatsResponse] = await Promise.all([
        apiClient.get('/users'),
        apiClient.get('/users?role=provider'),
        apiClient.get('/bookings'),
        apiClient.get('/trucks/admin/all'),
        apiClient.get('/documents/stats')
      ]);

      const users = usersResponse.data.data?.users || usersResponse.data.users || [];
      const providersEnriched = providerUsersResponse.data.data?.users || providerUsersResponse.data.users || [];
      const bookings = bookingsResponse.data.data?.bookings || bookingsResponse.data.bookings || [];
      const trucks = trucksResponse.data.data?.trucks || trucksResponse.data.trucks || [];
      
      // Calculate user stats
      const userStats = {
        totalUsers: users.length,
        totalCustomers: users.filter(u => u.role === 'customer').length,
        totalProviders: providersEnriched.length,
        pendingProviders: providersEnriched.filter(p => !p.is_verified).length
      };

      // Calculate booking stats
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = completedBookings
        .filter(b => {
          const bookingDate = new Date(b.created_at);
          return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        })
        .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);

      // Calculate truck stats
      const activeTrucks = trucks.filter(t => t.status === 'active').length;
      
      // Define rental equipment types (construction/industrial equipment)
      const rentalEquipmentTypes = [
        'crane', 'mobile_crane', 'tower_crane', 'forklift', 'reach_truck', 'pallet_jack',
        'excavator', 'bulldozer', 'loader', 'dump_truck', 'concrete_mixer'
      ];
      
      // Define logistics truck types (transport vehicles)
      const logisticsTruckTypes = [
        'flatbed', 'container', 'box', 'refrigerated', 'tanker', 'other'
      ];
      
      const rentalTrucks = trucks.filter(t => t.truck_type && rentalEquipmentTypes.includes(t.truck_type)).length;
      const logisticsTrucks = trucks.filter(t => t.truck_type && logisticsTruckTypes.includes(t.truck_type)).length;
      
      setStats({
        ...userStats,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending_review').length,
        totalTrucks: trucks.length,
        activeTrucks: activeTrucks,
        rentalTrucks: rentalTrucks,
        logisticsTrucks: logisticsTrucks,
        totalRevenue: totalRevenue,
        monthlyRevenue: monthlyRevenue,
        transportBookings: bookings.filter(b => b.service_type === 'transport').length,
        rentalBookings: bookings.filter(b => b.service_type === 'rental').length
      });

      // Set recent activity as recent bookings
      setRecentActivity(bookings.slice(0, 10));

      // Create pending items list
      const pendingBookings = bookings.filter(b => b.status === 'pending_review').length;
      const pendingDocuments = documentsStatsResponse?.data?.data?.stats?.pending_documents || 0;
      const pending = [
        ...(pendingBookings > 0 ? [{
          type: 'booking',
          count: pendingBookings,
          title: 'Booking Approvals',
          description: 'Booking requests awaiting review',
          link: '/admin/bookings'
        }] : []),
        ...(pendingDocuments > 0 ? [{
          type: 'document',
          count: pendingDocuments,
          title: 'Document Verifications',
          description: 'Uploaded documents awaiting verification',
          link: '/admin/documents'
        }] : []),
        ...(userStats.pendingProviders > 0 ? [{
          type: 'provider',
          count: userStats.pendingProviders,
          title: 'Provider Verifications',
          description: 'Provider accounts awaiting verification',
          link: '/admin/providers'
        }] : [])
      ];

      setPendingItems(pending);
    } catch (error) {
      console.error('Admin Dashboard Error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking_status': return Package;
      case 'document_verification': return FileText;
      case 'provider_verification': return Building;
      case 'admin_alert': return AlertTriangle;
      default: return Activity;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Monitor platform activity and manage system operations.
          </p>
        </div>

        {/* Platform Stats Badges */}
        <div className="mb-6 sm:mb-8">
          <StatsBadges />
        </div>

        {/* Pending Actions Alert */}
        {pendingItems.length > 0 && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Pending Actions Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You have {pendingItems.reduce((sum, item) => sum + item.count, 0)} items requiring attention.</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pendingItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.link}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200"
                    >
                      {item.count} {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/users"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600 group-hover:text-accent-500 transition-colors" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('dashboard.manageUsers')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">{t('dashboard.manageUsersDesc')}</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/analytics"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-indigo-600 group-hover:text-indigo-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('dashboard.analytics')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">{t('dashboard.trendsAndFunnels')}</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/bookings"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-green-600 group-hover:text-green-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('dashboard.bookings')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">{t('dashboard.reviewBookings')}</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/documents"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-purple-600 group-hover:text-purple-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('dashboard.documentVerification')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">{t('dashboard.reviewDocuments')}</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/providers"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building className="h-8 w-8 text-orange-600 group-hover:text-orange-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('dashboard.providerVerification')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">{t('dashboard.reviewProviders')}</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Platform Overview - Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <Users className="h-8 w-8" />
                </div>
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                {t('dashboard.totalUsers')}
              </dt>
              <dd className="text-3xl font-bold">
                {stats.totalUsers}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                {stats.totalCustomers} {t('dashboard.customers')} • {stats.totalProviders} {t('dashboard.providers')}
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <Package className="h-8 w-8" />
                </div>
                <Activity className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                {t('dashboard.totalBookings')}
              </dt>
              <dd className="text-3xl font-bold">
                {stats.totalBookings}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                {stats.pendingBookings > 0 ? `${stats.pendingBookings} ${t('dashboard.pendingReview')}` : t('dashboard.allUpToDate')}
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <DollarSign className="h-8 w-8" />
                </div>
                <TrendingUp className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                {t('dashboard.totalRevenue')}
              </dt>
              <dd className="text-3xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                {formatCurrency(stats.monthlyRevenue)} {t('dashboard.thisMonth')}
              </div>
            </div>
          </div>

          {/* Fleet Size */}
          <div className="bg-gradient-to-br from-orange-500 to-accent-600 overflow-hidden shadow-lg rounded-lg transform transition-all hover:scale-105">
            <div className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <Truck className="h-8 w-8" />
                </div>
                <Zap className="h-5 w-5 opacity-60" />
              </div>
              <dt className="text-sm font-medium opacity-90 mb-1">
                {t('dashboard.totalFleet')}
              </dt>
              <dd className="text-3xl font-bold">
                {stats.totalTrucks}
              </dd>
              <div className="mt-2 text-xs opacity-75">
                {stats.activeTrucks} {t('dashboard.activeVehicles')}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics - Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.transportBookings')}</h3>
              <Truck className="h-5 w-5 text-primary-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.transportBookings}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.logisticsServices')}</p>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.vehicles')}: {stats.logisticsTrucks || 0}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.rentalBookings')}</h3>
              <Building className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.rentalBookings}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.equipmentRentals')}</p>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.equipment')}: {stats.rentalTrucks || 0}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.pendingProviders')}</h3>
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingProviders}</p>
            <p className="text-xs text-yellow-600 mt-1">{t('dashboard.needVerification')}</p>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Link to="/admin/providers" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                {t('dashboard.reviewNow')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('dashboard.platformHealth')}</h3>
              <Activity className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{t('dashboard.excellent')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.allSystemsOperational')}</p>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Link to="/admin/analytics" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                View analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('dashboard.recentActivity')}</h3>
                <Link
                  to="/admin/activity"
                  className="text-sm text-accent-500 hover:text-accent-600 transition-colors font-medium"
                >
                  {t('dashboard.viewAll')}
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentActivity.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('dashboard.noRecentActivity')}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">
                    System activity will appear here.
                  </p>
                </div>
              ) : (
                recentActivity.slice(0, 5).map((booking) => {
                  return (
                    <div key={booking.id} className="px-6 py-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Package className="h-4 w-4 text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {booking.service_type === 'rental' ? 'Equipment Rental' : 'Transport'} #{booking.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mt-1">
                            {booking.service_type === 'rental' 
                              ? (booking.work_address || 'Equipment rental')
                              : `${booking.pickup_city} → ${booking.destination_city}`
                            }
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(booking.created_at)} • {booking.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pending Items */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Pending Actions</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {pendingItems.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">All caught up!</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">
                    No pending actions require your attention.
                  </p>
                </div>
              ) : (
                pendingItems.map((item, index) => (
                  <div key={index} className="px-6 py-4">
                    <Link
                      to={item.link}
                      className="flex items-center justify-between hover:bg-gray-50 dark:bg-gray-900 -mx-6 px-6 py-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-yellow-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          {item.count}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
