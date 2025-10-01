#!/usr/bin/env bash
# Start the dev JSON server detached (Linux / macOS / WSL)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$SCRIPT_DIR/dev-json-server.cjs"
if [ ! -f "$SCRIPT" ]; then
  echo "dev-json-server script not found: $SCRIPT" >&2
  exit 1
fi

echo "Starting dev JSON server in background..."
nohup node "$SCRIPT" >/dev/null 2>&1 &
PID=$!
echo "Dev JSON server started (pid=$PID). Check http://localhost:4000/health"
