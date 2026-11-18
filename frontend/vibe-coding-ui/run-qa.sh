#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/../.." && pwd)"
cd "$DIR"

PORT=3001
API_PORT=8000

echo "[QA Runner] Starting FastAPI backend on port $API_PORT..."
"$ROOT_DIR/venv/bin/uvicorn" api.main:app --app-dir "$ROOT_DIR" --port $API_PORT > /tmp/fastapi_qa.log 2>&1 &
API_PID=$!

echo "[QA Runner] Starting Next.js production server on port $PORT..."
npx next start -p $PORT > /tmp/next_qa_3001.log 2>&1 &
SERVER_PID=$!

cleanup() {
  echo "[QA Runner] Stopping servers..."
  kill "$SERVER_PID" 2>/dev/null || true
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT

# Wait for both servers to be ready
echo "[QA Runner] Waiting for backend and frontend servers..."
for i in {1..20}; do
  if python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:$API_PORT/health', timeout=1)" 2>/dev/null && \
     python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:$PORT', timeout=1)" 2>/dev/null; then
    echo "[QA Runner] Both servers are healthy and listening!"
    break
  fi
  sleep 0.5
done

echo "[QA Runner] Running Playwright visual verification..."
PORT=$PORT node verify-ui.js
