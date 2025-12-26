-- Migration: Add Facebook Page token columns to connected_accounts table
-- This allows storing Facebook Page access tokens for posting to Pages

-- Add Facebook Page columns if they don't exist
alter table if exists connected_accounts 
  add column if not exists facebook_page_id text;

alter table if exists connected_accounts 
  add column if not exists facebook_page_name text;

alter table if exists connected_accounts 
  add column if not exists facebook_page_access_token text;

-- Add index for faster lookups by page ID
create index if not exists connected_accounts_facebook_page_id_idx 
  on connected_accounts(facebook_page_id) 
  where platform = 'facebook' and facebook_page_id is not null;
























