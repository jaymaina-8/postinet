# Postinet MVP - Setup Instructions

## Database Setup Required

Your Supabase database is missing some columns that were added in recent migrations. You need to run the migration to fix the 400 errors.

### Option 1: Run the Simple Migration (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `db/add_missing_columns.sql`
6. Click **Run** or press `Ctrl+Enter`

### Option 2: Run the Full Migration

If you haven't run the full migration yet:

1. Go to your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `db/supabase_migrations.sql`
4. Click **Run**

## What These Migrations Do

The migrations add the following columns to the `connected_accounts` table:
- `platform_username` - Stores the username/channel name
- `facebook_page_name` - Stores the Facebook Page name
- `facebook_page_id` - Stores the Facebook Page ID
- `facebook_page_access_token` - Stores the page-specific access token

## After Running the Migration

1. Refresh your browser
2. The 400 errors should be gone
3. Connected accounts will display properly with names

## Current Workaround

The app currently has fallback logic that works even without these columns, but you'll see:
- Network 400 errors in the console (suppressed in code)
- Missing account names in the UI
- Limited functionality for Facebook Pages

Running the migration will fix all of these issues.

## Environment Variables Required

Make sure you have these in your `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/facebook/exchange

# YouTube OAuth
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/exchange

# OpenAI (for content generation)
OPENAI_API_KEY=your_openai_api_key
```

## Pages Implemented

✅ Landing Page - `/`
✅ Login - `/auth/login`
✅ Signup - `/auth/signup`
✅ Onboarding - `/onboarding`
✅ Dashboard - `/dashboard`
✅ Connected Accounts - `/dashboard/accounts`
✅ Profile - `/dashboard/profile`
✅ Content Generator - `/dashboard/generate`
✅ Scheduler - `/dashboard/schedule`
✅ History - `/dashboard/history`
✅ Legal Pages - `/privacy`, `/terms`, `/delete-data`

## User Flow

1. User lands on `/` (Landing Page)
2. Clicks "Get Started" → `/auth/signup`
3. After signup → `/onboarding`
4. Completes onboarding → `/dashboard`
5. Dashboard shows guided steps:
   - Step 1: Connect accounts → `/dashboard/accounts`
   - Step 2: Generate content → `/dashboard/generate`
   - Step 3: Schedule/Publish → `/dashboard/schedule`
6. View history → `/dashboard/history`
7. Manage profile → `/dashboard/profile`





