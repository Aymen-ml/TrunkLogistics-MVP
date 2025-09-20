#!/usr/bin/env node

import { query } from './server/src/config/database.js';

async function applyNotificationFix() {
  console.log('🔧 Applying Notification Schema Fix...\n');

  try {
    // Check current schema first
    console.log('📋 Checking current notifications table structure...');
    const currentSchema = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position
    `);
    
    console.log('Current columns:');
    currentSchema.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    // Apply schema fixes step by step
    const fixes = [
      {
        name: 'Add priority column',
        sql: `ALTER TABLE notifications 
              ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' 
              CHECK (priority IN ('low', 'medium', 'high'))`
      },
      {
        name: 'Add related_entity_type column',
        sql: `ALTER TABLE notifications 
              ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50)`
      },
      {
        name: 'Add related_entity_id column',
        sql: `ALTER TABLE notifications 
              ADD COLUMN IF NOT EXISTS related_entity_id UUID`
      },
      {
        name: 'Add read_at column',
        sql: `ALTER TABLE notifications 
              ADD COLUMN IF NOT EXISTS read_at TIMESTAMP`
      },
      {
        name: 'Update existing records with related entity data',
        sql: `UPDATE notifications 
              SET related_entity_type = 'booking', 
                  related_entity_id = related_booking_id
              WHERE related_booking_id IS NOT NULL 
                AND related_entity_type IS NULL`
      },
      {
        name: 'Create priority index',
        sql: `CREATE INDEX IF NOT EXISTS idx_notifications_priority 
              ON notifications(priority)`
      },
      {
        name: 'Create related entity index',
        sql: `CREATE INDEX IF NOT EXISTS idx_notifications_related_entity 
              ON notifications(related_entity_type, related_entity_id)`
      },
      {
        name: 'Create type index',
        sql: `CREATE INDEX IF NOT EXISTS idx_notifications_type 
              ON notifications(type)`
      },
      {
        name: 'Create read_at trigger function',
        sql: `CREATE OR REPLACE FUNCTION update_notification_read_at()
              RETURNS TRIGGER AS $$
              BEGIN
                  IF NEW.is_read = true AND OLD.is_read = false THEN
                      NEW.read_at = CURRENT_TIMESTAMP;
                  END IF;
                  RETURN NEW;
              END;
              $$ LANGUAGE plpgsql`
      },
      {
        name: 'Drop existing trigger if exists',
        sql: `DROP TRIGGER IF EXISTS update_notification_read_at_trigger ON notifications`
      },
      {
        name: 'Create read_at trigger',
        sql: `CREATE TRIGGER update_notification_read_at_trigger
              BEFORE UPDATE ON notifications
              FOR EACH ROW
              EXECUTE FUNCTION update_notification_read_at()`
      }
    ];

    for (const fix of fixes) {
      console.log(`\n📝 ${fix.name}...`);
      try {
        await query(fix.sql);
        console.log(`✅ ${fix.name} completed successfully`);
      } catch (error) {
        console.error(`❌ ${fix.name} failed:`, error.message);
        // Continue with other fixes even if one fails
      }
    }

    // Verify the final schema
    console.log('\n🔍 Verifying updated schema...');
    const updatedSchema = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position
    `);
    
    console.log('Updated columns:');
    updatedSchema.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('\n🎉 Notification schema fix completed successfully!');

  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
applyNotificationFix().catch(console.error);
