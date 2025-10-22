#!/bin/bash

# Script to start development environment with tmux
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

# Create new tmux session with two panes
tmux new-session -d -s vanx-dev -n "dev"

# Split the window horizontally
tmux split-window -h -t vanx-dev:0

# Configure pane 0 (left) - API development
tmux send-keys -t vanx-dev:0.0 "echo '🚀 Starting NestJS development server...'" Enter
tmux send-keys -t vanx-dev:0.0 "pnpm dev" Enter

# Configure pane 1 (right) - Prisma Studio
tmux send-keys -t vanx-dev:0.1 "echo '🗄️  Starting Prisma Studio...'" Enter
tmux send-keys -t vanx-dev:0.1 "pnpm prisma studio" Enter

# Set pane titles
tmux select-pane -t vanx-dev:0.0 -T "API Dev Server"
tmux select-pane -t vanx-dev:0.1 -T "Prisma Studio"

# Attach to the session
echo "🎉 Development environment started!"
echo "📝 Commands:"
echo "   - Ctrl+b d: Detach from session"
echo "   - Ctrl+b x: Kill current pane"
echo "   - Ctrl+b c: Create new window"
echo "   - tmux attach -t vanx-dev: Reattach to session"
echo ""
echo "🔗 Prisma Studio will be available at: http://localhost:5555"
echo "🔗 API will be available at: http://localhost:3000"
echo ""

tmux attach -t vanx-dev