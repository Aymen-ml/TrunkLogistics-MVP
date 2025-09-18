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
END $$;-- Migration: 001_create_tables.sql
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
-- Migration: 002_add_soft_delete_bookings.sql
-- Add soft delete fields to bookings table
-- Migration 002: Add customer and provider deletion tracking

DO $$
BEGIN
    -- Add deleted_by_customer_at if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'deleted_by_customer_at'
    ) THEN
        ALTER TABLE bookings ADD COLUMN deleted_by_customer_at TIMESTAMP DEFAULT NULL;
    END IF;

    -- Add deleted_by_provider_at if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'deleted_by_provider_at'
    ) THEN
        ALTER TABLE bookings ADD COLUMN deleted_by_provider_at TIMESTAMP DEFAULT NULL;
    END IF;

    -- Create indices if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_bookings_deleted_by_customer') THEN
        CREATE INDEX idx_bookings_deleted_by_customer ON bookings(deleted_by_customer_at);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_bookings_deleted_by_provider') THEN
        CREATE INDEX idx_bookings_deleted_by_provider ON bookings(deleted_by_provider_at);
    END IF;
END $$;

-- Migration: 002_add_truck_images.sql
-- Migration 002: Add images column to trucks table
-- This adds support for storing truck image paths

-- Only add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='trucks' AND column_name='images'
    ) THEN
        ALTER TABLE trucks ADD COLUMN images TEXT[];
    END IF;
END $$;

-- Add index for images column for better performance (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'trucks' AND indexname = 'idx_trucks_images'
    ) THEN
        CREATE INDEX idx_trucks_images ON trucks USING GIN (images);
    END IF;
END $$;

-- Migration: 003_add_booking_reference.sql
-- Migration 003: Add booking reference column
-- This adds a unique reference field to bookings for display purposes

-- Only add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='bookings' AND column_name='reference'
    ) THEN
        ALTER TABLE bookings ADD COLUMN reference VARCHAR(20) UNIQUE;
    END IF;
END $$;

-- Create a function to generate booking reference
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
DO $$
BEGIN
    -- Drop trigger if it exists and recreate it
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'generate_booking_reference_trigger') THEN
        DROP TRIGGER generate_booking_reference_trigger ON bookings;
    END IF;
    
    CREATE TRIGGER generate_booking_reference_trigger
        BEFORE INSERT ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION generate_booking_reference();
END $$;

-- Update existing bookings with references (if any exist)
DO $$
DECLARE
    booking_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR booking_record IN 
        SELECT id, created_at 
        FROM bookings 
        WHERE reference IS NULL 
        ORDER BY created_at
    LOOP
        UPDATE bookings 
        SET reference = EXTRACT(YEAR FROM booking_record.created_at)::VARCHAR || LPAD(counter::VARCHAR, 4, '0')
        WHERE id = booking_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;

-- Migration: 004_add_additional_docs_type.sql
-- Migration 004: Add additional_docs document type
-- Add 'additional_docs' to the document_type constraint

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Add the new constraint with 'additional_docs' included
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN ('registration', 'technical_inspection', 'insurance', 'license', 'business_license', 'additional_docs'));

-- Add comment for documentation
COMMENT ON CONSTRAINT documents_document_type_check ON documents IS 'Allowed document types: registration, technical_inspection, insurance, license, business_license, additional_docs';

-- Migration: 005_add_more_document_types.sql
-- Migration 005: Add more document types for comprehensive truck documentation
-- Add additional document types to support more comprehensive document management

-- Drop the existing constraint
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Add the new constraint with additional document types
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
  'registration',           -- Vehicle registration
  'technical_inspection',   -- Technical inspection certificate
  'insurance',             -- Insurance certificate
  'license',               -- Driver's license
  'business_license',      -- Business license
  'additional_docs',       -- Additional documents
  'permit',                -- Special permits (overweight, hazardous materials, etc.)
  'maintenance_record',    -- Maintenance and service records
  'driver_certificate',    -- Driver certifications (CDL, endorsements, etc.)
  'customs_documents',     -- Customs and border crossing documents
  'safety_certificate',    -- Safety inspection certificate
  'emission_certificate',  -- Emission test certificate
  'weight_certificate',    -- Weight and dimension certificate
  'cargo_insurance',       -- Cargo insurance certificate
  'transport_license',     -- Transport/carrier license
  'route_permit',          -- Route-specific permits
  'hazmat_permit',         -- Hazardous materials permit
  'oversize_permit',       -- Oversize/overweight permit
  'fuel_card',             -- Fuel card documentation
  'toll_transponder',      -- Toll system documentation
  'gps_certificate',       -- GPS/tracking system certificate
  'compliance_certificate' -- DOT compliance certificate
));

