#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# KryinCraftPanel - Diagnostic Status Check
# ==============================================================================

echo "=== ROG Phone 5s Status Check ==="

# 1. Agent status
if [ -f ".agent.pid" ] && kill -0 "$(cat .agent.pid)" 2>/dev/null; then
    echo "• KryinAgent: RUNNING (PID: $(cat .agent.pid))"
else
    echo "• KryinAgent: STOPPED"
fi

# 2. Paper status
SERVER_DIR="$HOME/minecraft/server"
if [ -f "$SERVER_DIR/.server.pid" ] && kill -0 "$(cat "$SERVER_DIR/.server.pid")" 2>/dev/null; then
    echo "• Paper 26.3: RUNNING (PID: $(cat "$SERVER_DIR/.server.pid"))"
else
    echo "• Paper 26.3: STOPPED"
fi

# 3. System RAM
if [ -f "/proc/meminfo" ]; then
    TOTAL_RAM=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024)}')
    AVAIL_RAM=$(grep MemAvailable /proc/meminfo | awk '{print int($2/1024)}')
    echo "• Phone RAM: Available ${AVAIL_RAM}MB / Total ${TOTAL_RAM}MB"
fi

# 4. Local IP
IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -n 1)
echo "• Local Wi-Fi IP: ${IP:-Unknown}"
echo "=================================="
