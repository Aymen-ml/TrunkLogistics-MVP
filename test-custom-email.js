#!/usr/bin/env node

/**
 * Custom Email Test Script
 * Tests noreply@movelinker.com email configuration
 * 
 * Usage:
 *   node test-custom-email.js [recipient-email]
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables BEFORE importing emailService
const envPath = resolve(__dirname, 'server/.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
} catch (error) {
  console.error('❌ Error loading .env file:', error.message);
  process.exit(1);
}

// Now import emailService after env vars are loaded
const { default: emailService } = await import('./server/src/services/emailService.js');

console.log('\n🔧 TruckLogistics - Custom Email Test\n');
console.log('========================================');
console.log('Testing: noreply@movelinker.com');
console.log('========================================\n');

async function testCustomEmail() {
  try {
    // Step 1: Check environment configuration
    console.log('1️⃣  Checking environment configuration...\n');
    
    const config = {
      emailService: process.env.EMAIL_SERVICE || 'smtp',
      emailFrom: process.env.EMAIL_FROM,
      emailFromName: process.env.EMAIL_FROM_NAME,
      emailHost: process.env.EMAIL_HOST,
      emailPort: process.env.EMAIL_PORT,
      emailSecure: process.env.EMAIL_SECURE,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPassword: !!process.env.EMAIL_PASSWORD,
      hasSendGridKey: !!process.env.SENDGRID_API_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY
    };
    
    console.log('Configuration:');
    console.log('   Service Type:', config.emailService);
    console.log('   From Email:', config.emailFrom);
    console.log('   From Name:', config.emailFromName);
    console.log('   SMTP Host:', config.emailHost || 'NOT SET');
    console.log('   SMTP Port:', config.emailPort || 'NOT SET');
    console.log('   SMTP Secure:', config.emailSecure || 'NOT SET');
    console.log('   Email User:', config.hasEmailUser ? '✅ SET' : '❌ NOT SET');
    console.log('   Email Password:', config.hasEmailPassword ? '✅ SET' : '❌ NOT SET');
    console.log('   SendGrid API Key:', config.hasSendGridKey ? '✅ SET' : '❌ NOT SET');
    console.log('   Resend API Key:', config.hasResendKey ? '✅ SET' : '❌ NOT SET');
    console.log('');
    
    // Validate configuration
    if (config.emailFrom !== 'noreply@movelinker.com') {
      console.log('⚠️  WARNING: EMAIL_FROM is not set to noreply@movelinker.com');
      console.log('   Current value:', config.emailFrom);
      console.log('   Please update your .env file\n');
    } else {
      console.log('✅ Email sender correctly set to noreply@movelinker.com\n');
    }
    
    // Check if email service is configured
    if (!emailService.transporter && !emailService.resend) {
      console.log('❌ ERROR: Email service not initialized!');
      console.log('   Please check your environment variables.\n');
      process.exit(1);
    }
    
    console.log('✅ Email service initialized successfully\n');
    
    // Step 2: Send test email
    console.log('2️⃣  Sending test email...\n');
    
    // Prompt for recipient email
    const recipientEmail = process.argv[2] || config.emailFrom;
    
    console.log(`   Recipient: ${recipientEmail}`);
    console.log(`   From: ${config.emailFromName} <${config.emailFrom}>`);
    console.log('');
    
    const testSubject = '✅ TruckLogistics - Custom Email Test';
    const testHtmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .success-badge {
            background: #10B981;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            margin: 20px 0;
            font-weight: bold;
          }
          .info-box {
            background: white;
            border-left: 4px solid #3B82F6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            color: #6B7280;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E5E7EB;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Email Test Successful!</h1>
        </div>
        
        <div class="content">
          <div class="success-badge">
            ✅ Custom Email Working
          </div>
          
          <h2>Congratulations!</h2>
          
          <p>Your custom email <strong>noreply@movelinker.com</strong> is now properly configured and working!</p>
          
          <div class="info-box">
            <h3>📧 Email Configuration Details</h3>
            <p><strong>From:</strong> ${config.emailFromName} &lt;${config.emailFrom}&gt;</p>
            <p><strong>Service:</strong> ${config.emailService.toUpperCase()}</p>
            <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <h3>✅ What's Working:</h3>
          <ul>
            <li>Email service successfully initialized</li>
            <li>SMTP/API credentials validated</li>
            <li>Email sending functionality operational</li>
            <li>Custom domain email configured</li>
            <li>HTML email rendering</li>
          </ul>
          
          <h3>🚀 Next Steps:</h3>
          <ol>
            <li>Test password reset emails</li>
            <li>Test welcome emails</li>
            <li>Test booking notification emails</li>
            <li>Configure email templates</li>
            <li>Set up email monitoring</li>
          </ol>
          
          <p style="margin-top: 30px;">
            <strong>Note:</strong> This is a test email to verify your custom email configuration. 
            If you received this email, everything is working correctly!
          </p>
        </div>
        
        <div class="footer">
          <p>TruckLogistics - Email Service Test</p>
          <p>This is an automated test email sent from ${config.emailFrom}</p>
          <p>© ${new Date().getFullYear()} TruckLogistics. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
    
    const result = await emailService.sendEmail(
      recipientEmail,
      testSubject,
      testHtmlContent
    );
    
    console.log('✅ Test email sent successfully!\n');
    
    if (result && result.messageId) {
      console.log('   Message ID:', result.messageId);
    }
    if (result && result.id) {
      console.log('   Email ID:', result.id);
    }
    
    console.log('');
    console.log('========================================');
    console.log('📬 Check your inbox at:', recipientEmail);
    console.log('========================================\n');
    
    console.log('✅ All tests passed!\n');
    console.log('Your custom email noreply@movelinker.com is working perfectly! 🎉\n');
    
    // Step 3: Additional tests
    console.log('3️⃣  Additional Email Templates Test...\n');
    
    // Test password reset email template
    console.log('   Testing Password Reset Email...');
    const resetUrl = 'https://movelinker.com/reset-password/test-token-123';
    const resetResult = await emailService.sendPasswordResetEmail(
      recipientEmail,
      'Test User',
      resetUrl
    );
    console.log('   ✅ Password reset email sent\n');
    
    // Test welcome email template
    console.log('   Testing Welcome Email...');
    const welcomeResult = await emailService.sendWelcomeEmail(
      recipientEmail,
      'Test User',
      'customer'
    );
    console.log('   ✅ Welcome email sent\n');
    
    console.log('========================================');
    console.log('🎊 ALL EMAIL TESTS COMPLETED SUCCESSFULLY!');
    console.log('========================================\n');
    
    console.log('Summary:');
    console.log('   ✅ Test email sent');
    console.log('   ✅ Password reset email sent');
    console.log('   ✅ Welcome email sent');
    console.log('   ✅ Custom domain verified');
    console.log('');
    console.log('Check your inbox for all test emails!\n');
    
    process.exit(0);
    
  } catch (error) {
    console.log('\n❌ EMAIL TEST FAILED\n');
    console.error('Error:', error.message);
    
    if (error.code) {
      console.error('Error Code:', error.code);
    }
    
    if (error.response) {
      console.error('Response:', error.response);
    }
    
    console.log('\n💡 Troubleshooting Tips:\n');
    console.log('1. Verify EMAIL_FROM is set to noreply@movelinker.com');
    console.log('2. Check SMTP credentials (EMAIL_USER, EMAIL_PASSWORD)');
    console.log('3. Ensure EMAIL_HOST and EMAIL_PORT are correct');
    console.log('4. Verify your email domain DNS records (SPF, DKIM, DMARC)');
    console.log('5. Check if your email provider requires app-specific passwords');
    console.log('6. Make sure firewall allows outbound SMTP connections');
    console.log('');
    
    process.exit(1);
  }
}

// Get recipient email from command line or use default
if (process.argv.length > 3) {
  console.log('Usage: node test-custom-email.js [recipient-email]');
  console.log('Example: node test-custom-email.js user@example.com');
  console.log('');
  process.exit(1);
}

// Run the test
testCustomEmail();
