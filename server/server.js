import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import app from './src/app.js';
import logger from './src/utils/logger.js';
import runStartupFixes from './startup.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Trust proxy for Render deployment (fixes X-Forwarded-For header issues)
app.set('trust proxy', 1);

// Rate limiting (disabled for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Global middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

// Start server with request timeout configuration
const server = app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Run startup fixes after server starts
  setTimeout(() => {
    runStartupFixes().catch(err => {
      console.log('Startup fixes failed (non-critical):', err.message);
    });
  }, 3000);
});

// Set server timeout for long file uploads (3 minutes)
server.timeout = 180000;
server.keepAliveTimeout = 180000;
server.headersTimeout = 180000;

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
