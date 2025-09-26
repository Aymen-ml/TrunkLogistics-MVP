-- Update service_type values from 'transport'/'rental' to 'logistics'/'retail'

-- First, update existing data
UPDATE trucks SET service_type = 'logistics' WHERE service_type = 'transport';
UPDATE trucks SET service_type = 'retail' WHERE service_type = 'rental';

UPDATE bookings SET service_type = 'logistics' WHERE service_type = 'transport';
UPDATE bookings SET service_type = 'retail' WHERE service_type = 'rental';

-- Drop existing constraints
ALTER TABLE trucks DROP CONSTRAINT IF EXISTS check_trucks_service_type;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_bookings_service_type;

-- Add updated constraints with new values
ALTER TABLE trucks ADD CONSTRAINT check_trucks_service_type 
CHECK (service_type IN ('logistics', 'retail'));

ALTER TABLE bookings ADD CONSTRAINT check_bookings_service_type 
CHECK (service_type IN ('logistics', 'retail'));

-- Update default values
ALTER TABLE trucks ALTER COLUMN service_type SET DEFAULT 'logistics';
ALTER TABLE bookings ALTER COLUMN service_type SET DEFAULT 'logistics';
