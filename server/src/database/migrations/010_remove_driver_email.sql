-- Remove driver_email column from trucks table

-- Drop the index first
DROP INDEX IF EXISTS idx_trucks_driver_email;

-- Remove the driver_email column
ALTER TABLE trucks DROP COLUMN IF EXISTS driver_email;
