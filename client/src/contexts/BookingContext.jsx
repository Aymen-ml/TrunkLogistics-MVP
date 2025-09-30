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
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/bookings');
      console.log('Fetched bookings:', response.data.data?.bookings);
      setBookings(response.data.data?.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId, status, notes) => {
    try {
      console.log(`Updating booking ${bookingId} to ${status}`);
      const response = await apiClient.put(`/bookings/${bookingId}/status`, { status, notes });
      
      // Optimistically update the local state immediately
      const updatedBooking = response.data.data?.booking;
      if (updatedBooking) {
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.id === bookingId ? updatedBooking : booking
          )
        );
      }
      
      // Also fetch fresh data from server to ensure consistency
      await fetchBookings();
      console.log('Finished updating and fetching.');
      return response.data;
    } catch (err) {
      console.error('Failed to update booking status:', err);
      console.error('Full error object:', err.toJSON ? err.toJSON() : err);
      // Revert optimistic update on error by refetching
      await fetchBookings();
      throw err;
    }
  };

  const createBooking = async (bookingData) => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      const newBooking = response.data.data.booking;
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
      await fetchBookings();
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
