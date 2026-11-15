#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# KryinCraftPanel - Playit.gg Tunnel Starter for Termux (ARM64)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

PLAYIT_BIN="$HOME/playit"

# Check if playit is already installed or download it
if ! command -v playit &>/dev/null && [ ! -f "$PLAYIT_BIN" ]; then
    echo "[+] Downloading official Playit.gg ARM64 binary..."
    curl -SsL "https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-aarch64" -o "$PLAYIT_BIN"
    chmod +x "$PLAYIT_BIN"
    echo "[✓] Download complete."
fi

EXEC_CMD="playit"
if [ -f "$PLAYIT_BIN" ]; then
    EXEC_CMD="$PLAYIT_BIN"
fi

# Prevent Android CPU sleep
termux-wake-lock 2>/dev/null || true

echo "=================================================="
echo " Starting Playit.gg Tunnel..."
echo " If this is your first run, copy the claim URL"
echo " to link it to your Playit.gg account."
echo "=================================================="

$EXEC_CMD
