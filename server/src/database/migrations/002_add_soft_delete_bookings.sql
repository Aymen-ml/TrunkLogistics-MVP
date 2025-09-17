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
