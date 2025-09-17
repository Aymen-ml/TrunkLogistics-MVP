-- Add driver information fields to trucks table

-- Add driver information fields to trucks table
ALTER TABLE trucks 
ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS driver_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS driver_license_number VARCHAR(100);

-- Add index for driver email for better query performance
CREATE INDEX IF NOT EXISTS idx_trucks_driver_email ON trucks(driver_email);
