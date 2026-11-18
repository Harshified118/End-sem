#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT=3001
echo "[Capture] Starting Next.js server on port $PORT..."
npx next start -p $PORT > /tmp/next_cap.log 2>&1 &
SERVER_PID=$!

cleanup() {
  echo "[Capture] Stopping server..."
  kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "[Capture] Waiting for server..."
for i in {1..20}; do
  if python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:$PORT', timeout=1)" 2>/dev/null; then
    break
  fi
  sleep 0.5
done

echo "[Capture] Running capture-points.js..."
PORT=$PORT node capture-points.js
echo "[Capture] Done successfully!"
