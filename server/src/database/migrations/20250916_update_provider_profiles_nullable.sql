DO $$
BEGIN
    -- Make non-essential fields nullable
    ALTER TABLE provider_profiles ALTER COLUMN business_license DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN postal_code DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN business_phone DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN industry_sector DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_name DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_position DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_email DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN contact_person_phone DROP NOT NULL;
    ALTER TABLE provider_profiles ALTER COLUMN delivery_instructions DROP NOT NULL;
    
    -- Set default values for array fields
    ALTER TABLE provider_profiles ALTER COLUMN preferred_payment_methods SET DEFAULT '[]'::jsonb[];
    
    -- Make sure validation fields have proper defaults
    ALTER TABLE provider_profiles ALTER COLUMN is_validated SET DEFAULT false;
    ALTER TABLE provider_profiles ALTER COLUMN validation_status SET DEFAULT 'pending';
    
    -- Ensure proper type for preferred_payment_methods
    ALTER TABLE provider_profiles 
    ALTER COLUMN preferred_payment_methods TYPE jsonb[] 
    USING CASE 
        WHEN preferred_payment_methods IS NULL THEN '[]'::jsonb[]
        ELSE preferred_payment_methods::jsonb[]
    END;
END $$;