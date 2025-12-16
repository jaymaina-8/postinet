# Cron Job Setup Guide

## Overview

The cron job runs every 5 minutes to check for scheduled posts that are due and publishes them to the connected social media platforms.

## GitHub Actions Setup

### Step 1: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these two secrets:

1. **CRON_SECRET**
   - Value: Generate a random secret (e.g., `openssl rand -hex 32`)
   - This is used to authenticate the cron job requests
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`

2. **CRON_URL**
   - Value: Your deployed app URL + `/api/cron/run`
   - For production: `https://your-domain.com/api/cron/run`
   - For Vercel: `https://your-app.vercel.app/api/cron/run`
   - For local testing: `http://localhost:3000/api/cron/run`

### Step 2: Add CRON_SECRET to Your Environment Variables

Add to your `.env.local` (for local development):

```env
CRON_SECRET=your_secret_here
```

Add to your production environment (Vercel/Netlify/etc.):
- Go to your deployment platform
- Add `CRON_SECRET` as an environment variable
- Use the same value as in GitHub secrets

### Step 3: Enable GitHub Actions

1. Go to your repository → Actions tab
2. If prompted, enable GitHub Actions
3. The cron job will now run every 5 minutes automatically

### Step 4: Test the Cron Job

#### Manual Test via GitHub Actions:
1. Go to Actions tab
2. Click on "Scheduled Posts Cron Job"
3. Click "Run workflow" → "Run workflow"
4. Check the logs to see if it succeeded

#### Manual Test via curl:
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/run
```

Expected response:
```json
{
  "success": true,
  "message": "No posts to publish",
  "processed": 0
}
```

Or if there are posts:
```json
{
  "success": true,
  "message": "Cron job completed",
  "total": 2,
  "successful": 2,
  "failed": 0,
  "errors": []
}
```

## How It Works

1. **Every 5 minutes**, GitHub Actions triggers the workflow
2. The workflow makes a GET request to `/api/cron/run`
3. The endpoint:
   - Verifies the CRON_SECRET
   - Fetches all pending scheduled posts that are due
   - For each post:
     - Gets the user's connected account
     - Publishes to the platform (Facebook, YouTube, etc.)
     - Updates the post status to "posted"
     - Records the platform post ID
   - Returns a summary of results

## Troubleshooting

### 405 Method Not Allowed
- **Cause**: The endpoint doesn't exist or the route file is missing
- **Fix**: Make sure `src/app/api/cron/run/route.ts` exists and exports GET/POST functions

### 401 Unauthorized
- **Cause**: CRON_SECRET mismatch
- **Fix**: Ensure the secret in GitHub matches the one in your environment variables

### 500 Internal Server Error
- **Cause**: Database error or missing environment variables
- **Fix**: Check the logs for specific error messages

### No posts being published
- **Cause**: 
  - No scheduled posts in the database
  - Scheduled time is in the future
  - Posts already published
- **Fix**: Check the `scheduled_posts` table in Supabase

## Database Schema

The cron job uses these tables:

### scheduled_posts
- `id` - UUID
- `post_id` - References posts.id
- `user_id` - References auth.users.id
- `scheduled_at` - Timestamp when post should be published
- `status` - 'pending' | 'posted' | 'failed' | 'cancelled'
- `platform` - 'facebook' | 'youtube' | 'instagram'
- `error_message` - Error details if failed

### posts
- `id` - UUID
- `content` - Original content
- `ai_caption` - AI-generated caption
- `ai_hashtags` - AI-generated hashtags
- `media_url` - Optional media
- `posted_at` - Timestamp when published
- `platform_post_id` - ID from the platform

### connected_accounts
- `user_id` - References auth.users.id
- `platform` - Platform name
- `access_token` - OAuth token
- `facebook_page_id` - For Facebook Pages
- `facebook_page_access_token` - Page-specific token

## Monitoring

Check the cron job status:
1. Go to GitHub → Actions
2. Click on "Scheduled Posts Cron Job"
3. View recent runs and their logs

Each run shows:
- Number of posts processed
- Success/failure count
- Detailed error messages if any

## Alternative: Vercel Cron Jobs

If you're deploying to Vercel, you can use Vercel Cron Jobs instead:

1. Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/run",
    "schedule": "*/5 * * * *"
  }]
}
```

2. No need for GitHub Actions
3. Vercel will call the endpoint automatically
4. Still need CRON_SECRET in environment variables

## Cost Considerations

- **GitHub Actions**: Free for public repos, 2000 minutes/month for private repos
- **Vercel Cron**: Included in all plans
- **API Calls**: Each cron run = 1 API call + N database queries (where N = number of due posts)

Running every 5 minutes = 288 runs per day = ~8,640 runs per month





