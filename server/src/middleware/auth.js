import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided or invalid format');
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. User not found.'
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated.'
        });
      }

      req.user = user;
      
      // Debug logging for document requests
      if (req.url.includes('/documents/')) {
        logger.info('Document request authentication:', {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          requestUrl: req.url,
          requestMethod: req.method
        });
      }
      
      next();
    } catch (tokenError) {
      logger.error('Token verification failed:', tokenError);
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during authentication.'
    });
  }
};

// Middleware to check user role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Middleware to check if user is admin
export const requireAdmin = authorize('admin');

// Middleware to check if user is provider
export const requireProvider = authorize('provider');

// Middleware to check if user is customer
export const requireCustomer = authorize('customer');

// Middleware to check if user is provider or admin
export const requireProviderOrAdmin = authorize('provider', 'admin');
