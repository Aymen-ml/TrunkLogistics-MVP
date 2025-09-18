-- Migration: Fix password reset tokens table schema
-- This migration ensures the password_reset_tokens table has the correct schema

-- First, check if the table exists and what columns it has
-- If it has 'used' instead of 'used_at', we need to rename it
-- If it doesn't have 'used_at' at all, we need to add it

DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'password_reset_tokens') THEN
        
        -- Check if 'used_at' column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'password_reset_tokens' AND column_name = 'used_at') THEN
            
            -- Check if 'used' column exists (wrong name)
            IF EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'password_reset_tokens' AND column_name = 'used') THEN
                -- Rename 'used' to 'used_at'
                ALTER TABLE password_reset_tokens RENAME COLUMN used TO used_at;
                RAISE NOTICE 'Renamed column "used" to "used_at" in password_reset_tokens table';
            ELSE
                -- Add 'used_at' column if it doesn't exist
                ALTER TABLE password_reset_tokens ADD COLUMN used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
                RAISE NOTICE 'Added "used_at" column to password_reset_tokens table';
            END IF;
        ELSE
            RAISE NOTICE 'Column "used_at" already exists in password_reset_tokens table';
        END IF;
        
    ELSE
        -- Table doesn't exist, create it with the correct schema
        CREATE TABLE password_reset_tokens (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
        
        -- Add trigger to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
        
        CREATE TRIGGER update_password_reset_tokens_updated_at
            BEFORE UPDATE ON password_reset_tokens
            FOR EACH ROW
            EXECUTE FUNCTION update_password_reset_tokens_updated_at();
            
        RAISE NOTICE 'Created password_reset_tokens table with correct schema';
    END IF;
END
$$;
