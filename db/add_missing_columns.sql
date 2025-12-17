-- Add missing columns to connected_accounts table if they don't exist
-- Run this in your Supabase SQL Editor

ALTER TABLE connected_accounts 
ADD COLUMN IF NOT EXISTS platform_username text;

ALTER TABLE connected_accounts 
ADD COLUMN IF NOT EXISTS facebook_page_name text;

ALTER TABLE connected_accounts 
ADD COLUMN IF NOT EXISTS facebook_page_id text;

ALTER TABLE connected_accounts 
ADD COLUMN IF NOT EXISTS facebook_page_access_token text;

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'connected_accounts'
ORDER BY ordinal_position;






