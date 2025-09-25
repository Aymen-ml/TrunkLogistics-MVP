#!/usr/bin/env node

import dotenv from 'dotenv';
import { pool, query } from './src/config/database.js';
import logger from './src/utils/logger.js';

dotenv.config();

const deploymentFixes = async () => {
  console.log('🔧 Starting deployment fixes...');
  
  try {
    // Test database connection first
    console.log('1. Testing database connection...');
    await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');

    // Fix missing columns in customer_profiles
    console.log('2. Fixing customer_profiles schema...');
    await query(`
      ALTER TABLE customer_profiles 
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Unknown'
    `);
    console.log('✅ Added country column to customer_profiles');

    // Fix notifications schema
    console.log('3. Fixing notifications schema...');
    await query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS related_entity_id INTEGER
    `);
    console.log('✅ Added missing notification columns');

    // Fix array data type issues in trucks table
    console.log('4. Fixing trucks table array columns...');
    await query(`
      UPDATE trucks 
      SET images = '[]'::jsonb 
      WHERE images IS NULL OR images = '' OR images = '[]'
    `);
    console.log('✅ Fixed trucks images array format');

    // Create missing indexes for performance
    console.log('5. Creating performance indexes...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(status);
      CREATE INDEX IF NOT EXISTS idx_trucks_provider_id ON trucks(provider_id);
      CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    `);
    console.log('✅ Created performance indexes');

    // Verify critical tables exist
    console.log('6. Verifying critical tables...');
    const tables = ['users', 'trucks', 'bookings', 'notifications', 'documents'];
    for (const table of tables) {
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (!result.rows[0].exists) {
        throw new Error(`Critical table ${table} is missing`);
      }
    }
    console.log('✅ All critical tables verified');

    console.log('🎉 All deployment fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment fix failed:', error.message);
    logger.error('Deployment fix error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run the fixes
deploymentFixes();