-- Add comment for documentation
COMMENT ON CONSTRAINT documents_document_type_check ON documents IS 
'Allowed document types: registration, technical_inspection, insurance, license, business_license, additional_docs, permit, maintenance_record, driver_certificate, customs_documents, safety_certificate, emission_certificate, weight_certificate, cargo_insurance, transport_license, route_permit, hazmat_permit, oversize_permit, fuel_card, toll_transponder, gps_certificate, compliance_certificate';

-- Migration: 006_preserve_booking_history.sql
-- Migration 006: Preserve booking history when trucks are deleted
-- This migration changes the foreign key constraint to preserve completed/cancelled bookings

DO $$
BEGIN
    -- Step 1: Check if deleted_trucks table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deleted_trucks') THEN
        -- Create table only if it doesn't exist
        CREATE TABLE deleted_trucks (
            id UUID PRIMARY KEY,
            provider_id UUID,
            license_plate VARCHAR(50) NOT NULL,
            truck_type VARCHAR(20) NOT NULL,
            capacity_weight DECIMAL(10,2),
            capacity_volume DECIMAL(10,2),
            make VARCHAR(100),
            model VARCHAR(100),
            year INTEGER,
            deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_by UUID REFERENCES users(id)
        );

        -- Create index only if table was just created
        CREATE INDEX idx_deleted_trucks_id ON deleted_trucks(id);
    END IF;

    -- Create license plate index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'idx_deleted_trucks_license_plate'
    ) THEN
        CREATE INDEX idx_deleted_trucks_license_plate ON deleted_trucks(license_plate);
    END IF;

    -- Step 3: Add columns to bookings if they don't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'truck_deleted_at'
    ) THEN
        ALTER TABLE bookings ADD COLUMN truck_deleted_at TIMESTAMP;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'deleted_truck_info'
    ) THEN
        ALTER TABLE bookings ADD COLUMN deleted_truck_info JSONB;
    END IF;

    -- Step 4: Update the foreign key constraint with ON DELETE SET NULL
    ALTER TABLE bookings 
    DROP CONSTRAINT IF EXISTS bookings_truck_id_fkey;

    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_truck_id_fkey 
    FOREIGN KEY (truck_id) 
    REFERENCES trucks(id) 
    ON DELETE SET NULL;
END $$;

