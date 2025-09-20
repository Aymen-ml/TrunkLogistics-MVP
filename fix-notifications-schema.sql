-- Fix notifications table schema to match application expectations
-- This script updates the notifications table to include all fields the app expects

-- First, let's add the missing columns to the existing notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50);

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS related_entity_id UUID;

ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Update existing records to have proper related_entity data
UPDATE notifications 
SET 
    related_entity_type = 'booking',
    related_entity_id = related_booking_id
WHERE related_booking_id IS NOT NULL;

-- Create index for the new fields
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Update the trigger to set read_at when is_read is set to true
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_read_at_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();

-- Add this migration to tracking
INSERT INTO migrations (filename) VALUES ('20250920_fix_notifications_schema.sql')
ON CONFLICT (filename) DO NOTHING;
