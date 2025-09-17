-- Migration: Add required fields to provider_profiles table

-- Create the provider_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS provider_profiles (
    id UUID PRIMARY KEY REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Add business information fields
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS business_registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS tax_identification_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS vat_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS service_areas TEXT[],

-- Add contact information
ADD COLUMN IF NOT EXISTS business_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),

-- Add address information
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state_province VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),

-- Add insurance information
ADD COLUMN IF NOT EXISTS insurance_provider_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS insurance_expiry_date DATE,
ADD COLUMN IF NOT EXISTS insurance_documents TEXT[],

-- Add banking information
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_routing_number VARCHAR(100),

-- Add document tracking
ADD COLUMN IF NOT EXISTS business_license_file TEXT,
ADD COLUMN IF NOT EXISTS business_license_expiry DATE,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_provider_verification_status ON provider_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_provider_business_registration ON provider_profiles(business_registration_number);

-- Add timestamp trigger for updated_at
CREATE OR REPLACE FUNCTION update_provider_profiles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provider_profiles_timestamp
    BEFORE UPDATE ON provider_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_profiles_timestamp();