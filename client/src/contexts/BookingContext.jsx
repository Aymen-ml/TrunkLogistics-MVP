import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from './AuthContext';

const BookingContext = createContext();

export const useBookings = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchBookings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/bookings');
      const fetchedBookings = response.data.data?.bookings || [];
      console.log('✅ Fetched bookings:', fetchedBookings.length);
      setBookings(fetchedBookings);
    } catch (err) {
      console.error('❌ Failed to fetch bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId, status, notes = '') => {
    // Store previous state for rollback on error
    const previousBookings = [...bookings];
    
    try {
      console.log(`🔄 Updating booking ${bookingId} to status: ${status}`);
      
      // Optimistic UI update - update immediately for better UX
      setBookings(prevBookings => {
        return prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status, updated_at: new Date().toISOString() } 
            : booking
        );
      });
      console.log('⚡ Optimistic UI update applied');
      
      // Step 1: Update the status on the server
      await apiClient.put(`/bookings/${bookingId}/status`, { status, notes });
      console.log('✅ Status updated on server');
      
      // Step 2: Fetch the complete updated booking with all joined fields
      const bookingResponse = await apiClient.get(`/bookings/${bookingId}`);
      const updatedBooking = bookingResponse.data.data?.booking;
      
      if (!updatedBooking) {
        throw new Error('Failed to fetch updated booking');
      }
      
      console.log('✅ Fetched complete updated booking:', updatedBooking);
      
      // Step 3: Update the local state with complete server data
      setBookings(prevBookings => {
        const newBookings = prevBookings.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        );
        console.log('✅ Local state updated with complete data, bookings count:', newBookings.length);
        return newBookings;
      });
      
      console.log('✅ Booking status update complete');
      return { success: true, booking: updatedBooking };
      
    } catch (err) {
      console.error('❌ Failed to update booking status:', err);
      console.error('Error details:', err.response?.data || err.message);
      
      // Rollback optimistic update
      console.log('⏪ Rolling back optimistic update...');
      setBookings(previousBookings);
      
      // On error, refetch all bookings to ensure consistency
      console.log('🔄 Refetching all bookings due to error...');
      await fetchBookings();
      
      throw err;
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      const newBooking = response.data.data.booking;
      
      // Add the new booking to the beginning of the list
      setBookings(prev => [newBooking, ...prev]);
      
      return newBooking;
    } catch (err) {
      console.error('Failed to create booking:', err);
      throw err;
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      await apiClient.delete(`/bookings/${bookingId}`);
      
      // Remove the booking from local state
      setBookings(prev => prev.filter(b => b.id !== bookingId));
      
    } catch (err) {
      console.error('Failed to delete booking:', err);
      throw err;
    }
  };

  const value = {
    bookings,
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
    createBooking,
    deleteBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
