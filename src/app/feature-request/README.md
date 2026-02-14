# Feature requests

When a user submits an idea on the **Feature request** page, it is saved via `POST /api/feature-requests` and stored in Supabase.

## How you get the ideas

1. **Create the table** (once)  
   In [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**, run the migration:
   - `supabase/migrations/20250213000000_create_feature_requests.sql`

2. **View submissions**  
   In Supabase Dashboard → **Table Editor** → **feature_requests** you’ll see every submission with:
   - `title`, `details`, `category`, `votes`, `created_at`, and optional `user_id` (if you add auth later).

3. **Environment**  
   Ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set so the API can write to the database.

Optional next steps: add a GET endpoint to load these into the Ideas list, or send yourself an email (e.g. Resend) when a row is inserted.
