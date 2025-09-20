import { query } from '../config/database.js';
import logger from '../utils/logger.js';

class Notification {
  static async create(notificationData) {
    const {
      userId,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
      priority = 'medium'
    } = notificationData;

    const queryText = `
      INSERT INTO notifications (
        user_id, type, title, message, related_entity_type, 
        related_entity_id, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      userId, type, title, message, relatedEntityType, 
      relatedEntityId, priority
    ];

    try {
      const result = await query(queryText, values);
      logger.info(`Notification created: ${result.rows[0].id} for user ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  static async findById(id) {
    const queryText = `
      SELECT n.*, u.email, u.first_name, u.last_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE n.id = $1
    `;

    try {
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding notification by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId, options = {}) {
    let queryText = `
      SELECT * FROM notifications 
      WHERE user_id = $1
    `;

    const values = [userId];
    let paramCount = 1;

    if (options.type) {
      queryText += ` AND type = $${++paramCount}`;
      values.push(options.type);
    }

    if (options.isRead !== undefined) {
      queryText += ` AND is_read = $${++paramCount}`;
      values.push(options.isRead);
    }

    if (options.priority) {
      queryText += ` AND priority = $${++paramCount}`;
      values.push(options.priority);
    }

    queryText += ` ORDER BY created_at DESC`;

    const limit = options.limit || 50;
    const offset = options.offset || 0;

    queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(limit, offset);

    try {
      const result = await query(queryText, values);
      return result.rows;
    } catch (error) {
      logger.error('Error finding notifications by user ID:', error);
      throw error;
    }
  }

  static async markAsRead(id, userId = null) {
    let queryText = 'UPDATE notifications SET is_read = true, read_at = CURRENT_TIMESTAMP WHERE id = $1';
    let values = [id];

    if (userId) {
      queryText += ' AND user_id = $2';
      values.push(userId);
    }

    queryText += ' RETURNING *';

    try {
      const result = await query(queryText, values);
      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      logger.info(`Notification marked as read: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    const queryText = `
      UPDATE notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP 
      WHERE user_id = $1 AND is_read = false
    `;

    try {
      const result = await query(queryText, [userId]);
      const count = result.rowCount;
      
      logger.info(`${count} notifications marked as read for user ${userId}`);
      return count;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  static async delete(id, userId = null) {
    let queryText = 'DELETE FROM notifications WHERE id = $1';
    let values = [id];

    if (userId) {
      queryText += ' AND user_id = $2';
      values.push(userId);
    }

    queryText += ' RETURNING *';

    try {
      const result = await query(queryText, values);
      if (result.rows.length === 0) {
        throw new Error('Notification not found or access denied');
      }

      logger.info(`Notification deleted: ${id}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    const queryText = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false';

    try {
      const result = await query(queryText, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw error;
    }
  }

  static async getAll(options = {}) {
    let queryText = `
      SELECT n.*, u.email, u.first_name, u.last_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (options.type) {
      queryText += ` AND n.type = $${++paramCount}`;
      values.push(options.type);
    }

    if (options.priority) {
      queryText += ` AND n.priority = $${++paramCount}`;
      values.push(options.priority);
    }

    if (options.isRead !== undefined) {
      queryText += ` AND n.is_read = $${++paramCount}`;
      values.push(options.isRead);
    }

    queryText += ` ORDER BY n.created_at DESC`;

    const limit = options.limit || 100;
    const offset = options.offset || 0;

    queryText += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    values.push(limit, offset);

    try {
      const result = await query(queryText, values);
      return result.rows;
    } catch (error) {
      logger.error('Error getting all notifications:', error);
      throw error;
    }
  }

  static async getNotificationStats() {
    const queryText = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
        COUNT(CASE WHEN type = 'booking_status' THEN 1 END) as booking_notifications,
        COUNT(CASE WHEN type = 'document_verification' THEN 1 END) as document_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority,
        COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority,
        COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority
      FROM notifications
    `;

    try {
      const result = await query(queryText);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting notification statistics:', error);
      throw error;
    }
  }

  static async cleanupOldNotifications(daysOld = 90) {
    const queryText = `
      DELETE FROM notifications 
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      AND is_read = true
    `;

    try {
      const result = await query(queryText);
      const deletedCount = result.rowCount;
      
      logger.info(`Cleaned up ${deletedCount} old notifications`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }

  // Bulk create notifications for multiple users
  static async createBulk(notifications) {
    if (!notifications || notifications.length === 0) {
      return [];
    }

    const queryText = `
      INSERT INTO notifications (
        user_id, type, title, message, related_entity_type, 
        related_entity_id, priority
      ) VALUES ${notifications.map((_, i) => 
        `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`
      ).join(', ')}
      RETURNING *
    `;

    const values = notifications.flatMap(n => [
      n.userId, n.type, n.title, n.message, 
      n.relatedEntityType, n.relatedEntityId, n.priority || 'medium'
    ]);

    try {
      const result = await query(queryText, values);
      logger.info(`${result.rows.length} bulk notifications created`);
      return result.rows;
    } catch (error) {
      logger.error('Error creating bulk notifications:', error);
      throw error;
    }
  }
}

export default Notification;
