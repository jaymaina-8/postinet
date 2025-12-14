# Vercel Cron Job Setup

## Configuration

The cron job is configured in `vercel.json` to run every 5 minutes, checking for scheduled posts that are due to be posted.

## Setup Instructions

### Option 1: Using vercel.json (Recommended)

The `vercel.json` file is already configured. When you deploy to Vercel, the cron job will be automatically set up.

**Note:** You may need to configure the cron job in the Vercel dashboard after deployment:
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Cron Jobs**
3. Verify the cron job is listed: `/api/scheduler/run` with schedule `*/5 * * * *` (every 5 minutes)

### Option 2: Manual Setup in Vercel Dashboard

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Cron Jobs**
4. Click **Create Cron Job**
5. Configure:
   - **Path**: `/api/scheduler/run`
   - **Schedule**: `*/5 * * * *` (every 5 minutes)
   - **Timezone**: Your preferred timezone (e.g., `America/New_York`)

## Security

The cron job endpoint includes optional security via `CRON_SECRET` environment variable:

1. Set `CRON_SECRET` in your Vercel environment variables
2. The cron job will verify the `Authorization: Bearer {CRON_SECRET}` header
3. In Vercel Cron Jobs, you can add custom headers:
   - Go to **Settings** → **Cron Jobs** → Edit your cron job
   - Add header: `Authorization: Bearer ${CRON_SECRET}` (Vercel will replace the env var)

Alternatively, you can rely on Vercel's built-in security (cron jobs are only accessible from Vercel's infrastructure).

## Testing

To test the cron job manually:

```bash
# Set CRON_SECRET if you're using it
curl -X GET https://your-domain.vercel.app/api/scheduler/run \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Or test locally:
```bash
curl -X GET http://localhost:3000/api/scheduler/run
```

## Schedule Options

Current schedule: `*/5 * * * *` (every 5 minutes)

Other common options:
- `*/1 * * * *` - Every minute (for testing)
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours
- `0 9 * * *` - Daily at 9 AM

## Monitoring

Check Vercel logs to monitor cron job execution:
1. Go to **Deployments** → Select a deployment → **Functions** tab
2. Look for `/api/scheduler/run` function logs
3. Check for errors or successful executions

## Troubleshooting

- **Cron job not running**: Verify it's configured in Vercel Dashboard
- **401 Unauthorized**: Check `CRON_SECRET` is set correctly
- **No posts processed**: Check if there are scheduled posts with `status = 'pending'` and `scheduled_at <= now()`

