import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Create Redis client (optional - falls back to memory store if Redis unavailable)
let redisClient;
try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true
  });
} catch (error) {
  }

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined
});

// Disabled rate limiter for authentication endpoints (development only)
export const authLimiter = (req, res, next) => {
  // Skip rate limiting entirely for development
  next();
};

// Disabled upload rate limiter for development
export const uploadLimiter = (req, res, next) => {
  next();
};

// Disabled booking rate limiter for development
export const bookingLimiter = (req, res, next) => {
  next();
};

// Disabled email rate limiter for development
export const emailLimiter = (req, res, next) => {
  next();
};

export default {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  bookingLimiter,
  emailLimiter
};
