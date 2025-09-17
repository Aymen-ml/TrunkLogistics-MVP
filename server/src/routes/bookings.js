import express from 'express';
import { 
  createBooking, 
  getBookings, 
  getBooking, 
  updateBookingStatus, 
  updateBooking,
  deleteBooking,
  getBookingStats,
  getPriceEstimate,
  getRentalPriceEstimate
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  validateBookingCreate, 
  validateBookingStatusUpdate,
  validateBookingUpdate,
  validateUUID,
  validateRequest
} from '../middleware/validation.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// GET /api/bookings - Get user's bookings
router.get('/', authenticate, getBookings);

// GET /api/bookings/price-estimate - Get price estimate for a route
router.get('/price-estimate', authenticate, getPriceEstimate);

// GET /api/bookings/rental-price-estimate - Get rental price estimate
router.get('/rental-price-estimate', authenticate, getRentalPriceEstimate);

// GET /api/bookings/stats - Get booking statistics (admin only)
router.get('/stats', authenticate, getBookingStats);

// POST /api/bookings - Create booking request
router.post('/', authenticate, bookingLimiter, validateBookingCreate, validateRequest, createBooking);

// GET /api/bookings/:id - Get booking details
router.get('/:id', authenticate, validateUUID, validateRequest, getBooking);

// PUT /api/bookings/:id - Update booking details
router.put('/:id', authenticate, validateUUID, validateBookingUpdate, validateRequest, updateBooking);

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', authenticate, validateUUID, validateBookingStatusUpdate, validateRequest, updateBookingStatus);

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', authenticate, validateUUID, validateRequest, deleteBooking);

export default router;