-- Step 5: Create or replace the trigger function
CREATE OR REPLACE FUNCTION preserve_truck_info_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update bookings that are completed or cancelled
    UPDATE bookings 
    SET 
        truck_deleted_at = CURRENT_TIMESTAMP,
        deleted_truck_info = jsonb_build_object(
            'license_plate', OLD.license_plate,
            'truck_type', OLD.truck_type,
            'capacity_weight', OLD.capacity_weight,
            'capacity_volume', OLD.capacity_volume,
            'make', OLD.make,
            'model', OLD.model,
            'year', OLD.year
        )
    WHERE truck_id = OLD.id 
      AND status IN ('completed', 'cancelled')
      AND truck_deleted_at IS NULL;
    
    -- Store the deleted truck information
    INSERT INTO deleted_trucks (
        id, provider_id, license_plate, truck_type, 
        capacity_weight, capacity_volume, make, model, year
    ) VALUES (
        OLD.id, OLD.provider_id, OLD.license_plate, OLD.truck_type,
        OLD.capacity_weight, OLD.capacity_volume, OLD.make, OLD.model, OLD.year
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create or replace the trigger
DROP TRIGGER IF EXISTS preserve_truck_info_trigger ON trucks;
CREATE TRIGGER preserve_truck_info_trigger
    BEFORE DELETE ON trucks
    FOR EACH ROW
    EXECUTE FUNCTION preserve_truck_info_on_delete();
-- Migration: 007_fix_truck_deletion_booking_preservation.sql
-- Migration 007: Fix truck deletion to preserve booking information for ALL bookings
-- This fixes the issue where active bookings become invisible to providers when trucks are deleted

-- Step 1: Update the trigger function to preserve truck info for ALL bookings, not just completed/cancelled
CREATE OR REPLACE FUNCTION preserve_truck_info_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update ALL bookings associated with this truck to preserve truck information
    UPDATE bookings 
    SET 
        truck_deleted_at = CURRENT_TIMESTAMP,
        deleted_truck_info = jsonb_build_object(
            'id', OLD.id,
            'license_plate', OLD.license_plate,
            'truck_type', OLD.truck_type,
            'capacity_weight', OLD.capacity_weight,
            'capacity_volume', OLD.capacity_volume,
            'make', OLD.make,
            'model', OLD.model,
            'year', OLD.year,
            'price_per_km', OLD.price_per_km,
            'fixed_price', OLD.fixed_price,
            'pricing_type', OLD.pricing_type
        )
    WHERE truck_id = OLD.id 
      AND truck_deleted_at IS NULL;  -- Only update if not already marked as deleted
    
    -- Store the deleted truck information for reference
    INSERT INTO deleted_trucks (
        id, provider_id, license_plate, truck_type, 
        capacity_weight, capacity_volume, make, model, year
    ) VALUES (
        OLD.id, OLD.provider_id, OLD.license_plate, OLD.truck_type,
        OLD.capacity_weight, OLD.capacity_volume, OLD.make, OLD.model, OLD.year
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Add comment explaining the fix
COMMENT ON FUNCTION preserve_truck_info_on_delete() IS 'Preserves truck information for ALL bookings when a truck is deleted, ensuring booking history is maintained for both customers and providers';

-- Migration: 008_add_rental_equipment_support.sql
-- Add rental equipment support to trucks and bookings tables

-- Add rental equipment fields to trucks table
ALTER TABLE trucks 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'transport',
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weekly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS monthly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS work_location VARCHAR(255);

-- Add index for service_type for better query performance
CREATE INDEX IF NOT EXISTS idx_trucks_service_type ON trucks(service_type);

-- Add rental fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'transport',
ADD COLUMN IF NOT EXISTS rental_start_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS rental_end_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS work_address TEXT,
ADD COLUMN IF NOT EXISTS operator_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS operator_provided BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rental_duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS purpose_description TEXT;

-- Add index for service_type for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);

-- Add index for rental dates for availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_rental_dates ON bookings(rental_start_datetime, rental_end_datetime);

-- Add constraint to ensure service_type is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'trucks' AND constraint_name = 'check_trucks_service_type'
    ) THEN
        ALTER TABLE trucks ADD CONSTRAINT check_trucks_service_type 
        CHECK (service_type IN ('transport', 'rental'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'bookings' AND constraint_name = 'check_bookings_service_type'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT check_bookings_service_type 
        CHECK (service_type IN ('transport', 'rental'));
    END IF;
END $$;
-- Migration: 009_add_driver_info_to_trucks.sql
-- Add driver information fields to trucks table

-- Add driver information fields to trucks table
ALTER TABLE trucks 
ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS driver_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS driver_license_number VARCHAR(100);

-- Add index for driver email for better query performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver_email ON trucks(driver_email);

-- Migration: 010_remove_driver_email.sql
-- Remove driver_email column from trucks table

-- Drop the index first
DROP INDEX IF EXISTS idx_trucks_driver_email;

-- Remove the driver_email column
ALTER TABLE trucks DROP COLUMN IF EXISTS driver_email;

-- Migration: 010_update_truck_constraints.sql
-- Update truck constraints for better equipment support

-- First, drop existing constraints
ALTER TABLE trucks DROP CONSTRAINT IF EXISTS trucks_truck_type_check;
ALTER TABLE trucks DROP CONSTRAINT IF EXISTS trucks_pricing_type_check;

-- Add updated truck_type constraint with all supported types
ALTER TABLE trucks ADD CONSTRAINT trucks_truck_type_check 
CHECK (truck_type IN (
  'flatbed', 'container', 'refrigerated', 'tanker', 'box', 'other',
  'excavator', 'crane', 'mobile_crane', 'tower_crane', 'bulldozer', 'loader', 
  'forklift', 'reach_truck', 'pallet_jack', 'dump_truck', 'concrete_mixer'
));

-- Make pricing_type optional (can be NULL for rental equipment)
ALTER TABLE trucks ADD CONSTRAINT trucks_pricing_type_check 
CHECK (pricing_type IS NULL OR pricing_type IN ('per_km', 'fixed'));

-- Update the existing default pricing_type constraint if it exists
UPDATE trucks SET pricing_type = NULL WHERE service_type = 'rental';

-- Migration: 011_update_booking_status_constraints.sql
-- Migration 011: Update booking status constraints to support rental statuses
-- Add 'active' and 'overdue' statuses for rental equipment bookings

-- Drop existing check constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE booking_status_history DROP CONSTRAINT IF EXISTS booking_status_history_status_check;

-- Add updated check constraints with rental statuses
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'overdue', 'completed', 'cancelled'));

