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
