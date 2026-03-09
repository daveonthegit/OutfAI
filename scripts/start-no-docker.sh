#!/usr/bin/env bash
# OutfAI startup (no Docker) — Convex dev + Next.js, both run locally.
# Usage: ./scripts/start-no-docker.sh
#
#   1. Installs npm dependencies if node_modules is missing.
#   2. Starts `npm run convex:dev` in the background (local).
#   3. Waits 10 s for Convex to initialise and generate types.
#   4. Starts the Next.js dev server in the background (local).
#   5. Waits for http://localhost:3000, then opens the browser.
#
# Background process PIDs are saved to .dev-pids for clean shutdown.
# Type :q to stop everything and exit (uses stop-no-docker.sh).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$ROOT_DIR/.dev-pids"

CYN='\033[0;36m'; GRN='\033[0;32m'; YLW='\033[0;33m'; RED='\033[0;31m'; RST='\033[0m'
log()  { echo -e "${CYN}[start-no-docker]${RST} $*"; }
ok()   { echo -e "${GRN}[start-no-docker]${RST} $*"; }
warn() { echo -e "${YLW}[start-no-docker]${RST} $*"; }
err()  { echo -e "${RED}[start-no-docker] ERROR:${RST} $*"; }

# ── Stop any running processes first ──────────────────────────────────────────
log "Stopping any existing processes..."
"$SCRIPT_DIR/stop-no-docker.sh" || warn "Stop step had errors (continuing)."
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
else
    log "node_modules present — skipping install (run 'npm install' manually to update)."
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

# ── 1. Start Convex dev watcher (local) ───────────────────────────────────────
log "Starting Convex dev watcher in background (local)..."
npm run convex:dev >"$ROOT_DIR/logs/convex-dev.log" 2>&1 &
CONVEX_PID=$!
echo "convex:$CONVEX_PID" > "$PID_FILE"
ok "Convex dev watcher started (PID: $CONVEX_PID)"

log "Waiting 10 s for Convex to initialise and generate types..."
sleep 10

# ── 2. Start Next.js dev server (local, no Docker) ─────────────────────────────
log "Starting Next.js dev server in background (local)..."
npm run dev >"$ROOT_DIR/logs/next-dev.log" 2>&1 &
NEXT_PID=$!
echo "next:$NEXT_PID" >> "$PID_FILE"
ok "Next.js dev server started (PID: $NEXT_PID)"

if wait_for_app "http://localhost:3000"; then
    ok "App is ready."
    open_browser "http://localhost:3000"
else
    warn "App did not respond within 120 s."
    warn "Check logs: tail -f logs/next-dev.log"
fi

echo ""
ok "Startup done (no Docker)."
echo -e "  Web app:          \033[0;37mhttp://localhost:3000\033[0m"
echo -e "  Convex dashboard: \033[0;37mhttps://dashboard.convex.dev\033[0m"
echo ""
echo -e "  Tail Convex logs: \033[0;37mtail -f logs/convex-dev.log\033[0m"
echo -e "  Tail Next.js logs: \033[0;37mtail -f logs/next-dev.log\033[0m"
echo ""
echo -e "  Type \033[0;37m:q\033[0m  to stop everything and exit"
echo ""

while true; do
    read -r cmd
    if [ "$cmd" = ":q" ]; then
        log "Stopping..."
        "$SCRIPT_DIR/stop-no-docker.sh"
        break
    fi
done
