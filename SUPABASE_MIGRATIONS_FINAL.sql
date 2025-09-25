-- =====================================================
-- TRUNKLOGISTICS FINAL CORRECTED DATABASE MIGRATIONS FOR SUPABASE
-- =====================================================
-- This version matches EXACTLY what the application expects
-- Based on thorough analysis of models, controllers, and migration files

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
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

-- =====================================================
-- 2. CUSTOMER PROFILES TABLE
-- =====================================================
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

-- =====================================================
-- 3. PROVIDER PROFILES TABLE (with all extended fields)
-- =====================================================
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_license VARCHAR(255),
    street_address TEXT,  -- Note: renamed from 'address' in migrations
    city VARCHAR(100),
    postal_code VARCHAR(20),
    state_province VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    -- Extended fields from migrations
    business_type VARCHAR(50) DEFAULT 'individual',
    business_phone VARCHAR(50),
    industry_sector VARCHAR(100),
    contact_person_name VARCHAR(255),
    contact_person_position VARCHAR(100),
    contact_person_email VARCHAR(255),
    contact_person_phone VARCHAR(50),
    delivery_instructions TEXT,
    preferred_payment_methods TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. TRUCKS TABLE (with all fields the app actually uses)
-- =====================================================
CREATE TABLE IF NOT EXISTS trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES provider_profiles(id) ON DELETE CASCADE,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    truck_type VARCHAR(50) NOT NULL,
    -- Capacity fields
    capacity_weight DECIMAL(10,2),
    capacity_volume DECIMAL(10,2),
    -- Vehicle details
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    -- Pricing fields (critical for the app)
    price_per_km DECIMAL(10,2),
    fixed_price DECIMAL(10,2),
    pricing_type VARCHAR(20) CHECK (pricing_type IN ('per_km', 'fixed', 'hourly', 'daily')),
    -- Rental/equipment fields
    service_type VARCHAR(20) DEFAULT 'transport' CHECK (service_type IN ('transport', 'rental')),
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    work_location VARCHAR(255),
    -- Driver information
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    driver_license_number VARCHAR(50),
    -- Status and images
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    images TEXT[], -- Array of image URLs
    -- Revenue tracking
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. BOOKINGS TABLE (matching the app's actual structure)
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(20) UNIQUE,  -- Note: field name is 'reference' not 'reference_number'
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
    truck_id UUID REFERENCES trucks(id) ON DELETE SET NULL,
    -- Location fields (as used by the app)
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100),
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100),
    -- Date/time fields
    pickup_date DATE NOT NULL,
    pickup_time TIME,
    -- Cargo details
    cargo_description TEXT,
    cargo_weight DECIMAL(10,2),
    cargo_volume DECIMAL(10,2),
    estimated_distance DECIMAL(10,2),
    -- Pricing
    total_price DECIMAL(10,2),
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'approved', 'in_transit', 'in_progress', 'completed', 'cancelled', 'rejected')),
    -- Rental-specific fields
    service_type VARCHAR(20) DEFAULT 'transport' CHECK (service_type IN ('transport', 'rental')),
    rental_start_datetime TIMESTAMP,
    rental_end_datetime TIMESTAMP,
    work_address TEXT,
    operator_required BOOLEAN DEFAULT false,
    operator_provided BOOLEAN DEFAULT false,
    rental_duration_hours INTEGER,
    purpose_description TEXT,
    -- Additional fields
    notes TEXT,
    payment_status VARCHAR(20) DEFAULT 'pending',
    -- Soft delete support (separate for customer and provider)
    deleted_by_customer_at TIMESTAMP,
    deleted_by_provider_at TIMESTAMP,
    -- Deleted truck info preservation
    deleted_truck_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. BOOKING STATUS HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled')),
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. DOCUMENTS TABLE (matching actual Document model)
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('truck', 'provider', 'booking', 'user')),
    entity_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'registration', 'technical_inspection', 'insurance', 'license', 'business_license',
        'driver_license', 'vehicle_registration', 'identity_document', 'cargo_manifest', 
        'delivery_receipt', 'invoice', 'truck_inspection', 'additional_documents'
    )),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    expiry_date DATE,
    -- Status field used by Document model
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    -- Verification fields
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verification_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    -- Upload tracking
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. NOTIFICATIONS TABLE (with booking reference)
-- =====================================================
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

-- =====================================================
-- 9. PASSWORD RESET TOKENS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. EMAIL VERIFICATION TOKENS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 11. DELETED TRUCKS TABLE (for booking history preservation)
-- =====================================================
CREATE TABLE IF NOT EXISTS deleted_trucks (
    id UUID PRIMARY KEY,
    provider_id UUID,
    license_plate VARCHAR(50),
    truck_type VARCHAR(50),
    capacity_weight DECIMAL(10,2),
    capacity_volume DECIMAL(10,2),
    make VARCHAR(100),
    model VARCHAR(100),
    year INTEGER,
    price_per_km DECIMAL(10,2),
    fixed_price DECIMAL(10,2),
    pricing_type VARCHAR(20),
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by UUID
);

