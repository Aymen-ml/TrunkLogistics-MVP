-- Add new fields to customer_profiles table
ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS industry_sector VARCHAR(100),
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_person_position VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_person_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_person_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS state_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
ADD COLUMN IF NOT EXISTS preferred_payment_methods TEXT[];