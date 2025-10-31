import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  getProviderAnalytics, 
  getBookingAnalytics,
  getOperationalKPIs,
  getGeographicAnalytics,
  getPricingAnalytics,
  getPredictiveAnalytics,
  getCustomerAnalytics
} from '../controllers/analyticsController.js';

const router = express.Router();

// Phase 1: Essential Analytics
router.get('/provider', authenticate, authorize('provider'), getProviderAnalytics);
router.get('/provider/bookings', authenticate, authorize('provider'), getBookingAnalytics);

// Phase 2: Performance Optimization
router.get('/provider/kpis', authenticate, authorize('provider'), getOperationalKPIs);
router.get('/provider/geographic', authenticate, authorize('provider'), getGeographicAnalytics);
router.get('/provider/pricing', authenticate, authorize('provider'), getPricingAnalytics);

// Phase 3: Advanced Intelligence
router.get('/provider/predictive', authenticate, authorize('provider'), getPredictiveAnalytics);
router.get('/provider/customers', authenticate, authorize('provider'), getCustomerAnalytics);

export default router;
