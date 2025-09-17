-- Migration 011: Update booking status constraints to support rental statuses
-- Add 'active' and 'overdue' statuses for rental equipment bookings

-- Drop existing check constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE booking_status_history DROP CONSTRAINT IF EXISTS booking_status_history_status_check;

-- Add updated check constraints with rental statuses
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'overdue', 'completed', 'cancelled'));

ALTER TABLE booking_status_history ADD CONSTRAINT booking_status_history_status_check 
    CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'overdue', 'completed', 'cancelled'));
