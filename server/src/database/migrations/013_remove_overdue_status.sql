-- Migration 013: Remove overdue status from booking constraints
-- Update booking status constraints to remove 'overdue' status

-- Update bookings table constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'));

-- Update booking_status_history table constraint  
ALTER TABLE booking_status_history DROP CONSTRAINT IF EXISTS booking_status_history_status_check;
ALTER TABLE booking_status_history ADD CONSTRAINT booking_status_history_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'));
