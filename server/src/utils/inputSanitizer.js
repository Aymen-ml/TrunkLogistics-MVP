import validator from 'validator';
import { AppError } from '../middleware/errorHandler.js';

// Input sanitization utilities
export const sanitizeInput = {
  // Sanitize and validate string input
  string: (value, options = {}) => {
    if (typeof value !== 'string') {
      throw new AppError('Invalid input type, expected string', 400);
    }

    let sanitized = value.trim();
    
    // Remove HTML tags if specified
    if (options.stripHtml !== false) {
      sanitized = validator.escape(sanitized);
    }
    
    // Check length constraints
    if (options.minLength && sanitized.length < options.minLength) {
      throw new AppError(`Input must be at least ${options.minLength} characters long`, 400);
    }
    
    if (options.maxLength && sanitized.length > options.maxLength) {
      throw new AppError(`Input must be no more than ${options.maxLength} characters long`, 400);
    }
    
    // Check for required field
    if (options.required && !sanitized) {
      throw new AppError('This field is required', 400);
    }
    
    return sanitized;
  },

  // Sanitize and validate email
  email: (value) => {
    const sanitized = sanitizeInput.string(value, { required: true, maxLength: 255 });
    
    if (!validator.isEmail(sanitized)) {
      throw new AppError('Invalid email format', 400);
    }
    
    return validator.normalizeEmail(sanitized);
  },

  // Sanitize and validate phone number
  phone: (value) => {
    if (!value) return null;
    
    const sanitized = sanitizeInput.string(value, { maxLength: 20 });
    
    // Remove all non-digit characters except + for international numbers
    const cleaned = sanitized.replace(/[^\d+]/g, '');
    
    if (cleaned.length < 10) {
      throw new AppError('Phone number must be at least 10 digits', 400);
    }
    
    return cleaned;
  },

  // Sanitize and validate numeric input
  number: (value, options = {}) => {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      throw new AppError('Invalid number format', 400);
    }
    
    if (options.min !== undefined && num < options.min) {
      throw new AppError(`Value must be at least ${options.min}`, 400);
    }
    
    if (options.max !== undefined && num > options.max) {
      throw new AppError(`Value must be no more than ${options.max}`, 400);
    }
    
    if (options.integer && !Number.isInteger(num)) {
      throw new AppError('Value must be an integer', 400);
    }
    
    return num;
  },

  // Sanitize and validate integer
  integer: (value, options = {}) => {
    return sanitizeInput.number(value, { ...options, integer: true });
  },

  // Sanitize and validate boolean
  boolean: (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1') return true;
      if (lower === 'false' || lower === '0') return false;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    
    throw new AppError('Invalid boolean value', 400);
  },

  // Sanitize and validate date
  date: (value) => {
    if (!value) return null;
    
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }
    
    return date;
  },

  // Sanitize and validate UUID
  uuid: (value) => {
    const sanitized = sanitizeInput.string(value, { required: true });
    
    if (!validator.isUUID(sanitized)) {
      throw new AppError('Invalid UUID format', 400);
    }
    
    return sanitized;
  },

  // Sanitize and validate URL
  url: (value) => {
    if (!value) return null;
    
    const sanitized = sanitizeInput.string(value, { maxLength: 2048 });
    
    if (!validator.isURL(sanitized)) {
      throw new AppError('Invalid URL format', 400);
    }
    
    return sanitized;
  },

  // Sanitize array input
  array: (value, itemSanitizer, options = {}) => {
    if (!Array.isArray(value)) {
      throw new AppError('Invalid input type, expected array', 400);
    }
    
    if (options.minLength && value.length < options.minLength) {
      throw new AppError(`Array must have at least ${options.minLength} items`, 400);
    }
    
    if (options.maxLength && value.length > options.maxLength) {
      throw new AppError(`Array must have no more than ${options.maxLength} items`, 400);
    }
    
    return value.map(item => itemSanitizer(item));
  },

  // Sanitize object input
  object: (value, schema) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new AppError('Invalid input type, expected object', 400);
    }
    
    const sanitized = {};
    
    for (const [key, sanitizer] of Object.entries(schema)) {
      if (value.hasOwnProperty(key)) {
        sanitized[key] = sanitizer(value[key]);
      }
    }
    
    return sanitized;
  },

  // Sanitize enum values
  enum: (value, allowedValues) => {
    const sanitized = sanitizeInput.string(value, { required: true });
    
    if (!allowedValues.includes(sanitized)) {
      throw new AppError(`Invalid value. Allowed values: ${allowedValues.join(', ')}`, 400);
    }
    
    return sanitized;
  }
};

// Common validation patterns
export const patterns = {
  // Alphanumeric with spaces, hyphens, underscores
  name: /^[a-zA-Z0-9\s\-_]+$/,
  
  // License plate (flexible format)
  licensePlate: /^[A-Z0-9\-\s]+$/i,
  
  // Postal/ZIP code
  postalCode: /^[A-Z0-9\s\-]+$/i,
  
  // Simple password (at least 8 chars, 1 letter, 1 number)
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
};

// Validate against pattern
export const validatePattern = (value, pattern, errorMessage) => {
  const sanitized = sanitizeInput.string(value, { required: true });
  
  if (!pattern.test(sanitized)) {
    throw new AppError(errorMessage || 'Invalid format', 400);
  }
  
  return sanitized;
};

export default sanitizeInput;
