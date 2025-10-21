import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Calendar, DollarSign, Settings } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

const BookingManagement = () => {
  const { showSuccess, showError } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [filter, setFilter] = useState('all'); // all, approved, in_transit, active, completed, cancelled, pending_review

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await apiClient.get('/bookings');
      setBookings(response.data.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus, notes = null) => {
    if (newStatus === bookings.find(b => b.id === bookingId)?.status) {
      return; // No change needed
    }

    // If no notes provided and it's a significant change, prompt for explanation
    if (!notes && ['cancelled', 'completed'].includes(newStatus)) {
      const explanation = prompt(`Please provide a reason for changing this booking to ${newStatus.replace('_', ' ')}:`);
      if (explanation === null) return; // User cancelled
      notes = explanation.trim();
    }

    setUpdating(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      const payload = { status: newStatus };
      if (notes) {
        payload.notes = notes;
      }

      // Update status on server
      await apiClient.put(`/bookings/${bookingId}/status`, payload);
      
      // Fetch the complete updated booking with all fields
      const bookingResponse = await apiClient.get(`/bookings/${bookingId}`);
      const updatedBooking = bookingResponse.data.data?.booking;
      
      if (!updatedBooking) {
        throw new Error('Failed to fetch updated booking data');
      }
      
      // Update local state with complete booking object
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? updatedBooking  // Use complete updated booking data
          : booking
      ));
      
      showSuccess(`Booking status updated to ${newStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} successfully!`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error updating booking status';
      showError(`Failed to update booking status: ${errorMessage}`);
      
      // Refetch all bookings on error to ensure consistency
      fetchBookings();
    } finally {
      setUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const getStatusBadge = (status, serviceType) => {
    const statusConfig = {
      approved: { color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200', icon: CheckCircle },
      in_transit: { color: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200', icon: Truck },
      completed: { color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200', icon: XCircle },
      pending_review: { color: 'bg-orange-100 text-orange-800', icon: Clock },
      active: { color: 'bg-indigo-100 text-indigo-800', icon: serviceType === 'rental' ? Settings : Truck }
    };

    const config = statusConfig[status] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getServiceTypeBadge = (serviceType) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        serviceType === 'rental' 
          ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
      }`}>
        {serviceType === 'rental' ? 'Rental' : 'Transport'}
      </span>
    );
  };

  const getStatusOptions = (currentStatus, serviceType) => {
    // Service-specific status sets (cancelled removed from admin options as per requirements)
    const transportStatuses = ['pending_review', 'approved', 'in_transit', 'completed'];
    const rentalStatuses = ['pending_review', 'approved', 'active', 'completed'];
    const allStatuses = serviceType === 'rental' ? rentalStatuses : transportStatuses;
    return allStatuses.filter(status => status !== currentStatus);
  };

  const getQuickActionButtons = (booking) => {
    // Admin should not have cancel button - removed as per requirements
    // Admin can use the status dropdown to change to any status
    return [];
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const stats = {
    total: bookings.length,
    approved: bookings.filter(b => b.status === 'approved').length,
    in_transit: bookings.filter(b => b.status === 'in_transit').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    pending_review: bookings.filter(b => b.status === 'pending_review').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:bg-gray-900 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Booking Management</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Monitor and manage all platform bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">Total</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pending removed (not used) */}

          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.approved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Truck className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">In Transit (Logistics)</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.in_transit}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">Active (Rental)</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.active}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.completed}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">Cancelled</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.cancelled}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-3 w-0 flex-1">
                  <dl>
                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 truncate">Review</dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{stats.pending_review}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'pending_review', label: 'Pending Review' },
                { key: 'approved', label: 'Approved' },
                { key: 'in_transit', label: 'In Transit (Logistics)' },
                { key: 'active', label: 'Active (Rental)' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === key
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700'
                      : 'text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:text-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-gray-800 dark:bg-gray-800 dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Bookings ({filteredBookings.length})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Manage booking statuses and monitor platform activity
            </p>
          </div>
          
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredBookings.map((booking) => (
              <li key={booking.id} className="px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Package className="h-10 w-10 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {booking.booking_reference || `Booking #${booking.id.slice(0, 8)}`}
                        </p>
                        {getStatusBadge(booking.status, booking.service_type)}
                        {getServiceTypeBadge(booking.service_type)}
                      </div>
                      
                      <div className="space-y-1">
                        {booking.service_type === 'rental' ? (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.work_address || 'Work location not specified'}
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {booking.pickup_city} → {booking.destination_city}
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {booking.service_type === 'rental' 
                              ? new Date(booking.rental_start_datetime).toLocaleDateString()
                              : new Date(booking.pickup_date).toLocaleDateString()
                            }
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatCurrency(booking.total_price)}
                          </div>
                          
                          {booking.truck_license_plate && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                              <Truck className="h-4 w-4 mr-1" />
                              {booking.truck_license_plate}
                            </div>
                          )}
                        </div>
                        
                        {booking.customer_company && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            Customer: {booking.customer_company}
                          </p>
                        )}
                        
                        {booking.provider_company && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            Provider: {booking.provider_company}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Quick Action Buttons */}
                    {getQuickActionButtons(booking).map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.status}
                          onClick={() => {
                            // For critical actions, always prompt for notes
                            if (['cancelled', 'completed'].includes(action.status)) {
                              const notes = prompt(`Please provide a reason for ${action.label.toLowerCase()}ing this booking:`);
                              if (notes !== null) {
                                handleStatusChange(booking.id, action.status, notes.trim());
                              }
                            } else {
                              handleStatusChange(booking.id, action.status, `Admin ${action.label.toLowerCase()}ed booking`);
                            }
                          }}
                          disabled={updating[booking.id]}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${action.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 disabled:opacity-50`}
                        >
                          {updating[booking.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Icon className="h-4 w-4 mr-2" />
                          )}
                          {action.label}
                        </button>
                      );
                    })}

                    {/* Status Dropdown for All Options */}
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      disabled={updating[booking.id]}
                      className="block w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
                    >
                      <option value={booking.status}>
                        {booking.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                      {getStatusOptions(booking.status, booking.service_type).map(status => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                    
                    {updating[booking.id] && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;
