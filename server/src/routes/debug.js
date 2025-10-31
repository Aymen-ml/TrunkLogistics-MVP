import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Simple test endpoint to check provider profile and database connectivity
router.get('/test-provider', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    logger.info('=== TEST PROVIDER ENDPOINT ===');
    logger.info('User ID:', userId);
    logger.info('User Role:', req.user.role);
    logger.info('User Email:', req.user.email);
    
    // Test 1: Check provider profile exists
    const profileQuery = await pool.query(
      'SELECT * FROM provider_profiles WHERE user_id = $1',
      [userId]
    );
    
    logger.info('Provider profile query result:', profileQuery.rows.length, 'rows');
    
    if (profileQuery.rows.length > 0) {
      logger.info('Provider profile found:', profileQuery.rows[0]);
    }
    
    // Test 2: Check bookings table
    const bookingsQuery = await pool.query(
      'SELECT COUNT(*) as count FROM bookings WHERE provider_id = $1',
      [profileQuery.rows.length > 0 ? profileQuery.rows[0].id : null]
    );
    
    logger.info('Bookings count:', bookingsQuery.rows[0]);
    
    // Test 3: Check trucks table
    const trucksQuery = await pool.query(
      'SELECT COUNT(*) as count FROM trucks WHERE provider_id = $1',
      [profileQuery.rows.length > 0 ? profileQuery.rows[0].id : null]
    );
    
    logger.info('Trucks count:', trucksQuery.rows[0]);
    
    res.json({
      success: true,
      data: {
        userId,
        userRole: req.user.role,
        providerProfile: profileQuery.rows[0] || null,
        bookingsCount: bookingsQuery.rows[0]?.count || 0,
        trucksCount: trucksQuery.rows[0]?.count || 0
      }
    });
    
  } catch (error) {
    logger.error('Test provider endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

export default router;
