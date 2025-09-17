#!/usr/bin/env node

/**
 * Deploy Database Migrations to Supabase
 * Run this script to set up your database schema on Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  // Get database URL from environment or prompt
  const databaseUrl = process.env.DATABASE_URL || process.argv[2];
  
  if (!databaseUrl) {
    console.error('❌ Please provide DATABASE_URL as environment variable or command line argument');
    console.log('Usage: node deploy-migrations.js "postgresql://postgres:password@host:5432/postgres"');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'server', 'src', 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Create migrations table if it doesn't exist
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

    // Run pending migrations
    for (const filename of migrationFiles) {
      if (executedFilenames.includes(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${filename}`);
      
      const migrationPath = path.join(migrationsDir, filename);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      try {
        // Execute migration
        await client.query(migrationSQL);
        
        // Record migration as executed
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        
        console.log(`✅ Completed: ${filename}`);
      } catch (error) {
        console.error(`❌ Failed to run migration ${filename}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
