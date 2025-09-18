import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

// Try to resolve IPv4 address for the host
const resolveIPv4 = async (hostname) => {
  return new Promise((resolve, reject) => {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        console.log(`No IPv4 address found for ${hostname}, using hostname`);
        resolve(hostname);
      } else {
        console.log(`Resolved IPv4 for ${hostname}:`, addresses[0]);
        resolve(addresses[0]);
      }
    });
  });
};

// Use Supavisor connection pooler for IPv4 support
// Correct format from Supabase dashboard: postgresql://postgres.[project_ref]:[password]@[region].pooler.supabase.com:5432/postgres
const connectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.drqkwioicbcihakxgsoe:${process.env.DB_PASSWORD}@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`;

console.log('🔄 Attempting connection with Supavisor pooler for IPv4 support...');

const pool = new Pool({
  connectionString: connectionString,
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
