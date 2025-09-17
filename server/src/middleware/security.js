import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", ...(process.env.NODE_ENV === 'development' ? ["http:"] : [])],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api."],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Data sanitization middleware
export const sanitizeData = [
  // Prevent NoSQL injection attacks
  mongoSanitize({
    replaceWith: '_'
  }),
  
  // Prevent XSS attacks
  xss(),
  
  // Prevent HTTP Parameter Pollution
  hpp({
    whitelist: ['sort', 'fields', 'page', 'limit', 'status', 'type']
  })
];

// Input validation helpers
export const validateInput = {
  // Sanitize string input
  sanitizeString: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  },

  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Validate UUID
  isValidUUID: (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Validate numeric input
  isValidNumber: (num, min = null, max = null) => {
    const number = parseFloat(num);
    if (isNaN(number)) return false;
    if (min !== null && number < min) return false;
    if (max !== null && number > max) return false;
    return true;
  },

  // Validate date input
  isValidDate: (date) => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  },

  // Validate file type
  isValidFileType: (filename, allowedTypes) => {
    const ext = filename.toLowerCase().split('.').pop();
    return allowedTypes.includes(ext);
  }
};

// Security middleware for file uploads
export const secureFileUpload = {
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
    const ext = file.originalname.toLowerCase().split('.').pop();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
  
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maximum 5 files
  }
};

export default {
  securityHeaders,
  corsOptions,
  sanitizeData,
  validateInput,
  secureFileUpload
};
