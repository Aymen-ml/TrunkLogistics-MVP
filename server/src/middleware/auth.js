import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization;
    
    // Enhanced logging for document requests
    const isDocumentRequest = req.url.includes('/documents/');
    
    if (isDocumentRequest) {
      logger.info('Document request authentication attempt:', {
        url: req.url,
        method: req.method,
        hasAuthHeader: !!authHeader,
        authHeaderFormat: authHeader ? (authHeader.startsWith('Bearer ') ? 'valid' : 'invalid') : 'none',
        userAgent: req.headers['user-agent']?.substring(0, 100)
      });
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: No token provided or invalid format', {
        url: req.url,
        hasAuthHeader: !!authHeader,
        authHeaderStart: authHeader?.substring(0, 20)
      });
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (isDocumentRequest) {
      logger.info('Document request token info:', {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20),
        tokenEnd: token.substring(token.length - 20)
      });
    }
    
    try {
      const decoded = verifyToken(token);
      
      if (isDocumentRequest) {
        logger.info('Document request token decoded:', {
          userId: decoded.id,
          exp: decoded.exp,
          iat: decoded.iat,
          currentTime: Math.floor(Date.now() / 1000),
          isExpired: decoded.exp < Math.floor(Date.now() / 1000)
        });
      }
      
      // Get user from database
      const user = await User.findById(decoded.id);
      
      if (!user) {
        if (isDocumentRequest) {
          logger.error('Document request: User not found in database', {
            decodedUserId: decoded.id
          });
        }
        return res.status(401).json({
          success: false,
          error: 'Invalid token. User not found.'
        });
      }

      if (!user.is_active) {
        if (isDocumentRequest) {
          logger.error('Document request: User account deactivated', {
            userId: user.id,
            userEmail: user.email
          });
        }
        return res.status(401).json({
          success: false,
          error: 'Account is deactivated.'
        });
      }

      req.user = user;
      
      // Debug logging for document requests
      if (isDocumentRequest) {
        logger.info('Document request authentication SUCCESS:', {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          requestUrl: req.url,
          requestMethod: req.method
        });
      }
      
      next();
    } catch (tokenError) {
      if (isDocumentRequest) {
        logger.error('Document request token verification failed:', {
          error: tokenError.message,
          tokenLength: token.length,
          tokenStart: token.substring(0, 20)
        });
        
        // For document requests, provide more helpful error handling
        // Check if it's a token expiration issue
        if (tokenError.message.includes('expired') || tokenError.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            error: 'Token expired. Please refresh your session.',
            code: 'TOKEN_EXPIRED'
          });
        }
      }
      
      logger.error('Token verification failed:', tokenError);
      return res.status(401).json({
        success: false,
        error: 'Authentication failed'
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
