import { query } from '../config/database.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

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

// Email configuration - update these with your email service settings
const emailConfig = {
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true' || process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD
  }
};

let transporter = null;

// Initialize transporter with error handling
try {
  if (emailConfig.auth.user && emailConfig.auth.pass) {
    transporter = nodemailer.createTransport(emailConfig);
    logger.info('Email transporter initialized for verification emails');
  } else {
    logger.warn('Email credentials not configured - verification emails will not be sent');
  }
} catch (error) {
  logger.error('Failed to initialize email transporter:', error);
}

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
    if (!transporter) {
      logger.warn('Email transporter not configured - cannot send verification email');
      return false;
    }

    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'TrunkLogistics'} <${process.env.EMAIL_FROM || 'noreply@trunklogistics.com'}>`,
      to: user.email,
      subject: 'Verify your email address - TrunkLogistics',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to TrunkLogistics!</h1>
            <p style="color: #6b7280; font-size: 16px;">Please verify your email address to complete your registration</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin-bottom: 20px; color: #374151;">Hello ${user.first_name || 'there'},</p>
            <p style="margin-bottom: 20px; color: #374151;">Thank you for registering with TrunkLogistics. To complete your account setup, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="
                background-color: #2563eb;
                border: none;
                color: white;
                padding: 15px 30px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                font-weight: bold;
                border-radius: 6px;
                cursor: pointer;
              ">Verify Email Address</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #2563eb; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
            <p>If you did not create an account with TrunkLogistics, please ignore this email.</p>
            <p style="margin-top: 20px;">Best regards,<br>The TrunkLogistics Team</p>
          </div>
        </div>
      `
    };

    try {
      const result = await transporter.sendMail(mailOptions);
      logger.info(`Verification email sent successfully to ${user.email}`);
      return result;
    } catch (error) {
      logger.error('Error sending verification email:', error);
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