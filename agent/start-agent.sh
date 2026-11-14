#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# KryinCraftPanel - Agent Launcher for Termux (ASUS ROG Phone 5s)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Check if agent is already running
if [ -f ".agent.pid" ]; then
    PID=$(cat .agent.pid)
    if kill -0 "$PID" 2>/dev/null; then
        echo "[KryinAgent] Agent is already running with PID $PID"
        exit 0
    fi
fi

# Acquire Termux wake lock to prevent CPU sleep
termux-wake-lock 2>/dev/null

echo "[KryinAgent] Launching KryinAgent via OpenJDK 25..."
nohup java KryinAgent.java > agent.log 2>&1 &
AGENT_PID=$!

echo "$AGENT_PID" > .agent.pid
echo "[KryinAgent] Started successfully with PID $AGENT_PID"
echo "[KryinAgent] Live logs: tail -f $SCRIPT_DIR/agent.log"
