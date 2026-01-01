import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Truck, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Filter,
  Search,
  Settings,
  Plus,
  Eye,
  Trash2,
  DollarSign,
  TrendingUp,
  Activity,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { VEHICLE_TYPE_LABELS } from '../../constants/truckTypes';

const BookingList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { bookings, loading, deleteBooking, fetchBookings } = useBookings();
  const { showSuccess, showError } = useToast();
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    date_from: '',
    date_to: '',
    service_type: 'all',
    provider: 'all'
  });

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const statusMatch = filters.status === 'all' || booking.status === filters.status;
      const serviceMatch = filters.service_type === 'all' || booking.service_type === filters.service_type;
      const providerMatch = filters.provider === 'all' || (booking.provider_company && booking.provider_company === filters.provider);

      const searchLower = filters.search.toLowerCase();
      const searchMatch = filters.search === '' ||
        (booking.reference && booking.reference.toLowerCase().includes(searchLower)) ||
        (booking.pickup_city && booking.pickup_city.toLowerCase().includes(searchLower)) ||
        (booking.destination_city && booking.destination_city.toLowerCase().includes(searchLower)) ||
        (booking.work_address && booking.work_address.toLowerCase().includes(searchLower));

      const bookingDate = new Date(booking.pickup_date || booking.rental_start_datetime);
      const fromDate = filters.date_from ? new Date(filters.date_from) : null;
      const toDate = filters.date_to ? new Date(filters.date_to) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      const dateMatch = (!fromDate || bookingDate >= fromDate) && (!toDate || bookingDate <= toDate);

      return statusMatch && searchMatch && dateMatch && serviceMatch && providerMatch;
    });
  }, [bookings, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      search: '',
      date_from: '',
      date_to: '',
      service_type: 'all',
      provider: 'all'
    });
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }
    setDeletingBookingId(bookingId);
    try {
      await deleteBooking(bookingId);
      showSuccess('Booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showError(`Failed to delete booking: ${error.response?.data?.error || error.message}`);
    } finally {
      setDeletingBookingId(null);
    }
  };

  const getStatusIcon = (status, serviceType) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'in_transit':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'active':
        return serviceType === 'rental' ? 
          <Settings className="h-4 w-4 text-orange-500" /> : 
          <Truck className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'approved':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'in_transit':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'active':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800';
    }
  };

  const getStatusLabel = (status, serviceType) => {
    const labels = {
      pending_review: 'Pending Review',
      approved: 'Approved',
      in_transit: 'In Transit',
      active: serviceType === 'rental' ? 'Equipment In Use' : 'Active',
      completed: 'Completed',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Calculate stats from filtered bookings
  const stats = useMemo(() => {
    const total = filteredBookings.length;
    const active = filteredBookings.filter(b => 
      b.status === 'in_transit' || b.status === 'active' || b.status === 'approved'
    ).length;
    const completed = filteredBookings.filter(b => b.status === 'completed').length;
    const totalRevenue = filteredBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);
    
    return { total, active, completed, totalRevenue };
  }, [filteredBookings]);

  const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (!amount || amount === 0 || isNaN(numAmount)) return '$0';
    if (numAmount % 1 === 0) {
      return `$${numAmount.toLocaleString()}`;
    } else {
      return `$${numAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'status' || key === 'service_type' || key === 'provider') return value !== 'all';
    if (key === 'search') return value !== '';
    if (key === 'date_from' || key === 'date_to') return value !== '';
    return false;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl">
                {t('bookings.myBookings')}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('bookings.manageBookings')}
              </p>
            </div>
            {user.role === 'customer' && (
              <div className="mt-4 md:mt-0 md:ml-4">
                <Link
                  to="/bookings/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('bookings.createBooking')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('bookings.total')} {t('bookings.myBookings')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                <Package className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('bookings.activeBookings')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('bookings.completedBookings')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.completed}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('bookings.totalRevenue')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg mb-6">
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('bookings.filters')}</h3>
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                  {t('bookings.clearFilters')}
                </button>
              )}
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bookings.search')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="search"
                      id="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                      placeholder={t('bookings.searchPlaceholder')}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bookings.status')}
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                  >
                    <option value="all">{t('bookings.allStatuses')}</option>
                    <option value="pending_review">{t('bookings.pendingReview')}</option>
                    <option value="approved">{t('bookings.approved')}</option>
                    <option value="in_transit">{t('bookings.inTransit')}</option>
                    <option value="active">{t('bookings.active')}</option>
                    <option value="completed">{t('bookings.completed')}</option>
                    <option value="cancelled">{t('bookings.cancelled')}</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bookings.serviceType')}
                  </label>
                  <select
                    id="service_type"
                    name="service_type"
                    value={filters.service_type}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                  >
                    <option value="all">{t('bookings.allServices')}</option>
                    <option value="transport">{t('bookings.transportation')}</option>
                    <option value="rental">{t('bookings.equipmentRental')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bookings.fromDate')}
                  </label>
                  <input
                    type="date"
                    id="date_from"
                    name="date_from"
                    value={filters.date_from}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('bookings.toDate')}
                  </label>
                  <input
                    type="date"
                    id="date_to"
                    name="date_to"
                    value={filters.date_to}
                    onChange={handleFilterChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('bookings.allBookings')} ({filteredBookings.length})
              </h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('bookings.bookingDetails')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('bookings.location')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('bookings.schedule')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('bookings.status')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('bookings.price')}
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {t('bookings.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.notFound')}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('bookings.tryAdjustingFilters')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-600/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg ${
                            booking.service_type === 'rental' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 dark:bg-blue-900 text-blue-600'
                          }`}>
                            {booking.service_type === 'rental' ? (
                              <Settings className="h-6 w-6" />
                            ) : (
                              <Package className="h-6 w-6" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {booking.service_type === 'rental' ? t('bookings.equipmentRental') : t('bookings.transportation')} #{booking.reference || booking.id.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {VEHICLE_TYPE_LABELS[booking.truck_type] || booking.truck_type || t('bookings.vehicle')}
                            </div>
                            {user.role === 'customer' && booking.provider_company && (
                              <div className="text-xs text-primary-600 font-medium mt-1">
                                {booking.provider_company}
                              </div>
                            )}
                            {user.role === 'provider' && booking.customer_company && (
                              <div className="text-xs text-green-600 font-medium mt-1">
                                {booking.customer_company}
                              </div>
                            )}
                            {user.role === 'admin' && (
                              <>
                                {booking.provider_company && (
                                  <div className="text-xs text-primary-600 font-medium mt-1">
                                    {t('bookings.provider')}: {booking.provider_company}
                                  </div>
                                )}
                                {booking.customer_company && (
                                  <div className="text-xs text-green-600 font-medium mt-1">
                                    {t('bookings.customer')}: {booking.customer_company}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                          <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mr-1" />
                          {booking.service_type === 'rental' ? (
                            <span className="truncate max-w-48" title={booking.work_address}>
                              {booking.work_address || t('bookings.workLocation')}
                            </span>
                          ) : (
                            <>
                              <span>{booking.pickup_city}</span>
                              <span className="mx-2">→</span>
                              <span>{booking.destination_city}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mr-1" />
                          {booking.service_type === 'rental' ? (
                            booking.rental_start_datetime ? (
                              <div className="flex flex-col">
                                <span>{new Date(booking.rental_start_datetime).toLocaleDateString()}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(booking.rental_start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                  {new Date(booking.rental_end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            ) : (
                              <span>{t('bookings.rentalDatesTBD')}</span>
                            )
                          ) : (
                            <>
                              {new Date(booking.pickup_date).toLocaleDateString()}
                              {booking.pickup_time && (
                                <span className="ml-1">{t('bookings.at')} {booking.pickup_time}</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(booking.status, booking.service_type)}
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status, booking.service_type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                          <DollarSign className="h-4 w-4 text-gray-400 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mr-1" />
                          {booking.total_price?.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }) || 'TBD'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            to={`/bookings/${booking.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('bookings.viewDetails')}
                          </Link>
                          {(
                            (user.role === 'provider' && ['cancelled', 'completed'].includes(booking.status)) ||
                            (user.role === 'customer' && ['pending_review', 'cancelled', 'completed'].includes(booking.status))
                          ) && (
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              disabled={deletingBookingId === booking.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 dark:bg-red-900 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {deletingBookingId === booking.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-1"></div>
                                  {t('bookings.deleting')}
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {t('bookings.delete')}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;
