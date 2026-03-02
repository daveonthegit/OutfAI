# OutfAI — stop Docker web container and local Convex dev watcher.

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Log { Write-Host "[stop] $args" -ForegroundColor Cyan }
function Ok  { Write-Host "[stop] $args" -ForegroundColor Green }

# ── Stop Docker Compose services ──────────────────────────────────────────────
Log "Stopping Docker Compose services..."
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        docker compose down 2>$null
    } else {
        Log "Docker is not running — skipping Docker Compose teardown."
    }
} catch {
    Log "Docker not available — skipping Docker Compose teardown."
}

# ── Kill local Convex dev watcher ─────────────────────────────────────────────
Log "Stopping Convex dev watcher..."
try {
    $procs = Get-WmiObject Win32_Process -ErrorAction SilentlyContinue |
             Where-Object { $_.Name -like "node*" -and $_.CommandLine -like "*convex*" }
    foreach ($p in $procs) {
        Log "  Stopping PID $($p.ProcessId)"
        Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    }
} catch { }

# ── Fallback: free port 3000 if anything is still listening ───────────────────
function Stop-Port {
    param([int]$Port)
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                Where-Object { $_.State -eq "Listen" }
        if ($conn) {
            $pid = ($conn.OwningProcess | Select-Object -First 1)
            if ($pid) {
                Log "Freeing port $Port (PID: $pid)"
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
    } catch { }
}

Stop-Port -Port 3000

Ok "Done."
