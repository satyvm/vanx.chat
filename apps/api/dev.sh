#!/bin/bash

# Script to start development environment with tmux (2x2 grid layout)
# Usage: ./dev.sh

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo "❌ tmux is not installed. Please install it first:"
    echo "   brew install tmux  # on macOS"
    echo "   apt install tmux  # on Ubuntu/Debian"
    exit 1
fi

# Check if we're in the API directory
if [ ! -f "package.json" ] || [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Please run this script from the apps/api directory"
    exit 1
fi

# Kill any existing tmux session with the same name
tmux kill-session -t vanx-dev 2>/dev/null || true

# Create new tmux session
tmux new-session -d -s vanx-dev -n "dev"
tmux set-option -t vanx-dev -g default-terminal "screen-256color"

# Split horizontally first (left and right panes on top)
tmux split-window -h -t vanx-dev:0

# Split top-left pane vertically
tmux split-window -v -t vanx-dev:0.0

# Split top-right pane vertically
tmux split-window -v -t vanx-dev:0.1

# Configure pane 0 (top-left) - API development
tmux send-keys -t vanx-dev:0.0 'echo "🚀 Starting NestJS development server..."' C-m
tmux send-keys -t vanx-dev:0.0 'pnpm dev' C-m

# Configure pane 1 (top-right) - Prisma Studio
tmux send-keys -t vanx-dev:0.1 'echo "🗄️  Starting Prisma Studio..."' C-m
tmux send-keys -t vanx-dev:0.1 'pnpm prisma studio' C-m

# Configure pane 2 (bottom-left) - Docker Compose
tmux send-keys -t vanx-dev:0.2 'echo "🔗 Starting Docker Compose..."' C-m
tmux send-keys -t vanx-dev:0.2 'TERM=xterm-256color && cd ../..' C-m
tmux send-keys -t vanx-dev:0.2 'docker-compose up' C-m

# Configure pane 3 (bottom-right) - Logs/Debug
tmux send-keys -t vanx-dev:0.3 'cat << "EOF"
📝 Keyboard Shortcuts:
   - Ctrl+b h/j/k/l: Move between panes (vim keys)
   - Ctrl+b Space: Cycle through layouts
   - Ctrl+b z: Zoom current pane
   - Ctrl+b d: Detach from session
   - Ctrl+b x: Kill current pane
   - tmux attach -t vanx-dev: Reattach to session
EOF' C-m

# Set pane titles
tmux select-pane -t vanx-dev:0.0 -T "API Dev Server"
tmux select-pane -t vanx-dev:0.1 -T "Prisma Studio"
tmux select-pane -t vanx-dev:0.2 -T "Docker Compose"
tmux select-pane -t vanx-dev:0.3 -T "Logs/Debug"

# Balance panes equally
tmux select-layout -t vanx-dev:0 tiled
tmux attach -t vanx-dev