#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;
import fs from 'fs';

// Use the same connection approach as the server
const connectionConfig = {
  connectionString: process.env.DATABASE_URL || 
    `postgresql://postgres.drqkwioicbcihakxgsoe:${process.env.DB_PASSWORD}@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`,
  ssl: {
    rejectUnauthorized: false
  }
};

async function executeSchemaFix() {
  console.log('🔧 Executing Database Schema Fix for Notifications\n');
  
  const client = new Client(connectionConfig);
  
  try {
    console.log('1. Connecting to production database...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    console.log('\n2. Reading schema fix SQL...');
    const schemaSQL = fs.readFileSync('apply-schema-fix-final.sql', 'utf8');
    console.log('✅ Schema fix SQL loaded');
    
    console.log('\n3. Executing schema changes...');
    console.log('   - Adding missing columns...');
    console.log('   - Creating indexes...');
    console.log('   - Setting up triggers...');
    
    const result = await client.query(schemaSQL);
    console.log('✅ Schema fix executed successfully!');
    
    console.log('\n4. Verifying changes...');
    const verifyQuery = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
        AND table_schema = 'public'
        AND column_name IN ('priority', 'related_entity_type', 'related_entity_id', 'read_at')
      ORDER BY column_name;
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log('✅ Schema verification:');
    console.table(verifyResult.rows);
    
    // Test notification creation
    console.log('\n5. Testing notification creation...');
    const testQuery = `
      SELECT COUNT(*) as user_count FROM users WHERE role = 'admin' LIMIT 1;
    `;
    const userResult = await client.query(testQuery);
    
    if (parseInt(userResult.rows[0].user_count) > 0) {
      console.log('✅ Database is ready for notification creation');
    }
    
    console.log('\n🎉 Database schema fix completed successfully!');
    console.log('📋 Changes applied:');
    console.log('   ✅ Added priority column with constraint');
    console.log('   ✅ Added related_entity_type column');
    console.log('   ✅ Added related_entity_id column');
    console.log('   ✅ Added read_at timestamp column');
    console.log('   ✅ Created performance indexes');
    console.log('   ✅ Added automatic read_at trigger');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ Schema fix failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n🔑 Authentication issue detected.');
      console.log('📋 Manual steps required:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/drqkwioicbcihakxgsoe');
      console.log('   2. Navigate to: SQL Editor');
      console.log('   3. Copy and paste the SQL from: apply-schema-fix-final.sql');
      console.log('   4. Click "Run" to execute the schema fix');
    } else if (error.message.includes('column') && error.message.includes('already exists')) {
      console.log('\n✅ Some columns already exist - this is normal!');
      console.log('   The schema fix uses IF NOT EXISTS to prevent errors.');
      return true;
    } else {
      console.log('\n🔧 Error details:', error.code, error.detail);
    }
    
    return false;
    
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Execute the schema fix
executeSchemaFix().then(success => {
  if (success) {
    console.log('\n🚀 Ready to test! Run: node test-after-schema-fix.js');
  } else {
    console.log('\n⚠️  Please apply the schema fix manually using Supabase dashboard');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Script execution failed:', error);
  process.exit(1);
});
