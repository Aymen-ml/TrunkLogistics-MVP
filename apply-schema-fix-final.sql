-- TrunkLogistics Notification Schema Fix - Final Version
-- Execute this in Supabase SQL Editor to complete the notification system fix

-- Add missing columns with safe IF NOT EXISTS checks
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Add constraint for priority validation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_priority') THEN
        ALTER TABLE notifications ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
END $$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create trigger function for automatic read_at updates
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND (OLD.is_read = false OR OLD.is_read IS NULL) THEN
        NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS update_notification_read_at_trigger ON notifications;
CREATE TRIGGER update_notification_read_at_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();

-- Update existing notifications to have default priority
UPDATE notifications 
SET priority = 'medium' 
WHERE priority IS NULL;

-- Migrate existing related_booking_id data if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'notifications' AND column_name = 'related_booking_id') THEN
        UPDATE notifications 
        SET 
            related_entity_type = 'booking',
            related_entity_id = related_booking_id
        WHERE related_booking_id IS NOT NULL 
          AND (related_entity_type IS NULL OR related_entity_id IS NULL);
    END IF;
END $$;

-- Verify the changes
SELECT 
    'Schema fix completed successfully!' as status,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN priority IS NOT NULL THEN 1 END) as notifications_with_priority
FROM notifications;
