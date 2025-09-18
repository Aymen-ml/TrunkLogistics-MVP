#!/usr/bin/env node

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use the same connection string as the app
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.drqkwioicbcihakxgsoe:${process.env.DB_PASSWORD}@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

const fixPasswordResetSchema = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Check current table structure
    console.log('🔍 Checking current password_reset_tokens table structure...');
    const tableCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_tokens'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current columns:', tableCheck.rows);
    
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Table password_reset_tokens does not exist!');
      console.log('🔄 Creating table with correct schema...');
      
      await client.query(`
        CREATE TABLE password_reset_tokens (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);`);
      
      console.log('✅ Table created successfully!');
    } else {
      // Check if used_at column exists
      const usedAtExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'password_reset_tokens' AND column_name = 'used_at'
        );
      `);
      
      if (!usedAtExists.rows[0].exists) {
        console.log('❌ Column "used_at" does not exist!');
        
        // Check if 'used' column exists
        const usedExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'password_reset_tokens' AND column_name = 'used'
          );
        `);
        
        if (usedExists.rows[0].exists) {
          console.log('🔄 Renaming "used" column to "used_at"...');
          await client.query(`ALTER TABLE password_reset_tokens RENAME COLUMN used TO used_at;`);
          console.log('✅ Column renamed successfully!');
        } else {
          console.log('🔄 Adding "used_at" column...');
          await client.query(`ALTER TABLE password_reset_tokens ADD COLUMN used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;`);
          console.log('✅ Column added successfully!');
        }
      } else {
        console.log('✅ Column "used_at" already exists!');
      }
    }
    
    // Final verification
    console.log('🔍 Final table structure:');
    const finalCheck = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_tokens'
      ORDER BY ordinal_position;
    `);
    
    console.log('Final columns:', finalCheck.rows);
    
    // Test the problematic query
    console.log('🧪 Testing the problematic query...');
    try {
      await client.query('SELECT used_at FROM password_reset_tokens LIMIT 1');
      console.log('✅ Query test successful!');
    } catch (error) {
      console.log('❌ Query test failed:', error.message);
    }
    
    console.log('🎉 Schema fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the fix
fixPasswordResetSchema()
  .then(() => {
    console.log('✅ Password reset schema fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Schema fix failed:', error.message);
    process.exit(1);
  });
