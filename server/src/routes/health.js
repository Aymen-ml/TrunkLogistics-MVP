import express from 'express';
import { getHealthStatus } from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Database health check endpoint
router.get('/db', async (req, res) => {
  try {
    const healthStatus = await getHealthStatus();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json({
      success: healthStatus.status === 'healthy',
      ...healthStatus
    });
    
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// General application health check
router.get('/', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'TruckLogistics API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;