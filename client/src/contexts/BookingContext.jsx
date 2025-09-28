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
      setBookings(response.data.data?.bookings || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId, status, notes) => {
    const originalBookings = [...bookings];
    // Optimistic update
    setBookings(prev =>
      prev.map(b => (String(b.id) === String(bookingId) ? { ...b, status } : b))
    );

    try {
      const response = await apiClient.put(`/bookings/${bookingId}/status`, { status, notes });
      // Replace with data from server for consistency
      setBookings(prev =>
        prev.map(b => (String(b.id) === String(bookingId) ? response.data.data.booking : b))
      );
      return response.data;
    } catch (err) {
      console.error('Failed to update booking status:', err);
      setBookings(originalBookings); // Revert on error
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
    const originalBookings = [...bookings];
    // Optimistic update
    setBookings(prev => prev.filter(b => b.id !== bookingId));

    try {
      await apiClient.delete(`/bookings/${bookingId}`);
    } catch (err) {
      console.error('Failed to delete booking:', err);
      setBookings(originalBookings); // Revert on error
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
