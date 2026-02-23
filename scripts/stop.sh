#!/usr/bin/env bash
# OutfAI — stop Docker services and free all dev ports.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ANSI colours
CYN='\033[0;36m'; GRN='\033[0;32m'; RST='\033[0m'
log()  { echo -e "${CYN}[stop]${RST} $*"; }
ok()   { echo -e "${GRN}[stop]${RST} $*"; }

stop_port() {
    local port=$1
    local pids
    pids=$(lsof -ti tcp:"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        log "Stopping process on port $port (PIDs: $pids)"
        echo "$pids" | xargs kill -9 2>/dev/null || true
    fi
}

log "Stopping Docker Compose services..."
if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    docker compose -f "$ROOT_DIR/docker-compose.yml" down 2>/dev/null || true
else
    log "Docker not running — skipping Docker Compose teardown."
fi

log "Freeing project ports (3000, 54321-54324)..."
for port in 3000 54321 54322 54323 54324; do
    stop_port "$port"
done

# Stop Supabase local stack if running
if command -v supabase &>/dev/null; then
    if supabase status &>/dev/null 2>&1; then
        log "Stopping Supabase local stack..."
        supabase stop || true
    fi
fi

ok "Done."
