import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL with proper SSL configuration for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

// Test the connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  console.error('❌ Database connection error:', err.message);
  process.exit(-1);
});

// Test connection on startup
const testConnection = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection test successful:', result.rows[0]);
    logger.info('Database connection test successful');
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    logger.error('Database connection test failed:', error);
  }
};

// Run connection test
testConnection();

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    logger.error('Database query error', { text, error: error.message });
    throw error;
  }
};

// Helper function to get a client from the pool
export const getClient = async () => {
  return await pool.connect();
};

export { pool };
export default pool;
