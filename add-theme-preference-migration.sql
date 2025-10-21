-- Migration: Add theme preference to users table
-- Date: October 21, 2025
-- Description: Allow users to store their theme preference (light/dark) in their profile

-- Add theme_preference column with default 'light'
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme_preference VARCHAR(10) DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'));

-- Add comment for documentation
COMMENT ON COLUMN users.theme_preference IS 'User UI theme preference: light or dark mode';

-- Update existing users to have 'light' theme if null
UPDATE users 
SET theme_preference = 'light' 
WHERE theme_preference IS NULL;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'theme_preference';