ALTER TABLE booking_status_history ADD CONSTRAINT booking_status_history_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'overdue', 'completed', 'cancelled'));

-- Migration: 012_add_truck_revenue_tracking.sql
-- Migration 012: Add revenue tracking for trucks
-- Add total_revenue column to trucks table for analytics

DO $$
BEGIN
    -- Add total_revenue column if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'trucks' AND column_name = 'total_revenue'
    ) THEN
        ALTER TABLE trucks ADD COLUMN total_revenue DECIMAL(10,2) DEFAULT 0.00;
    END IF;

    -- Add index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'idx_trucks_total_revenue'
    ) THEN
        CREATE INDEX idx_trucks_total_revenue ON trucks(total_revenue);
    END IF;

    -- Update existing trucks to have 0 revenue if NULL
    UPDATE trucks SET total_revenue = 0.00 WHERE total_revenue IS NULL;
END $$;

-- Migration: 013_remove_overdue_status.sql
-- Migration 013: Remove overdue status from booking constraints
-- Update booking status constraints to remove 'overdue' status

-- Update bookings table constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'));

-- Update booking_status_history table constraint  
ALTER TABLE booking_status_history DROP CONSTRAINT IF EXISTS booking_status_history_status_check;
ALTER TABLE booking_status_history ADD CONSTRAINT booking_status_history_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'));

-- Migration: 014_update_customer_profiles.sql
-- Add new fields to customer_profiles table
ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS industry_sector VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_person_position VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_person_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_person_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS state_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS preferred_payment_methods TEXT[];
-- Migration: 015_add_verification_notes_to_documents.sql
-- Migration 015: Add verification_notes column to documents table
-- Add verification notes field to store admin comments when approving/rejecting documents

-- Add verification_notes column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN documents.verification_notes IS 'Admin notes when verifying documents (approval/rejection reasons)';

-- Add index for verification_notes for potential future queries
CREATE INDEX IF NOT EXISTS idx_documents_verification_notes ON documents(verification_notes) WHERE verification_notes IS NOT NULL;

-- Migration: 015_remove_country.sql
-- Remove country column from customer_profiles and provider_profiles tables

-- Remove from customer_profiles
ALTER TABLE customer_profiles DROP COLUMN IF EXISTS country;

-- Remove from provider_profiles
ALTER TABLE provider_profiles DROP COLUMN IF EXISTS country;
-- Migration: 015_update_notifications_table.sql
-- Migration to update notifications table with missing fields
-- This adds the missing columns that the notification model expects

DO $$
BEGIN
    -- Add related_entity_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_entity_type') THEN
        ALTER TABLE notifications ADD COLUMN related_entity_type VARCHAR(50);
    END IF;

    -- Add related_entity_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_entity_id') THEN
        ALTER TABLE notifications ADD COLUMN related_entity_id UUID;
    END IF;

    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
    END IF;

    -- Add read_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
    END IF;

    -- Create additional indexes for better performance
    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace 
                   WHERE c.relname = 'idx_notifications_type') THEN
        CREATE INDEX idx_notifications_type ON notifications(type);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace 
                   WHERE c.relname = 'idx_notifications_priority') THEN
        CREATE INDEX idx_notifications_priority ON notifications(priority);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace 
                   WHERE c.relname = 'idx_notifications_entity') THEN
        CREATE INDEX idx_notifications_entity ON notifications(related_entity_type, related_entity_id);
    END IF;
END $$;

-- Migration: 016_add_password_reset_tokens.sql
-- Migration: Add password reset tokens table
-- This table stores temporary tokens for password reset functionality

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_password_reset_tokens_updated_at
  BEFORE UPDATE ON password_reset_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_password_reset_tokens_updated_at();

-- Migration: 20230915_update_provider_profiles.sql
-- Migration: Add required fields to provider_profiles table

-- Create the provider_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Add business information fields
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS tax_identification_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS service_areas TEXT[],

-- Add contact information
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),

-- Add address information
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),

-- Add insurance information
ADD COLUMN IF NOT EXISTS insurance_provider_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,
ADD COLUMN IF NOT EXISTS insurance_documents TEXT[],

-- Add banking information
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_routing_number VARCHAR(100),

-- Add document tracking
ADD COLUMN IF NOT EXISTS business_license_file TEXT,
ADD COLUMN IF NOT EXISTS business_license_expiry DATE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_provider_verification_status ON provider_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_provider_business_registration ON provider_profiles(business_registration_number);

-- Add timestamp trigger for updated_at
CREATE OR REPLACE FUNCTION update_provider_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provider_profiles_timestamp
    BEFORE UPDATE ON provider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_profiles_timestamp();
