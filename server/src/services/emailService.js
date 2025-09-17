import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  initialize() {
    try {
      // Configure email transporter based on environment
      if (process.env.EMAIL_SERVICE === 'gmail') {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
      } else {
        // Default SMTP configuration - support both SMTP_ and EMAIL_ prefixes
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587'),
          secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true',
          auth: {
            user: process.env.SMTP_USER || process.env.EMAIL_USER,
            pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
          }
        });
      }

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.transporter) {
      logger.warn('Email service not configured, skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME || 'TrunkLogistics'} <${process.env.EMAIL_FROM || 'noreply@trunklogistics.com'}>`,
        to,
        subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}: ${subject}`);
      return result;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return false;
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
    const subject = 'Reset Your Password - TrunkLogistics';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">🚛 TrunkLogistics</h1>
        </div>
        
        <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin-top: 0;">Reset Your Password</h2>
          
          <p style="margin-bottom: 20px; color: #374151;">Hello ${userName},</p>
          
          <p style="margin-bottom: 20px; color: #374151;">
            We received a request to reset your password for your TrunkLogistics account. 
            If you didn't make this request, you can safely ignore this email.
          </p>
          
          <p style="margin-bottom: 30px; color: #374151;">
            To reset your password, click the button below. This link will expire in 1 hour for security reasons.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="
              display: inline-block;
              background-color: #2563eb;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              font-size: 16px;
            ">Reset My Password</a>
          </div>
          
          <p style="margin-bottom: 20px; color: #6b7280; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="margin-bottom: 20px; color: #6b7280; font-size: 14px; word-break: break-all;">
            ${resetUrl}
          </p>
        </div>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 30px;">
          <p style="margin: 0; color: #dc2626; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this password reset, 
            please contact our support team immediately at support@trunklogistics.com
          </p>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 12px;">
          <p>This email was sent by TrunkLogistics</p>
          <p>© 2025 TrunkLogistics. All rights reserved.</p>
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
