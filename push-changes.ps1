<#
PowerShell helper to stage, commit, and PUSH reliably.

Why this exists:
- It's easy to "commit" locally but forget to push, so GitHub (and Actions) never see the change.
- This script makes "commit + push" the default behavior and warns when you're ahead of origin.

Usage:
  .\push-changes.ps1 -Message "fix: ..."          # stage all, commit, push
  .\push-changes.ps1 -Message "docs: ..." -StageSelected  # stage curated list, commit, push
  .\push-changes.ps1 -PushOnly                   # no staging/commit; just push unpushed commits

Notes:
- We do NOT modify git config here.
- We push the CURRENT branch (not hard-coded main).
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$Message,

  [Parameter(Mandatory = $false)]
  [switch]$StageSelected,

  [Parameter(Mandatory = $false)]
  [switch]$PushOnly
)

$ErrorActionPreference = "Stop"

Write-Host "Postinet: stage -> commit -> push" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory (safe even if already here)
Set-Location "C:\Users\USER\3D Objects\postinet2"

function ExecGit([string]$Cmd) {
  Write-Host "git $Cmd" -ForegroundColor DarkGray
  & git @($Cmd -split ' ')
}

function HasUpstream {
  & git rev-parse --abbrev-ref --symbolic-full-name "@{u}" *> $null
  return ($LASTEXITCODE -eq 0)
}

function AheadCount {
  if (-not (HasUpstream)) { return 0 }
  $count = & git rev-list --count "@{u}..HEAD"
  return [int]$count
}

$branch = (& git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) { throw "Could not determine current git branch." }

Write-Host "Branch: $branch" -ForegroundColor White

if (-not $PushOnly) {
  Write-Host ""
  Write-Host "Staging changes..." -ForegroundColor Yellow

  if ($StageSelected) {
    # Curated list (kept for backwards compatibility)
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
    git add .github/workflows/vercel-deploy.yml
    git add db/add_missing_columns.sql
    git add db/add_facebook_page_tokens.sql
    git add CRON_SETUP_GUIDE.md
    git add SETUP_INSTRUCTIONS.md
    git add TROUBLESHOOTING.md
    git add package.json
    git add package-lock.json
    git add src/components/ConnectYouTubeCard.tsx
    git add push-changes.ps1
  } else {
    # Default: stage everything (including deletions) to avoid "forgot to add file" situations
    git add -A
  }

  Write-Host "Staging complete." -ForegroundColor Green

  # If there is anything staged, commit it.
  $staged = (& git diff --cached --name-only).Trim()
  if ($staged) {
    Write-Host ""
    Write-Host "Committing..." -ForegroundColor Yellow

    if (-not $Message) {
      $Message = "chore: sync local changes"
    }

    git commit -m $Message
    Write-Host "Commit created." -ForegroundColor Green
  } else {
    Write-Host ""
    Write-Host "No staged changes to commit." -ForegroundColor DarkYellow
  }
}

Write-Host ""
Write-Host "Checking push status..." -ForegroundColor Yellow

$ahead = AheadCount
if (-not (HasUpstream)) {
  Write-Host "No upstream configured for $branch. Pushing with upstream..." -ForegroundColor DarkYellow
  git push -u origin $branch
} elseif ($ahead -gt 0) {
  Write-Host "You have $ahead local commit(s) not on origin/$branch. Pushing..." -ForegroundColor DarkYellow
  git push origin $branch
} else {
  Write-Host "Nothing to push (origin/$branch is up to date)." -ForegroundColor Green
}

Write-Host ""
Write-Host "Done." -ForegroundColor Cyan
