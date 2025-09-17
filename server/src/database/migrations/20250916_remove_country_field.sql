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