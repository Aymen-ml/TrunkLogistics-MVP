#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration from the prompt.txt
const SUPABASE_URL = 'https://drqkwioicbcihakxgsoe.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function deployNotificationsFix() {
  console.log('🔧 Deploying Notifications Schema Fix...\n');

  try {
    // Read the fix-notifications-schema.sql file
    const sqlContent = fs.readFileSync('fix-notifications-schema.sql', 'utf8');
    
    console.log('📄 Executing SQL migration...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ SQL execution failed:', error);
      throw error;
    }
    
    console.log('✅ Notifications schema fix applied successfully!');
    
    // Verify the schema changes
    console.log('\n🔍 Verifying schema changes...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'notifications')
      .order('ordinal_position');
    
    if (columnsError) {
      console.error('❌ Failed to verify schema:', columnsError);
    } else {
      console.log('📋 Current notifications table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    console.log('\n🎉 Notification system database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function deployNotificationsFixDirect() {
  console.log('🔧 Deploying Notifications Schema Fix (Direct SQL)...\n');

  try {
    // Execute each SQL statement individually for better error handling
    const statements = [
      `ALTER TABLE notifications 
       ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' 
       CHECK (priority IN ('low', 'medium', 'high'))`,
      
      `ALTER TABLE notifications 
       ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50)`,
      
      `ALTER TABLE notifications 
       ADD COLUMN IF NOT EXISTS related_entity_id UUID`,
      
      `ALTER TABLE notifications 
       ADD COLUMN IF NOT EXISTS read_at TIMESTAMP`,
      
      `UPDATE notifications 
       SET related_entity_type = 'booking', related_entity_id = related_booking_id
       WHERE related_booking_id IS NOT NULL`,
      
      `CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority)`,
      
      `CREATE INDEX IF NOT EXISTS idx_notifications_related_entity 
       ON notifications(related_entity_type, related_entity_id)`,
      
      `CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)`,
      
      `CREATE OR REPLACE FUNCTION update_notification_read_at()
       RETURNS TRIGGER AS $$
       BEGIN
           IF NEW.is_read = true AND OLD.is_read = false THEN
               NEW.read_at = CURRENT_TIMESTAMP;
           END IF;
           RETURN NEW;
       END;
       $$ LANGUAGE plpgsql`,
      
      `DROP TRIGGER IF EXISTS update_notification_read_at_trigger ON notifications`,
      
      `CREATE TRIGGER update_notification_read_at_trigger
       BEFORE UPDATE ON notifications
       FOR EACH ROW
       EXECUTE FUNCTION update_notification_read_at()`,
      
      `INSERT INTO migrations (filename) VALUES ('20250920_fix_notifications_schema.sql')
       ON CONFLICT (filename) DO NOTHING`
    ];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error);
        console.error('Statement:', statement);
        throw error;
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`);
    }
    
    console.log('\n🎉 All statements executed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run the deployment
if (process.argv.includes('--direct')) {
  deployNotificationsFixDirect();
} else {
  deployNotificationsFix();
}
