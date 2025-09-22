import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * Special authentication middleware for document requests
 * More lenient than regular auth to avoid blocking providers
 */
export const documentAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Log the request for debugging
    logger.info('Document authentication attempt:', {
      url: req.url,
      method: req.method,
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'valid' : 'invalid') : 'none'
    });
    
    // If no auth header, allow the request to proceed
    // The controller will handle access control
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Document request without auth header - allowing to proceed:', {
        url: req.url
      });
      req.user = null; // No user, but let the request continue
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = verifyToken(token);
      
      // Try to get user from database
      const user = await User.findById(decoded.id);
      
      if (user && user.is_active) {
        req.user = user;
        logger.info('Document request authenticated:', {
          userId: user.id,
          userRole: user.role,
          url: req.url
        });
      } else {
        // User not found or inactive, but don't block the request
        logger.warn('Document request - user not found or inactive:', {
          decodedUserId: decoded.id,
          url: req.url
        });
        req.user = null;
      }
      
      next();
    } catch (tokenError) {
      // Token verification failed - could be expired or invalid
      logger.warn('Document request token verification failed:', {
        error: tokenError.message,
        url: req.url
      });
      
      // Don't block the request, just proceed without user
      req.user = null;
      next();
    }
  } catch (error) {
    logger.error('Document auth middleware error:', error);
    // Even on error, don't block the request
    req.user = null;
    next();
  }
};

/**
 * Alternative: Completely bypass authentication for document viewing
 * Use this if you want documents to be publicly accessible
 */
export const publicDocumentAccess = (req, res, next) => {
  logger.info('Public document access (no auth required):', {
    url: req.url,
    method: req.method
  });
  req.user = null;
  next();
};
