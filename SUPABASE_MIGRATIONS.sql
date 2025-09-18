-- =====================================================
-- TRUNKLOGISTICS DATABASE MIGRATIONS FOR SUPABASE
-- =====================================================
-- Copy and paste these SQL blocks into Supabase SQL Editor
-- Run them one by one in the order provided

-- =====================================================
-- MIGRATION 1: Create Base Tables
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create customer profiles table
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

-- Create provider profiles table
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
    provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    truck_type VARCHAR(50) NOT NULL,
    capacity_tons DECIMAL(8,2) NOT NULL,
    dimensions_length DECIMAL(8,2),
    dimensions_width DECIMAL(8,2),
    dimensions_height DECIMAL(8,2),
    license_plate VARCHAR(20) NOT NULL,
    year INTEGER,
    make VARCHAR(50),
    model VARCHAR(50),
    location_city VARCHAR(100) NOT NULL,
    location_address TEXT,
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_license VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pickup_location TEXT NOT NULL,
    delivery_location TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    delivery_date DATE,
    pickup_time TIME,
    delivery_time TIME,
    cargo_description TEXT,
    cargo_weight DECIMAL(8,2),
    special_requirements TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    total_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    truck_id UUID REFERENCES trucks(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verification_notes TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_trucks_provider_id ON trucks(provider_id);
CREATE INDEX IF NOT EXISTS idx_trucks_location_city ON trucks(location_city);
CREATE INDEX IF NOT EXISTS idx_trucks_is_available ON trucks(is_available);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_truck_id ON bookings(truck_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference_number ON bookings(reference_number);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_truck_id ON documents(truck_id);
CREATE INDEX IF NOT EXISTS idx_documents_booking_id ON documents(booking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- MIGRATION 2: Add Truck Images Support
-- =====================================================

-- Add image columns to trucks table
ALTER TABLE trucks 
ADD COLUMN IF NOT EXISTS image_urls TEXT[],
ADD COLUMN IF NOT EXISTS primary_image_url TEXT;

-- =====================================================
-- MIGRATION 3: Add Soft Delete to Bookings
-- =====================================================

-- Add soft delete support to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- =====================================================
-- MIGRATION 4: Add Additional Document Types
-- =====================================================

-- Update document types constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
    'driver_license', 'vehicle_registration', 'insurance', 'business_license',
    'identity_document', 'cargo_manifest', 'delivery_receipt', 'invoice',
    'truck_inspection', 'additional_documents'
));

-- =====================================================
-- MIGRATION 5: Add Email Verification Tokens
-- =====================================================

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);

-- =====================================================
-- MIGRATION 6: Add Revenue Tracking
-- =====================================================

-- Add revenue tracking to trucks
ALTER TABLE trucks 
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;

-- =====================================================
-- MIGRATION 7: Update Booking Status Constraints
-- =====================================================

-- Update booking status to include more statuses
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'));

-- =====================================================
-- MIGRATION 8: Create Migrations Tracking Table
-- =====================================================

-- Create migrations table to track which migrations have been run
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record that all migrations have been executed
INSERT INTO migrations (filename) VALUES 
('001_create_tables.sql'),
('002_add_truck_images.sql'),
('003_add_soft_delete_bookings.sql'),
('004_add_additional_docs_type.sql'),
('005_add_email_verification.sql'),
('006_add_revenue_tracking.sql'),
('007_update_booking_status_constraints.sql')
ON CONFLICT (filename) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables were created
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show table counts (should all be 0 for new database)
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'trucks', COUNT(*) FROM trucks
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'customer_profiles', COUNT(*) FROM customer_profiles
UNION ALL
SELECT 'provider_profiles', COUNT(*) FROM provider_profiles
UNION ALL
SELECT 'password_reset_tokens', COUNT(*) FROM password_reset_tokens
UNION ALL
SELECT 'email_verification_tokens', COUNT(*) FROM email_verification_tokens
UNION ALL
SELECT 'migrations', COUNT(*) FROM migrations;
