-- Add onboarded column to user_profile table if it doesn't exist
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;

-- Update any existing rows to set onboarded = false if null
UPDATE user_profile 
SET onboarded = false 
WHERE onboarded IS NULL;


