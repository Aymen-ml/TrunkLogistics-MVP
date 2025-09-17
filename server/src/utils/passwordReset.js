import crypto from 'crypto';
import { query } from '../config/database.js';
import logger from './logger.js';

class PasswordReset {
  // Generate a secure random token
  static generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create a password reset token for a user
  static async createResetToken(userId) {
    try {
      // First, invalidate any existing tokens for this user
      await query(
        'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND used_at IS NULL',
        [userId]
      );

      // Generate new token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Insert new token
      const result = await query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [userId, token, expiresAt]
      );

      logger.info(`Password reset token created for user ${userId}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating password reset token:', error);
      throw error;
    }
  }

  // Verify and get token information
  static async verifyToken(token) {
    try {
      const result = await query(
        `SELECT prt.*, u.email, u.first_name, u.last_name 
         FROM password_reset_tokens prt
         JOIN users u ON prt.user_id = u.id
         WHERE prt.token = $1 
         AND prt.used_at IS NULL 
         AND prt.expires_at > CURRENT_TIMESTAMP`,
        [token]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error verifying password reset token:', error);
      throw error;
    }
  }

  // Mark token as used
  static async markTokenAsUsed(token) {
    try {
      const result = await query(
        'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = $1 RETURNING *',
        [token]
      );

      if (result.rows.length === 0) {
        throw new Error('Token not found');
      }

      logger.info(`Password reset token marked as used: ${token}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error marking token as used:', error);
      throw error;
    }
  }

  // Clean up expired tokens (can be run as a scheduled job)
  static async cleanupExpiredTokens() {
    try {
      const result = await query(
        'DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL'
      );

      logger.info(`Cleaned up ${result.rowCount} expired/used password reset tokens`);
      return result.rowCount;
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      throw error;
    }
  }

  // Check if user has recent reset request (to prevent spam)
  static async hasRecentResetRequest(userId, minutesAgo = 5) {
    try {
      const result = await query(
        `SELECT COUNT(*) as count 
         FROM password_reset_tokens 
         WHERE user_id = $1 
         AND created_at > CURRENT_TIMESTAMP - INTERVAL '${minutesAgo} minutes'`,
        [userId]
      );

      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      logger.error('Error checking recent reset requests:', error);
      throw error;
    }
  }
}

export default PasswordReset;
