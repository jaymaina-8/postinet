# How to Get Vercel Project ID and Org ID

## Method 1: From Vercel Dashboard (Easiest)

1. Go to your Vercel project: https://vercel.com/jaymaina-8/postinet
2. Go to **Settings** → **General**
3. Scroll down to find:
   - **Project ID**: Should be visible in the project settings
   - **Team ID** (this is your Org ID): Found in the URL or team settings

## Method 2: Using Vercel CLI

Run these commands locally:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel@latest

# Login to Vercel
vercel login

# Link to your project (this will show the project ID)
vercel link

# Get your team/org ID
vercel teams ls
```

## Method 3: From Browser Network Tab

1. Open your Vercel project dashboard
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for API calls to `vercel.com/api` - the responses will contain `projectId` and `teamId`

## Method 4: From Project Settings URL

The project ID might be visible in:
- Project Settings URL: `https://vercel.com/[team]/[project]/settings`
- Or check the `.vercel` folder if you've linked locally (should contain `project.json`)

## After Getting the IDs:

1. Go to GitHub: https://github.com/jaymaina-8/postinet/settings/secrets/actions
2. Add/Update these secrets:
   - `VERCEL_TOKEN` - Get from: https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Your team/org ID
   - `VERCEL_PROJECT_ID` - Your project ID
   - `VERCEL_DEPLOY_AUTHOR_EMAIL` (optional) - Your Vercel account email






## Method 1: From Vercel Dashboard (Easiest)

1. Go to your Vercel project: https://vercel.com/jaymaina-8/postinet
2. Go to **Settings** → **General**
3. Scroll down to find:
   - **Project ID**: Should be visible in the project settings
   - **Team ID** (this is your Org ID): Found in the URL or team settings

## Method 2: Using Vercel CLI

Run these commands locally:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel@latest

# Login to Vercel
vercel login

# Link to your project (this will show the project ID)
vercel link

# Get your team/org ID
vercel teams ls
```

## Method 3: From Browser Network Tab

1. Open your Vercel project dashboard
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for API calls to `vercel.com/api` - the responses will contain `projectId` and `teamId`

## Method 4: From Project Settings URL

The project ID might be visible in:
- Project Settings URL: `https://vercel.com/[team]/[project]/settings`
- Or check the `.vercel` folder if you've linked locally (should contain `project.json`)

## After Getting the IDs:

1. Go to GitHub: https://github.com/jaymaina-8/postinet/settings/secrets/actions
2. Add/Update these secrets:
   - `VERCEL_TOKEN` - Get from: https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Your team/org ID
   - `VERCEL_PROJECT_ID` - Your project ID
   - `VERCEL_DEPLOY_AUTHOR_EMAIL` (optional) - Your Vercel account email









## Method 1: From Vercel Dashboard (Easiest)

1. Go to your Vercel project: https://vercel.com/jaymaina-8/postinet
2. Go to **Settings** → **General**
3. Scroll down to find:
   - **Project ID**: Should be visible in the project settings
   - **Team ID** (this is your Org ID): Found in the URL or team settings

## Method 2: Using Vercel CLI

Run these commands locally:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel@latest

# Login to Vercel
vercel login

# Link to your project (this will show the project ID)
vercel link

# Get your team/org ID
vercel teams ls
```

## Method 3: From Browser Network Tab

1. Open your Vercel project dashboard
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for API calls to `vercel.com/api` - the responses will contain `projectId` and `teamId`

## Method 4: From Project Settings URL

The project ID might be visible in:
- Project Settings URL: `https://vercel.com/[team]/[project]/settings`
- Or check the `.vercel` folder if you've linked locally (should contain `project.json`)

## After Getting the IDs:

1. Go to GitHub: https://github.com/jaymaina-8/postinet/settings/secrets/actions
2. Add/Update these secrets:
   - `VERCEL_TOKEN` - Get from: https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Your team/org ID
   - `VERCEL_PROJECT_ID` - Your project ID
   - `VERCEL_DEPLOY_AUTHOR_EMAIL` (optional) - Your Vercel account email






## Method 1: From Vercel Dashboard (Easiest)

1. Go to your Vercel project: https://vercel.com/jaymaina-8/postinet
2. Go to **Settings** → **General**
3. Scroll down to find:
   - **Project ID**: Should be visible in the project settings
   - **Team ID** (this is your Org ID): Found in the URL or team settings

## Method 2: Using Vercel CLI

Run these commands locally:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel@latest

# Login to Vercel
vercel login

# Link to your project (this will show the project ID)
vercel link

# Get your team/org ID
vercel teams ls
```

## Method 3: From Browser Network Tab

1. Open your Vercel project dashboard
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh the page
5. Look for API calls to `vercel.com/api` - the responses will contain `projectId` and `teamId`

## Method 4: From Project Settings URL

The project ID might be visible in:
- Project Settings URL: `https://vercel.com/[team]/[project]/settings`
- Or check the `.vercel` folder if you've linked locally (should contain `project.json`)

## After Getting the IDs:

1. Go to GitHub: https://github.com/jaymaina-8/postinet/settings/secrets/actions
2. Add/Update these secrets:
   - `VERCEL_TOKEN` - Get from: https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Your team/org ID
   - `VERCEL_PROJECT_ID` - Your project ID
   - `VERCEL_DEPLOY_AUTHOR_EMAIL` (optional) - Your Vercel account email







