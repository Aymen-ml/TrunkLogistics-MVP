import bcrypt from 'bcryptjs';
import { query } from './src/config/database.js';
import logger from './src/utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    logger.info('Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await query('SELECT id FROM users WHERE email = $1', ['admin@movelinker.com']);
    if (existingAdmin.rows.length > 0) {
      logger.info('Admin user already exists');
      return;
    }

    // Hash password
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminResult = await query(`
      INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, role
    `, ['admin@movelinker.com', adminPassword, 'admin', 'Admin', 'User', '+1234567890', true, true]);
    
    const admin = adminResult.rows[0];
    logger.info('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      role: admin.role
    });

    logger.info('Admin credentials:');
    logger.info('Email: admin@movelinker.com');
    logger.info('Password: admin123');

  } catch (error) {
    logger.error('Failed to create admin user:', error);
    throw error;
  }
};

// Run the script
createAdmin()
  .then(() => {
    console.log('✅ Admin user creation completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Admin user creation failed:', error.message);
    process.exit(1);
  });
