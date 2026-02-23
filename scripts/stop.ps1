# OutfAI — stop Docker services and free all dev ports.

$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Log  { Write-Host "[stop] $args" -ForegroundColor Cyan }
function Ok   { Write-Host "[stop] $args" -ForegroundColor Green }

function Stop-Port {
    param([int]$Port)
    $found = $false
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
                Where-Object { $_.State -eq "Listen" }
        if ($conn) {
            $processId = ($conn.OwningProcess | Select-Object -First 1)
            if ($processId) {
                Log "Stopping process on port $Port (PID: $processId)"
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                $found = $true
            }
        }
    } catch { }

    if (-not $found) {
        $line = netstat -ano | Select-String "LISTENING" | Select-String ":$Port "
        if ($line) {
            $processId = ($line -split '\s+')[-1]
            if ($processId -match '^\d+$') {
                Log "Stopping process on port $Port (PID: $processId)"
                Stop-Process -Id ([int]$processId) -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

Log "Stopping Docker Compose services..."
docker compose down 2>$null

Log "Freeing project ports (3000, 54321-54324)..."
foreach ($port in @(3000, 54321, 54322, 54323, 54324)) {
    Stop-Port -Port $port
}

Ok "Done."
