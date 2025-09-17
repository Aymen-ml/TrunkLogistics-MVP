-- Migration 003: Add booking reference column
-- This adds a unique reference field to bookings for display purposes

-- Only add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='bookings' AND column_name='reference'
    ) THEN
        ALTER TABLE bookings ADD COLUMN reference VARCHAR(20) UNIQUE;
    END IF;
END $$;

-- Create a function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
DECLARE
    ref_number VARCHAR(20);
    year_part VARCHAR(4);
    sequence_part INTEGER;
BEGIN
    -- Get current year
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(reference, 5) AS INTEGER)), 0) + 1
    INTO sequence_part
    FROM bookings 
    WHERE reference LIKE year_part || '%'
    AND reference IS NOT NULL;
    
    -- Generate reference like "2025001", "2025002", etc.
    ref_number := year_part || LPAD(sequence_part::VARCHAR, 4, '0');
    
    NEW.reference := ref_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate reference on insert
DO $$
BEGIN
    -- Drop trigger if it exists and recreate it
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'generate_booking_reference_trigger') THEN
        DROP TRIGGER generate_booking_reference_trigger ON bookings;
    END IF;
    
    CREATE TRIGGER generate_booking_reference_trigger
        BEFORE INSERT ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION generate_booking_reference();
END $$;

-- Update existing bookings with references (if any exist)
DO $$
DECLARE
    booking_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR booking_record IN 
        SELECT id, created_at 
        FROM bookings 
        WHERE reference IS NULL 
        ORDER BY created_at
    LOOP
        UPDATE bookings 
        SET reference = EXTRACT(YEAR FROM booking_record.created_at)::VARCHAR || LPAD(counter::VARCHAR, 4, '0')
        WHERE id = booking_record.id;
        
        counter := counter + 1;
    END LOOP;
END $$;