-- =====================================================
-- 12. CREATE ALL NECESSARY INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Trucks indexes
CREATE INDEX IF NOT EXISTS idx_trucks_provider_id ON trucks(provider_id);
CREATE INDEX IF NOT EXISTS idx_trucks_status ON trucks(status);
CREATE INDEX IF NOT EXISTS idx_trucks_truck_type ON trucks(truck_type);
CREATE INDEX IF NOT EXISTS idx_trucks_service_type ON trucks(service_type);
CREATE INDEX IF NOT EXISTS idx_trucks_license_plate ON trucks(license_plate);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_truck_id ON bookings(truck_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(reference);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);
CREATE INDEX IF NOT EXISTS idx_bookings_rental_dates ON bookings(rental_start_datetime, rental_end_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_by_customer ON bookings(deleted_by_customer_at);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_by_provider ON bookings(deleted_by_provider_at);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_verification_status ON documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_verification_notes ON documents(verification_notes) WHERE verification_notes IS NOT NULL;

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_related_booking ON notifications(related_booking_id);

-- Token indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);

-- Profile indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_verification_status ON provider_profiles(verification_status);

-- Booking status history indexes
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_status ON booking_status_history(status);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_changed_by ON booking_status_history(changed_by);

-- =====================================================
-- 13. CREATE UPDATED_AT TRIGGERS
-- =====================================================

-- Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at
    BEFORE UPDATE ON provider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trucks_updated_at
    BEFORE UPDATE ON trucks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 14. CREATE BOOKING REFERENCE GENERATION
-- =====================================================

-- Create function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    ref_number VARCHAR(20);
    year_part VARCHAR(4);
    sequence_part INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference, 5) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM bookings 
    WHERE reference LIKE year_part || '%'
    AND reference IS NOT NULL;
    
    -- Generate reference like "2025001", "2025002", etc.
    ref_number := year_part || LPAD(sequence_part::VARCHAR, 4, '0');
    
    NEW.reference := ref_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate reference on insert
CREATE TRIGGER generate_booking_reference_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_reference();

-- =====================================================
-- 15. CREATE MIGRATIONS TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record all migrations as executed
INSERT INTO migrations (filename) VALUES 
('001_create_tables.sql'),
('002_add_truck_images.sql'),
('003_add_booking_reference.sql'),
('004_add_additional_docs_type.sql'),
('005_add_more_document_types.sql'),
('006_preserve_booking_history.sql'),
('007_fix_truck_deletion_booking_preservation.sql'),
('008_add_rental_equipment_support.sql'),
('009_add_driver_info_to_trucks.sql'),
('010_update_truck_constraints.sql'),
('011_update_booking_status_constraints.sql'),
('012_add_truck_revenue_tracking.sql'),
('013_remove_overdue_status.sql'),
('014_update_customer_profiles.sql'),
('015_add_verification_notes_to_documents.sql'),
('015_update_notifications_table.sql'),
('016_add_password_reset_tokens.sql'),
('20250915_add_email_verification.sql'),
('20250916_update_provider_profiles.sql')
ON CONFLICT (filename) DO NOTHING;

-- =====================================================
-- 16. VERIFICATION QUERIES
-- =====================================================

-- Show all created tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Show row counts (should all be 0 for new database except migrations)
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'customer_profiles', COUNT(*) FROM customer_profiles
UNION ALL
SELECT 'provider_profiles', COUNT(*) FROM provider_profiles
UNION ALL
SELECT 'trucks', COUNT(*) FROM trucks
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'booking_status_history', COUNT(*) FROM booking_status_history
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'password_reset_tokens', COUNT(*) FROM password_reset_tokens
UNION ALL
SELECT 'email_verification_tokens', COUNT(*) FROM email_verification_tokens
UNION ALL
SELECT 'deleted_trucks', COUNT(*) FROM deleted_trucks
UNION ALL
SELECT 'migrations', COUNT(*) FROM migrations
ORDER BY table_name;

-- =====================================================
-- 17. UPDATE CUSTOMER PROFILES STRUCTURE
-- =====================================================
-- First, create a backup of existing data if needed
CREATE TABLE IF NOT EXISTS customer_profiles_backup AS SELECT * FROM customer_profiles;

-- Drop the existing customer_profiles table
DROP TABLE IF EXISTS customer_profiles CASCADE;

-- Recreate customer_profiles table with updated structure
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restore data from backup, excluding company_name
INSERT INTO customer_profiles (id, user_id, address, city, postal_code, created_at, updated_at)
SELECT id, user_id, address, city, postal_code, created_at, updated_at
FROM customer_profiles_backup;

-- Drop the backup table
DROP TABLE IF EXISTS customer_profiles_backup;

-- Add this migration to the tracking table
INSERT INTO migrations (filename) VALUES ('20250917_remove_company_from_customer_profiles.sql')
ON CONFLICT (filename) DO NOTHING;

-- Recreate the updated_at trigger for customer_profiles
CREATE TRIGGER update_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
