#!/usr/bin/env node

import { query } from './server/src/config/database.js';

async function checkNotificationSchema() {
  console.log('🔍 Checking notifications table schema...\n');
  
  try {
    // Check current schema
    const schemaResult = await query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'notifications' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Current notifications table schema:');
    console.table(schemaResult.rows);
    
    // Check for missing columns that the model expects
    const expectedColumns = ['priority', 'related_entity_type', 'related_entity_id', 'read_at'];
    const currentColumns = schemaResult.rows.map(row => row.column_name);
    
    const missingColumns = expectedColumns.filter(col => !currentColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Missing columns:', missingColumns.join(', '));
      console.log('This explains why notification creation and stats are failing.');
    } else {
      console.log('\n✅ All expected columns are present.');
    }
    
    // Test a simple query to see what fails
    console.log('\n🔍 Testing notification queries...');
    
    try {
      const countResult = await query('SELECT COUNT(*) as count FROM notifications');
      console.log('✅ Basic count query works:', countResult.rows[0]);
    } catch (error) {
      console.log('❌ Basic count query failed:', error.message);
    }
    
    // Test with expected columns
    try {
      const testResult = await query(`
        SELECT COUNT(*) as total,
        COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority
        FROM notifications
      `);
      console.log('✅ Priority column query works:', testResult.rows[0]);
    } catch (error) {
      console.log('❌ Priority column query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkNotificationSchema().catch(console.error);