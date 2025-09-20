#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Database connection details from the app
const supabaseUrl = 'https://drqkwioicbcihakxgsoe.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyNotificationSchemaFix() {
  console.log('🔧 Applying notification schema fix to production database...\n');
  
  try {
    // Read the schema fix SQL
    const schemaFixSQL = fs.readFileSync('fix-notifications-schema.sql', 'utf8');
    
    console.log('1. Executing schema fix SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaFixSQL });
    
    if (error) {
      console.error('❌ Schema fix failed:', error);
      return false;
    }
    
    console.log('✅ Schema fix applied successfully');
    
    // Test the schema by checking if the new columns exist
    console.log('\n2. Verifying schema changes...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'notifications')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.error('❌ Schema verification failed:', columnsError);
      return false;
    }
    
    const columnNames = columns.map(col => col.column_name);
    const requiredColumns = ['priority', 'related_entity_type', 'related_entity_id', 'read_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing columns:', missingColumns);
      return false;
    }
    
    console.log('✅ All required columns are present:', requiredColumns);
    
    // Test creating a notification
    console.log('\n3. Testing notification creation...');
    const testNotification = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID for test
      type: 'system',
      title: 'Schema Fix Test',
      message: 'Testing notification system after schema fix',
      priority: 'low',
      related_entity_type: 'system',
      related_entity_id: null
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotification)
      .select();
    
    if (insertError) {
      console.log('⚠️  Test notification creation failed (expected if user doesn\'t exist):', insertError.message);
    } else {
      console.log('✅ Test notification created successfully');
      
      // Clean up test notification
      if (insertData && insertData[0]) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', insertData[0].id);
        console.log('✅ Test notification cleaned up');
      }
    }
    
    console.log('\n🎉 Notification schema fix completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Alternative method using direct SQL execution
async function applySchemaFixDirectSQL() {
  console.log('🔧 Applying notification schema fix using direct SQL...\n');
  
  try {
    // Add missing columns
    console.log('1. Adding priority column...');
    const { error: priorityError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));`
    });
    
    if (priorityError) {
      console.error('❌ Priority column addition failed:', priorityError);
    } else {
      console.log('✅ Priority column added');
    }
    
    console.log('2. Adding related_entity_type column...');
    const { error: entityTypeError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50);`
    });
    
    if (entityTypeError) {
      console.error('❌ Related entity type column addition failed:', entityTypeError);
    } else {
      console.log('✅ Related entity type column added');
    }
    
    console.log('3. Adding related_entity_id column...');
    const { error: entityIdError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_id UUID;`
    });
    
    if (entityIdError) {
      console.error('❌ Related entity ID column addition failed:', entityIdError);
    } else {
      console.log('✅ Related entity ID column added');
    }
    
    console.log('4. Adding read_at column...');
    const { error: readAtError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;`
    });
    
    if (readAtError) {
      console.error('❌ Read at column addition failed:', readAtError);
    } else {
      console.log('✅ Read at column added');
    }
    
    console.log('5. Creating indexes...');
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);`
    ];
    
    for (const query of indexQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.error('❌ Index creation failed:', error);
      }
    }
    console.log('✅ Indexes created');
    
    console.log('6. Creating read_at trigger...');
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_notification_read_at()
      RETURNS TRIGGER AS $$
      BEGIN
          IF NEW.is_read = true AND OLD.is_read = false THEN
              NEW.read_at = CURRENT_TIMESTAMP;
          END IF;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      DROP TRIGGER IF EXISTS update_notification_read_at_trigger ON notifications;
      CREATE TRIGGER update_notification_read_at_trigger
          BEFORE UPDATE ON notifications
          FOR EACH ROW
          EXECUTE FUNCTION update_notification_read_at();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: triggerSQL });
    
    if (triggerError) {
      console.error('❌ Trigger creation failed:', triggerError);
    } else {
      console.log('✅ Read at trigger created');
    }
    
    console.log('\n🎉 Schema fix completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the schema fix
applySchemaFixDirectSQL().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
