#!/usr/bin/env node

/**
 * Fix Booking Status History Table
 * 
 * This script adds the missing booking_status_history table to the production database.
 * The table is required for the booking creation process to work correctly.
 */

import { query } from './server/src/config/database.js';
import logger from './server/src/utils/logger.js';

async function fixBookingStatusHistoryTable() {
  try {
    console.log('🔧 Starting booking_status_history table fix...');

    // Check if table already exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_status_history'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ booking_status_history table already exists');
      return;
    }

    console.log('📝 Creating booking_status_history table...');

    // Create the booking_status_history table
    await query(`
      CREATE TABLE IF NOT EXISTS booking_status_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled')),
        changed_by UUID REFERENCES users(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('📊 Creating indexes for booking_status_history table...');

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_booking_status_history_status ON booking_status_history(status);
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_booking_status_history_changed_by ON booking_status_history(changed_by);
    `);

    console.log('✅ booking_status_history table and indexes created successfully');

    // Verify the table was created
    const verifyTable = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'booking_status_history' 
      ORDER BY ordinal_position;
    `);

    console.log('📋 Table structure:');
    verifyTable.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    console.log('🎉 Booking status history table fix completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing booking_status_history table:', error);
    logger.error('Error in fixBookingStatusHistoryTable:', error);
    throw error;
  }
}

// Run the fix
fixBookingStatusHistoryTable()
  .then(() => {
    console.log('✅ Fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });