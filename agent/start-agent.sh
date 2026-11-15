#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# KryinCraftPanel - Agent Launcher for Termux
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

# Acquire Termux wake lock to prevent Android CPU sleep
termux-wake-lock 2>/dev/null

# If agent.json does not exist, copy from agent.example.json
if [ ! -f "agent.json" ] && [ -f "agent.example.json" ]; then
    cp agent.example.json agent.json
fi

if [ -f "agent.py" ] && command -v python3 &>/dev/null; then
    echo "[KryinAgent] Launching Python Agent (agent.py)..."
    nohup python3 agent.py > agent.log 2>&1 &
    AGENT_PID=$!
elif [ -f "KryinAgent.java" ] && command -v java &>/dev/null; then
    echo "[KryinAgent] Launching KryinAgent via OpenJDK..."
    nohup java KryinAgent.java > agent.log 2>&1 &
    AGENT_PID=$!
else
    echo "[!] Neither python3 nor java detected to run agent."
    exit 1
fi

echo "$AGENT_PID" > .agent.pid
echo "[KryinAgent] Started successfully with PID $AGENT_PID"
echo "[KryinAgent] Live logs: tail -f $SCRIPT_DIR/agent.log"
