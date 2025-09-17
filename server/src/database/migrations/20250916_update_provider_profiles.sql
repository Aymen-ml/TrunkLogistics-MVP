DO $$ 
BEGIN
    
    -- Add business type field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'business_type') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN business_type VARCHAR(50) DEFAULT 'individual';
    END IF;

    -- Add business phone field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'business_phone') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN business_phone VARCHAR(50);
    END IF;

    -- Add industry sector field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'industry_sector') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN industry_sector VARCHAR(100);
    END IF;

    -- Add contact person fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_name') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_position') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_position VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_email') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'contact_person_phone') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN contact_person_phone VARCHAR(50);
    END IF;

    -- Rename address to street_address for consistency
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'provider_profiles' AND column_name = 'address') THEN
        ALTER TABLE provider_profiles 
        RENAME COLUMN address TO street_address;
    END IF;

    -- Add state/province field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'state_province') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN state_province VARCHAR(100);
    END IF;

    -- Add delivery instructions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'delivery_instructions') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN delivery_instructions TEXT;
    END IF;

    -- Add preferred payment methods
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'provider_profiles' AND column_name = 'preferred_payment_methods') THEN
        ALTER TABLE provider_profiles 
        ADD COLUMN preferred_payment_methods TEXT[];
    END IF;

    -- Update address to be nullable since it's part of a multi-step form
    ALTER TABLE provider_profiles 
    ALTER COLUMN street_address DROP NOT NULL;

    -- Update city to be nullable since it's part of a multi-step form
    ALTER TABLE provider_profiles 
    ALTER COLUMN city DROP NOT NULL;

END $$;