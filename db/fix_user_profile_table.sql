-- Ensure user_profile table exists with all required columns
CREATE TABLE IF NOT EXISTS user_profile (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  niche text,
  content_goals text,
  tone text,
  frequency text,
  audience text,
  competitors text,
  onboarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add onboarded column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profile' AND column_name = 'onboarded'
  ) THEN
    ALTER TABLE user_profile ADD COLUMN onboarded boolean DEFAULT false;
  END IF;
END $$;

-- Update any existing rows to ensure onboarded is set
UPDATE user_profile 
SET onboarded = COALESCE(onboarded, false) 
WHERE onboarded IS NULL;

