#!/usr/bin/env bash
# OutfAI startup — Convex dev (local) + Next.js web server (Docker).
# Usage: ./scripts/start.sh
#
#   1. Starts `npm run convex:dev` in the background (local — must run outside
#      Docker so it can watch source files and reach Convex cloud).
#   2. Waits 10 s for Convex to initialise and generate types.
#   3. Starts the Next.js web server via Docker Compose.
#   4. Waits for http://localhost:3000, then opens the browser.
#
# Background process PIDs are saved to .dev-pids for clean shutdown.
# Type :q to stop everything and exit.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$ROOT_DIR/.dev-pids"

CYN='\033[0;36m'; GRN='\033[0;32m'; YLW='\033[0;33m'; RED='\033[0;31m'; RST='\033[0m'
log()  { echo -e "${CYN}[start]${RST} $*"; }
ok()   { echo -e "${GRN}[start]${RST} $*"; }
warn() { echo -e "${YLW}[start]${RST} $*"; }
err()  { echo -e "${RED}[start] ERROR:${RST} $*"; }

# ── Stop any running processes first ──────────────────────────────────────────
log "Stopping any existing processes..."
"$SCRIPT_DIR/stop.sh" || warn "Stop step had errors (continuing)."
sleep 1
ok "Stopped (if any were running)."

# ── Ensure .env.local exists ──────────────────────────────────────────────────
if [ ! -f "$ROOT_DIR/.env.local" ]; then
    if [ -f "$ROOT_DIR/.env.example" ]; then
        cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"
        log "Created .env.local from .env.example"
        warn "Fill in your values in .env.local, then run this script again."
        warn "  Hint: run  npx convex dev  once to populate CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL."
        exit 1
    else
        err ".env.local is missing and .env.example was not found."
        exit 1
    fi
fi

# ── Check Convex vars are not still placeholder values ────────────────────────
if grep -q "NEXT_PUBLIC_CONVEX_URL=https://your-deployment" "$ROOT_DIR/.env.local"; then
    warn ".env.local still has placeholder Convex values."
    warn "Run  npx convex dev  once from the project root to populate them, then re-run this script."
    exit 1
fi
if ! grep -q "NEXT_PUBLIC_CONVEX_URL=https://" "$ROOT_DIR/.env.local"; then
    warn "NEXT_PUBLIC_CONVEX_URL is missing from .env.local."
    warn "Run  npx convex dev  once from the project root to populate it."
    exit 1
fi

# ── Install npm dependencies if missing ───────────────────────────────────────
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    log "node_modules not found — running npm install..."
    npm install --prefix "$ROOT_DIR"
    ok "npm install done."
fi

# ── Check Docker is running ───────────────────────────────────────────────────
docker_running() { docker info &>/dev/null 2>&1; }

if ! docker_running; then
    if ! command -v docker &>/dev/null; then
        err "Docker is not installed. Install it from https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    log "Docker is not running — attempting to start it..."
    if [[ "$(uname)" == "Darwin" ]]; then
        open -a "Docker" 2>/dev/null || true
    elif command -v systemctl &>/dev/null; then
        sudo systemctl start docker 2>/dev/null || true
    fi
    max_wait=90; waited=0
    while ! docker_running && [ "$waited" -lt "$max_wait" ]; do
        sleep 3; waited=$((waited + 3))
        echo -e "  \033[0;37mWaiting for Docker... ${waited}s\033[0m"
    done
    if ! docker_running; then
        err "Docker did not become ready in ${max_wait}s. Start it manually and re-run."
        exit 1
    fi
    ok "Docker is ready."
fi

# ── Readiness poll ────────────────────────────────────────────────────────────
wait_for_app() {
    local url=$1 max_wait=${2:-120} waited=0
    while [ "$waited" -lt "$max_wait" ]; do
        if curl -sf --max-time 2 "$url" &>/dev/null; then return 0; fi
        sleep 3; waited=$((waited + 3))
        echo -e "  \033[0;37mWaiting for app... ${waited}s\033[0m"
    done
    return 1
}

open_browser() {
    local url=$1
    if command -v xdg-open &>/dev/null; then xdg-open "$url" &>/dev/null &
    elif command -v open &>/dev/null; then open "$url"; fi
}

mkdir -p "$ROOT_DIR/logs"
cd "$ROOT_DIR"

# ── 1. Start Convex dev watcher (local, outside Docker) ───────────────────────
log "Starting Convex dev watcher in background (local)..."
npm run convex:dev >"$ROOT_DIR/logs/convex-dev.log" 2>&1 &
CONVEX_PID=$!
echo "convex:$CONVEX_PID" > "$PID_FILE"
ok "Convex dev watcher started (PID: $CONVEX_PID)"

log "Waiting 10 s for Convex to initialise and generate types..."
sleep 10

# ── 2. Start Next.js via Docker Compose ──────────────────────────────────────
log "Starting Next.js web server via Docker Compose..."
docker compose up --build -d
ok "Container started. Waiting for web app to be ready..."

if wait_for_app "http://localhost:3000"; then
    ok "App is ready."
    open_browser "http://localhost:3000"
else
    warn "App did not respond within 120 s."
    warn "Check container logs:  docker compose logs -f web"
fi

echo ""
ok "Startup done."
echo -e "  Web app:          \033[0;37mhttp://localhost:3000\033[0m"
echo -e "  Convex dashboard: \033[0;37mhttps://dashboard.convex.dev\033[0m"
echo ""
echo -e "  Tail web logs:    \033[0;37mdocker compose logs -f web\033[0m"
echo -e "  Tail Convex logs: \033[0;37mtail -f logs/convex-dev.log\033[0m"
echo ""
echo -e "  Type \033[0;37m:q\033[0m  to stop everything and exit"
echo ""

while true; do
    read -r cmd
    if [ "$cmd" = ":q" ]; then
        log "Stopping..."
        "$SCRIPT_DIR/stop.sh"
        break
    fi
done
