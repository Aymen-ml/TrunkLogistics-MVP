import express from 'express';
import emailService from '../services/emailService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Test endpoint to check email service configuration
router.get('/test-email-config', async (req, res) => {
  try {
    // Check if email service is configured
    const testResult = await emailService.testConnection();
    
    const config = {
      emailService: process.env.EMAIL_SERVICE || 'default',
      smtpHost: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'not configured',
      smtpPort: process.env.SMTP_PORT || process.env.EMAIL_PORT || 'not configured',
      smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER || 'not configured',
      smtpSecure: process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'not configured',
      emailFrom: process.env.EMAIL_FROM || 'not configured',
      emailFromName: process.env.EMAIL_FROM_NAME || 'not configured',
      hasTransporter: !!emailService.transporter
    };

    res.json({
      success: true,
      emailServiceTest: testResult,
      configuration: config
    });
  } catch (error) {
    logger.error('Email test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to send a test email
router.post('/send-test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address required'
      });
    }

    console.log('Attempting to send test email to:', email);
    console.log('Email service configuration:', {
      service: process.env.EMAIL_SERVICE,
      hasApiKey: !!process.env.SENDGRID_API_KEY,
      apiKeyPrefix: process.env.SENDGRID_API_KEY ? process.env.SENDGRID_API_KEY.substring(0, 10) + '...' : 'not set',
      emailFrom: process.env.EMAIL_FROM,
      hasTransporter: !!emailService.transporter
    });

    const result = await emailService.sendEmail(
      email,
      'Test Email from TrunkLogistics',
      '<h2>Test Email</h2><p>This is a test email to verify email service is working.</p>',
      'Test Email - This is a test email to verify email service is working.'
    );

    console.log('Email send result:', result);

    res.json({
      success: !!result,
      message: result ? 'Test email sent successfully' : 'Failed to send test email',
      result: result,
      debug: {
        hasTransporter: !!emailService.transporter,
        emailService: process.env.EMAIL_SERVICE,
        hasApiKey: !!process.env.SENDGRID_API_KEY
      }
    });
  } catch (error) {
    console.error('Test email send error:', error);
    logger.error('Test email send error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
