#!/bin/bash
# Double-click this to view the site. Close the window (or press Ctrl-C) to stop.
cd "$(dirname "$0")/.." || exit 1

PORT=8000
while lsof -i ":$PORT" >/dev/null 2>&1; do PORT=$((PORT+1)); done

echo ""
echo "  Memory Mug Company"
echo "  ------------------"
echo "  Opening http://localhost:$PORT"
echo "  Admin:  http://localhost:$PORT/#admin"
echo ""
echo "  Leave this window open while you browse."
echo "  Press Ctrl-C here when you're done."
echo ""

( sleep 1; open "http://localhost:$PORT" ) &
python3 -m http.server "$PORT"
