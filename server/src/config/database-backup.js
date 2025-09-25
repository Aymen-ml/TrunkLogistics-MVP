import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

// Database configuration with production-ready settings and fallback
const primaryConnectionString = process.env.DATABASE_URL || 
  `postgresql://postgres.drqkwioicbcihakxgsoe:${process.env.DB_PASSWORD}@aws-1-eu-west-3.pooler.supabase.com:5432/postgres`;

const fallbackConnectionString = `postgresql://postgres:${process.env.DB_PASSWORD || 'igeem002'}@db.drqkwioicbcihakxgsoe.supabase.co:5432/postgres`;

const dbConfig = {
  connectionString: primaryConnectionString,
  ssl: process.env.NODE_ENV === 'production' ? { 
    rejectUnauthorized: false 
  } : false,
  // Connection pool settings optimized for production with longer timeouts
  max: process.env.NODE_ENV === 'production' ? 10 : 5, // Reduced max connections
  min: 1, // Reduced minimum connections
  idleTimeoutMillis: 60000, // Increased idle timeout
  connectionTimeoutMillis: 30000, // Increased connection timeout
  acquireTimeoutMillis: 30000, // Increased acquire timeout
  createTimeoutMillis: 30000, // Increased create timeout
  destroyTimeoutMillis: 10000, // Increased destroy timeout
  reapIntervalMillis: 2000, // Increased reap interval
  createRetryIntervalMillis: 500, // Increased retry interval
  // Enable keep-alive for long-running connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
  // Add query timeout
  query_timeout: 30000,
  statement_timeout: 30000
};

let pool;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 5000;

// Initialize database connection with retry logic
const initializeDatabase = async (useFallback = false) => {
  try {
    const connectionConfig = useFallback ? 
      { ...dbConfig, connectionString: fallbackConnectionString } : 
      dbConfig;

    if (useFallback) {
      logger.warn('Using fallback direct database connection');
    } else {
      logger.info('🔄 Attempting connection with Supavisor pooler for IPv4 support...');
    }
    
    pool = new Pool(connectionConfig);
    
    // Connection event handlers
    pool.on('connect', (client) => {
      isConnected = true;
      reconnectAttempts = 0;
      logger.info('✅ Database connection established', { 
        processId: client.processID,
        connectionType: useFallback ? 'direct' : 'pooler'
      });
    });

    pool.on('acquire', (client) => {
      logger.debug('Client acquired from pool', { processId: client.processID });
    });

    pool.on('remove', (client) => {
      logger.debug('Client removed from pool', { processId: client.processID });
    });

    pool.on('error', async (err, client) => {
      isConnected = false;
      logger.error('Database pool error', { 
        error: err.message, 
        stack: err.stack,
        processId: client?.processID 
      });
      
      // Try fallback if not already using it
      if (!useFallback) {
        logger.warn('Primary connection failed, trying fallback...');
        await initializeDatabase(true);
      } else {
        await handleReconnection();
      }
    });

    // Test initial connection
    await testConnection();
    
    logger.info('Database initialized successfully', {
      maxConnections: dbConfig.max,
      minConnections: dbConfig.min,
      environment: process.env.NODE_ENV,
      connectionType: useFallback ? 'direct' : 'pooler'
    });
    
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    
    // Try fallback if not already using it
    if (!useFallback) {
      logger.warn('Primary connection failed, trying fallback...');
      await initializeDatabase(true);
    } else {
      await handleReconnection();
    }
  }
};

// Handle reconnection with exponential backoff
const handleReconnection = async () => {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error('Max reconnection attempts reached. Exiting process.');
    process.exit(1);
  }

  reconnectAttempts++;
  const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1); // Exponential backoff
  
  logger.warn(`Attempting database reconnection ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
  
  setTimeout(async () => {
    try {
      if (pool) {
        await pool.end();
      }
      await initializeDatabase();
    } catch (error) {
      logger.error('Reconnection attempt failed', { error: error.message });
      await handleReconnection();
    }
  }, delay);
};

// Enhanced connection test with health check
const testConnection = async () => {
  let client;
  try {
    logger.info('Testing database connection...');
    
    client = await pool.connect();
    
    // Test basic connectivity
    const timeResult = await client.query('SELECT NOW() as current_time');
    
    // Test database health
    const healthResult = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as postgres_version,
        pg_database_size(current_database()) as db_size
    `);
    
    isConnected = true;
    
    logger.info('Database connection test successful', {
      currentTime: timeResult.rows[0].current_time,
      database: healthResult.rows[0].database_name,
      user: healthResult.rows[0].user_name,
      version: healthResult.rows[0].postgres_version.split(' ')[0] + ' ' + healthResult.rows[0].postgres_version.split(' ')[1],
      size: `${Math.round(healthResult.rows[0].db_size / 1024 / 1024)} MB`
    });
    
  } catch (error) {
    isConnected = false;
    logger.error('Database connection test failed', { 
      error: error.message,
      code: error.code,
      detail: error.detail 
    });
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Enhanced query function with retry logic and monitoring
export const query = async (text, params, retries = 3) => {
  const start = Date.now();
  let attempt = 0;
  
  while (attempt < retries) {
    let client;
    try {
      if (!isConnected) {
        throw new Error('Database not connected');
      }
      
      client = await pool.connect();
      const res = await client.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Query executed successfully', { 
        duration, 
        rows: res.rowCount,
        attempt: attempt + 1
      });
      
      return res;
      
    } catch (error) {
      attempt++;
      const duration = Date.now() - start;
      
      logger.error('Database query error', { 
        error: error.message,
        code: error.code,
        attempt,
        duration,
        query: text.substring(0, 100) + (text.length > 100 ? '...' : '')
      });
      
      if (client) {
        client.release();
      }
      
      // If it's a connection error, mark as disconnected
      if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        isConnected = false;
      }
      
      // If this was the last attempt, throw the error
      if (attempt >= retries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Enhanced transaction support
export const transaction = async (callback) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    
    logger.debug('Transaction completed successfully');
    return result;
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', { error: error.message });
    throw error;
  } finally {
    client.release();
  }
};

// Health check endpoint helper
export const getHealthStatus = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        COUNT(*) as active_connections,
        current_database() as database,
        current_user as user,
        NOW() as timestamp
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `);
    client.release();
    
    return {
      status: 'healthy',
      connected: isConnected,
      activeConnections: result.rows[0].active_connections,
      database: result.rows[0].database,
      user: result.rows[0].user,
      timestamp: result.rows[0].timestamp,
      poolStats: {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  try {
    logger.info('Closing database connections...');
    await pool.end();
    isConnected = false;
    logger.info('Database connections closed successfully');
  } catch (error) {
    logger.error('Error closing database connections', { error: error.message });
  }
};

// Helper function to get a client from the pool
export const getClient = async () => {
  if (!isConnected) {
    throw new Error('Database not connected');
  }
  return await pool.connect();
};

// Initialize database on module load
initializeDatabase();

// Handle process termination
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
process.on('beforeExit', closeDatabase);

export { pool };
export default pool;
