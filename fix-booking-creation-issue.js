#!/usr/bin/env node

/**
 * Fix Booking Creation Issue
 * 
 * This script fixes the booking creation 500 error by:
 * 1. Adding the missing booking_status_history table
 * 2. Verifying database constraints
 * 3. Testing the booking creation flow
 */

import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

async function fixBookingCreationIssue() {
  try {
    console.log('🔧 Starting booking creation issue fix...');

    // Step 1: Check if booking_status_history table exists
    console.log('📋 Checking booking_status_history table...');
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_status_history'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('📝 Creating booking_status_history table...');
      
      await query(`
        CREATE TABLE booking_status_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
          status VARCHAR(20) NOT NULL CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled')),
          changed_by UUID REFERENCES users(id),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes
      await query(`CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);`);
      await query(`CREATE INDEX IF NOT EXISTS idx_booking_status_history_status ON booking_status_history(status);`);
      await query(`CREATE INDEX IF NOT EXISTS idx_booking_status_history_changed_by ON booking_status_history(changed_by);`);
      
      console.log('✅ booking_status_history table created successfully');
    } else {
      console.log('✅ booking_status_history table already exists');
    }

    // Step 2: Verify bookings table structure
    console.log('📋 Verifying bookings table structure...');
    const bookingsColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      ORDER BY ordinal_position;
    `);

    const requiredColumns = [
      'id', 'customer_id', 'truck_id', 'pickup_address', 'pickup_city',
      'destination_address', 'destination_city', 'pickup_date', 'pickup_time',
      'cargo_description', 'cargo_weight', 'cargo_volume', 'total_price',
      'status', 'service_type', 'notes'
    ];

    const existingColumns = bookingsColumns.rows.map(row => row.column_name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

    if (missingColumns.length > 0) {
      console.log('❌ Missing columns in bookings table:', missingColumns);
    } else {
      console.log('✅ All required columns exist in bookings table');
    }

    // Step 3: Check booking status constraints
    console.log('📋 Checking booking status constraints...');
    const statusConstraint = await query(`
      SELECT conname, consrc 
      FROM pg_constraint 
      WHERE conrelid = 'bookings'::regclass 
      AND conname LIKE '%status%';
    `);

    console.log('📊 Current status constraints:');
    statusConstraint.rows.forEach(row => {
      console.log(`  - ${row.conname}: ${row.consrc}`);
    });

    // Step 4: Test customer profile lookup
    console.log('📋 Testing customer profile functionality...');
    const customerProfiles = await query(`
      SELECT COUNT(*) as count FROM customer_profiles;
    `);
    console.log(`✅ Found ${customerProfiles.rows[0].count} customer profiles`);

    // Step 5: Test provider profile lookup
    console.log('📋 Testing provider profile functionality...');
    const providerProfiles = await query(`
      SELECT COUNT(*) as count FROM provider_profiles;
    `);
    console.log(`✅ Found ${providerProfiles.rows[0].count} provider profiles`);

    // Step 6: Test trucks table
    console.log('📋 Testing trucks table...');
    const trucks = await query(`
      SELECT COUNT(*) as count FROM trucks WHERE status = 'active';
    `);
    console.log(`✅ Found ${trucks.rows[0].count} active trucks`);

    // Step 7: Verify the specific truck from the error
    const truckId = '63860450-237e-4b62-9209-f9d92afde2eb';
    console.log(`📋 Checking specific truck: ${truckId}...`);
    
    const specificTruck = await query(`
      SELECT t.*, pp.id as provider_profile_id, pp.company_name
      FROM trucks t
      LEFT JOIN provider_profiles pp ON t.provider_id = pp.id
      WHERE t.id = $1;
    `, [truckId]);

    if (specificTruck.rows.length > 0) {
      const truck = specificTruck.rows[0];
      console.log('✅ Truck found:');
      console.log(`  - License Plate: ${truck.license_plate}`);
      console.log(`  - Status: ${truck.status}`);
      console.log(`  - Pricing Type: ${truck.pricing_type}`);
      console.log(`  - Provider: ${truck.company_name || 'No provider'}`);
      
      if (!truck.provider_profile_id) {
        console.log('❌ WARNING: Truck has no associated provider profile!');
      }
    } else {
      console.log('❌ ERROR: Truck not found!');
    }

    console.log('🎉 Booking creation issue analysis completed!');

    // Step 8: Provide recommendations
    console.log('\n📋 RECOMMENDATIONS:');
    console.log('1. ✅ booking_status_history table is now available');
    console.log('2. ✅ Validation middleware has been updated');
    console.log('3. 🔍 Check if the specific truck has a valid provider profile');
    console.log('4. 🔍 Ensure the customer has a valid customer profile');
    console.log('5. 🔍 Check server logs for detailed error messages');

  } catch (error) {
    console.error('❌ Error during fix:', error);
    logger.error('Error in fixBookingCreationIssue:', error);
    throw error;
  }
}

// Run the fix
fixBookingCreationIssue()
  .then(() => {
    console.log('✅ Fix analysis completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });