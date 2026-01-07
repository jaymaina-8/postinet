# Facebook OAuth Configuration Fix Instructions

## Issues Found

1. **Invalid Scopes: email** - Facebook is rejecting the email scope
2. **Domain not included** - Vercel/Supabase domains need to be whitelisted

## Code Fixes Applied ✅

- Updated OAuth calls to explicitly set `queryParams.scope` to prevent Supabase from adding email scope
- Code now explicitly excludes email scope in both OAuth calls

## Facebook App Settings - REQUIRED ACTIONS

### Step 1: Add Domains to App Domains

Go to: https://developers.facebook.com/apps/4311453579077727/settings/basic/

**App Domains** field - Add these domains (one per line):
```
postinet.pro
*.vercel.app
ewzslshgbjhecfruvsna.supabase.co
```

**Note:** If wildcards don't work, add your specific Vercel domain:
- Find your Vercel deployment URL (e.g., `postinet-ii42jeuh3-postinetcom.vercel.app`)
- Add it specifically: `postinet-ii42jeuh3-postinetcom.vercel.app`

### Step 2: Add Redirect URIs

Go to: https://developers.facebook.com/apps/4311453579077727/fb-login/settings/

**Valid OAuth Redirect URIs** - Add:
```
https://ewzslshgbjhecfruvsna.supabase.co/auth/v1/callback
https://postinet.pro/api/facebook/exchange
https://*.vercel.app/api/facebook/exchange
```

**Or add your specific Vercel domain:**
```
https://postinet-ii42jeuh3-postinetcom.vercel.app/api/facebook/exchange
```

### Step 3: Check Supabase Dashboard

Go to: https://supabase.com/dashboard/project/[your-project]/auth/providers

1. Click on **Facebook** provider
2. Check if there's a **Scopes** field
3. If it exists, ensure it only contains:
   ```
   public_profile,pages_show_list,pages_manage_metadata,pages_read_engagement
   ```
4. Remove `email` if it's listed
5. Save changes

### Step 4: Test

After making these changes:
1. Clear browser cache/cookies
2. Try connecting Facebook again
3. The email scope error should be gone
4. The domain error should be resolved

## Summary

✅ **Code fixed** - Explicitly prevents email scope
⏳ **Facebook settings** - Need to add domains and redirect URIs
⏳ **Supabase settings** - Check and remove email scope if present



## Issues Found

1. **Invalid Scopes: email** - Facebook is rejecting the email scope
2. **Domain not included** - Vercel/Supabase domains need to be whitelisted

## Code Fixes Applied ✅

- Updated OAuth calls to explicitly set `queryParams.scope` to prevent Supabase from adding email scope
- Code now explicitly excludes email scope in both OAuth calls

## Facebook App Settings - REQUIRED ACTIONS

### Step 1: Add Domains to App Domains

Go to: https://developers.facebook.com/apps/4311453579077727/settings/basic/

**App Domains** field - Add these domains (one per line):
```
postinet.pro
*.vercel.app
ewzslshgbjhecfruvsna.supabase.co
```

**Note:** If wildcards don't work, add your specific Vercel domain:
- Find your Vercel deployment URL (e.g., `postinet-ii42jeuh3-postinetcom.vercel.app`)
- Add it specifically: `postinet-ii42jeuh3-postinetcom.vercel.app`

### Step 2: Add Redirect URIs

Go to: https://developers.facebook.com/apps/4311453579077727/fb-login/settings/

**Valid OAuth Redirect URIs** - Add:
```
https://ewzslshgbjhecfruvsna.supabase.co/auth/v1/callback
https://postinet.pro/api/facebook/exchange
https://*.vercel.app/api/facebook/exchange
```

**Or add your specific Vercel domain:**
```
https://postinet-ii42jeuh3-postinetcom.vercel.app/api/facebook/exchange
```

### Step 3: Check Supabase Dashboard

Go to: https://supabase.com/dashboard/project/[your-project]/auth/providers

1. Click on **Facebook** provider
2. Check if there's a **Scopes** field
3. If it exists, ensure it only contains:
   ```
   public_profile,pages_show_list,pages_manage_metadata,pages_read_engagement
   ```
4. Remove `email` if it's listed
5. Save changes

### Step 4: Test

After making these changes:
1. Clear browser cache/cookies
2. Try connecting Facebook again
3. The email scope error should be gone
4. The domain error should be resolved

## Summary

✅ **Code fixed** - Explicitly prevents email scope
⏳ **Facebook settings** - Need to add domains and redirect URIs
⏳ **Supabase settings** - Check and remove email scope if present


