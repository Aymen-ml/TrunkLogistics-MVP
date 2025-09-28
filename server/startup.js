#!/usr/bin/env node

import dotenv from 'dotenv';
import { pool, query } from './src/config/database.js';
import logger from './src/utils/logger.js';
import { initializeRenderDatabase } from './src/database/init-render.js';

dotenv.config();

const runStartupFixes = async () => {
  console.log('🔧 Running startup fixes...');
  
  try {
    // Wait a bit for database to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Initialize database schema if needed
    console.log('1. Initializing database schema...');
    const dbInitialized = await initializeRenderDatabase();
    if (!dbInitialized) {
      console.log('⚠️ Database initialization failed, continuing...');
    }
    
    // Test database connection
    console.log('2. Testing database connection...');
    await query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');

    // Fix missing columns (safe operations)
    console.log('3. Applying safe schema fixes...');
    
    await query(`
      ALTER TABLE customer_profiles 
      ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Unknown'
    `);
    
    await query(`
      ALTER TABLE notifications 
      ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS related_entity_id INTEGER
    `);
    
    // Fix array data
    await query(`
      UPDATE trucks 
      SET images = '[]'::jsonb 
      WHERE images IS NULL OR images = '' OR images = '[]'
    `);
    
    console.log('✅ Startup fixes completed successfully!');
    
  } catch (error) {
    console.error('⚠️ Startup fix failed (non-critical):', error.message);
    logger.error('Startup fix error:', error);
  }
};

export default runStartupFixes;