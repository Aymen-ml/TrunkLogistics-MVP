import Notification from '../models/Notification.js';
import notificationService from '../services/notificationService.js';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, isRead, priority, limit, offset } = req.query;

    const options = {
      type,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      priority,
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    };

    const notifications = await notificationService.getUserNotifications(userId, options);

    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notifications'
    });
  }
};

export const getNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if user owns this notification
    if (notification.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    logger.error('Get notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notification'
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    const notification = await Notification.markAsRead(id, userId);

    logger.info(`Notification marked as read: ${id} by user ${req.user.email}`);

    res.json({
      success: true,
      data: { notification },
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error('Mark notification as read error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or access denied'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while marking notification as read'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.markAllAsReadForUser(userId);

    logger.info(`${count} notifications marked as read for user ${req.user.email}`);

    res.json({
      success: true,
      data: { count },
      message: `${count} notifications marked as read`
    });
  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while marking notifications as read'
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    const notification = await Notification.delete(id, userId);

    logger.info(`Notification deleted: ${id} by user ${req.user.email}`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or access denied'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while deleting notification'
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCountForUser(userId);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching unread count'
    });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    // Only admins can view all notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { type, priority, isRead, limit, offset } = req.query;

    const options = {
      type,
      priority,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    };

    const notifications = await Notification.getAll(options);

    res.json({
      success: true,
      data: { notifications }
    });
  } catch (error) {
    logger.error('Get all notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notifications'
    });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    logger.info('getNotificationStats called by user:', req.user);
    
    // Only admins can view notification statistics
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    logger.info('Calling Notification.getNotificationStats()');
    const stats = await Notification.getNotificationStats();
    logger.info('Stats result:', stats);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    logger.error('Get notification stats error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Check if it's a database schema issue
    if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
      logger.error('Database schema issue detected - missing column');
      return res.status(500).json({
        success: false,
        error: 'Database schema issue - notification table missing required columns',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while fetching notification statistics',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createSystemNotification = async (req, res) => {
  try {
    logger.info('createSystemNotification called by user:', req.user);
    logger.info('Request body:', req.body);
    
    // Only admins can create system notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Manual validation instead of relying on express-validator middleware
    const { message, priority = 'medium' } = req.body;
    
    logger.info('Parsed message:', message, 'priority:', priority);
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      });
    }
    
    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message must be less than 1000 characters'
      });
    }
    
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be low, medium, or high'
      });
    }

    logger.info('Calling notificationService.notifySystemMaintenance');
    const notifications = await notificationService.notifySystemMaintenance(message.trim(), priority);
    logger.info('Service result:', notifications ? notifications.length : 'null/undefined');

    logger.info(`System notification sent to ${notifications.length} users by admin ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: { 
        count: notifications.length,
        notifications: notifications.slice(0, 5) // Return first 5 as sample
      },
      message: `System notification sent to ${notifications.length} users`
    });
  } catch (error) {
    logger.error('Create system notification error:', error);
    logger.error('Error stack:', error.stack);
    logger.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Check if it's a database schema issue
    if (error.message && error.message.includes('column') && error.message.includes('does not exist')) {
      logger.error('Database schema issue detected - missing column');
      return res.status(500).json({
        success: false,
        error: 'Database schema issue - notification table missing required columns',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        hint: 'Please run the notification schema migration'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while creating system notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const testEmailService = async (req, res) => {
  try {
    // Only admins can test email service
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const emailService = (await import('../services/emailService.js')).default;
    const result = await emailService.testConnection();

    res.json({
      success: result.success,
      data: result,
      message: result.success ? 'Email service is working' : 'Email service connection failed'
    });
  } catch (error) {
    logger.error('Test email service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while testing email service'
    });
  }
};

export const cleanupOldNotifications = async (req, res) => {
  try {
    // Only admins can cleanup notifications
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const { daysOld = 90 } = req.query;
    const count = await notificationService.cleanupOldNotifications(parseInt(daysOld));

    logger.info(`${count} old notifications cleaned up by admin ${req.user.email}`);

    res.json({
      success: true,
      data: { count },
      message: `${count} old notifications cleaned up`
    });
  } catch (error) {
    logger.error('Cleanup notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while cleaning up notifications'
    });
  }
};
