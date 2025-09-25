#!/usr/bin/env node

/**
 * Debug Login Issue - Check database structure and simulate login steps
 */

import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

async function debugLoginIssue() {
  // Use the same connection approach as the server
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://postgres.drqkwioicbcihakxgsoe:${process.env.DB_PASSWORD || 'igeem002'}@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`;
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // 1. Check if users table exists and its structure
    console.log('\n📋 Checking users table structure...');
    const tableCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Users table does not exist!');
      return;
    }
    
    console.log('Users table columns:');
    tableCheck.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(required)' : '(optional)'}`);
    });

    // 2. Check if admin user exists
    console.log('\n👤 Checking for admin user...');
    const adminCheck = await client.query(`
      SELECT id, email, role, password_hash, is_active, email_verified, first_name, last_name
      FROM users 
      WHERE email = $1
    `, ['korichiaymen27@gmail.com']);
    
    if (adminCheck.rows.length === 0) {
      console.log('❌ Admin user not found!');
      console.log('Let me check all users...');
      const allUsers = await client.query('SELECT email, role FROM users LIMIT 5');
      console.log('Existing users:', allUsers.rows);
    } else {
      const user = adminCheck.rows[0];
      console.log('✅ Admin user found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        hasPasswordHash: !!user.password_hash,
        firstName: user.first_name,
        lastName: user.last_name
      });

      // 3. Test password verification
      console.log('\n🔐 Testing password verification...');
      try {
        const testPassword = 'igeem002';
        const isValid = await bcrypt.compare(testPassword, user.password_hash);
        console.log('Password verification result:', isValid);
        
        if (!isValid) {
          console.log('❌ Password verification failed');
          console.log('Password hash format:', user.password_hash?.substring(0, 20) + '...');
        } else {
          console.log('✅ Password verification successful');
        }
      } catch (pwError) {
        console.log('❌ Password verification error:', pwError.message);
      }
    }

    // 4. Check provider_profiles table if admin user is a provider
    if (adminCheck.rows.length > 0 && adminCheck.rows[0].role === 'provider') {
      console.log('\n🏢 Checking provider profile...');
      const providerCheck = await client.query(`
        SELECT id, user_id, is_verified 
        FROM provider_profiles 
        WHERE user_id = $1
      `, [adminCheck.rows[0].id]);
      
      console.log('Provider profile:', providerCheck.rows);
    }

    // 5. Test a simple query like the one in findByEmail
    console.log('\n🔍 Testing User.findByEmail simulation...');
    const findTest = await client.query('SELECT * FROM users WHERE email = $1', ['korichiaymen27@gmail.com']);
    console.log('findByEmail result count:', findTest.rows.length);

    console.log('\n🎉 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await client.end();
  }
}

debugLoginIssue();
