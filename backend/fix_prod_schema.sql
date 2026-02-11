
-- Run this on your PRODUCTION database to fix the missing columns

-- Add google_uid column if it doesn't exist
ALTER TABLE users ADD COLUMN google_uid VARCHAR(255) UNIQUE DEFAULT NULL;

-- Add is_verified column if it doesn't exist
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Optional: Add other potentially missing columns for Google Auth tokens
ALTER TABLE users ADD COLUMN google_access_token TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN google_refresh_token TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN google_token_expiry BIGINT DEFAULT NULL;
