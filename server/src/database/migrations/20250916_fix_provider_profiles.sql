DO $$ 
BEGIN
    -- Make non-essential fields nullable
    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN business_license DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN street_address DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN city DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN business_phone DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN industry_sector DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_name DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_position DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_email DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN contact_person_phone DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN delivery_instructions DROP NOT NULL;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    -- Add business_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'business_type') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN business_type VARCHAR(50) DEFAULT 'individual';
    END IF;

    -- Add industry_sector if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'industry_sector') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN industry_sector VARCHAR(100);
    END IF;

    -- Add preferred_payment_methods if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'preferred_payment_methods') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN preferred_payment_methods JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Ensure validation fields have proper defaults
    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN is_validated SET DEFAULT false;
    EXCEPTION WHEN others THEN
        NULL;
    END;

    BEGIN
        ALTER TABLE provider_profiles ALTER COLUMN validation_status SET DEFAULT 'pending';
    EXCEPTION WHEN others THEN
        NULL;
    END;

END $$;