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