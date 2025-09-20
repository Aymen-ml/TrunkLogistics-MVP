import dotenv from 'dotenv';
import { query } from './src/config/database.js';
import EmailVerification from './src/utils/emailVerification.js';
import emailService from './src/services/emailService.js';

dotenv.config();

async function debugEmailFlow() {
  console.log('🔍 Debugging Email Verification Flow...\n');
  
  try {
    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    const dbTest = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', dbTest.rows[0].current_time);
    
    // Test 2: Check email service
    console.log('\n2. Testing email service...');
    const emailTest = await emailService.testConnection();
    console.log('✅ Email service:', emailTest);
    
    // Test 3: Check email_verifications table structure
    console.log('\n3. Checking email_verifications table...');
    const tableCheck = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'email_verifications'
      ORDER BY ordinal_position
    `);
    console.log('📋 Table structure:');
    tableCheck.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test 4: Try creating a verification token
    console.log('\n4. Testing verification token creation...');
    const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // Fake UUID for testing
    
    try {
      const token = await EmailVerification.createVerificationToken(testUserId);
      console.log('✅ Token created successfully:', token.substring(0, 10) + '...');
      
      // Clean up test token
      await query('DELETE FROM email_verifications WHERE user_id = $1', [testUserId]);
      console.log('🧹 Test token cleaned up');
    } catch (tokenError) {
      console.error('❌ Token creation failed:', tokenError.message);
      console.error('Stack:', tokenError.stack);
    }
    
    // Test 5: Check recent registrations and their verification tokens
    console.log('\n5. Checking recent registrations...');
    const recentUsers = await query(`
      SELECT u.id, u.email, u.created_at, u.email_verified,
             ev.token, ev.created_at as token_created, ev.expires_at, ev.verified_at
      FROM users u
      LEFT JOIN email_verifications ev ON u.id = ev.user_id
      WHERE u.created_at > NOW() - INTERVAL '1 hour'
      ORDER BY u.created_at DESC
      LIMIT 5
    `);
    
    console.log('📊 Recent registrations:');
    recentUsers.rows.forEach(user => {
      console.log(`  - ${user.email}:`);
      console.log(`    User ID: ${user.id}`);
      console.log(`    Created: ${user.created_at}`);
      console.log(`    Email Verified: ${user.email_verified}`);
      console.log(`    Token: ${user.token ? user.token.substring(0, 10) + '...' : 'NO TOKEN'}`);
      console.log(`    Token Created: ${user.token_created || 'N/A'}`);
      console.log(`    Token Expires: ${user.expires_at || 'N/A'}`);
      console.log(`    Token Verified: ${user.verified_at || 'N/A'}`);
      console.log('');
    });
    
    // Test 6: Try sending a test verification email
    console.log('6. Testing verification email sending...');
    const testUser = {
      id: 'test-debug-user',
      email: 'debug.test.verification@gmail.com',
      first_name: 'Debug',
      last_name: 'Test'
    };
    
    const testToken = 'debug-token-' + Date.now();
    const emailResult = await EmailVerification.sendVerificationEmail(testUser, testToken);
    console.log('📧 Email send result:', emailResult);
    
  } catch (error) {
    console.error('❌ Debug flow error:', error);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

debugEmailFlow();
