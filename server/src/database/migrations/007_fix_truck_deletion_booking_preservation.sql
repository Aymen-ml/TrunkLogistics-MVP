-- Migration 007: Fix truck deletion to preserve booking information for ALL bookings
-- This fixes the issue where active bookings become invisible to providers when trucks are deleted

-- Step 1: Update the trigger function to preserve truck info for ALL bookings, not just completed/cancelled
CREATE OR REPLACE FUNCTION preserve_truck_info_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update ALL bookings associated with this truck to preserve truck information
    UPDATE bookings 
    SET 
        truck_deleted_at = CURRENT_TIMESTAMP,
        deleted_truck_info = jsonb_build_object(
            'id', OLD.id,
            'license_plate', OLD.license_plate,
            'truck_type', OLD.truck_type,
            'capacity_weight', OLD.capacity_weight,
            'capacity_volume', OLD.capacity_volume,
            'make', OLD.make,
            'model', OLD.model,
            'year', OLD.year,
            'price_per_km', OLD.price_per_km,
            'fixed_price', OLD.fixed_price,
            'pricing_type', OLD.pricing_type
        )
    WHERE truck_id = OLD.id 
      AND truck_deleted_at IS NULL;  -- Only update if not already marked as deleted
    
    -- Store the deleted truck information for reference
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

-- Step 2: Add comment explaining the fix
COMMENT ON FUNCTION preserve_truck_info_on_delete() IS 'Preserves truck information for ALL bookings when a truck is deleted, ensuring booking history is maintained for both customers and providers';
