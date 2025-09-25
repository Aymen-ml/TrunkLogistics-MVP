#!/usr/bin/env node

/**
 * Debug Login Issue
 * Quick test to see what's causing the 500 error
 */

import pg from 'pg';

const { Client } = pg;

async function debugLogin() {
  const password = 'igeem002';
  const connectionString = `postgresql://postgres.drqkwioicbcihakxgsoe:${password}@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`;
  
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Check if users table exists
    console.log('🔍 Checking users table...');
    const usersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    console.log('Users table exists:', usersCheck.rows[0].exists);

    if (usersCheck.rows[0].exists) {
      // Check users table structure
      console.log('📊 Checking users table structure...');
      const structure = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        ORDER BY ordinal_position;
      `);
      console.log('Users table structure:', structure.rows);

      // Try to find a test user
      console.log('👤 Checking for admin user...');
      const userCheck = await client.query(`
        SELECT id, email, role, is_active, email_verified 
        FROM users 
        WHERE email = 'korichiaymen27@gmail.com'
        LIMIT 1;
      `);
      console.log('Admin user found:', userCheck.rows.length > 0);
      if (userCheck.rows.length > 0) {
        console.log('User details:', userCheck.rows[0]);
      }

      // Check recent errors or issues
      console.log('📈 Checking total users count...');
      const countCheck = await client.query('SELECT COUNT(*) as total FROM users');
      console.log('Total users:', countCheck.rows[0].total);
    }

    console.log('🎉 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  debugLogin();
}
