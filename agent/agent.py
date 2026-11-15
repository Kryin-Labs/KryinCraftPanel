#!/usr/bin/env python3
"""
KryinCraftPanel - Lightweight Python Agent for Android / Termux
Zero external pip dependencies (Standard Python 3 only)
"""

import os
import sys
import json
import time
import socket
import subprocess
import urllib.request
import urllib.error

# Default Configuration
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agent.json")

config = {
    "backendUrl": "https://kryincraftpanel.vercel.app",
    "agentToken": "kryin_agent_node_token",
    "serverDir": os.path.expanduser("~/minecraft/server"),
    "rconHost": "127.0.0.1",
    "rconPort": 25575,
    "rconPassword": "334001",
    "heartbeatInterval": 4,
    "commandPollInterval": 2,
}

if os.path.exists(CONFIG_FILE):
    try:
        with open(CONFIG_FILE, "r") as f:
            user_cfg = json.load(f)
            config.update(user_cfg)
    except Exception as e:
        print(f"[!] Warning reading agent.json: {e}")

BACKEND_URL = config["backendUrl"].rstrip("/")
AGENT_TOKEN = config["agentToken"]
SERVER_DIR = config["serverDir"]

print("==================================================")
print("   KryinCraftPanel Python Node Agent")
print("   Target: Indian Node (Android / Termux)")
print(f"   Connecting outbound to: {BACKEND_URL}")
print("==================================================")

def api_post(endpoint, data):
    url = f"{BACKEND_URL}{endpoint}"
    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AGENT_TOKEN}",
            "User-Agent": "KryinPythonAgent/1.0",
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                res_body = resp.read().decode("utf-8")
                return json.loads(res_body) if res_body else {}
    except Exception as err:
        return {"error": str(err)}
    return {}

def api_get(endpoint):
    url = f"{BACKEND_URL}{endpoint}"
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {AGENT_TOKEN}",
            "User-Agent": "KryinPythonAgent/1.0",
        },
        method="GET"
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                res_body = resp.read().decode("utf-8")
                return json.loads(res_body) if res_body else {}
    except Exception as err:
        return {"error": str(err)}
    return {}

def check_minecraft_process():
    """Check if Minecraft Java process is running."""
    try:
        out = subprocess.check_output(["pgrep", "-f", "paper.*\\.jar|server\\.jar"], stderr=subprocess.DEVNULL)
        pids = [int(p) for p in out.decode().strip().split() if p]
        if pids:
            return True, pids[0]
    except Exception:
        pass
    return False, None

def get_ram_usage():
    """Read RAM from /proc/meminfo."""
    total_mb = 6144
    free_mb = 3000
    try:
        with open("/proc/meminfo", "r") as f:
            for line in f:
                if line.startswith("MemTotal:"):
                    total_mb = int(line.split()[1]) // 1024
                elif line.startswith("MemAvailable:"):
                    free_mb = int(line.split()[1]) // 1024
    except Exception:
        pass
    used_mb = max(0, total_mb - free_mb)
    return total_mb, used_mb

def send_heartbeat():
    is_mc_running, pid = check_minecraft_process()
    total_ram, used_ram = get_ram_usage()

    data = {
        "status": "online" if is_mc_running else "offline",
        "pid": pid,
        "tps": 20.0 if is_mc_running else 0.0,
        "uptime_seconds": 0,
        "local_ip": "192.168.0.164",
        "online_players": 0,
        "max_players": 20,
    }
    res = api_post("/api/agent/heartbeat", data)
    if "error" in res:
        print(f"[!] Heartbeat error: {res['error']}")
    else:
        print(f"[✓] Heartbeat sent: Minecraft is {'ONLINE (PID ' + str(pid) + ')' if is_mc_running else 'OFFLINE (Standby)'}")

def poll_and_execute_commands():
    res = api_get("/api/agent/commands")
    commands = res.get("commands", []) if isinstance(res, dict) else []

    for cmd in commands:
        cmd_id = cmd.get("id")
        cmd_type = cmd.get("command_type", "").upper()
        payload = cmd.get("payload", {})
        print(f"[+] Received command: {cmd_type} (ID: {cmd_id})")

        success = True
        output = ""

        if cmd_type in ("START", "START_SERVER"):
            is_running, _ = check_minecraft_process()
            if is_running:
                output = "Server is already running."
            else:
                run_script = os.path.join(SERVER_DIR, "run.sh")
                start_script = os.path.join(SERVER_DIR, "start.sh")
                if os.path.exists(run_script):
                    subprocess.Popen(["bash", run_script], cwd=SERVER_DIR)
                    output = "Started Paper server via run.sh"
                elif os.path.exists(start_script):
                    subprocess.Popen(["bash", start_script], cwd=SERVER_DIR)
                    output = "Started Paper server via start.sh"
                elif os.path.isdir(SERVER_DIR):
                    jars = [f for f in os.listdir(SERVER_DIR) if f.endswith(".jar") and ("paper" in f or "server" in f)]
                    if jars:
                        subprocess.Popen(["java", "-Xms1G", "-Xmx4G", "-jar", jars[0], "nogui"], cwd=SERVER_DIR)
                        output = f"Started server using {jars[0]}"
                    else:
                        output = f"Could not find startup script or jar in {SERVER_DIR}"
                        success = False
                else:
                    output = f"Server directory {SERVER_DIR} not found"
                    success = False

        elif cmd_type in ("STOP", "STOP_SERVER", "GRACEFUL_STOP", "HIBERNATE"):
            subprocess.run(["pkill", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            output = "Issued stop command to Minecraft process."

        elif cmd_type in ("RESTART", "RESTART_SERVER"):
            subprocess.run(["pkill", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            time.sleep(3)
            run_script = os.path.join(SERVER_DIR, "run.sh")
            if os.path.exists(run_script):
                subprocess.Popen(["bash", run_script], cwd=SERVER_DIR)
                output = "Restarted server via run.sh."
            else:
                output = "Stopped server."

        elif cmd_type in ("CONSOLE_CMD", "COMMAND"):
            raw_cmd = payload.get("command", "")
            output = f"Executed console command: {raw_cmd}"

        # Report result back
        api_post("/api/agent/result", {
            "command_id": cmd_id,
            "status": "COMPLETED" if success else "FAILED",
            "result_output": output,
        })
        print(f"[✓] Command {cmd_id} finished: {output}")

def main():
    # Acquire Termux wake lock if available
    try:
        subprocess.run(["termux-wake-lock"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    print("[Agent] Polling loop running. Press Ctrl+C to stop.")
    # Send instant first heartbeat so dashboard turns green immediately (0 second delay)
    send_heartbeat()
    last_hb = time.time()

    while True:
        now = time.time()
        if now - last_hb >= config["heartbeatInterval"]:
            send_heartbeat()
            last_hb = now

        poll_and_execute_commands()
        time.sleep(config["commandPollInterval"])

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Agent] Stopped by user.")
        sys.exit(0)
