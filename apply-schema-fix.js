#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Database connection details from the app
const supabaseUrl = 'https://drqkwioicbcihakxgsoe.supabase.co';

// Get service key from environment or use a placeholder
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set the environment variable and try again.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchemaFix() {
  console.log('🔧 Applying notification schema fix to production database...\n');
  
  try {
    // Read the schema fix SQL
    const schemaFixSQL = fs.readFileSync('fix-notification-schema-production.sql', 'utf8');
    
    console.log('1. Executing schema fix SQL...');
    
    // Split the SQL into individual statements and execute them
    const statements = schemaFixSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().includes('select')) {
        // Skip SELECT statements as they're just for verification
        continue;
      }
      
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { 
        sql: statement + ';' 
      });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        // Continue with other statements
      } else {
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('\n2. Verifying schema changes...');
    
    // Check if the required columns exist
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
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
    
    // Show current schema
    console.log('\n3. Current notifications table schema:');
    columns.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    console.log('\n🎉 Notification schema fix completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the schema fix
applySchemaFix().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