-- Migration: 20250916_fix_migrations_and_remove_country.sql
-- Fix migrations tracking and remove country field

DO $$ 
BEGIN
    -- First, ensure migrations table exists
    CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Mark migration 006 as executed if not already
    INSERT INTO migrations (filename)
    SELECT '006_preserve_booking_history.sql'
    WHERE NOT EXISTS (
        SELECT 1 FROM migrations 
        WHERE filename = '006_preserve_booking_history.sql'
    );

    -- Remove country column from customer_profiles if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'customer_profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE customer_profiles DROP COLUMN country;
    END IF;

    -- Remove country column from provider_profiles if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'provider_profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE provider_profiles DROP COLUMN country;
    END IF;
END $$;
-- Migration: 20250916_fix_provider_profiles.sql
DO $$ 
BEGIN
    -- Make non-essential fields nullable
    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN business_license DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN street_address DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN city DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN business_phone DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN industry_sector DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_name DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_position DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_email DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_phone DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN delivery_instructions DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    -- Add business_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'business_type') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN business_type VARCHAR(50) DEFAULT 'individual';
    END IF;

    -- Add industry_sector if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'industry_sector') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN industry_sector VARCHAR(100);
    END IF;

    -- Add preferred_payment_methods if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'preferred_payment_methods') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN preferred_payment_methods JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Ensure validation fields have proper defaults
    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN is_validated SET DEFAULT false;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN validation_status SET DEFAULT 'pending';
    EXCEPTION WHEN others THEN
        NULL;
    END;

END $$;
-- Migration: 20250916_remove_country_field.sql
-- Migration: Remove country field from customer and provider profiles
-- This migration removes the country field since the application is Algeria-specific

DO $$ 
BEGIN
    -- Attempt to remove country column from customer_profiles if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'customer_profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE customer_profiles DROP COLUMN country;
    END IF;

    -- Attempt to remove country column from provider_profiles if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'provider_profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE provider_profiles DROP COLUMN country;
    END IF;
END $$;
-- Migration: 20250916_update_provider_profiles_nullable.sql
DO $$
BEGIN
    -- Make non-essential fields nullable
    ALTER TABLE provider_profiles ALTER COLUMN business_license DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN postal_code DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN business_phone DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN industry_sector DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_name DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_position DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_email DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_phone DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN delivery_instructions DROP NOT NULL;
    
    -- Set default values for array fields
    ALTER TABLE provider_profiles ALTER COLUMN preferred_payment_methods SET DEFAULT '[]'::jsonb[];
    
    -- Make sure validation fields have proper defaults
    ALTER TABLE provider_profiles ALTER COLUMN is_validated SET DEFAULT false;
    ALTER TABLE provider_profiles ALTER COLUMN validation_status SET DEFAULT 'pending';
    
    -- Ensure proper type for preferred_payment_methods
    ALTER TABLE provider_profiles 
    ALTER COLUMN preferred_payment_methods TYPE jsonb[] 
    USING CASE 
        WHEN preferred_payment_methods IS NULL THEN '[]'::jsonb[]
        ELSE preferred_payment_methods::jsonb[]
    END;
END $$;
-- Migration: 20250916_update_provider_profiles.sql
DO $$ 
BEGIN
    
    -- Add business type field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'business_type') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN business_type VARCHAR(50) DEFAULT 'individual';
    END IF;

    -- Add business phone field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'business_phone') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN business_phone VARCHAR(50);
    END IF;

    -- Add industry sector field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'industry_sector') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN industry_sector VARCHAR(100);
    END IF;

    -- Add contact person fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_name') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_position') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_position VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_email') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_phone') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_phone VARCHAR(50);
    END IF;

    -- Rename address to street_address for consistency
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'provider_profiles' AND column_name = 'address') THEN
        ALTER TABLE provider_profiles 
        RENAME COLUMN address TO street_address;
    END IF;

    -- Add state/province field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'state_province') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN state_province VARCHAR(100);
    END IF;

    -- Add delivery instructions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'delivery_instructions') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN delivery_instructions TEXT;
    END IF;

    -- Add preferred payment methods
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'preferred_payment_methods') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN preferred_payment_methods TEXT[];
    END IF;

    -- Update address to be nullable since it's part of a multi-step form
    ALTER TABLE provider_profiles 
    ALTER COLUMN street_address DROP NOT NULL;

    -- Update city to be nullable since it's part of a multi-step form
    ALTER TABLE provider_profiles 
    ALTER COLUMN city DROP NOT NULL;

END $$;
