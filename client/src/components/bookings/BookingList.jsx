import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  AlertTriangle,
  Plus,
  Eye,
  Trash2,
  DollarSign
} from 'lucide-react';
import { apiClient } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { VEHICLE_TYPE_LABELS } from '../../constants/truckTypes';

const BookingList = () => {
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

  const filteredBookings = React.useMemo(() => {
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
    // Filtering is handled automatically by the useMemo hook based on the filters state.
    // This function is just here to prevent the default form submission.
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
      // Refresh the bookings list after successful deletion
      await fetchBookings();
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
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'active':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                Bookings
              </h2>
            </div>
            {user.role === 'customer' && (
              <div className="mt-4 md:mt-0 md:ml-4">
                <Link
                  to="/bookings/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:grid md:grid-cols-7 md:gap-4 md:items-end">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search bookings..."
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="in_transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Service
                </label>
                <select
                  id="service_type"
                  name="service_type"
                  value={filters.service_type}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Services</option>
                  <option value="transport">Transportation</option>
                  <option value="rental">Equipment Rental</option>
                </select>
              </div>

              <div>
                <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
                  Provider
                </label>
                <select
                  id="provider"
                  name="provider"
                  value={filters.provider}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Providers</option>
                  {/* Provider options will be populated dynamically */}
                  {bookings && [...new Set(bookings.map(b => b.provider_company).filter(Boolean))].map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="date_from"
                  id="date_from"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>

              <div>
                <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="date_to"
                  id="date_to"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                />
              </div>

              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg ${
                            booking.service_type === 'rental' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {booking.service_type === 'rental' ? (
                              <Settings className="h-6 w-6" />
                            ) : (
                              <Package className="h-6 w-6" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.service_type === 'rental' ? 'Equipment Rental' : 'Transport'} #{booking.reference || booking.id.slice(-8)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {VEHICLE_TYPE_LABELS[booking.truck_type] || booking.truck_type || 'Vehicle'}
                            </div>
                            {/* Show company information based on user role */}
                            {user.role === 'customer' && booking.provider_company && (
                              <div className="text-xs text-blue-600 font-medium mt-1">
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
                                  <div className="text-xs text-blue-600 font-medium mt-1">
                                    Provider: {booking.provider_company}
                                  </div>
                                )}
                                {booking.customer_company && (
                                  <div className="text-xs text-green-600 font-medium mt-1">
                                    Customer: {booking.customer_company}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {booking.service_type === 'rental' ? (
                            <span className="truncate max-w-48" title={booking.work_address}>
                              {booking.work_address || 'Work location'}
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
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {booking.service_type === 'rental' ? (
                            booking.rental_start_datetime ? (
                              <div className="flex flex-col">
                                <span>{new Date(booking.rental_start_datetime).toLocaleDateString()}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(booking.rental_start_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                                  {new Date(booking.rental_end_datetime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              </div>
                            ) : (
                              <span>Rental dates TBD</span>
                            )
                          ) : (
                            <>
                              {new Date(booking.pickup_date).toLocaleDateString()}
                              {booking.pickup_time && (
                                <span className="ml-1">at {booking.pickup_time}</span>
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
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
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
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Link>
                          {(
                            (user.role === 'provider' && booking.status === 'cancelled') ||
                            (user.role === 'customer' && ['pending_review', 'cancelled'].includes(booking.status))
                          ) && (
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              disabled={deletingBookingId === booking.id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                              {deletingBookingId === booking.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-1"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
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
