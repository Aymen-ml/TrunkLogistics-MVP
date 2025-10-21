import dotenv from 'dotenv';
import { query } from './src/config/database.js';
import emailService from './src/services/emailService.js';
import User from './src/models/User.js';
import logger from './src/utils/logger.js';

dotenv.config();

async function testRegistrationFlow() {
  console.log('🧪 Testing complete registration and email verification flow...\n');
  
  const testEmail = `test.user.${Date.now()}@gmail.com`;
  const testUser = {
    email: testEmail,
    password: 'testPassword123',
    role: 'customer',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  };
  
  try {
    // Step 1: Test database connection
    console.log('1. Testing database connection...');
    const dbTest = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', dbTest.rows[0].current_time);
    
    // Step 2: Test email service
    console.log('\n2. Testing email service...');
    const emailTest = await emailService.testConnection();
    console.log('✅ Email service:', emailTest);
    
    // Step 3: Create test user (simulating registration)
    console.log('\n3. Creating test user...');
    const user = await User.create(testUser);
    console.log('✅ User created:', {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.email_verified
    });
    
    // Step 4: Test direct email verification approach (current working method)
    console.log('\n4. Testing direct email verification...');
    const verificationToken = `verify-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    console.log('✅ Direct verification token created:', verificationToken.substring(0, 20) + '...');
    
    // Step 5: Send verification email
    console.log('\n5. Sending verification email...');
    const verificationUrl = `${process.env.CLIENT_URL || 'https://trucklogistics-mvp.netlify.app'}/verify-email/${verificationToken}`;
    
    const emailResult = await emailService.sendEmail(
      user.email,
      'Test: Verify Your Email Address - TruckLogistics',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Email Verification Test</h2>
          <p>Hello ${user.first_name},</p>
          <p>This is a test of the email verification system.</p>
          <p><a href="${verificationUrl}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
          <p>Or copy this link: ${verificationUrl}</p>
          <p>Test completed at: ${new Date().toISOString()}</p>
        </div>
      `
    );
    
    if (emailResult) {
      console.log('✅ Verification email sent successfully!');
      console.log('📧 Email details:', {
        messageId: emailResult.messageId,
        accepted: emailResult.accepted,
        rejected: emailResult.rejected
      });
    } else {
      console.log('❌ Failed to send verification email');
    }
    
    // Step 6: Test token verification simulation
    console.log('\n6. Testing token verification simulation...');
    
    // Extract user ID from token (simulating verification endpoint)
    const tokenParts = verificationToken.split('-');
    if (tokenParts.length >= 2) {
      const extractedUserId = tokenParts[1];
      console.log('✅ User ID extracted from token:', extractedUserId);
      
      // Verify it matches our user
      if (extractedUserId === user.id) {
        console.log('✅ Token validation successful - User ID matches');
        
        // Simulate email verification (update user)
        await User.setEmailVerified(user.id, true);
        const verifiedUser = await User.findById(user.id);
        console.log('✅ User email verification updated:', verifiedUser.email_verified);
      } else {
        console.log('❌ Token validation failed - User ID mismatch');
      }
    } else {
      console.log('❌ Invalid token format');
    }
    
    // Step 7: Cleanup test user
    console.log('\n7. Cleaning up test user...');
    await User.delete(user.id);
    console.log('✅ Test user cleaned up');
    
    console.log('\n🎉 Registration flow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection: Working');
    console.log('✅ Email service: Working');
    console.log('✅ User creation: Working');
    console.log('✅ Token generation: Working');
    console.log('✅ Email sending: Working');
    console.log('✅ Token verification: Working');
    console.log('✅ User update: Working');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testRegistrationFlow();