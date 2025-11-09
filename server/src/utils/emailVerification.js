import { query } from '../config/database.js';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import emailService from '../services/emailService.js';

// List of commonly used disposable email domains
const disposableEmailDomains = [
  'tempmail.com',
  'throwawaymail.com',
  'mailinator.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'sharklasers.com'
];

// Email verification now uses the centralized emailService
// which handles SendGrid configuration

class EmailVerification {
  static async createVerificationToken(userId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await query(
      'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );

    return token;
  }

  static async verifyEmail(token) {
    const result = await query(
      'SELECT user_id, expires_at FROM email_verifications WHERE token = $1 AND verified_at IS NULL',
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired verification token');
    }

    const verification = result.rows[0];
    if (new Date(verification.expires_at) < new Date()) {
      throw new Error('Verification token has expired');
    }

    // Mark email as verified
    await query(
      'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1',
      [verification.user_id]
    );

    // Mark verification as completed
    await query(
      'UPDATE email_verifications SET verified_at = NOW() WHERE token = $1',
      [token]
    );

    return verification.user_id;
  }

  static async resendVerificationEmail(userId) {
    // Delete any existing unverified tokens
    await query(
      'DELETE FROM email_verifications WHERE user_id = $1 AND verified_at IS NULL',
      [userId]
    );

    // Create new token
    return await this.createVerificationToken(userId);
  }

  static async sendVerificationEmail(user, token) {
    try {
      const verificationUrl = `${process.env.CLIENT_URL || 'https://movelinker.com'}/verify-email/${token}`;

      const subject = 'Verify Your Email Address - movelinker';
      
      const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">movelinker</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Logistics Management Platform</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Welcome to movelinker!</h2>
            
            <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">Hello ${user.first_name || 'there'},</p>
            
            <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">
              Thank you for registering with movelinker! We're excited to have you join our logistics management platform.
            </p>
            
            <p style="margin-bottom: 30px; color: #374151; line-height: 1.6;">
              To complete your account setup and start using all features, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="
                display: inline-block;
                background-color: #059669;
                color: white;
                padding: 14px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                letter-spacing: 0.5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              ">Verify Email Address</a>
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
              <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
                <strong>Alternative method:</strong> If the button above doesn't work, copy and paste this secure link into your browser:
              </p>
              <p style="margin: 10px 0 0 0; color: #2563eb; font-size: 13px; word-break: break-all; font-family: monospace;">
                ${verificationUrl}
              </p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
            <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
              <strong>⏰ Important:</strong> This verification link will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 0 0 5px 0;">If you did not create an account with movelinker, please ignore this email.</p>
            <p style="margin: 0 0 5px 0;">© 2025 movelinker. All rights reserved.</p>
            <p style="margin: 0;">Need help? Contact us at support@movelinker.com</p>
          </div>
        </div>
      `;

      const result = await emailService.sendEmail(user.email, subject, html);
      
      if (result) {
        logger.info(`✅ Verification email sent successfully to ${user.email}`);
        return result;
      } else {
        logger.error(`❌ Failed to send verification email to ${user.email}`);
        return false;
      }
    } catch (error) {
      logger.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  static isDisposableEmail(email) {
    const domain = email.split('@')[1].toLowerCase();
    return disposableEmailDomains.includes(domain);
  }

  static isValidEmail(email) {
    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Check domain has valid MX record (requires DNS lookup)
    const domain = email.split('@')[1];
    return new Promise(async (resolve) => {
      try {
        const dns = await import('dns');
        dns.resolveMx(domain, (err) => {
          resolve(!err);
        });
      } catch (error) {
        resolve(true); // If DNS check fails, allow the email
      }
    });
  }
}

export default EmailVerification;