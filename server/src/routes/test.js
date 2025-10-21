import express from 'express';
import emailService from '../services/emailService.js';
import EmailVerification from '../utils/emailVerification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Test email service
router.post('/test-email', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    // Test email service connection
    const connectionTest = await emailService.testConnection();
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured properly',
        details: connectionTest.error
      });
    }

    // Send test email
    const result = await emailService.sendEmail(
      email,
      'Test Email - TruckLogistics',
      `
        <h2>Email Service Test</h2>
        <p>This is a test email from TruckLogistics.</p>
        <p>If you received this, the email service is working correctly!</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    );

    if (result) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        details: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Test verification email
router.post('/test-verification', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // Create verification token
    const token = await EmailVerification.createVerificationToken(user.id);
    
    // Send verification email
    const result = await EmailVerification.sendVerificationEmail(user, token);
    
    if (result) {
      res.json({
        success: true,
        message: 'Verification email sent successfully',
        token: token // For testing purposes
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send verification email'
      });
    }
  } catch (error) {
    console.error('Test verification email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
});

export default router;
