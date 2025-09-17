import express from 'express';
import { 
  getNotifications, 
  getNotification, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  getUnreadCount, 
  getAllNotifications, 
  getNotificationStats, 
  createSystemNotification, 
  testEmailService, 
  cleanupOldNotifications 
} from '../controllers/notificationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateUUID, validateSystemNotification } from '../middleware/validation.js';

const router = express.Router();

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticate, getUnreadCount);

// GET /api/notifications/all - Get all notifications (admin only)
router.get('/all', authenticate, requireAdmin, getAllNotifications);

// GET /api/notifications/stats - Get notification statistics (admin only)
router.get('/stats', authenticate, requireAdmin, getNotificationStats);

// POST /api/notifications/system - Create system notification (admin only)
router.post('/system', authenticate, requireAdmin, validateSystemNotification, createSystemNotification);

// GET /api/notifications/test-email - Test email service (admin only)
router.get('/test-email', authenticate, requireAdmin, testEmailService);

// DELETE /api/notifications/cleanup - Cleanup old notifications (admin only)
router.delete('/cleanup', authenticate, requireAdmin, cleanupOldNotifications);

// GET /api/notifications - Get user notifications
router.get('/', authenticate, getNotifications);

// GET /api/notifications/:id - Get single notification
router.get('/:id', authenticate, validateUUID, getNotification);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticate, validateUUID, markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', authenticate, markAllAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticate, validateUUID, deleteNotification);

export default router;
