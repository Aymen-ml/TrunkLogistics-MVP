import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    try {
      logger.info('Initializing email service...', {
        emailService: process.env.EMAIL_SERVICE,
        hasSendGridKey: !!process.env.SENDGRID_API_KEY,
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        hasEmailHost: !!process.env.EMAIL_HOST,
        emailHost: process.env.EMAIL_HOST,
        emailPort: process.env.EMAIL_PORT,
        emailSecure: process.env.EMAIL_SECURE
      });

      // Configure email transporter based on environment
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        logger.info('Gmail email service configured');
      } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY environment variable is required for SendGrid service');
        }
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        logger.info('SendGrid email service configured');
      } else {
        // Default SMTP configuration - support both SMTP_ and EMAIL_ prefixes
        const smtpConfig = {
          host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
          secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
          auth: {
            user: process.env.SMTP_USER || process.env.EMAIL_USER,
            pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
          }
        };
        
        logger.info('Configuring SMTP with:', {
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          hasUser: !!smtpConfig.auth.user,
          hasPassword: !!smtpConfig.auth.pass
        });
        
        if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
          logger.error('SMTP authentication credentials missing!', {
            hasUser: !!smtpConfig.auth.user,
            hasPassword: !!smtpConfig.auth.pass
          });
          throw new Error('EMAIL_USER and EMAIL_PASSWORD are required for SMTP');
        }
        
        this.transporter = nodemailer.createTransport(smtpConfig);
        logger.info('Default SMTP email service configured');
      }

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.transporter) {
      const errorMsg = 'Email service not configured - transporter is null';
      logger.error(errorMsg, {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        hasEmailHost: !!process.env.EMAIL_HOST
      });
      throw new Error(errorMsg);
    }

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'TrunkLogistics'} <${process.env.EMAIL_FROM || 'noreply@trunklogistics.com'}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      logger.info(`Attempting to send email to ${to}: ${subject}`);
      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${subject}`, { 
        messageId: result.messageId 
      });
      return result;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      throw error; // Throw instead of returning false
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Booking notification templates
  async sendBookingCreatedEmail(userEmail, userName, booking) {
    const subject = 'Booking Request Created - TrunkLogistics';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Request Created</h2>
        <p>Dear ${userName},</p>
        <p>Your booking request has been successfully created and is now pending review.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Pickup:</strong> ${booking.pickup_address}, ${booking.pickup_city}</p>
          <p><strong>Destination:</strong> ${booking.destination_address}, ${booking.destination_city}</p>
          <p><strong>Pickup Date:</strong> ${booking.pickup_date}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
        </div>
        
        <p>We will notify you once an admin reviews your request.</p>
        <p>Best regards,<br>TrunkLogistics Team</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendBookingStatusUpdateEmail(userEmail, userName, booking, oldStatus, newStatus) {
    const subject = `Booking ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - TrunkLogistics`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Status Update</h2>
        <p>Dear ${userName},</p>
        <p>Your booking status has been updated from <strong>${oldStatus}</strong> to <strong>${newStatus}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Route:</strong> ${booking.pickup_city} → ${booking.destination_city}</p>
          <p><strong>New Status:</strong> <span style="color: #059669; font-weight: bold;">${newStatus}</span></p>
        </div>
        
        ${this.getStatusMessage(newStatus)}
        
        <p>Best regards,<br>TrunkLogistics Team</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  getStatusMessage(status) {
    const messages = {
      approved: '<p style="color: #059669;">Great news! Your booking has been approved. The provider will confirm shortly.</p>',
      confirmed: '<p style="color: #059669;">Your booking is confirmed! The truck is assigned and ready for pickup.</p>',
      in_transit: '<p style="color: #2563eb;">Your cargo is now in transit. You can track the progress with your provider.</p>',
      completed: '<p style="color: #059669;">Your booking has been completed successfully. Thank you for using TrunkLogistics!</p>',
      cancelled: '<p style="color: #dc2626;">Your booking has been cancelled. If you have questions, please contact support.</p>'
    };
    
    return messages[status] || '<p>Your booking status has been updated.</p>';
  }

  async sendBookingConfirmationEmail(userEmail, userName, booking) {
    const subject = `Booking Confirmed - TrunkLogistics`;
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmed</h2>
        <p>Dear ${userName},</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${booking.id}</p>
          <p><strong>Pickup Location:</strong> ${booking.pickup_location}</p>
          <p><strong>Delivery Location:</strong> ${booking.delivery_location}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
        </div>
        
        <p>Thank you for using TrunkLogistics!</p>
      </div>
    `;
    
    await this.sendEmail(userEmail, subject, content);
  }

  // Provider verification templates
  async sendProviderVerificationEmail(userEmail, userName, status) {
    const subject = `Provider Account ${status.charAt(0).toUpperCase() + status.slice(1)} - TrunkLogistics`;
    const statusColor = status === 'approved' ? '#059669' : '#dc2626';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Provider Verification Update</h2>
        <p>Dear ${userName},</p>
        <p>Your provider account has been <strong style="color: ${statusColor};">${status}</strong>.</p>
        
        ${status === 'approved' 
          ? `
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
              <p style="color: #059669; font-weight: bold;">Congratulations!</p>
              <p>Your provider account is now active. You can start:</p>
              <ul>
                <li>Adding trucks to your fleet</li>
                <li>Receiving booking requests</li>
                <li>Managing your logistics operations</li>
              </ul>
            </div>
          `
          : `
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="color: #dc2626; font-weight: bold;">Account Not Approved</p>
              <p>Unfortunately, we cannot approve your provider account at this time. Please contact our support team for more information.</p>
            </div>
          `
        }
        
        <p>Best regards,<br>TrunkLogistics Team</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  // Welcome email template
  async sendWelcomeEmail(userEmail, userName, userRole) {
    const subject = 'Welcome to TrunkLogistics!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to TrunkLogistics!</h2>
        <p>Dear ${userName},</p>
        <p>Welcome to TrunkLogistics! Your account has been successfully created as a <strong>${userRole}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Next Steps</h3>
          ${userRole === 'customer' 
            ? `
              <ul>
                <li>Complete your company profile</li>
                <li>Browse available trucks</li>
                <li>Create your first booking request</li>
              </ul>
            `
            : userRole === 'provider'
            ? `
              <ul>
                <li>Complete your provider profile</li>
                <li>Upload required documents for verification</li>
                <li>Add trucks to your fleet once approved</li>
              </ul>
            `
            : `
              <ul>
                <li>Access the admin dashboard</li>
                <li>Review pending verifications</li>
                <li>Manage platform operations</li>
              </ul>
            `
          }
        </div>
        
        <p>If you have any questions, don't hesitate to contact our support team.</p>
        <p>Best regards,<br>TrunkLogistics Team</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendPasswordResetEmail(userEmail, userName, resetUrl) {
    const subject = 'Password Reset Request - TrunkLogistics';
    
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="color: #1f2937; margin: 0; font-size: 24px;">TrunkLogistics</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Logistics Management Platform</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Password Reset Request</h2>
          
          <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
          
          <p style="margin-bottom: 20px; color: #374151; line-height: 1.6;">
            You have requested to reset your password for your TrunkLogistics account. 
            This is a security-protected action to ensure your account remains safe.
          </p>
          
          <p style="margin-bottom: 30px; color: #374151; line-height: 1.6;">
            Please click the secure link below to create a new password. This link will expire in 60 minutes for your security.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="
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
            ">Reset Password Securely</a>
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6b7280;">
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">
              <strong>Alternative method:</strong> If the button above doesn't work, copy and paste this secure link into your browser:
            </p>
            <p style="margin: 10px 0 0 0; color: #2563eb; font-size: 13px; word-break: break-all; font-family: monospace;">
              ${resetUrl}
            </p>
          </div>
        </div>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 30px;">
          <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
            <strong>⚠️ Security Notice:</strong> If you did not request this password reset, please ignore this email. 
            Your account remains secure and no changes will be made.
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          <p style="margin: 0 0 5px 0;">This is an automated security email from TrunkLogistics</p>
          <p style="margin: 0 0 5px 0;">© 2025 TrunkLogistics. All rights reserved.</p>
          <p style="margin: 0;">Need help? Contact us at support@trunklogistics.com</p>
        </div>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  // Test email connectivity
  async testConnection() {
    if (!this.transporter) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection verified' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();
export default emailService;
