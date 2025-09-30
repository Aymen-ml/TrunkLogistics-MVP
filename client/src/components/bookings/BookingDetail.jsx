import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Truck, 
  Package, 
  DollarSign, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Edit, 
  Trash2,
  MessageSquare,
  User,
  Building,
  Settings,
  AlertTriangle,
  Weight,
  FileText
} from 'lucide-react';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, loading, updateBookingStatus, deleteBooking } = useBookings();
  const { showSuccess, showError } = useToast();
  const [updating, setUpdating] = useState(false);

  // Find the booking from context
  const booking = bookings.find(b => b.id === id);

  // Log for debugging
  useEffect(() => {
    console.log('📍 BookingDetail - Current booking:', booking);
    console.log('📍 BookingDetail - Booking status:', booking?.status);
    console.log('📍 BookingDetail - Total bookings in context:', bookings.length);
  }, [booking, bookings]);

  const handleUpdateStatus = async (newStatus) => {
    const confirmMessage = `Are you sure you want to change the status to ${newStatus.replace('_', ' ')}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdating(true);
    try {
      console.log(`🔄 Initiating status update to: ${newStatus}`);
      
      await updateBookingStatus(id, newStatus, `Status updated to ${newStatus}`);
      
      console.log('✅ Status update successful');
      showSuccess(`Booking status updated to ${newStatus.replace('_', ' ')} successfully!`);
      
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      showError(`Failed to update booking status: ${error.response?.data?.error || error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    setUpdating(true);
    try {
      await deleteBooking(id);
      showSuccess('Booking deleted successfully');
      navigate('/bookings');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showError('Failed to delete booking. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status, serviceType) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'active':
        return serviceType === 'rental' ? 
          <Settings className="h-5 w-5 text-orange-500" /> : 
          <Truck className="h-5 w-5 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
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

  const getAvailableActions = () => {
    if (!booking) return [];
    
    const actions = [];
    
    if (user.role === 'customer') {
      // Customer actions
      if (booking.status === 'pending_review') {
        actions.push(
          { 
            label: 'Edit Booking', 
            action: 'edit', 
            color: 'blue',
            icon: <Edit className="h-4 w-4 mr-1" />,
            path: `/bookings/${booking.id}/edit`
          },
          { 
            label: 'Cancel', 
            action: 'cancelled', 
            color: 'red',
            icon: <XCircle className="h-4 w-4 mr-1" />,
            onClick: () => handleUpdateStatus('cancelled')
          }
        );
      }
      
      if (booking.status === 'in_transit') {
        actions.push({
          label: 'Confirm Delivery',
          action: 'completed',
          color: 'green',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          onClick: () => handleUpdateStatus('completed')
        });
      }
      
      if (booking.status === 'active' && booking.service_type === 'rental') {
        actions.push({
          label: 'Return Equipment',
          action: 'completed',
          color: 'green',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          onClick: () => handleUpdateStatus('completed')
        });
      }
      
      if (['pending_review', 'cancelled', 'completed'].includes(booking.status)) {
        actions.push({
          label: 'Delete Booking',
          action: 'delete',
          color: 'red',
          icon: <Trash2 className="h-4 w-4 mr-1" />,
          onClick: handleDeleteBooking
        });
      }
    } else if (user.role === 'provider') {
      // Provider actions
      if (!['completed', 'cancelled'].includes(booking.status)) {
        actions.push({
          label: 'Send Message',
          action: 'message',
          color: 'green',
          icon: <MessageSquare className="h-4 w-4 mr-1" />,
          onClick: () => alert('Messaging feature coming soon!')
        });
      }
      
      if (booking.status === 'pending_review') {
        actions.push(
          { 
            label: 'Approve Booking', 
            action: 'approved', 
            color: 'blue',
            icon: <CheckCircle className="h-4 w-4 mr-1" />,
            onClick: () => handleUpdateStatus('approved')
          },
          { 
            label: 'Reject Booking', 
            action: 'cancelled', 
            color: 'red',
            icon: <XCircle className="h-4 w-4 mr-1" />,
            onClick: () => handleUpdateStatus('cancelled')
          }
        );
      } else if (booking.status === 'approved') {
        const nextStatus = booking.service_type === 'rental' ? 'active' : 'in_transit';
        const actionLabel = booking.service_type === 'rental' ? 'Start Rental' : 'Start Trip';
        const actionIcon = booking.service_type === 'rental' ? 
          <Settings className="h-4 w-4 mr-1" /> : 
          <Truck className="h-4 w-4 mr-1" />;
        const actionColor = booking.service_type === 'rental' ? 'orange' : 'purple';
        
        actions.push({ 
          label: actionLabel, 
          action: nextStatus, 
          color: actionColor,
          icon: actionIcon,
          onClick: () => handleUpdateStatus(nextStatus)
        });
      }
      
      if (['cancelled', 'completed'].includes(booking.status)) {
        actions.push({
          label: 'Delete Booking',
          action: 'delete',
          color: 'red',
          icon: <Trash2 className="h-4 w-4 mr-1" />,
          onClick: handleDeleteBooking
        });
      }
    }
    
    return actions;
  };

  const getButtonClasses = (color) => {
    const baseClasses = "inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
    switch(color) {
      case 'blue':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400`;
      case 'green':
        return `${baseClasses} bg-green-600 hover:bg-green-700 disabled:bg-green-400`;
      case 'red':
        return `${baseClasses} bg-red-600 hover:bg-red-700 disabled:bg-red-400`;
      case 'purple':
        return `${baseClasses} bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400`;
      case 'orange':
        return `${baseClasses} bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400`;
      case 'yellow':
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400`;
      default:
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Booking not found</h2>
          <p className="mt-2 text-gray-600">The booking you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  const availableActions = getAvailableActions();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Bookings
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              {booking.service_type === 'rental' ? (
                <Settings className="h-8 w-8 text-orange-500 mr-3" />
              ) : (
                <Package className="h-8 w-8 text-blue-600 mr-3" />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {booking.service_type === 'rental' ? 'Equipment Rental' : 'Booking'} #{booking.reference || booking.id.slice(-8)}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Created on {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                </p>
                <div className="mt-2 flex items-center flex-wrap gap-2">
                  <div className="flex items-center">
                    {getStatusIcon(booking.status, booking.service_type)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status, booking.service_type)}
                    </span>
                  </div>
                  {booking.service_type === 'rental' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <Settings className="h-3 w-3 mr-1" />
                      Rental Equipment
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              {availableActions.map((action, index) => (
                <button
                  key={`${action.action}-${index}`}
                  onClick={action.onClick || (() => action.path && navigate(action.path))}
                  disabled={updating}
                  className={getButtonClasses(action.color)}
                >
                  {updating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    action.icon && <span className="mr-1">{action.icon}</span>
                  )}
                  {updating ? 'Updating...' : action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Information */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Route Information</h3>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Pickup Location</p>
                      <p className="text-sm text-gray-600">{booking.pickup_address}</p>
                      <p className="text-sm text-gray-600">{booking.pickup_city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Destination</p>
                      <p className="text-sm text-gray-600">{booking.destination_address}</p>
                      <p className="text-sm text-gray-600">{booking.destination_city}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Pickup Date & Time</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.pickup_date).toLocaleDateString()}
                        {booking.pickup_time && ` at ${booking.pickup_time}`}
                      </p>
                    </div>
                  </div>

                  {booking.estimated_distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Estimated Distance:</span>
                      <span className="font-medium">{booking.estimated_distance} km</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cargo Information - Only for transport bookings */}
            {booking.service_type !== 'rental' && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Cargo Information</h3>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Description</p>
                      <p className="text-sm text-gray-600 mt-1">{booking.cargo_description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Weight className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Weight</p>
                          <p className="text-sm text-gray-600">{booking.cargo_weight?.toLocaleString()} kg</p>
                        </div>
                      </div>
                      
                      {booking.cargo_volume && (
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Volume</p>
                            <p className="text-sm text-gray-600">{booking.cargo_volume} m³</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-900">Additional Notes</p>
                        <p className="text-sm text-gray-600 mt-1">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rental Equipment Information */}
            {booking.service_type === 'rental' && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-orange-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Rental Equipment Details</h3>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.rental_start_datetime && (
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Rental Start</p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.rental_start_datetime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {booking.rental_end_datetime && (
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Rental End</p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.rental_end_datetime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.work_address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-purple-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Work Location</p>
                          <p className="text-sm text-gray-600">{booking.work_address}</p>
                        </div>
                      </div>
                    )}

                    {booking.purpose_description && (
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Purpose</p>
                          <p className="text-sm text-gray-600">{booking.purpose_description}</p>
                        </div>
                      </div>
                    )}

                    {booking.operator_required !== undefined && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Operator Required</p>
                          <p className="text-sm text-gray-600">
                            {booking.operator_required ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    )}

                    {booking.rental_start_datetime && booking.rental_end_datetime && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Rental Duration:</span>
                          <span className="font-medium">
                            {Math.ceil(
                              (new Date(booking.rental_end_datetime) - new Date(booking.rental_start_datetime)) / (1000 * 60 * 60 * 24)
                            )} day(s)
                          </span>
                        </div>
                      </div>
                    )}

                    {booking.notes && (
                      <div className="flex items-start">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Additional Notes</p>
                          <p className="text-sm text-gray-600">{booking.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Truck Information */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Truck Information</h3>
              </div>
              <div className="px-6 py-6">
                <div className="flex items-center">
                  <Truck className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900">{booking.truck_license_plate || booking.license_plate}</p>
                    <p className="text-sm text-gray-600">{booking.truck_make} {booking.truck_model}</p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium">{booking.truck_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Capacity:</span>
                    <span className="font-medium">{booking.truck_capacity?.toLocaleString() || booking.capacity_weight?.toLocaleString()} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Price:</span>
                  <span className="font-medium">${booking.total_price?.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${booking.total_price?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {user.role === 'customer' ? 'Provider' : 'Customer'} Contact
              </h3>
              <div className="space-y-4">
                {/* Company Name */}
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Company Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.role === 'customer' 
                        ? (booking.provider_company || 'Not provided') 
                        : (booking.customer_company || 'Not provided')
                      }
                    </p>
                  </div>
                </div>
                
                {/* Phone Number */}
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.role === 'customer' 
                        ? (booking.provider_phone || 'Not provided') 
                        : (booking.customer_phone || 'Not provided')
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => alert('Messaging feature coming soon!')}
                className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Booking Created</p>
                    <p className="text-gray-500">
                      {new Date(booking.created_at).toLocaleDateString()} at {new Date(booking.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {booking.status !== 'pending_review' && (
                  <div className="flex items-center text-sm">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Status Updated</p>
                      <p className="text-gray-500">
                        {new Date(booking.updated_at).toLocaleDateString()} at {new Date(booking.updated_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
