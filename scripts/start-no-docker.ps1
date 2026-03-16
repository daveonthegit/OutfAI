# OutfAI startup (no Docker) — Convex dev + Next.js, both run locally.
# Usage: .\scripts\start-no-docker.ps1
#
#   1. Installs npm dependencies if node_modules is missing.
#   2. Starts `npm run convex:dev` in a new PowerShell window (local).
#   3. Waits 10 s for Convex to initialise and generate types.
#   4. Starts the Next.js dev server in another window (local).
#   5. Waits for http://localhost:3000, then opens the browser.
#
# Type :q to stop everything and quit (uses stop-no-docker.ps1).

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Log  { Write-Host "[start-no-docker] $args" -ForegroundColor Cyan }
function Ok   { Write-Host "[start-no-docker] $args" -ForegroundColor Green }
function Warn { Write-Host "[start-no-docker] $args" -ForegroundColor Yellow }
function Err  { Write-Host "[start-no-docker] ERROR: $args" -ForegroundColor Red }

# ── Stop any running processes first ──────────────────────────────────────────
Log "Stopping any existing processes..."
try { & "$Root\scripts\stop-no-docker.ps1" } catch { Warn "Stop step had errors (continuing): $_" }
Start-Sleep -Seconds 1
Ok "Stopped (if any were running)."

# ── Ensure .env.local exists ──────────────────────────────────────────────────
if (-not (Test-Path "$Root\.env.local")) {
    if (Test-Path "$Root\.env.example") {
        Copy-Item "$Root\.env.example" "$Root\.env.local"
        Log "Created .env.local from .env.example"
        Warn "Fill in your values in .env.local, then run this script again."
        Warn "  Hint: run  npx convex dev  once to populate CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL."
        exit 1
    } else {
        Err ".env.local is missing and .env.example was not found."
        exit 1
    }
}

# ── Check Convex vars are not still placeholder values ────────────────────────
$envContent = Get-Content "$Root\.env.local" -Raw
if ($envContent -match "NEXT_PUBLIC_CONVEX_URL=https://your-deployment") {
    Warn ".env.local still has placeholder Convex values."
    Warn "Run  npx convex dev  once from the project root to populate them, then re-run this script."
    exit 1
}
if ($envContent -notmatch "NEXT_PUBLIC_CONVEX_URL=https://") {
    Warn "NEXT_PUBLIC_CONVEX_URL is missing from .env.local."
    Warn "Run  npx convex dev  once from the project root to populate it."
    exit 1
}

# ── Install npm dependencies (ensures missing/updated deps are installed) ─────
Log "Ensuring npm dependencies are installed..."
npm install
Ok "npm install done."

# ── Readiness poll ────────────────────────────────────────────────────────────
function Wait-ForApp {
    param([string]$Url, [int]$MaxSeconds = 120)
    $waited = 0
    while ($waited -lt $MaxSeconds) {
        try {
            $r = Invoke-WebRequest -Uri $Url -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
            if ($r -and $r.StatusCode -lt 500) { return $true }
        } catch { }
        Start-Sleep -Seconds 3; $waited += 3
        Write-Host "  Waiting for app... ${waited}s" -ForegroundColor Gray
    }
    return $false
}

# ── 1. Start Convex dev watcher (local) ───────────────────────────────────────
Log "Starting Convex dev watcher in a new window (local)..."
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$Root'; `$Host.UI.RawUI.WindowTitle = 'OutfAI — Convex Dev'; npm run convex:dev"

Log "Waiting 10 s for Convex to initialise and generate types..."
Start-Sleep -Seconds 10

# ── 2. Start Next.js dev server (local, no Docker) ────────────────────────────
Log "Starting Next.js dev server in a new window (local)..."
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$Root'; `$Host.UI.RawUI.WindowTitle = 'OutfAI — Next.js'; npm run dev"

Ok "Next.js starting. Waiting for web app to be ready..."

if (Wait-ForApp "http://localhost:3000") {
    Ok "App is ready."
    Start-Process "http://localhost:3000"
} else {
    Warn "App did not respond within 120 s."
    Warn "Check the 'OutfAI — Next.js' window for errors."
}

Write-Host ""
Ok "Startup done (no Docker)."
Write-Host "  Web app:          http://localhost:3000"              -ForegroundColor White
Write-Host "  Convex dashboard: https://dashboard.convex.dev"       -ForegroundColor White
Write-Host ""
Write-Host "  Convex output:  see the 'OutfAI — Convex Dev' window" -ForegroundColor Gray
Write-Host "  Next.js output: see the 'OutfAI — Next.js' window"    -ForegroundColor Gray
Write-Host ""
Write-Host "  Type :q  to stop everything and quit"                 -ForegroundColor Gray
Write-Host ""

while ($true) {
    $cmd = Read-Host
    if ($cmd -eq ":q") {
        Log "Stopping..."
        & "$Root\scripts\stop-no-docker.ps1"
        break
    }
}
