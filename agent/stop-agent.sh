#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# KryinCraftPanel - Agent Stop Script
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

if [ -f ".agent.pid" ]; then
    PID=$(cat .agent.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "[KryinAgent] Stopping agent PID $PID..."
        kill "$PID"
        rm -f .agent.pid
        echo "[KryinAgent] Agent stopped."
        exit 0
    fi
    rm -f .agent.pid
fi

echo "[KryinAgent] No active agent process found."
