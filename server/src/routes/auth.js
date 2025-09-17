import express from 'express';
import {
  register, 
  login,
  getProfile,
  updateProfile,
  logout,
  verifyEmail,
  resendVerification,
  updatePassword,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole } from '../middleware/authorization.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRequest, validateRegister, validateLogin, validateProfileUpdate, validateProviderRegistration, validateForgotPassword, validateResetPassword } from '../middleware/validation.js';
import { uploadFiles } from '../middleware/fileUpload.js';

const router = express.Router();

// Initial registration
router.post('/register', authLimiter, validateRegister, validateRequest, register);

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, validateRequest, login);

// GET /api/auth/profile
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/profile
router.put('/profile', authenticate, validateProfileUpdate, validateRequest, updateProfile);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// PUT /api/auth/password
router.put('/password', authenticate, updatePassword);

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', verifyEmail);

// POST /api/auth/resend-verification
router.post('/resend-verification', authenticate, resendVerification);

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, validateForgotPassword, validateRequest, forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', authLimiter, validateResetPassword, validateRequest, resetPassword);

export default router;
