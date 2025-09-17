import logger from './logger.js';

// Audit logging for security-sensitive operations
export const auditLogger = {
  // Log authentication events
  auth: (event, userId, details = {}) => {
    logger.info('AUDIT_AUTH', {
      event,
      userId,
      timestamp: new Date().toISOString(),
      ip: details.ip,
      userAgent: details.userAgent,
      success: details.success,
      reason: details.reason
    });
  },

  // Log data access events
  dataAccess: (resource, action, userId, details = {}) => {
    logger.info('AUDIT_DATA_ACCESS', {
      resource,
      action,
      userId,
      timestamp: new Date().toISOString(),
      resourceId: details.resourceId,
      ip: details.ip,
      success: details.success
    });
  },

  // Log administrative actions
  admin: (action, adminId, details = {}) => {
    logger.info('AUDIT_ADMIN', {
      action,
      adminId,
      timestamp: new Date().toISOString(),
      targetUserId: details.targetUserId,
      targetResource: details.targetResource,
      changes: details.changes,
      ip: details.ip
    });
  },

  // Log security events
  security: (event, details = {}) => {
    logger.warn('AUDIT_SECURITY', {
      event,
      timestamp: new Date().toISOString(),
      ip: details.ip,
      userAgent: details.userAgent,
      userId: details.userId,
      severity: details.severity || 'medium',
      description: details.description
    });
  },

  // Log file operations
  file: (operation, userId, details = {}) => {
    logger.info('AUDIT_FILE', {
      operation,
      userId,
      timestamp: new Date().toISOString(),
      filename: details.filename,
      fileSize: details.fileSize,
      fileType: details.fileType,
      success: details.success,
      ip: details.ip
    });
  },

  // Log booking operations
  booking: (operation, userId, details = {}) => {
    logger.info('AUDIT_BOOKING', {
      operation,
      userId,
      timestamp: new Date().toISOString(),
      bookingId: details.bookingId,
      truckId: details.truckId,
      statusChange: details.statusChange,
      amount: details.amount,
      ip: details.ip
    });
  }
};

export default auditLogger;
