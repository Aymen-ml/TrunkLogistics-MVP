import express from 'express';
import emailService from '../services/emailService.js';

const router = express.Router();

/**
 * GET /api/diagnostics/email
 * Check email service configuration status
 */
router.get('/email', (req, res) => {
  try {
    const config = {
      hasTransporter: !!emailService.transporter,
      hasResend: !!emailService.resend,
      configuration: {
        EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'default SMTP',
        EMAIL_HOST: process.env.EMAIL_HOST || 'not set',
        EMAIL_PORT: process.env.EMAIL_PORT || 'not set',
        EMAIL_SECURE: process.env.EMAIL_SECURE || 'not set',
        hasEMAIL_USER: !!process.env.EMAIL_USER,
        hasEMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
        hasRESEND_API_KEY: !!process.env.RESEND_API_KEY,
        hasEMAIL_FROM: !!process.env.EMAIL_FROM,
        EMAIL_FROM: process.env.EMAIL_FROM || 'not set',
        CLIENT_URL: process.env.CLIENT_URL || 'not set'
      },
      status: (emailService.resend || emailService.transporter) ? 'configured' : 'NOT CONFIGURED'
    };

    res.json({
      success: true,
      emailService: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/diagnostics/test-email
 * Send a test email (use with caution in production)
 */
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    if (!emailService.transporter && !emailService.resend) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured',
        details: {
          hasRESEND_API_KEY: !!process.env.RESEND_API_KEY,
          hasEMAIL_USER: !!process.env.EMAIL_USER,
          hasEMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
          EMAIL_HOST: process.env.EMAIL_HOST || 'not set',
          EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'not set'
        }
      });
    }

    const testHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Test Email from movelinker</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Host: ${process.env.EMAIL_HOST}</li>
          <li>Port: ${process.env.EMAIL_PORT}</li>
          <li>From: ${process.env.EMAIL_FROM}</li>
        </ul>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
      </div>
    `;

    await emailService.sendEmail(
      email,
      'Test Email - movelinker',
      testHtml
    );

    res.json({
      success: true,
      message: `Test email sent to ${email}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      details: {
        hasResend: !!emailService.resend,
        hasTransporter: !!emailService.transporter,
        hasRESEND_API_KEY: !!process.env.RESEND_API_KEY,
        hasEMAIL_USER: !!process.env.EMAIL_USER,
        hasEMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD
      }
    });
  }
});

export default router;
