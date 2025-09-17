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
