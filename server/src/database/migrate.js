import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { query, pool } from '../config/database.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runMigrations = async (options = { force: false }) => {
  const client = await pool.connect();
  
  try {
    logger.info('Starting database migrations...');
    
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const executedMigrations = await client.query('SELECT filename FROM migrations');
    const executedFiles = new Set(executedMigrations.rows.map(row => row.filename));

    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      if (executedFiles.has(file) && !options.force) {
        logger.info(`Migration ${file} already executed, skipping...`);
        continue;
      }

      logger.info(`Executing migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query('BEGIN');
      
      try {
        // Execute migration
        await client.query(sql);
        
        // Record migration as executed
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING',
          [file]
        );
        
        await client.query('COMMIT');
        logger.info(`Migration ${file} completed successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        logger.error(`Failed to execute migration ${file}:`, error);
        throw error;
      }
    }

    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Run migrations if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const force = process.argv.includes('--force');
  
  runMigrations({ force })
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    });
}

export default runMigrations;