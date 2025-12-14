# Troubleshooting Supabase "Failed to fetch" Errors

## Common Causes

The "Failed to fetch" errors you're seeing are typically caused by:

1. **Missing Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL` is not set or incorrect
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not set or incorrect

2. **Network Issues**
   - Supabase API is unreachable
   - CORS configuration issues
   - Firewall blocking requests

3. **Invalid Session**
   - Expired or invalid authentication tokens
   - Session storage issues

## Solutions

### 1. Verify Environment Variables

Create or check your `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** 
- Restart your Next.js dev server after adding/changing environment variables
- Make sure `.env.local` is in `.gitignore` (never commit secrets)

### 2. Check Supabase Project Status

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Verify your project is active and running
3. Check the API URL matches your `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the anon key from Settings > API

### 3. Clear Browser Storage

If you're seeing persistent errors:

1. Open browser DevTools (F12)
2. Go to Application > Storage
3. Clear Local Storage and Session Storage
4. Refresh the page

### 4. Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for failed requests to `*.supabase.co`
4. Check the error details and status codes

### 5. Verify Supabase Client Configuration

The Supabase client has been configured to handle errors gracefully. If errors persist:

1. Check browser console for specific error messages
2. Verify the Supabase URL format: `https://xxxxx.supabase.co` (no trailing slash)
3. Ensure your Supabase project allows requests from your domain

## What Was Fixed

The following improvements were made to handle these errors:

1. **Enhanced Error Handling**: Added custom fetch wrapper to gracefully handle network errors
2. **Token Refresh Handling**: Suppressed "Failed to fetch" errors during token refresh when session is invalid
3. **Better Logging**: Improved error logging in development mode
4. **Component Error Handling**: Added try-catch blocks in components that use Supabase auth

## Still Having Issues?

If errors persist after checking the above:

1. Check Supabase project logs in the dashboard
2. Verify your Supabase project is not paused or deleted
3. Check if you're hitting rate limits
4. Verify your network connection
5. Try accessing Supabase API directly: `https://your-project.supabase.co/rest/v1/`

## Additional Notes

- These errors are often harmless and occur when:
  - The user is not logged in
  - The session has expired
  - The app is trying to refresh an invalid token
  
- The app will handle these gracefully and redirect to login when needed

















