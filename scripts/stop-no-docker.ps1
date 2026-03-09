# OutfAI — stop local Convex dev watcher and Next.js (no Docker).

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Log { Write-Host "[stop-no-docker] $args" -ForegroundColor Cyan }
function Ok  { Write-Host "[stop-no-docker] $args" -ForegroundColor Green }

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

# ── Kill Next.js dev server (port 3000) ───────────────────────────────────────
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
