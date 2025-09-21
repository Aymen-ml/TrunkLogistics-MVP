-- Migration 030: Fix notifications table schema for production
-- This migration ensures all required columns exist for the notification system

-- Add priority column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';
        ALTER TABLE notifications ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high'));
        RAISE NOTICE 'Added priority column to notifications table';
    ELSE
        RAISE NOTICE 'Priority column already exists';
    END IF;
END $$;

-- Add related_entity_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_entity_type') THEN
        ALTER TABLE notifications ADD COLUMN related_entity_type VARCHAR(50);
        RAISE NOTICE 'Added related_entity_type column to notifications table';
    ELSE
        RAISE NOTICE 'Related_entity_type column already exists';
    END IF;
END $$;

-- Add related_entity_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'related_entity_id') THEN
        ALTER TABLE notifications ADD COLUMN related_entity_id UUID;
        RAISE NOTICE 'Added related_entity_id column to notifications table';
    ELSE
        RAISE NOTICE 'Related_entity_id column already exists';
    END IF;
END $$;

-- Add read_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP;
        RAISE NOTICE 'Added read_at column to notifications table';
    ELSE
        RAISE NOTICE 'Read_at column already exists';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create or replace the trigger function for read_at
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND (OLD.is_read = false OR OLD.is_read IS NULL) THEN
        NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_notification_read_at_trigger ON notifications;
CREATE TRIGGER update_notification_read_at_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();

-- Update existing notifications to have proper related_entity data if they have related_booking_id
UPDATE notifications 
SET 
    related_entity_type = 'booking',
    related_entity_id = related_booking_id
WHERE related_booking_id IS NOT NULL 
  AND (related_entity_type IS NULL OR related_entity_id IS NULL);

-- Set default priority for existing notifications that don't have one
UPDATE notifications 
SET priority = 'medium' 
WHERE priority IS NULL;

RAISE NOTICE 'Notifications table schema fix completed successfully';
