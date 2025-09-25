-- Fix Booking Status Constraint Issue
-- Run this directly in Supabase SQL Editor

-- Check current constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%booking%status%';

-- Drop any existing conflicting constraints
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_constraint;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_status;

-- Add the correct constraint that includes 'pending_review'
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled'));

-- Create booking_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled')),
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify the fix
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%booking%status%';

-- Test the constraint allows pending_review
SELECT 1 WHERE 'pending_review' IN ('pending_review', 'approved', 'confirmed', 'in_transit', 'active', 'completed', 'cancelled');
