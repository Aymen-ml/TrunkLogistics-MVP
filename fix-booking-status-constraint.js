#!/usr/bin/env node

/**
 * Fix Booking Status Constraint Issue
 * This script fixes the booking status constraint issue causing 500 errors
 */

import pg from 'pg';

const { Client } = pg;

async function fixBookingConstraint() {
  const password = process.env.DB_PASSWORD || process.argv[2];
  
  // Parse connection details (using the same pooler as your server)
  const connectionString = `postgresql://postgres.drqkwioicbcihakxgsoe:${password}@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`;
  
  // Alternative individual connection params (fallback)
  const host = 'aws-1-eu-west-3.pooler.supabase.com';
  const port = 5432;
  const database = 'postgres';
  const user = 'postgres.drqkwioicbcihakxgsoe';
  
  if (!password) {
    console.error('❌ Please provide password as environment variable DB_PASSWORD or command line argument');
    console.log('Usage: DB_PASSWORD=your_password node fix-booking-status-constraint.js');
    console.log('   OR: node fix-booking-status-constraint.js your_password');
    process.exit(1);
  }

  // Create client - try connection string first, then individual params
  let client;
  try {
    client = new Client({
      connectionString: connectionString,
      ssl: { rejectUnauthorized: false }
    });
  } catch (e) {
    console.log('Falling back to individual connection parameters...');
    client = new Client({
      host: host,
      port: port,
      database: database,
      user: user,
      password: password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000
    });
  }

  try {
    console.log('🔌 Connecting to database...');
    console.log(`📍 Host: ${host}`);
    console.log(`👤 User: ${user}`);
    
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Test connection
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log(`⏰ Database time: ${testResult.rows[0].current_time}`);

    console.log('🔄 Checking current constraints...');
    
    // Check existing constraint
    const constraintCheck = await client.query(`
      SELECT constraint_name, check_clause 
      FROM information_schema.check_constraints 
      WHERE constraint_name LIKE '%booking%status%'
    `);
    
    console.log('Current constraints:', constraintCheck.rows);

    console.log('🔧 Fixing booking status constraint...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    try {
      // Drop existing constraints that might be conflicting
      await client.query('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check');
      await client.query('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_constraint');
      await client.query('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_status');
      
      // Add the correct constraint
      await client.query(`
        ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
        CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'))
      `);
      
      // Also fix the booking status history constraint
      await client.query('ALTER TABLE booking_status_history DROP CONSTRAINT IF EXISTS booking_status_history_status_check');
      await client.query(`
        ALTER TABLE booking_status_history ADD CONSTRAINT booking_status_history_status_check 
        CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'))
      `);
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('✅ Constraints fixed successfully!');
      
      // Verify the fix
      const newConstraintCheck = await client.query(`
        SELECT constraint_name, check_clause 
        FROM information_schema.check_constraints 
        WHERE constraint_name LIKE '%booking%status%'
      `);
      
      console.log('New constraints:', newConstraintCheck.rows);
      
      // Test creating a booking with correct status
      console.log('🧪 Testing constraint with pending_review status...');
      const testQuery = `
        SELECT 1 WHERE 'pending_review' IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled')
      `;
      const testResult2 = await client.query(testQuery);
      
      if (testResult2.rows.length > 0) {
        console.log('✅ Constraint allows pending_review status correctly');
      } else {
        console.log('❌ Constraint test failed');
      }
      
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    }

    console.log('🎉 Booking status constraint fix complete!');
    console.log('🚀 Customers should now be able to create bookings!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    
    if (error.code === 'ENETUNREACH') {
      console.log('\n🔧 Troubleshooting network connectivity:');
      console.log('1. Check your internet connection');
      console.log('2. Try using a VPN if you have connectivity issues');
      console.log('3. Verify Supabase project is active and accessible');
    } else if (error.code === 'EAUTH' || error.message.includes('authentication')) {
      console.log('\n🔧 Authentication issue:');
      console.log('1. Verify your password is correct');
      console.log('2. Check if your Supabase project is active');
      console.log('3. Make sure you\'re using the correct database credentials');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fixBookingConstraint();
}
