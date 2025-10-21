import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../contexts/BookingContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Settings,
  Package
} from 'lucide-react';

/**
 * MINIMAL TEST COMPONENT - BookingDetailTest
 * 
 * This is a simplified version of BookingDetail to test the button lag fix in isolation.
 * 
 * Key Features Being Tested:
 * 1. Per-action updating (only clicked button disables)
 * 2. Container key forces remount on status change
 * 3. useMemo recalculates actions when status changes
 * 4. No blocking refetch after update
 * 5. pointer-events-auto ensures clickability
 * 
 * If this works without lag, we'll apply the same pattern to the full component.
 */

const BookingDetailTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, loading, updateBookingStatus } = useBookings();
  const { showSuccess, showError } = useToast();
  
  const [updatingAction, setUpdatingAction] = useState(null);
  const [localBooking, setLocalBooking] = useState(null);

  // Find and cache booking locally
  useEffect(() => {
    const foundBooking = bookings.find(b => b.id === id);
    if (foundBooking) {
      setLocalBooking(foundBooking);
      console.log('🧪 TEST - Booking updated:', foundBooking.status);
    }
  }, [bookings, id]);

  const booking = localBooking;

  // Handle status update
  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Update status to ${newStatus}?`)) return;

    setUpdatingAction(newStatus);
    try {
      console.log('🧪 TEST - Updating to:', newStatus);
      
      const result = await updateBookingStatus(id, newStatus, `Status updated to ${newStatus}`);
      
      // Update local state immediately
      if (result?.booking) {
        setLocalBooking(result.booking);
        console.log('🧪 TEST - Local updated:', result.booking.status);
      }
      
      // Small delay for React render
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Clear updating state IMMEDIATELY
      setUpdatingAction(null);
      console.log('🧪 TEST - Cleared updating, buttons should be clickable');
      
      showSuccess(`Status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('🧪 TEST - Error:', error);
      showError(`Failed to update: ${error.message}`);
      setUpdatingAction(null);
    }
  };

  // Memoized actions that recalculate when status changes
  const availableActions = useMemo(() => {
    if (!booking || !user) return [];
    
    console.log('🧪 TEST - Recalculating actions for status:', booking.status);
    
    const actions = [];

    if (user?.role === 'provider') {
      if (booking.status === 'pending_review') {
        actions.push({
          label: 'Approve',
          action: 'approved',
          color: 'blue',
          onClick: () => handleUpdateStatus('approved')
        });
        actions.push({
          label: 'Reject',
          action: 'cancelled',
          color: 'red',
          onClick: () => handleUpdateStatus('cancelled')
        });
      } else if (booking.status === 'approved') {
        const nextStatus = booking.service_type === 'rental' ? 'active' : 'in_transit';
        const label = booking.service_type === 'rental' ? 'Start Rental' : 'Start Trip';
        actions.push({
          label,
          action: nextStatus,
          color: 'purple',
          onClick: () => handleUpdateStatus(nextStatus)
        });
      }
    }

    console.log('🧪 TEST - Available actions:', actions.map(a => a.label).join(', '));
    return actions;
  }, [booking?.status, booking?.service_type, booking?.id, user?.role]);

  const getButtonClass = (color, isUpdating) => {
    const base = "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors pointer-events-auto";
    const disabled = "opacity-50 cursor-not-allowed";
    
    const colors = {
      blue: 'bg-accent-500 hover:bg-accent-600 transition-colors text-white',
      red: 'bg-red-600 hover:bg-red-700 text-white',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white',
      green: 'bg-green-600 hover:bg-green-700 text-white'
    };
    
    return `${base} ${colors[color] || colors.blue} ${isUpdating ? disabled : ''}`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-purple-100 text-purple-800',
      active: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please log in to view this booking.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Booking not found</h2>
          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-md text-white bg-accent-500 hover:bg-accent-600 transition-colors"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Test Badge */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>TEST MODE:</strong> This is a minimal test component to verify button behavior works without lag.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/bookings')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Bookings
        </button>

        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {booking.service_type === 'rental' ? (
                <Settings className="h-8 w-8 text-orange-500 mr-3" />
              ) : (
                <Package className="h-8 w-8 text-primary-600 mr-3" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Test Booking #{booking.id.slice(-8)}
                </h1>
                <p className="text-sm text-gray-500">
                  Service: {booking.service_type || 'transport'}
                </p>
              </div>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          {/* ACTION BUTTONS - KEY AREA BEING TESTED */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">
              <strong>Current Status:</strong> {booking.status}
            </p>
            
            {/* Container with key that forces remount on status change */}
            <div 
              className="flex flex-wrap gap-3" 
              key={`test-actions-${booking.status}-${booking.id}`}
            >
              {availableActions.length === 0 ? (
                <p className="text-sm text-gray-500">No actions available for this status</p>
              ) : (
                availableActions.map((action, index) => {
                  const isThisButtonUpdating = updatingAction === action.action;
                  return (
                    <button
                      key={`${booking.status}-${action.action}-${index}`}
                      onClick={action.onClick}
                      disabled={isThisButtonUpdating}
                      className={getButtonClass(action.color, isThisButtonUpdating)}
                    >
                      {isThisButtonUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        action.label
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-xs">
          <p className="text-green-400 font-bold mb-2">🧪 DEBUG INFO (Check Console):</p>
          <p>Booking ID: {booking.id}</p>
          <p>Current Status: {booking.status}</p>
          <p>Service Type: {booking.service_type || 'transport'}</p>
          <p>Updating Action: {updatingAction || 'none'}</p>
          <p>Available Actions: {availableActions.map(a => a.label).join(', ') || 'none'}</p>
          <p className="mt-2 text-yellow-300">
            👆 Click a button above and watch it change immediately!
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-bold text-blue-900 mb-2">Testing Instructions:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Open browser console (F12) to see debug logs</li>
            <li>Click "Approve" button if status is pending_review</li>
            <li>Watch the status change and new button appear</li>
            <li><strong>Try to click the new button IMMEDIATELY</strong> - it should work!</li>
            <li>No lag, no need to refresh, instant response</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailTest;
