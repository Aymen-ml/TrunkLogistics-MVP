import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getProviderAnalytics, getBookingAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

// Provider analytics routes
router.get('/provider', authenticate, authorize(['provider']), getProviderAnalytics);
router.get('/provider/bookings', authenticate, authorize(['provider']), getBookingAnalytics);

export default router;
