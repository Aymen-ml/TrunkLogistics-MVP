import express from 'express';
import { validateProvider, getPendingProviders } from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole } from '../middleware/authorization.js';
import pkg from '../../../shared/constants/roles.js';
const { USER_ROLES } = pkg;

const router = express.Router();

// Protect all routes with admin authentication
router.use(authenticate);
router.use(checkRole(USER_ROLES.ADMIN));

// Provider validation routes
router.get('/providers/pending', getPendingProviders);
router.put('/providers/:providerId/validate', validateProvider);

export default router;