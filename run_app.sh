#!/usr/bin/env bash
set -e

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend/vibe-coding-ui"

echo "=========================================================="
echo "  🚀 Starting DropOrCop Sneaker Resale Arbitrage Engine   "
echo "=========================================================="

# Free up ports 8000 and 3000 if occupied by previous runs
echo "🔍 Checking ports 8000 and 3000..."
fuser -k 8000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  fuser -k 8000/tcp 2>/dev/null || true
  fuser -k 3000/tcp 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI backend (port 8000)
echo "📦 [1/2] Starting FastAPI backend on http://127.0.0.1:8000..."
cd "$PROJECT_ROOT"
"$PROJECT_ROOT/venv/bin/uvicorn" api.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

# Wait briefly for backend startup (loading ML model)
sleep 2.5

# 2. Start Next.js frontend (port 3000)
echo "💻 [2/2] Starting Next.js UI on http://localhost:3000..."
cd "$FRONTEND_DIR"
npm run dev -- -p 3000 &
FRONTEND_PID=$!

sleep 1.5

echo ""
echo "✨ DropOrCop is live and running!"
echo "   👉 Web Interface:  http://localhost:3000"
echo "   👉 FastAPI Docs:   http://localhost:8000/docs"
echo "   👉 Health Status:  http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop both servers."

wait "$BACKEND_PID" "$FRONTEND_PID"
