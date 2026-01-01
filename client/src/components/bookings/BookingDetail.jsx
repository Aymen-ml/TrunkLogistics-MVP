import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, loading, updateBookingStatus, deleteBooking, fetchBookings } = useBookings();
  const { showSuccess, showError } = useToast();
  const [updatingAction, setUpdatingAction] = useState(null); // Track which specific action is updating
  const [localBooking, setLocalBooking] = useState(null);

  // Find and cache the booking locally to ensure UI updates
  useEffect(() => {
    const foundBooking = bookings.find(b => b.id === id);
    if (foundBooking) {
      setLocalBooking(foundBooking);
      console.log('📍 BookingDetail - Booking updated:', foundBooking.status);
    }
  }, [bookings, id]);

  // Use localBooking for rendering
  const booking = localBooking;

  // Log for debugging
  useEffect(() => {
    console.log('📍 BookingDetail - Current booking:', booking);
    console.log('📍 BookingDetail - Booking status:', booking?.status);
    console.log('📍 BookingDetail - Total bookings in context:', bookings.length);
  }, [booking, bookings]);

  const handleUpdateStatus = async (newStatus) => {
    const confirmMessage = `${t('bookings.confirmStatusChange')} ${newStatus.replace('_', ' ')}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setUpdatingAction(newStatus); // Set which action is updating
    try {
      console.log(`🔄 Initiating status update to: ${newStatus}`);
      
      const result = await updateBookingStatus(id, newStatus, `Status updated to ${newStatus}`);
      
      console.log('✅ Status update successful');
      
      // Update local booking immediately with the result
      if (result?.booking) {
        setLocalBooking(result.booking);
        console.log('🔄 Local booking updated, new status:', result.booking.status);
      }
      
  // Small delay to ensure React completes re-rendering before clearing updating state
  await new Promise(resolve => setTimeout(resolve, 50));
      
  // Clear updating state so new buttons are not disabled
      setUpdatingAction(null);
      console.log('✅ Updating action cleared, buttons should be clickable now');

      showSuccess(`${t('bookings.statusUpdated')} ${newStatus.replace('_', ' ')}!`);
      
    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      showError(`${t('bookings.statusUpdateFailed')}: ${error.response?.data?.error || error.message}`);
      setUpdatingAction(null);
    }
  };

  const handleDeleteBooking = async () => {
    if (!window.confirm(t('bookings.confirmDelete'))) {
      return;
    }

    setUpdating(true);
    try {
      await deleteBooking(id);
      showSuccess(t('bookings.bookingDeleted'));
      navigate('/bookings');
    } catch (error) {
      console.error('Error deleting booking:', error);
      showError(t('bookings.deleteFailed'));
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
        return <AlertCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
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
      pending_review: t('bookings.pendingReview'),
      approved: t('bookings.approved'),
      in_transit: t('bookings.inTransit'),
      active: serviceType === 'rental' ? t('bookings.equipmentInUse') : t('bookings.active'),
      completed: t('bookings.completed'),
      cancelled: t('bookings.cancelled')
    };
    return labels[status] || status;
  };

  // Memoize available actions to ensure they recalculate when status or service_type changes
  const availableActions = useMemo(() => {
    if (!booking || !user) return [];
    
    console.log('🔄 Recalculating available actions for status:', booking.status);
    
    const actions = [];
    
    if (user?.role === 'admin') {
      // Admin actions - can change to any status except current one
      const allStatuses = [
        { status: 'pending_review', label: t('bookings.pendingReview'), color: 'yellow', icon: <Clock className="h-4 w-4 mr-1" /> },
        { status: 'approved', label: t('bookings.approved'), color: 'blue', icon: <CheckCircle className="h-4 w-4 mr-1" /> },
        { status: 'in_transit', label: t('bookings.inTransit'), color: 'purple', icon: <Truck className="h-4 w-4 mr-1" /> },
        { status: 'active', label: booking.service_type === 'rental' ? `${t('bookings.active')} (${t('bookings.rentalEquipment')})` : t('bookings.active'), color: 'orange', icon: <Settings className="h-4 w-4 mr-1" /> },
        { status: 'completed', label: t('bookings.completed'), color: 'green', icon: <CheckCircle className="h-4 w-4 mr-1" /> }
      ];
      
      // Add status change buttons for all statuses except current one
      allStatuses.forEach(statusOption => {
        if (statusOption.status !== booking.status) {
          actions.push({
            label: `${t('bookings.setTo')} ${statusOption.label}`,
            action: statusOption.status,
            color: statusOption.color,
            icon: statusOption.icon,
            onClick: () => handleUpdateStatus(statusOption.status)
          });
        }
      });
      
      // Add delete button
      actions.push({
        label: t('bookings.deleteBooking'),
        action: 'delete',
        color: 'red',
        icon: <Trash2 className="h-4 w-4 mr-1" />,
        onClick: handleDeleteBooking
      });
      
    } else if (user?.role === 'customer') {
      // Customer actions
      if (booking.status === 'pending_review') {
        actions.push(
          { 
            label: t('bookings.editBooking'), 
            action: 'edit', 
            color: 'blue',
            icon: <Edit className="h-4 w-4 mr-1" />,
            path: `/bookings/${booking.id}/edit`
          },
          { 
            label: t('bookings.cancel'), 
            action: 'cancelled', 
            color: 'red',
            icon: <XCircle className="h-4 w-4 mr-1" />,
            onClick: () => handleUpdateStatus('cancelled')
          }
        );
      }
      
      if (booking.status === 'in_transit') {
        actions.push({
          label: t('bookings.confirmDelivery'),
          action: 'completed',
          color: 'green',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          onClick: () => handleUpdateStatus('completed')
        });
      }
      
      if (booking.status === 'active' && booking.service_type === 'rental') {
        actions.push({
          label: t('bookings.returnEquipment'),
          action: 'completed',
          color: 'green',
          icon: <CheckCircle className="h-4 w-4 mr-1" />,
          onClick: () => handleUpdateStatus('completed')
        });
      }
      
      if (['pending_review', 'cancelled', 'completed'].includes(booking.status)) {
        actions.push({
          label: t('bookings.deleteBooking'),
          action: 'delete',
          color: 'red',
          icon: <Trash2 className="h-4 w-4 mr-1" />,
          onClick: handleDeleteBooking
        });
      }
    } else if (user?.role === 'provider') {
      // Provider actions
      if (!['completed', 'cancelled'].includes(booking.status)) {
        actions.push({
          label: t('bookings.sendMessage'),
          action: 'message',
          color: 'green',
          icon: <MessageSquare className="h-4 w-4 mr-1" />,
          onClick: () => alert(t('bookings.messagingComingSoon'))
        });
      }
      
      if (booking.status === 'pending_review') {
        actions.push(
          { 
            label: t('bookings.approveBooking'), 
            action: 'approved', 
            color: 'blue',
            icon: <CheckCircle className="h-4 w-4 mr-1" />,
            onClick: () => handleUpdateStatus('approved')
          },
          { 
            label: t('bookings.rejectBooking'), 
            action: 'cancelled', 
            color: 'red',
            icon: <XCircle className="h-4 w-4 mr-1" />,
            onClick: () => handleUpdateStatus('cancelled')
          }
        );
      } else if (booking.status === 'approved') {
        const nextStatus = booking.service_type === 'rental' ? 'active' : 'in_transit';
        const actionLabel = booking.service_type === 'rental' ? t('bookings.startRental') : t('bookings.startTrip');
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
          label: t('bookings.deleteBooking'),
          action: 'delete',
          color: 'red',
          icon: <Trash2 className="h-4 w-4 mr-1" />,
          onClick: handleDeleteBooking
        });
      }
    }
    
    console.log('✅ Available actions:', actions.map(a => a.label).join(', '));
    return actions;
  }, [booking?.status, booking?.service_type, booking?.id, user?.role]); // Dependencies ensure recalculation

  const getButtonClasses = (color) => {
    const baseClasses = "inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";
    switch(color) {
      case 'blue':
        return `${baseClasses} bg-accent-500 hover:bg-accent-600 transition-colors disabled:bg-blue-400`;
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('bookings.bookingNotFound')}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('bookings.bookingNotFoundDesc')}</p>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors"
          >
            {t('bookings.backToBookings')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/bookings')}
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('bookings.backToBookings')}
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              {booking.service_type === 'rental' ? (
                <Settings className="h-8 w-8 text-orange-500 mr-3" />
              ) : (
                <Package className="h-8 w-8 text-primary-600 mr-3" />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {booking.service_type === 'rental' ? t('bookings.equipmentRental') : t('bookings.myBookings').replace(/s$/, '')} #{booking.reference || booking.id.slice(-8)}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('bookings.createdOn')} {new Date(booking.created_at).toLocaleDateString()} {t('bookings.at')} {new Date(booking.created_at).toLocaleTimeString()}
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
                      {t('bookings.rentalEquipment')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2" key={`actions-${booking.status}-${booking.id}`}>
              {availableActions.map((action, index) => {
                const isThisButtonUpdating = updatingAction === action.action;
                return (
                  <button
                    key={`${booking.status}-${action.action}-${action.label}-${index}`}
                    onClick={action.onClick || (() => action.path && navigate(action.path))}
                    disabled={isThisButtonUpdating}
                    className={`${getButtonClasses(action.color)} pointer-events-auto`}
                  >
                    {isThisButtonUpdating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      action.icon && <span className="mr-1">{action.icon}</span>
                    )}
                    {isThisButtonUpdating ? 'Updating...' : action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Information */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('bookings.routeInformation')}</h3>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.pickupLocation')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.pickup_address}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.pickup_city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.destination')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.destination_address}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{booking.destination_city}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.pickupDate')} & {t('bookings.pickupTime')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(booking.pickup_date).toLocaleDateString()}
                        {booking.pickup_time && ` ${t('bookings.at')} ${booking.pickup_time}`}
                      </p>
                    </div>
                  </div>

                  {booking.estimated_distance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{t('bookings.estimatedDuration')}:</span>
                      <span className="font-medium">{booking.estimated_distance} km</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cargo Information - Only for transport bookings */}
            {booking.service_type !== 'rental' && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('bookings.cargoInformation')}</h3>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.description')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{booking.cargo_description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Weight className="h-4 w-4 text-gray-400 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.weight')}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.cargo_weight?.toLocaleString()} kg</p>
                        </div>
                      </div>
                      
                      {booking.cargo_volume && (
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.volume')}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{booking.cargo_volume} m³</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.additionalNotes')}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rental Equipment Information */}
            {booking.service_type === 'rental' && (
              <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-orange-500 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Rental Equipment Details</h3>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.rental_start_datetime && (
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-green-500 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Rental Start</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(booking.rental_start_datetime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {booking.rental_end_datetime && (
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Rental End</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
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
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Work Location</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.work_address}</p>
                        </div>
                      </div>
                    )}

                    {booking.purpose_description && (
                      <div className="flex items-start">
                        <FileText className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Purpose</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.purpose_description}</p>
                        </div>
                      </div>
                    )}

                    {booking.operator_required !== undefined && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Operator Required</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {booking.operator_required ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>
                    )}

                    {booking.rental_start_datetime && booking.rental_end_datetime && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Rental Duration:</span>
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
                        <MessageSquare className="h-4 w-4 text-gray-400 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('bookings.additionalNotes')}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Truck Information */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {booking.service_type === 'rental' ? t('bookings.equipmentInformation') : t('bookings.truckInformation')}
                </h3>
              </div>
              <div className="px-6 py-6">
                <div className="flex items-center mb-4">
                  {booking.service_type === 'rental' ? (
                    <Settings className="h-8 w-8 text-orange-600" />
                  ) : (
                    <Truck className="h-8 w-8 text-primary-600" />
                  )}
                  <div className="ml-4">
                    <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {booking.truck_license_plate || booking.license_plate || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.truck_make && booking.truck_model 
                        ? `${booking.truck_make} ${booking.truck_model}` 
                        : 'Make & Model N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Vehicle Type */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.type')}:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {booking.truck_type || 'N/A'}
                    </span>
                  </div>
                  
                  {/* Capacity Weight */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.service_type === 'rental' ? t('bookings.operatingWeight') : t('bookings.capacity')}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(booking.truck_capacity?.toLocaleString() || booking.capacity_weight?.toLocaleString() || 'N/A')} 
                      {(booking.truck_capacity || booking.capacity_weight) && ' kg'}
                    </span>
                  </div>
                  
                  {/* Year */}
                  {(booking.truck_year || booking.year) && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.year')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {booking.truck_year || booking.year}
                      </span>
                    </div>
                  )}
                  
                  {/* Volume Capacity */}
                  {(booking.capacity_volume) && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.volume')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {booking.capacity_volume} m³
                      </span>
                    </div>
                  )}
                  
                  {/* Pricing Information */}
                  {booking.pricing_type && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.pricingType')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {booking.pricing_type === 'fixed' ? t('bookings.fixedPrice') : t('bookings.perKilometer')}
                      </span>
                    </div>
                  )}
                  
                  {/* Price per km or Fixed price */}
                  {booking.pricing_type === 'per_km' && booking.price_per_km && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.rate')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${booking.price_per_km}/km
                      </span>
                    </div>
                  )}
                  
                  {booking.pricing_type === 'fixed' && booking.fixed_price && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t('bookings.fixedRate')}:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${booking.fixed_price}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('bookings.pricing')}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{t('bookings.basePrice')}:</span>
                  <span className="font-medium">${booking.total_price?.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('bookings.total')}:</span>
                    <span className="text-lg font-bold text-green-600">
                      ${booking.total_price?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {user.role === 'customer' ? t('bookings.providerContact') : t('bookings.customerContact')}
              </h3>
              <div className="space-y-4">
                {/* Company Name */}
                <div>
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-primary-600 mr-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('bookings.company')}</p>
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 ml-7">
                    {user.role === 'customer' 
                      ? (booking.provider_company || t('bookings.notProvided')) 
                      : (booking.customer_company || t('bookings.notProvided'))
                    }
                  </p>
                </div>
                
                {/* Contact Person Name */}
                <div>
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('bookings.contactPerson')}</p>
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 ml-7">
                    {user.role === 'customer' 
                      ? (booking.provider_name || `${booking.provider_first_name || ''} ${booking.provider_last_name || ''}`.trim() || t('bookings.notProvided'))
                      : (booking.customer_name || `${booking.customer_first_name || ''} ${booking.customer_last_name || ''}`.trim() || t('bookings.notProvided'))
                    }
                  </p>
                </div>
                
                {/* Phone Number */}
                <div>
                  <div className="flex items-center mb-2">
                    <Phone className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('bookings.phone')}</p>
                  </div>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 ml-7">
                    {user.role === 'customer' 
                      ? (booking.provider_phone || t('bookings.notProvided')) 
                      : (booking.customer_phone || t('bookings.notProvided'))
                    }
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => alert('Messaging feature coming soon!')}
                className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:bg-gray-900"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {t('bookings.sendMessage')}
              </button>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('bookings.timeline')}</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('bookings.bookingCreated')}</p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {new Date(booking.created_at).toLocaleDateString()} {t('bookings.at')} {new Date(booking.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                {booking.status !== 'pending_review' && (
                  <div className="flex items-center text-sm">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-600 rounded-full"></div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{t('bookings.statusChanged')}</p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {new Date(booking.updated_at).toLocaleDateString()} {t('bookings.at')} {new Date(booking.updated_at).toLocaleTimeString()}
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
