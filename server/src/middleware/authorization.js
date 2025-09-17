/**
 * Role-based authorization middleware
 */
export const checkRole = (requiredRole) => {
  return (req, res, next) => {
    // User should be already authenticated at this point
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has the required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Insufficient permissions.'
      });
    }

    next();
  };
};