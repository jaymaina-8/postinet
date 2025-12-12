# GitHub Actions Cron Job Setup

## Overview

Postinet uses **GitHub Actions** for scheduled task execution. The cron job runs every 5 minutes to process scheduled posts that are due to be published.

**Production URL:** https://www.postinet.pro  
**Cron Endpoint:** https://www.postinet.pro/api/cron/run  
**Workflow File:** `.github/workflows/cron.yml`

## How It Works

1. GitHub Actions runs the workflow every 5 minutes (configurable)
2. The workflow sends a POST request to `/api/cron/run`
3. The endpoint processes all pending scheduled posts that are due
4. Posts are published to connected platforms (Facebook, YouTube, etc.)
5. Post statuses are updated in the database

## Setup Instructions

### Step 1: Add Repository Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secret:
   - **Name:** `CRON_SECRET`
   - **Value:** A secure random string (e.g., generate with `openssl rand -hex 32`)

### Step 2: Set Environment Variable on Server

Add the same `CRON_SECRET` to your production environment (Vercel, etc.):

```env
CRON_SECRET=your_secure_random_string
```

### Step 3: Verify Workflow File

The workflow file is located at `.github/workflows/cron.yml`:

```yaml
name: Postinet Cron Job

on:
  schedule:
    - cron: "*/5 * * * *"  # Every 5 minutes
  workflow_dispatch:        # Allow manual trigger

jobs:
  trigger-cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Postinet Cron Endpoint
        run: |
          curl -X POST "https://www.postinet.pro/api/cron/run" \
            -H "Content-Type: application/json" \
            -H "X-CRON-KEY: ${{ secrets.CRON_SECRET }}"
```

### Step 4: Enable GitHub Actions

1. Go to your repository's **Actions** tab
2. If prompted, enable GitHub Actions for the repository
3. The cron job will start running automatically based on the schedule

## Security

The cron endpoint is protected by the `X-CRON-KEY` header:

- The API endpoint validates that `X-CRON-KEY` matches `CRON_SECRET` environment variable
- Requests without a valid key receive a `401 Unauthorized` response
- The secret is stored securely in GitHub Secrets and never exposed in logs

## Testing

### Manual Trigger via GitHub Actions

1. Go to **Actions** → **Postinet Cron Job**
2. Click **Run workflow** → **Run workflow**
3. Check the workflow run for results

### Test via cURL (Local Development)

```bash
# Test locally (requires CRON_SECRET in .env.local)
curl -X POST http://localhost:3000/api/cron/run \
  -H "Content-Type: application/json" \
  -H "X-CRON-KEY: your_cron_secret"
```

### Test via cURL (Production)

```bash
# Test production endpoint
curl -X POST https://www.postinet.pro/api/cron/run \
  -H "Content-Type: application/json" \
  -H "X-CRON-KEY: your_cron_secret"
```

### Check Endpoint Info

```bash
# Get endpoint information (no auth required)
curl -X GET https://www.postinet.pro/api/cron/run
```

## Schedule Options

The schedule is defined using cron syntax in `.github/workflows/cron.yml`:

| Schedule | Cron Expression | Description |
|----------|-----------------|-------------|
| Every 5 minutes | `*/5 * * * *` | **Default** - Good for near-real-time posting |
| Every minute | `*/1 * * * *` | For testing only |
| Every 15 minutes | `*/15 * * * *` | Lower frequency |
| Every hour | `0 * * * *` | Hourly execution |
| Every 6 hours | `0 */6 * * *` | Less frequent |
| Daily at 9 AM UTC | `0 9 * * *` | Once per day |

To change the schedule, edit the `cron` value in `.github/workflows/cron.yml`:

```yaml
on:
  schedule:
    - cron: "*/15 * * * *"  # Change to every 15 minutes
```

## Monitoring

### View Workflow Runs

1. Go to your repository's **Actions** tab
2. Click on **Postinet Cron Job** workflow
3. View individual run logs for success/failure details

### Check Workflow Status

- ✅ **Green checkmark**: Cron job ran successfully
- ❌ **Red X**: Cron job failed (check logs for details)
- 🟡 **Yellow circle**: Cron job is currently running

### Enable Notifications

1. Go to **Settings** → **Notifications**
2. Configure email notifications for failed workflow runs

## Troubleshooting

### Cron Job Not Running

1. **Check GitHub Actions is enabled** for your repository
2. **Verify the workflow file** exists at `.github/workflows/cron.yml`
3. **Check workflow syntax** - use the GitHub Actions linter
4. **Note:** GitHub may delay or skip cron runs during high load periods

### 401 Unauthorized Error

1. **Verify CRON_SECRET** is set in GitHub repository secrets
2. **Verify CRON_SECRET** is set in your production environment
3. **Ensure values match** exactly (no extra spaces or newlines)

### No Posts Being Processed

1. Check if there are scheduled posts with:
   - `status = 'pending'`
   - `scheduled_at <= now()`
2. Verify platform connections are active
3. Check that access tokens haven't expired

### Workflow Timing Issues

- GitHub Actions cron jobs may be delayed by 5-15 minutes during peak usage
- For time-critical posts, consider using a dedicated cron service
- The workflow includes manual trigger option for immediate execution

## API Response Format

### Success Response

```json
{
  "message": "Processed 3 scheduled posts",
  "processed": 3,
  "results": [
    { "id": "post-1", "status": "posted", "postId": "123", "platformPostId": "fb_456" },
    { "id": "post-2", "status": "posted", "postId": "124", "platformPostId": "fb_789" },
    { "id": "post-3", "status": "failed", "reason": "Token expired" }
  ]
}
```

### No Posts Due

```json
{
  "message": "No posts due for posting",
  "processed": 0
}
```

### Error Response

```json
{
  "error": "Unauthorized"
}
```

## Files Reference

| File | Description |
|------|-------------|
| `.github/workflows/cron.yml` | GitHub Actions workflow configuration |
| `src/app/api/cron/run/route.ts` | API endpoint that processes scheduled posts |
| `CRON_SETUP.md` | This documentation file |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CRON_SECRET` | Yes | Secret key for authenticating cron requests |

Add to your `.env.local` (local development) and production environment:

```env
CRON_SECRET=your_secure_random_string_here
```
