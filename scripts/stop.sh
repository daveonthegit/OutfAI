#!/usr/bin/env bash
# OutfAI — stop Docker web container and local Convex dev watcher.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$ROOT_DIR/.dev-pids"

CYN='\033[0;36m'; GRN='\033[0;32m'; RST='\033[0m'
log() { echo -e "${CYN}[stop]${RST} $*"; }
ok()  { echo -e "${GRN}[stop]${RST} $*"; }

# ── Stop Docker Compose services ──────────────────────────────────────────────
log "Stopping Docker Compose services..."
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    docker compose -f "$ROOT_DIR/docker-compose.yml" down 2>/dev/null || true
else
    log "Docker not running — skipping Docker Compose teardown."
fi

# ── Kill tracked background PIDs (Convex dev watcher) ────────────────────────
if [ -f "$PID_FILE" ]; then
    while IFS= read -r line; do
        label="${line%%:*}"
        pid="${line##*:}"
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            log "Stopping $label (PID: $pid)"
            kill -TERM "$pid" 2>/dev/null || true
            sleep 1
            kill -9 "$pid" 2>/dev/null || true
        fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
fi

# ── Fallback: kill any remaining Convex dev processes by name ─────────────────
log "Stopping any remaining Convex dev processes..."
pkill -f "convex dev"  2>/dev/null || true
pkill -f "convex:dev"  2>/dev/null || true

# ── Fallback: free port 3000 if anything is still listening ───────────────────
pids=$(lsof -ti tcp:3000 2>/dev/null || true)
if [ -n "$pids" ]; then
    log "Freeing port 3000 (PIDs: $pids)"
    echo "$pids" | xargs kill -9 2>/dev/null || true
fi

ok "Done."
