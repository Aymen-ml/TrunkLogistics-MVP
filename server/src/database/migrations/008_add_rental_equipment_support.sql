-- Add rental equipment support to trucks and bookings tables

-- Add rental equipment fields to trucks table
ALTER TABLE trucks 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'transport',
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weekly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS monthly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS work_location VARCHAR(255);

-- Add index for service_type for better query performance
CREATE INDEX IF NOT EXISTS idx_trucks_service_type ON trucks(service_type);

-- Add rental fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) DEFAULT 'transport',
ADD COLUMN IF NOT EXISTS rental_start_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS rental_end_datetime TIMESTAMP,
ADD COLUMN IF NOT EXISTS work_address TEXT,
ADD COLUMN IF NOT EXISTS operator_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS operator_provided BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS rental_duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS purpose_description TEXT;

-- Add index for service_type for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);

-- Add index for rental dates for availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_rental_dates ON bookings(rental_start_datetime, rental_end_datetime);

-- Add constraint to ensure service_type is valid
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'trucks' AND constraint_name = 'check_trucks_service_type'
    ) THEN
        ALTER TABLE trucks ADD CONSTRAINT check_trucks_service_type 
        CHECK (service_type IN ('transport', 'rental'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'bookings' AND constraint_name = 'check_bookings_service_type'
    ) THEN
        ALTER TABLE bookings ADD CONSTRAINT check_bookings_service_type 
        CHECK (service_type IN ('transport', 'rental'));
    END IF;
END $$;