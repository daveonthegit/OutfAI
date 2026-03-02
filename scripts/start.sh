#!/usr/bin/env bash
# OutfAI startup — Docker Compose dev environment.
# Usage: ./scripts/start.sh [--no-docker]
#   --no-docker   Skip Docker; run Next.js dev server directly in the background.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ANSI colours
CYN='\033[0;36m'; GRN='\033[0;32m'; YLW='\033[0;33m'; RED='\033[0;31m'; RST='\033[0m'
log()  { echo -e "${CYN}[start]${RST} $*"; }
ok()   { echo -e "${GRN}[start]${RST} $*"; }
warn() { echo -e "${YLW}[start]${RST} $*"; }
err()  { echo -e "${RED}[start] ERROR:${RST} $*"; }

NO_DOCKER=false
for arg in "$@"; do
    case "$arg" in --no-docker) NO_DOCKER=true ;; esac
done

# ---- Stop any running processes first ----
log "Stopping any existing processes..."
"$SCRIPT_DIR/stop.sh" || warn "Stop step had errors (continuing anyway)."
sleep 1
ok "Stopped (if any were running)."

# ---- Ensure .env.local exists ----
if [ ! -f "$ROOT_DIR/.env.local" ]; then
    if [ -f "$ROOT_DIR/.env.example" ]; then
        cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env.local"
        log "Created .env.local from .env.example"
        warn "Fill in your values in .env.local, then run this script again."
        exit 1
    else
        err ".env.local is missing and .env.example was not found."
        err "Create .env.local before starting."
        exit 1
    fi
fi

# ---- Install npm dependencies if missing ----
if [ ! -d "$ROOT_DIR/node_modules" ]; then
    log "node_modules not found — running npm install..."
    npm install --prefix "$ROOT_DIR"
    ok "npm install done"
fi

# ---- Docker check + auto-start ----
docker_running() {
    docker info &>/dev/null 2>&1
}

if [ "$NO_DOCKER" = false ]; then
    if ! docker_running; then
        if ! command -v docker &>/dev/null; then
            warn "Docker is not installed. Install it from https://www.docker.com/products/docker-desktop"
            warn "Or use --no-docker to run the Next.js dev server directly."
            NO_DOCKER=true
        else
            log "Docker is not running — attempting to start it..."
            # macOS
            if [[ "$(uname)" == "Darwin" ]]; then
                open -a "Docker" 2>/dev/null || true
            # Linux (systemd)
            elif command -v systemctl &>/dev/null; then
                sudo systemctl start docker 2>/dev/null || true
            fi

            max_wait=90; waited=0
            while ! docker_running && [ "$waited" -lt "$max_wait" ]; do
                sleep 3; waited=$((waited + 3))
                echo -e "  \033[0;37mWaiting for Docker... ${waited}s\033[0m"
            done

            if ! docker_running; then
                warn "Docker did not become ready in ${max_wait}s."
                warn "Start Docker manually and re-run, or use --no-docker to skip."
                NO_DOCKER=true
            else
                ok "Docker is ready"
            fi
        fi
    fi
fi

# ---- Readiness poll ----
wait_for_app() {
    local url=$1
    local max_wait=${2:-120}
    local waited=0
    while [ "$waited" -lt "$max_wait" ]; do
        if curl -sf --max-time 2 "$url" &>/dev/null; then
            return 0
        fi
        sleep 3
        waited=$((waited + 3))
        echo -e "  \033[0;37mWaiting for app... ${waited}s\033[0m"
    done
    return 1
}

open_browser() {
    local url=$1
    if command -v xdg-open &>/dev/null; then
        xdg-open "$url" &>/dev/null &
    elif command -v open &>/dev/null; then
        open "$url"
    fi
}

# ---- Start ----
cd "$ROOT_DIR"
if [ "$NO_DOCKER" = false ]; then
    log "Starting Docker Compose (dev)..."
    docker compose up --build -d
    ok "Containers started. Waiting for web app to be ready..."
    if wait_for_app "http://localhost:3000"; then
        ok "App is ready"
        open_browser "http://localhost:3000"
    else
        warn "App did not respond within 120s — check logs: docker compose logs -f web"
    fi
else
    warn "Skipping Docker (--no-docker). Starting Next.js dev server in the background..."
    npm run dev &
    log "Waiting for dev server to be ready..."
    if wait_for_app "http://localhost:3000"; then
        ok "App is ready"
        open_browser "http://localhost:3000"
    else
        warn "Dev server did not respond within 120s."
    fi
fi

echo ""
ok "Startup done."
echo -e "  Web app:  \033[0;37mhttp://localhost:3000\033[0m"
echo -e "  Postgres: \033[0;37mlocalhost:5433\033[0m"
echo ""
echo -e "  Tail logs : \033[0;37mdocker compose logs -f web\033[0m"
echo -e "  Type :q   to stop everything and quit"
echo ""

while true; do
    read -r cmd
    if [ "$cmd" = ":q" ]; then
        log "Stopping..."
        "$SCRIPT_DIR/stop.sh"
        break
    fi
done
