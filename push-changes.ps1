# PowerShell script to commit and push changes to GitHub
# Run this with: .\push-changes.ps1

Write-Host "Pushing Postinet MVP changes to GitHub..." -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\USER\3D Objects\postinet2"

# Stage specific files
Write-Host "Staging files..." -ForegroundColor Yellow
git add src/app/page.tsx
git add src/components/Navbar.tsx
git add src/lib/facebook/
git add src/app/api/facebook/
git add src/components/ConnectFacebookCard.tsx
git add src/app/dashboard/accounts/
git add src/app/dashboard/profile/
git add src/app/dashboard/page.tsx
git add src/app/dashboard/layout.tsx
git add src/app/dashboard/generate/page.tsx
git add src/lib/supabaseClient.ts
git add src/app/api/cron/
git add .github/workflows/cron.yml
git add db/add_missing_columns.sql
git add CRON_SETUP_GUIDE.md
git add SETUP_INSTRUCTIONS.md
git add src/components/ConnectYouTubeCard.tsx
git add push-changes.ps1

Write-Host "Files staged successfully" -ForegroundColor Green
Write-Host ""

# Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = @"
Implement Postinet MVP: Landing page, accounts, profile, Facebook OAuth, cron jobs, and bug fixes

Features:
- Add public landing page with hero, features, and platform sections
- Add public navbar with responsive mobile menu
- Implement Facebook OAuth (auth URL, token exchange, page selection)
- Create Connected Accounts page to manage all platforms
- Create Profile page for user settings and preferences
- Enhance dashboard with guided onboarding steps and stats
- Update sidebar navigation with new pages
- Fix platform selection in content generator
- Implement cron job endpoint for scheduled posts
- Add GitHub Actions workflow for automatic post publishing

Bug Fixes:
- Fix Supabase error handling and session checking
- Add fallback logic for missing database columns
- Suppress expected auth and network errors
- Fix ConnectFacebookCard and ConnectYouTubeCard session handling

Documentation:
- Add database migration for missing columns
- Add comprehensive cron setup guide
- Add setup instructions for MVP

Pages Implemented:
- Landing Page (/)
- Connected Accounts (/dashboard/accounts)
- Profile (/dashboard/profile)
- Enhanced Dashboard with guided steps
- Cron job endpoint (/api/cron/run)
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "Commit successful" -ForegroundColor Green
    Write-Host ""
    
    # Push to GitHub
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Run the database migration (db/add_missing_columns.sql) in Supabase" -ForegroundColor White
        Write-Host "2. Set up GitHub secrets (CRON_SECRET, CRON_URL)" -ForegroundColor White
        Write-Host "3. Add CRON_SECRET to your environment variables" -ForegroundColor White
        Write-Host ""
        Write-Host "See CRON_SETUP_GUIDE.md and SETUP_INSTRUCTIONS.md for details" -ForegroundColor Gray
    } else {
        Write-Host "Push failed. Check your git configuration and network connection." -ForegroundColor Red
        Write-Host "You may need to set up your remote: git remote add origin <your-repo-url>" -ForegroundColor Yellow
    }
} else {
    Write-Host "Commit failed. Check the error message above." -ForegroundColor Red
}

Write-Host ""
