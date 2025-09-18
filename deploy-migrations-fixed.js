#!/usr/bin/env node

/**
 * Deploy Database Migrations to Supabase (Fixed Version)
 * This version handles IPv6 issues and connection problems
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  // Parse connection details
  const host = 'db.drqkwioicbcihakxgsoe.supabase.co';
  const port = 5432;
  const database = 'postgres';
  const user = 'postgres';
  const password = process.env.DB_PASSWORD || process.argv[2];
  
  if (!password) {
    console.error('❌ Please provide password as environment variable DB_PASSWORD or command line argument');
    console.log('Usage: DB_PASSWORD=your_password node deploy-migrations-fixed.js');
    console.log('   OR: node deploy-migrations-fixed.js your_password');
    process.exit(1);
  }

  // Create client with explicit IPv4 configuration
  const client = new Client({
    host: host,
    port: port,
    database: database,
    user: user,
    password: password,
    ssl: { rejectUnauthorized: false },
    // Force IPv4
    family: 4,
    // Connection timeout
    connectionTimeoutMillis: 10000,
    // Query timeout
    query_timeout: 30000,
    // Statement timeout
    statement_timeout: 30000
  });

  try {
    console.log('🔌 Connecting to database...');
    console.log(`📍 Host: ${host}`);
    console.log(`👤 User: ${user}`);
    
    await client.connect();
    console.log('✅ Connected to database successfully');

    // Test connection
    const testResult = await client.query('SELECT NOW() as current_time');
    console.log(`⏰ Database time: ${testResult.rows[0].current_time}`);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'server', 'src', 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Create migrations table if it doesn't exist
    console.log('🔧 Creating migrations tracking table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check which migrations have already been run
    const { rows: executedMigrations } = await client.query(
      'SELECT filename FROM migrations ORDER BY executed_at'
    );
    const executedFilenames = executedMigrations.map(row => row.filename);
    console.log(`📋 Previously executed migrations: ${executedFilenames.length}`);

    // Run pending migrations
    let executedCount = 0;
    for (const filename of migrationFiles) {
      if (executedFilenames.includes(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${filename}`);
      
      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      try {
        // Begin transaction
        await client.query('BEGIN');
        
        // Execute migration
        await client.query(migrationSQL);
        
        // Record migration as executed
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        
        // Commit transaction
        await client.query('COMMIT');
        
        console.log(`✅ Completed: ${filename}`);
        executedCount++;
      } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        console.error(`❌ Failed to run migration ${filename}:`, error.message);
        throw error;
      }
    }

    console.log(`🎉 Migration complete! Executed ${executedCount} new migrations.`);
    console.log('🚀 Your Supabase database is ready for TrunkLogistics!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.code === 'ENETUNREACH') {
      console.log('\n🔧 Troubleshooting network connectivity:');
      console.log('1. Check your internet connection');
      console.log('2. Try using a VPN if you have connectivity issues');
      console.log('3. Verify Supabase project is active and accessible');
      console.log('4. Check if your firewall is blocking the connection');
    } else if (error.code === 'EAUTH' || error.message.includes('authentication')) {
      console.log('\n🔧 Authentication issue:');
      console.log('1. Verify your password is correct');
      console.log('2. Check if your Supabase project is active');
      console.log('3. Make sure you\'re using the correct database credentials');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
