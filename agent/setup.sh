#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# KryinCraftPanel - 1-Click Termux Agent Installer & Starter
# ==============================================================================

set -e

echo "=== KryinHost Termux Agent Setup ==="

# 1. Acquire wake lock so Android doesn't throttle or sleep CPU
termux-wake-lock 2>/dev/null || true

# 2. Check for Java runtime
if ! command -v java &> /dev/null; then
    echo "[+] Installing Java (OpenJDK 21)..."
    pkg update -y && pkg install -y openjdk-21 curl
else
    echo "[✓] Java runtime detected: $(java -version 2>&1 | head -n 1)"
fi

# 3. Create dedicated agent directory in $HOME/kryin-agent
mkdir -p "$HOME/kryin-agent"
cd "$HOME/kryin-agent"

# 4. Download latest KryinAgent and scripts from GitHub
echo "[+] Downloading latest KryinAgent..."
curl -sSL "https://raw.githubusercontent.com/Kryin-Labs/KryinCraftPanel/main/agent/agent.py" -o agent.py
curl -sSL "https://raw.githubusercontent.com/Kryin-Labs/KryinCraftPanel/main/agent/KryinAgent.java" -o KryinAgent.java
curl -sSL "https://raw.githubusercontent.com/Kryin-Labs/KryinCraftPanel/main/agent/agent.example.json" -o agent.json
curl -sSL "https://raw.githubusercontent.com/Kryin-Labs/KryinCraftPanel/main/agent/start-agent.sh" -o start-agent.sh
curl -sSL "https://raw.githubusercontent.com/Kryin-Labs/KryinCraftPanel/main/agent/stop-agent.sh" -o stop-agent.sh
curl -sSL "https://raw.githubusercontent.com/Kryin-Labs/KryinCraftPanel/main/agent/status.sh" -o status.sh
chmod +x start-agent.sh stop-agent.sh status.sh agent.py

# 5. Start the agent in the background
echo "[+] Starting KryinAgent daemon..."
bash start-agent.sh

echo "=================================================="
echo " [✓] KryinHost Agent is LIVE and CONNECTED!"
echo " Check your web panel: https://kryincraftpanel.vercel.app/dashboard"
echo " View live logs: tail -f ~/kryin-agent/agent.log"
echo "=================================================="
