#!/usr/bin/env bash
# OutfAI — stop local Convex dev watcher and Next.js (no Docker).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_FILE="$ROOT_DIR/.dev-pids"

CYN='\033[0;36m'; GRN='\033[0;32m'; RST='\033[0m'
log() { echo -e "${CYN}[stop-no-docker]${RST} $*"; }
ok()  { echo -e "${GRN}[stop-no-docker]${RST} $*"; }

# ── Kill tracked background PIDs (Convex + Next.js) ────────────────────────────
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

# ── Fallback: free port 3000 (Next.js) ────────────────────────────────────────
pids=$(lsof -ti tcp:3000 2>/dev/null || true)
if [ -n "$pids" ]; then
    log "Freeing port 3000 (PIDs: $pids)"
    echo "$pids" | xargs kill -9 2>/dev/null || true
fi

ok "Done."
