# OutfAI startup — Docker Compose dev environment.
# Usage: .\scripts\start.ps1 [-NoDocker]
#   -NoDocker   Skip Docker; run Next.js dev server directly in a new window.

param(
    [switch]$NoDocker
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Log  { Write-Host "[start] $args" -ForegroundColor Cyan }
function Ok   { Write-Host "[start] $args" -ForegroundColor Green }
function Warn { Write-Host "[start] $args" -ForegroundColor Yellow }

# ---- Stop any running processes first ----
Log "Stopping any existing processes..."
try {
    & "$Root\scripts\stop.ps1"
} catch {
    Warn "Stop step had errors (continuing anyway): $_"
}
Start-Sleep -Seconds 1
Ok "Stopped (if any were running)."

# ---- Ensure .env.local exists ----
if (-not (Test-Path "$Root\.env.local")) {
    if (Test-Path "$Root\.env.example") {
        Copy-Item "$Root\.env.example" "$Root\.env.local"
        Log "Created .env.local from .env.example"
        Warn "Fill in your values in .env.local, then run this script again."
        exit 1
    } else {
        Write-Host "[start] ERROR: .env.local is missing and .env.example was not found." -ForegroundColor Red
        Write-Host "        Create .env.local before starting." -ForegroundColor Red
        exit 1
    }
}

# ---- Install npm dependencies if missing ----
if (-not (Test-Path "$Root\node_modules")) {
    Log "node_modules not found -- running npm install..."
    npm install
    Ok "npm install done"
}

# ---- Docker check + auto-start ----
function Test-DockerRunning {
    try {
        $null = docker info 2>&1
        return $LASTEXITCODE -eq 0
    } catch { return $false }
}

if (-not $NoDocker) {
    if (-not (Test-DockerRunning)) {
        $dockerDesktop = "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe"
        if (Test-Path $dockerDesktop) {
            Log "Docker is not running -- starting Docker Desktop..."
            Start-Process -FilePath $dockerDesktop
            $maxWait = 90
            $waited  = 0
            while (-not (Test-DockerRunning) -and $waited -lt $maxWait) {
                Start-Sleep -Seconds 3
                $waited += 3
                Write-Host "  Waiting for Docker... ${waited}s" -ForegroundColor Gray
            }
            if (-not (Test-DockerRunning)) {
                Warn "Docker Desktop did not become ready in ${maxWait}s."
                Warn "Start it manually and re-run, or use -NoDocker to skip."
                $NoDocker = $true
            } else {
                Ok "Docker is ready"
            }
        } else {
            Warn "Docker Desktop not found at the default path."
            Warn "Install it from https://www.docker.com/products/docker-desktop"
            Warn "Or use -NoDocker to run the Next.js dev server directly."
            $NoDocker = $true
        }
    }
}

# ---- Start ----
if (-not $NoDocker) {
    Log "Starting Docker Compose (dev)..."
    docker compose up --build -d
    Ok "Docker services up"
} else {
    Warn "Skipping Docker (-NoDocker). Starting Next.js dev server in a new window..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root'; npm run dev"
}

Write-Host ""
Ok "Startup done."
Write-Host "  Web app:  http://localhost:3000" -ForegroundColor White
Write-Host "  Postgres: localhost:54322"       -ForegroundColor White
Write-Host ""
Write-Host "  Tail logs : docker compose logs -f web" -ForegroundColor Gray
Write-Host "  Stop      : .\scripts\stop.ps1"         -ForegroundColor Gray
Write-Host ""
