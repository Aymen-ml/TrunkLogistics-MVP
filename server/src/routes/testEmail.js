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
      'Test Email from movelinker',
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

// Test endpoint to send verification email
router.post('/send-verification-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address required'
      });
    }

    // Create a test user object
    const testUser = {
      id: 'test-user-id',
      email: email,
      first_name: 'Test',
      last_name: 'User'
    };

    // Import EmailVerification
    const { default: EmailVerification } = await import('../utils/emailVerification.js');
    
    console.log('🧪 Testing verification email for:', email);
    
    // Create verification token
    const token = 'test-verification-token-' + Date.now();
    
    // Send verification email
    const result = await EmailVerification.sendVerificationEmail(testUser, token);
    
    console.log('📧 Verification email result:', result);

    res.json({
      success: !!result,
      message: result ? 'Verification email sent successfully' : 'Failed to send verification email',
      result: result,
      debug: {
        user: testUser,
        token: token
      }
    });
  } catch (error) {
    console.error('❌ Verification email test error:', error);
    logger.error('Verification email test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Debug endpoint to check the full email verification flow
router.post('/debug-verification-flow', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address required'
      });
    }

    console.log('🔍 Debugging full verification flow for:', email);
    
    // Import required modules
    const { query } = await import('../config/database.js');
    const { default: EmailVerification } = await import('../utils/emailVerification.js');
    
    const debugResults = {
      steps: [],
      success: false,
      error: null
    };
    
    // Step 1: Test database connection
    try {
      const dbTest = await query('SELECT NOW() as current_time');
      debugResults.steps.push({
        step: 'database_connection',
        success: true,
        result: dbTest.rows[0].current_time
      });
      console.log('✅ Database connected');
    } catch (dbError) {
      debugResults.steps.push({
        step: 'database_connection',
        success: false,
        error: dbError.message
      });
      console.error('❌ Database connection failed:', dbError.message);
    }
    
    // Step 2: Check email_verifications table
    try {
      const tableCheck = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'email_verifications'
        ORDER BY ordinal_position
      `);
      debugResults.steps.push({
        step: 'table_structure',
        success: true,
        result: tableCheck.rows
      });
      console.log('✅ Table structure verified');
    } catch (tableError) {
      debugResults.steps.push({
        step: 'table_structure',
        success: false,
        error: tableError.message
      });
      console.error('❌ Table check failed:', tableError.message);
    }
    
    // Step 3: Try creating a verification token
    const testUserId = '123e4567-e89b-12d3-a456-426614174000';
    try {
      const token = await EmailVerification.createVerificationToken(testUserId);
      debugResults.steps.push({
        step: 'token_creation',
        success: true,
        result: token.substring(0, 10) + '...'
      });
      console.log('✅ Token created successfully');
      
      // Clean up
      await query('DELETE FROM email_verifications WHERE user_id = $1', [testUserId]);
      console.log('🧹 Test token cleaned up');
    } catch (tokenError) {
      debugResults.steps.push({
        step: 'token_creation',
        success: false,
        error: tokenError.message
      });
      console.error('❌ Token creation failed:', tokenError.message);
    }
    
    // Step 4: Test email sending
    const testUser = {
      id: 'debug-user-id',
      email: email,
      first_name: 'Debug',
      last_name: 'User'
    };
    
    try {
      const testToken = 'debug-token-' + Date.now();
      const emailResult = await EmailVerification.sendVerificationEmail(testUser, testToken);
      debugResults.steps.push({
        step: 'email_sending',
        success: !!emailResult,
        result: emailResult
      });
      console.log('📧 Email send result:', emailResult);
    } catch (emailError) {
      debugResults.steps.push({
        step: 'email_sending',
        success: false,
        error: emailError.message
      });
      console.error('❌ Email sending failed:', emailError.message);
    }
    
    // Step 5: Check recent registrations
    try {
      const recentUsers = await query(`
        SELECT u.id, u.email, u.created_at, u.email_verified,
               ev.token, ev.created_at as token_created, ev.expires_at
        FROM users u
        LEFT JOIN email_verifications ev ON u.id = ev.user_id
        WHERE u.created_at > NOW() - INTERVAL '30 minutes'
        ORDER BY u.created_at DESC
        LIMIT 3
      `);
      
      debugResults.steps.push({
        step: 'recent_registrations',
        success: true,
        result: recentUsers.rows.map(user => ({
          email: user.email,
          created: user.created_at,
          hasToken: !!user.token,
          tokenCreated: user.token_created
        }))
      });
      console.log('📊 Recent registrations checked');
    } catch (recentError) {
      debugResults.steps.push({
        step: 'recent_registrations',
        success: false,
        error: recentError.message
      });
      console.error('❌ Recent registrations check failed:', recentError.message);
    }
    
    debugResults.success = debugResults.steps.every(step => step.success);
    
    res.json({
      success: true,
      message: 'Debug flow completed',
      debug: debugResults
    });
    
  } catch (error) {
    console.error('❌ Debug flow error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
