import PasswordReset from './src/utils/passwordReset.js';
import User from './src/models/User.js';
import emailService from './src/services/emailService.js';
import logger from './src/utils/logger.js';

/**
 * Manual Password Reset Link Generator
 * 
 * This script helps diagnose and manually generate password reset links
 * when the automated email system is not working.
 * 
 * Usage:
 *   node test-password-reset.js <email>
 *   
 * Example:
 *   node test-password-reset.js user@example.com
 */

async function testPasswordReset(userEmail) {
  console.log('\n🔐 TrunkLogistics Password Reset Tool\n');
  console.log('=====================================\n');

  try {
    // Step 1: Find user
    console.log(`1️⃣  Looking for user: ${userEmail}`);
    const user = await User.findByEmail(userEmail);
    
    if (!user) {
      console.error('❌ User not found with email:', userEmail);
      console.log('\n💡 Make sure the email address is correct and the user exists in the database.\n');
      process.exit(1);
    }
    
    console.log(`✅ User found: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.is_active}`);

    // Step 2: Check for recent reset requests
    console.log('\n2️⃣  Checking for recent reset requests...');
    const hasRecent = await PasswordReset.hasRecentResetRequest(user.id, 5);
    
    if (hasRecent) {
      console.log('⚠️  User has requested a password reset in the last 5 minutes');
      console.log('   Waiting to prevent spam...');
    } else {
      console.log('✅ No recent reset requests');
    }

    // Step 3: Create reset token
    console.log('\n3️⃣  Creating password reset token...');
    const resetToken = await PasswordReset.createResetToken(user.id);
    console.log(`✅ Token created successfully`);
    console.log(`   Token: ${resetToken.token}`);
    console.log(`   Expires: ${resetToken.expires_at.toLocaleString()}`);

    // Step 4: Generate reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken.token}`;
    
    console.log('\n4️⃣  Reset URL generated:');
    console.log('   ==========================================');
    console.log(`   ${resetUrl}`);
    console.log('   ==========================================');

    // Step 5: Test email service
    console.log('\n5️⃣  Testing email service...');
    console.log(`   Email Service: ${process.env.EMAIL_SERVICE || 'SMTP'}`);
    console.log(`   From: ${process.env.EMAIL_FROM_NAME || 'TrunkLogistics'} <${process.env.EMAIL_FROM || 'noreply@trunklogistics.com'}>`);
    console.log(`   To: ${user.email}`);
    
    if (!emailService.transporter) {
      console.log('❌ Email service not configured!');
      console.log('\n💡 Please configure email service in your .env file:');
      console.log('   Option 1 (SendGrid):');
      console.log('     EMAIL_SERVICE=sendgrid');
      console.log('     SENDGRID_API_KEY=your-api-key');
      console.log('   Option 2 (Gmail):');
      console.log('     EMAIL_SERVICE=gmail');
      console.log('     EMAIL_USER=your-gmail@gmail.com');
      console.log('     EMAIL_PASSWORD=your-app-password');
      console.log('\n   You can still use the reset URL above manually!\n');
    } else {
      console.log('✅ Email service configured');
      
      try {
        console.log('\n6️⃣  Sending password reset email...');
        const emailResult = await emailService.sendPasswordResetEmail(
          user.email,
          user.first_name || 'User',
          resetUrl
        );
        
        if (emailResult) {
          console.log('✅ Email sent successfully!');
          console.log(`   Message ID: ${emailResult.messageId || 'N/A'}`);
        } else {
          console.log('❌ Email failed to send (returned false)');
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError.message);
        console.log('\n💡 You can still use the reset URL above manually!');
      }
    }

    // Summary
    console.log('\n📋 SUMMARY');
    console.log('=========================================');
    console.log(`User Email: ${user.email}`);
    console.log(`Reset Token: ${resetToken.token}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Expires: ${resetToken.expires_at.toLocaleString()}`);
    console.log('=========================================');
    console.log('\n✅ Password reset link is ready!');
    console.log('   Copy the URL above and send it to the user,');
    console.log('   or they should receive it via email.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    logger.error('Password reset test failed:', error);
  }
  
  process.exit(0);
}

// Get email from command line arguments
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('\n❌ Please provide an email address');
  console.log('\nUsage:');
  console.log('  node test-password-reset.js <email>\n');
  console.log('Example:');
  console.log('  node test-password-reset.js user@example.com\n');
  process.exit(1);
}

// Validate email format
if (!/\S+@\S+\.\S+/.test(userEmail)) {
  console.error('\n❌ Invalid email format:', userEmail);
  console.log('Please provide a valid email address.\n');
  process.exit(1);
}

// Run the test
testPasswordReset(userEmail);
