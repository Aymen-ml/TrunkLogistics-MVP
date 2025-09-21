#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';
import path from 'path';

// Production database connection (from memory - Supabase via pooler)
const DATABASE_URL = 'postgresql://postgres.drqkwioicbcihakxgsoe:password@aws-1-eu-west-3.pooler.supabase.com:5432/postgres';

async function applyNotificationFix() {
  console.log('🔧 Applying notification schema fix to production database...\n');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Connect to database
    console.log('1. Connecting to production database...');
    await client.connect();
    console.log('✅ Connected to production database');

    // Read the migration file
    console.log('\n2. Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'server/src/database/migrations/030_fix_notifications_schema_final.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded');

    // Execute the migration
    console.log('\n3. Executing migration...');
    const result = await client.query(migrationSQL);
    console.log('✅ Migration executed successfully');

    // Verify the schema changes
    console.log('\n4. Verifying schema changes...');
    const schemaQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const schemaResult = await client.query(schemaQuery);
    console.log('✅ Current notifications table schema:');
    console.table(schemaResult.rows);

    // Check if all required columns exist
    const columnNames = schemaResult.rows.map(row => row.column_name);
    const requiredColumns = ['id', 'user_id', 'type', 'title', 'message', 'is_read', 'created_at', 'updated_at', 'priority', 'related_entity_type', 'related_entity_id', 'read_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.error('❌ Missing required columns:', missingColumns);
      return false;
    }
    
    console.log('✅ All required columns are present');

    // Test notification creation
    console.log('\n5. Testing notification creation...');
    
    // First, get a real user ID from the database
    const userQuery = 'SELECT id FROM users LIMIT 1';
    const userResult = await client.query(userQuery);
    
    if (userResult.rows.length === 0) {
      console.log('⚠️  No users found in database, skipping notification creation test');
    } else {
      const userId = userResult.rows[0].id;
      
      const testNotificationQuery = `
        INSERT INTO notifications (
          user_id, type, title, message, priority, related_entity_type, related_entity_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, created_at;
      `;
      
      const testValues = [
        userId,
        'system',
        'Schema Fix Test',
        'Testing notification system after schema fix - this notification will be deleted',
        'low',
        'system',
        null
      ];
      
      try {
        const insertResult = await client.query(testNotificationQuery, testValues);
        console.log('✅ Test notification created successfully:', insertResult.rows[0]);
        
        // Clean up test notification
        const deleteQuery = 'DELETE FROM notifications WHERE id = $1';
        await client.query(deleteQuery, [insertResult.rows[0].id]);
        console.log('✅ Test notification cleaned up');
        
      } catch (testError) {
        console.error('❌ Test notification creation failed:', testError.message);
        return false;
      }
    }

    // Update migration tracking
    console.log('\n6. Updating migration tracking...');
    const migrationTrackingQuery = `
      INSERT INTO migrations (filename, applied_at) 
      VALUES ('030_fix_notifications_schema_final.sql', NOW())
      ON CONFLICT (filename) DO UPDATE SET applied_at = NOW();
    `;
    
    try {
      await client.query(migrationTrackingQuery);
      console.log('✅ Migration tracking updated');
    } catch (trackingError) {
      console.log('⚠️  Migration tracking update failed (table might not exist):', trackingError.message);
    }

    console.log('\n🎉 Notification schema fix completed successfully!');
    console.log('📋 Summary of changes:');
    console.log('   - Added priority column with constraint');
    console.log('   - Added related_entity_type column');
    console.log('   - Added related_entity_id column');
    console.log('   - Added read_at column');
    console.log('   - Created performance indexes');
    console.log('   - Added trigger for automatic read_at timestamp');
    console.log('   - Updated existing data where needed');
    
    return true;

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
applyNotificationFix().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
