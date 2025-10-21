import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import truckRoutes from './routes/trucks.js';
import truckDocumentRoutes from './routes/truckDocuments.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import downloadRoutes from './routes/downloads.js';
import documentRoutes from './routes/documents.js';
import adminRoutes from './routes/admin.js';
import testRoutes from './routes/test.js';
import testEmailRoutes from './routes/testEmail.js';
import healthRoutes from './routes/health.js';
import diagnosticsRoutes from './routes/diagnostics.js';
import errorHandler from './middleware/errorHandler.js';
import { securityHeaders, corsOptions, sanitizeData } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { serveFileWithFallback, ensureUploadDirectories } from './middleware/fileHandler.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import databaseMonitor from './services/databaseMonitor.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Ensure upload directories exist on startup
ensureUploadDirectories();

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(generalLimiter);
  } else {
  }

app.use(sanitizeData);

// Body parsing middleware with increased limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb', parameterLimit: 100000 }));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Serve uploaded files with improved error handling and fallback
app.use('/uploads', serveFileWithFallback);

// API route for uploads (same handler)
app.use('/api/uploads', serveFileWithFallback);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trucks', truckRoutes);
app.use('/api/truck-documents', truckDocumentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/email', testEmailRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/diagnostics', diagnosticsRoutes);



// Simple health check without database
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
