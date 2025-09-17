import express from 'express';
import { 
  createProfile, 
  getProfile, 
  updateProfile, 
  getAllUsers, 
  toggleUserStatus, 
  verifyProvider,
  getProviderDetails,
  deleteUser
} from '../controllers/userController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { 
  validateProfileCreate, 
  validateUUID, 
  validateUserStatusToggle, 
  validateProviderVerification 
} from '../middleware/validation.js';

const router = express.Router();

// GET /api/users - Get all users (admin only)
router.get('/', authenticate, requireAdmin, getAllUsers);

// POST /api/users/profile - Create user profile
router.post('/profile', authenticate, validateProfileCreate, createProfile);

// GET /api/users/profile - Get user profile
router.get('/profile', authenticate, getProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', authenticate, validateProfileCreate, updateProfile);

// PUT /api/users/:id/status - Toggle user active status (admin only)
router.put('/:id/status', authenticate, requireAdmin, validateUUID, validateUserStatusToggle, toggleUserStatus);
router.delete('/:id', authenticate, requireAdmin, validateUUID, deleteUser);

// GET /api/users/providers/:id/profile - Get provider details (admin only)
router.get('/providers/:id/profile', authenticate, requireAdmin, validateUUID, getProviderDetails);

// PUT /api/users/providers/:id/verify - Verify provider (admin only)
router.put('/providers/:id/verify', authenticate, requireAdmin, validateUUID, validateProviderVerification, verifyProvider);

export default router;
