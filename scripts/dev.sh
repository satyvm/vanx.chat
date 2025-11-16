#!/usr/bin/env bash

set -euo pipefail

SESSION_NAME="vanx-dev"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
API_DIR="${REPO_ROOT}/apps/api"
WEB_DIR="${REPO_ROOT}/apps/web"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.yml"

echo "▶️  Bootstrapping tmux session '${SESSION_NAME}'..."

if ! command -v tmux >/dev/null 2>&1; then
    cat <<'EOF'
❌ tmux is not installed.
   macOS: brew install tmux
   Ubuntu/Debian: sudo apt install tmux
EOF
    exit 1
fi

for dir in "${API_DIR}" "${WEB_DIR}"; do
    if [[ ! -d "${dir}" ]] || [[ ! -f "${dir}/package.json" ]]; then
        echo "❌ Could not find expected workspace at ${dir}"
        exit 1
    fi
done

ensure_services() {
    if ! command -v docker >/dev/null 2>&1; then
        echo "❌ docker is not installed."
        exit 1
    fi

    if ! docker compose version >/dev/null 2>&1; then
        echo "❌ docker compose is unavailable. Please upgrade Docker Desktop."
        exit 1
    fi

    if [[ ! -f "${COMPOSE_FILE}" ]]; then
        echo "❌ Missing docker-compose.yml at ${COMPOSE_FILE}"
        exit 1
    fi

    if [[ -z "$(docker compose -f "${COMPOSE_FILE}" ps -q postgres 2>/dev/null)" ]]; then
        echo "🐘 Starting postgres via docker compose..."
        docker compose -f "${COMPOSE_FILE}" up -d postgres
    else
        echo "✅ postgres container already running."
    fi

    if [[ -z "$(docker compose -f "${COMPOSE_FILE}" ps -q redis 2>/dev/null)" ]]; then
        echo "🧊 Starting redis via docker compose..."
        docker compose -f "${COMPOSE_FILE}" up -d redis
    else
        echo "✅ redis container already running."
    fi
}

ensure_services

if tmux has-session -t "${SESSION_NAME}" 2>/dev/null; then
    echo "ℹ️  Found existing ${SESSION_NAME} session - replacing it."
    tmux kill-session -t "${SESSION_NAME}"
fi

tmux new-session -d -s "${SESSION_NAME}" -n "dev" -c "${API_DIR}"
tmux set-option -t "${SESSION_NAME}" default-terminal "screen-256color"

tmux send-keys -t "${SESSION_NAME}:0.0" 'printf "\n🚀 Starting API dev server...\n"' C-m
tmux send-keys -t "${SESSION_NAME}:0.0" 'pnpm dev' C-m
tmux select-pane -t "${SESSION_NAME}:0.0" -T "api | pnpm dev"

tmux split-window -h -t "${SESSION_NAME}:0" -c "${WEB_DIR}"
tmux send-keys -t "${SESSION_NAME}:0.1" 'printf "\n🌐 Starting web dev server...\n"' C-m
tmux send-keys -t "${SESSION_NAME}:0.1" 'pnpm dev' C-m
tmux select-pane -t "${SESSION_NAME}:0.1" -T "web | pnpm dev"

tmux split-window -v -t "${SESSION_NAME}:0.1" -c "${REPO_ROOT}"
tmux send-keys -t "${SESSION_NAME}:0.2" 'cat << "EOF"
📝 Shortcuts
   Ctrl+b d : detach session
   Ctrl+b z : zoom current pane
   Ctrl+b x : kill pane
   Ctrl+b % : vertical split
   tmux attach -t '${SESSION_NAME}' : reattach
   tmux kill-session -t '${SESSION_NAME}' : stop session
EOF' C-m
tmux select-pane -t "${SESSION_NAME}:0.2" -T "notes"

tmux select-layout -t "${SESSION_NAME}:0" tiled
tmux attach -t "${SESSION_NAME}"
