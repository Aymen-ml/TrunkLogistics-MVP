import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

// Direct database configuration (more reliable than pooler)
const dbConfig = {
  host: 'db.drqkwioicbcihakxgsoe.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'igeem002',
  ssl: {
    rejectUnauthorized: false
  },
  // Simple pool settings
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
};

let pool;
let isConnected = false;

// Simple initialization
const initializeDatabase = async () => {
  try {
    logger.info('🔌 Connecting to database...');
    console.log('🔌 Connecting to database...');
    
    pool = new Pool(dbConfig);
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    isConnected = true;
    
    logger.info('✅ Database connection established');
    console.log('✅ Database connection established');
    console.log(`⏰ Database time: ${testResult.rows[0].current_time}`);
    
    // Simple error handler
    pool.on('error', (err) => {
      logger.error('Database pool error:', err);
      isConnected = false;
    });
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    console.error('❌ Database connection failed:', error.message);
    isConnected = false;
    
    // Don't exit, let the app continue and retry
    setTimeout(() => initializeDatabase(), 5000);
  }
};

// Simple query function
export const query = async (text, params) => {
  if (!isConnected || !pool) {
    throw new Error('Database not connected');
  }
  
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    logger.error('Query error:', error.message);
    throw error;
  }
};

// Health check
export const getHealthStatus = async () => {
  try {
    if (!isConnected || !pool) {
      return { status: 'disconnected' };
    }
    
    const result = await pool.query('SELECT NOW() as timestamp');
    return {
      status: 'connected',
      timestamp: result.rows[0].timestamp
    };
  } catch (error) {
    return { status: 'error', error: error.message };
  }
};

// Initialize on import
initializeDatabase();

export { pool };
export default pool;
