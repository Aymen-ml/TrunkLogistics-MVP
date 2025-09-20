
-- Notification schema fixes for production
-- These changes are safe and use IF NOT EXISTS to prevent errors

-- Add priority column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_priority') THEN
        ALTER TABLE notifications ADD CONSTRAINT check_priority CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
END $$;

-- Add related_entity_type column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_type VARCHAR(50);

-- Add related_entity_id column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS related_entity_id UUID;

-- Add read_at column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_related_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);

-- Create trigger function
CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND (OLD.is_read = false OR OLD.is_read IS NULL) THEN
        NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_notification_read_at_trigger ON notifications;
CREATE TRIGGER update_notification_read_at_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_read_at();
  