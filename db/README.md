# Database Setup Instructions

## Step 0: Enable Row-Level Security

Row-level security must be locked down before launching. Run the contents of `supabase_migrations.sql` in the Supabase SQL Editor (or at least the RLS section at the bottom of the file) to enable RLS on `user_profile`, `connected_accounts`, `posts`, and `templates`. Policies are scoped so users can only read/write their own records (templates remain globally readable). If you already created the tables, you can safely re-run the script—each policy creation is guarded so it won't error if it already exists.

## Issue: Missing `onboarded` Column

If you're getting the error "Could not find the 'onboarded' column of 'user_profile' in the schema cache", you need to add this column to your Supabase database.

## Solution: Run the SQL Migration

### Option 1: Using Supabase SQL Editor (Recommended)

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `fix_user_profile_table.sql`
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

### Option 2: Quick Fix - Just Add the Column

If you only need to add the `onboarded` column, run this SQL:

```sql
ALTER TABLE user_profile 
ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;
```

## Verify the Fix

After running the SQL, verify the column exists:

1. Go to **Table Editor** in Supabase Dashboard
2. Select the `user_profile` table
3. Check that the `onboarded` column exists (boolean type, default false)

## Complete Table Schema

The `user_profile` table should have these columns:
- `id` (uuid, primary key, references auth.users)
- `niche` (text)
- `content_goals` (text)
- `tone` (text)
- `frequency` (text)
- `audience` (text)
- `competitors` (text)
- `onboarded` (boolean, default false)
- `created_at` (timestamptz, default now())

