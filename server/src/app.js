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
import errorHandler from './middleware/errorHandler.js';
import { securityHeaders, corsOptions, sanitizeData } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import dotenv from 'dotenv';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

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

// Custom middleware for handling document viewing (inline display)
app.use('/uploads/trucks/documents', (req, res, next) => {
  const filePath = join(__dirname, '../uploads/trucks/documents', req.path);
  const fileExtension = path.extname(req.path).toLowerCase();
  
  // Set appropriate content type based on file extension
  if (fileExtension === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
  } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
    res.setHeader('Content-Type', 'image/jpeg');
  } else if (fileExtension === '.png') {
    res.setHeader('Content-Type', 'image/png');
  } else if (fileExtension === '.gif') {
    res.setHeader('Content-Type', 'image/gif');
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
  }
  
  // Set Content-Disposition to inline for viewing instead of attachment for download
  res.setHeader('Content-Disposition', 'inline; filename=' + path.basename(req.path));
  next();
});

// Serve uploaded files with proper headers
app.use('/uploads', (req, res, next) => {
  const filePath = join(__dirname, '../uploads', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('File send error:', err);
      res.status(404).send('File not found');
    }
  });
});

// API route for uploads with proper headers for viewing
app.use('/api/uploads', (req, res, next) => {
  const filePath = join(__dirname, '../uploads', req.path);
  const fileExtension = path.extname(req.path).toLowerCase();
  
  // Set appropriate content type and disposition for viewing
  if (fileExtension === '.pdf') {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=' + path.basename(req.path));
  } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'inline; filename=' + path.basename(req.path));
  } else if (fileExtension === '.png') {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename=' + path.basename(req.path));
  } else if (fileExtension === '.gif') {
    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Content-Disposition', 'inline; filename=' + path.basename(req.path));
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(req.path));
  }
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('File send error:', err);
      res.status(404).send('File not found');
    }
  });
});

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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
