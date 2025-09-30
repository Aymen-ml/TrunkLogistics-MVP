import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

// Database configuration that works with both Render and local development
const dbConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  // Connection pool settings optimized for Render/Supabase
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // Keep connections alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
} : {
  // Fallback for local development or when DATABASE_URL is not set
  host: process.env.DB_HOST || 'db.drqkwioicbcihakxgsoe.supabase.co',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'igeem002',
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};

let pool;
let isConnected = false;
let reconnectTimeout = null;
let keepAliveInterval = null;

// Simple initialization
const initializeDatabase = async () => {
  try {
    logger.info('🔌 Connecting to database...');
    console.log('🔌 Connecting to database...');
    
    // Clear any existing pool
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        // Ignore errors when ending old pool
      }
    }
    
    // Clear existing keep-alive interval
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    
    pool = new Pool(dbConfig);
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    isConnected = true;
    
    logger.info('✅ Database connection established');
    console.log('✅ Database connection established');
    console.log(`⏰ Database time: ${testResult.rows[0].current_time}`);
    
    // Simple error handler with reconnection
    pool.on('error', (err) => {
      logger.error('Database pool error:', err);
      console.error('Database pool error:', err.message);
      isConnected = false;
      
      // Attempt to reconnect after a delay
      if (!reconnectTimeout) {
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          logger.info('Attempting to reconnect to database...');
          initializeDatabase();
        }, 5000);
      }
    });
    
    // Keep-alive query every 25 seconds to prevent connection timeout
    // Supabase/Postgres typically has 30-60 second idle timeout
    keepAliveInterval = setInterval(async () => {
      if (isConnected && pool) {
        try {
          await pool.query('SELECT 1');
          logger.debug('Keep-alive query successful');
        } catch (error) {
          logger.error('Keep-alive query failed:', error.message);
          isConnected = false;
          // The pool error handler will trigger reconnection
        }
      }
    }, 25000);
    
  } catch (error) {
    logger.error('❌ Database connection failed:', error.message);
    console.error('❌ Database connection failed:', error.message);
    isConnected = false;
    
    // Don't exit, let the app continue and retry
    if (!reconnectTimeout) {
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        initializeDatabase();
      }, 5000);
    }
  }
};

// Simple query function with retry logic
export const query = async (text, params) => {
  if (!isConnected || !pool) {
    // Try to reconnect if not connected
    if (!reconnectTimeout) {
      initializeDatabase();
    }
    throw new Error('Database not connected');
  }
  
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    logger.error('Query error:', error.message);
    
    // If it's a connection error, mark as disconnected
    if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
      isConnected = false;
      if (!reconnectTimeout) {
        initializeDatabase();
      }
    }
    
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

// Graceful shutdown
export const closeDatabase = async () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (pool) {
    try {
      await pool.end();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database:', error.message);
    }
  }
  
  isConnected = false;
};

// Initialize on import
initializeDatabase();

export { pool };
export default pool;
