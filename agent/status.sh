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

# 2. Paper Minecraft status
SERVER_DIR="$HOME/minecraft/server"
if [ -f "$SERVER_DIR/.server.pid" ] && kill -0 "$(cat "$SERVER_DIR/.server.pid")" 2>/dev/null; then
    echo "• Paper 26.3: RUNNING (PID: $(cat "$SERVER_DIR/.server.pid"))"
else
    echo "• Paper 26.3: STOPPED"
fi

# 3. System RAM from /proc/meminfo
if [ -f "/proc/meminfo" ]; then
    TOTAL_RAM=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024)}')
    AVAIL_RAM=$(grep MemAvailable /proc/meminfo | awk '{print int($2/1024)}')
    echo "• Phone RAM: Available ${AVAIL_RAM}MB / Total ${TOTAL_RAM}MB"
fi

# 4. Local Wi-Fi IP (Android 13 compatible - avoiding netlink restriction)
WIFI_IP=$(getprop dhcp.wlan0.ipaddress 2>/dev/null)
if [ -z "$WIFI_IP" ]; then
    WIFI_IP=$(ifconfig wlan0 2>/dev/null | grep 'inet ' | awk '{print $2}' | sed 's/addr://')
fi
echo "• Local Wi-Fi IP: ${WIFI_IP:-192.168.0.164 (LAN)}"
echo "=================================="
