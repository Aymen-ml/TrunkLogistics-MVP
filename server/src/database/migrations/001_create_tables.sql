-- Migration 001: Create initial database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    -- Create base tables
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'users') THEN
        CREATE TABLE users (
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
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'customer_profiles') THEN
        CREATE TABLE customer_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            company_name VARCHAR(255),
            address TEXT,
            city VARCHAR(100),
            postal_code VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'provider_profiles') THEN
        CREATE TABLE provider_profiles (
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
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'trucks') THEN
        CREATE TABLE trucks (
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
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'documents') THEN
        CREATE TABLE documents (
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
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'bookings') THEN
        CREATE TABLE bookings (
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
    END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'notifications') THEN
        CREATE TABLE notifications (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    -- Create indices
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_trucks_type') THEN
        CREATE INDEX idx_trucks_type ON trucks(truck_type);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_trucks_status') THEN
        CREATE INDEX idx_trucks_status ON trucks(status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_documents_entity') THEN
        CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_documents_verification') THEN
        CREATE INDEX idx_documents_verification ON documents(verification_status);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_notifications_user_unread') THEN
        CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
    END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON customer_profiles;
    DROP TRIGGER IF EXISTS update_provider_profiles_updated_at ON provider_profiles;
    DROP TRIGGER IF EXISTS update_trucks_updated_at ON trucks;

    -- Create new triggers
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
END $$;