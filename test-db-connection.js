#!/usr/bin/env node

import dotenv from 'dotenv';
import { query } from './server/src/config/database.js';

dotenv.config();

async function testConnection() {
  console.log('🔌 Testing database connection...');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('DB_HOST:', process.env.DB_HOST || 'Not set');
  
  try {
    const result = await query('SELECT NOW() as current_time, version() as db_version');
    console.log('✅ Database connection successful!');
    console.log('⏰ Current time:', result.rows[0].current_time);
    console.log('📊 Database version:', result.rows[0].db_version);
    
    // Test a simple table query
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:', tables.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();