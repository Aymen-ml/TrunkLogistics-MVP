-- Remove country column from customer_profiles and provider_profiles tables

-- Remove from customer_profiles
ALTER TABLE customer_profiles DROP COLUMN IF EXISTS country;

-- Remove from provider_profiles
ALTER TABLE provider_profiles DROP COLUMN IF EXISTS country;