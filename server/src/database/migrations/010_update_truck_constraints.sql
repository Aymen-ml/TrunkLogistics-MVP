-- Update truck constraints for better equipment support

-- First, drop existing constraints
ALTER TABLE trucks DROP CONSTRAINT IF EXISTS trucks_truck_type_check;
ALTER TABLE trucks DROP CONSTRAINT IF EXISTS trucks_pricing_type_check;

-- Add updated truck_type constraint with all supported types
ALTER TABLE trucks ADD CONSTRAINT trucks_truck_type_check 
CHECK (truck_type IN (
  'flatbed', 'container', 'refrigerated', 'tanker', 'box', 'other',
  'excavator', 'crane', 'mobile_crane', 'tower_crane', 'bulldozer', 'loader', 
  'forklift', 'reach_truck', 'pallet_jack', 'dump_truck', 'concrete_mixer'
));

-- Make pricing_type optional (can be NULL for rental equipment)
ALTER TABLE trucks ADD CONSTRAINT trucks_pricing_type_check 
CHECK (pricing_type IS NULL OR pricing_type IN ('per_km', 'fixed'));

-- Update the existing default pricing_type constraint if it exists
UPDATE trucks SET pricing_type = NULL WHERE service_type = 'rental';
