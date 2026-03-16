# OutfAI startup — Convex dev (local) + Next.js web server (Docker).
# Usage: .\scripts\start.ps1
#
#   1. Starts `npm run convex:dev` in a new PowerShell window (local — must
#      run outside Docker so it can watch source files and reach Convex cloud).
#   2. Waits 10 s for Convex to initialise and generate types.
#   3. Starts the Next.js web server via Docker Compose.
#   4. Waits for http://localhost:3000, then opens the browser.
#
# Type :q to stop everything and quit.

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Log  { Write-Host "[start] $args" -ForegroundColor Cyan }
function Ok   { Write-Host "[start] $args" -ForegroundColor Green }
function Warn { Write-Host "[start] $args" -ForegroundColor Yellow }
function Err  { Write-Host "[start] ERROR: $args" -ForegroundColor Red }

# ── Stop any running processes first ──────────────────────────────────────────
Log "Stopping any existing processes..."
try { & "$Root\scripts\stop.ps1" } catch { Warn "Stop step had errors (continuing): $_" }
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

# ── Check Docker is running ───────────────────────────────────────────────────
function Test-DockerRunning {
    try { $null = docker info 2>&1; return $LASTEXITCODE -eq 0 } catch { return $false }
}

if (-not (Test-DockerRunning)) {
    $dockerDesktop = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerDesktop) {
        Log "Docker is not running — starting Docker Desktop..."
        Start-Process -FilePath $dockerDesktop
        $maxWait = 90; $waited = 0
        while (-not (Test-DockerRunning) -and $waited -lt $maxWait) {
            Start-Sleep -Seconds 3; $waited += 3
            Write-Host "  Waiting for Docker... ${waited}s" -ForegroundColor Gray
        }
        if (-not (Test-DockerRunning)) {
            Err "Docker Desktop did not become ready in ${maxWait}s. Start it manually and re-run."
            exit 1
        }
        Ok "Docker is ready."
    } else {
        Err "Docker Desktop is not running and was not found at the default path."
        Err "Install it from https://www.docker.com/products/docker-desktop and start it."
        exit 1
    }
}

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

# ── 1. Start Convex dev watcher (local, outside Docker) ───────────────────────
Log "Starting Convex dev watcher in a new window (local)..."
Start-Process powershell -ArgumentList `
    "-NoExit", "-Command", `
    "Set-Location '$Root'; `$Host.UI.RawUI.WindowTitle = 'OutfAI — Convex Dev'; npm run convex:dev"

Log "Waiting 10 s for Convex to initialise and generate types..."
Start-Sleep -Seconds 10

# ── 2. Start Next.js via Docker Compose ──────────────────────────────────────
Log "Starting Next.js web server via Docker Compose..."
docker compose up --build -d
Ok "Container started. Waiting for web app to be ready..."

if (Wait-ForApp "http://localhost:3000") {
    Ok "App is ready."
    Start-Process "http://localhost:3000"
} else {
    Warn "App did not respond within 120 s."
    Warn "Check container logs:  docker compose logs -f web"
}

Write-Host ""
Ok "Startup done."
Write-Host "  Web app:          http://localhost:3000"              -ForegroundColor White
Write-Host "  Convex dashboard: https://dashboard.convex.dev"       -ForegroundColor White
Write-Host ""
Write-Host "  Tail web logs:  docker compose logs -f web"           -ForegroundColor Gray
Write-Host "  Convex output:  see the 'OutfAI — Convex Dev' window" -ForegroundColor Gray
Write-Host ""
Write-Host "  Type :q  to stop everything and quit"                 -ForegroundColor Gray
Write-Host ""

while ($true) {
    $cmd = Read-Host
    if ($cmd -eq ":q") {
        Log "Stopping..."
        & "$Root\scripts\stop.ps1"
        break
    }
}
