-- Migration 006: Preserve booking history when trucks are deleted
-- This migration changes the foreign key constraint to preserve completed/cancelled bookings

DO $$
BEGIN
    -- Step 1: Check if deleted_trucks table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deleted_trucks') THEN
        -- Create table only if it doesn't exist
        CREATE TABLE deleted_trucks (
            id UUID PRIMARY KEY,
            provider_id UUID,
            license_plate VARCHAR(50) NOT NULL,
            truck_type VARCHAR(20) NOT NULL,
            capacity_weight DECIMAL(10,2),
            capacity_volume DECIMAL(10,2),
            make VARCHAR(100),
            model VARCHAR(100),
            year INTEGER,
            deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_by UUID REFERENCES users(id)
        );

        -- Create index only if table was just created
        CREATE INDEX idx_deleted_trucks_id ON deleted_trucks(id);
    END IF;

    -- Create license plate index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'idx_deleted_trucks_license_plate'
    ) THEN
        CREATE INDEX idx_deleted_trucks_license_plate ON deleted_trucks(license_plate);
    END IF;

    -- Step 3: Add columns to bookings if they don't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'truck_deleted_at'
    ) THEN
        ALTER TABLE bookings ADD COLUMN truck_deleted_at TIMESTAMP;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = 'deleted_truck_info'
    ) THEN
        ALTER TABLE bookings ADD COLUMN deleted_truck_info JSONB;
    END IF;

    -- Step 4: Update the foreign key constraint with ON DELETE SET NULL
    ALTER TABLE bookings 
    DROP CONSTRAINT IF EXISTS bookings_truck_id_fkey;

    ALTER TABLE bookings 
    ADD CONSTRAINT bookings_truck_id_fkey 
    FOREIGN KEY (truck_id) 
    REFERENCES trucks(id) 
    ON DELETE SET NULL;
END $$;

-- Step 5: Create or replace the trigger function
CREATE OR REPLACE FUNCTION preserve_truck_info_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update bookings that are completed or cancelled
    UPDATE bookings 
    SET 
        truck_deleted_at = CURRENT_TIMESTAMP,
        deleted_truck_info = jsonb_build_object(
            'license_plate', OLD.license_plate,
            'truck_type', OLD.truck_type,
            'capacity_weight', OLD.capacity_weight,
            'capacity_volume', OLD.capacity_volume,
            'make', OLD.make,
            'model', OLD.model,
            'year', OLD.year
        )
    WHERE truck_id = OLD.id 
      AND status IN ('completed', 'cancelled')
      AND truck_deleted_at IS NULL;
    
    -- Store the deleted truck information
    INSERT INTO deleted_trucks (
        id, provider_id, license_plate, truck_type, 
        capacity_weight, capacity_volume, make, model, year
    ) VALUES (
        OLD.id, OLD.provider_id, OLD.license_plate, OLD.truck_type,
        OLD.capacity_weight, OLD.capacity_volume, OLD.make, OLD.model, OLD.year
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create or replace the trigger
DROP TRIGGER IF EXISTS preserve_truck_info_trigger ON trucks;
CREATE TRIGGER preserve_truck_info_trigger
    BEFORE DELETE ON trucks
    FOR EACH ROW
    EXECUTE FUNCTION preserve_truck_info_on_delete();