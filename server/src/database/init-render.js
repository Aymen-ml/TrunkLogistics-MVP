import { query } from '../config/database.js';
import logger from '../utils/logger.js';

// Simple database initialization for Render deployment
export async function initializeRenderDatabase() {
  try {
    logger.info('🔧 Initializing database schema...');
    console.log('🔧 Initializing database schema...');

    // Enable UUID extension
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create migrations tracking table
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if initial migration has been run
    const migrationCheck = await query(
      'SELECT filename FROM migrations WHERE filename = $1',
      ['001_create_tables.sql']
    );

    if (migrationCheck.rows.length === 0) {
      logger.info('📋 Running initial database migration...');
      console.log('📋 Running initial database migration...');

      // Run the main migration
      await query(`
        -- Create users table
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          phone VARCHAR(20),
          is_active BOOLEAN DEFAULT true,
          email_verified BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create customer_profiles table
        CREATE TABLE IF NOT EXISTS customer_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          company_name VARCHAR(255),
          address TEXT,
          city VARCHAR(100),
          postal_code VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create provider_profiles table
        CREATE TABLE IF NOT EXISTS provider_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          company_name VARCHAR(255) NOT NULL,
          business_license VARCHAR(255),
          address TEXT NOT NULL,
          city VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20),
          is_verified BOOLEAN DEFAULT false,
          verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create trucks table
        CREATE TABLE IF NOT EXISTS trucks (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
          license_plate VARCHAR(50) UNIQUE NOT NULL,
          truck_type VARCHAR(20) NOT NULL CHECK (truck_type IN ('flatbed', 'container', 'refrigerated', 'tanker', 'box', 'other')),
          capacity_weight DECIMAL(10,2),
          capacity_volume DECIMAL(10,2),
          make VARCHAR(100),
          model VARCHAR(100),
          year INTEGER,
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create documents table
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('truck', 'provider')),
          entity_id UUID NOT NULL,
          document_type VARCHAR(30) NOT NULL CHECK (document_type IN ('registration', 'technical_inspection', 'insurance', 'license', 'business_license')),
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER,
          mime_type VARCHAR(100),
          expiry_date DATE,
          verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
          verified_by UUID REFERENCES users(id),
          verified_at TIMESTAMP,
          uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create bookings table
        CREATE TABLE IF NOT EXISTS bookings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
          truck_id UUID REFERENCES trucks(id),
          status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_transit', 'completed', 'cancelled')),
          pickup_location TEXT NOT NULL,
          delivery_location TEXT NOT NULL,
          pickup_date TIMESTAMP NOT NULL,
          delivery_date TIMESTAMP NOT NULL,
          cargo_type VARCHAR(100),
          cargo_weight DECIMAL(10,2),
          cargo_volume DECIMAL(10,2),
          special_requirements TEXT,
          price DECIMAL(10,2),
          payment_status VARCHAR(20) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create notifications table
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'info',
          is_read BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Create password_reset_tokens table
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Mark migration as completed
      await query(
        'INSERT INTO migrations (filename) VALUES ($1)',
        ['001_create_tables.sql']
      );

      logger.info('✅ Database schema initialized successfully');
      console.log('✅ Database schema initialized successfully');
    } else {
      logger.info('✅ Database schema already initialized');
      console.log('✅ Database schema already initialized');
    }

    return true;
  } catch (error) {
    logger.error('❌ Database initialization failed:', error.message);
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}