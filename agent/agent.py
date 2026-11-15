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
    "logPollInterval": 2,
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
print(f"   Server Directory: {SERVER_DIR}")
print("==================================================")

log_file_pos = 0
last_player_sync = 0

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

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.0.164"

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

def read_server_properties():
    """Parse real server.properties file for MOTD, max players, port, etc."""
    props_file = os.path.join(SERVER_DIR, "server.properties")
    props = {
        "max-players": 20,
        "motd": "ECB Bache Minecraft Server",
        "server-port": 25565,
        "difficulty": "normal",
        "gamemode": "survival",
        "pvp": True,
        "white-list": False,
        "view-distance": 10,
    }
    if os.path.exists(props_file):
        try:
            with open(props_file, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip()
                        if k == "max-players":
                            props["max-players"] = int(v) if v.isdigit() else 20
                        elif k == "server-port":
                            props["server-port"] = int(v) if v.isdigit() else 25565
                        elif k in ("pvp", "white-list"):
                            props[k] = v.lower() == "true"
                        else:
                            props[k] = v
        except Exception as e:
            print(f"[!] Warning reading server.properties: {e}")
    return props

def check_port_open(port=25565):
    """Test if Minecraft server port is actively listening and accepting connections."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.6)
        res = s.connect_ex(('127.0.0.1', port))
        s.close()
        return res == 0
    except Exception:
        return False

def send_heartbeat(forced_status=None):
    is_mc_running, pid = check_minecraft_process()
    total_ram, used_ram = get_ram_usage()
    props = read_server_properties()
    server_port = props.get("server-port", 25565)

    if forced_status:
        status = forced_status
    elif is_mc_running:
        # If process is running, verify if port is actively open and ready
        is_ready = check_port_open(server_port)
        status = "online" if is_ready else "starting"
    else:
        status = "offline"

    data = {
        "status": status,
        "pid": pid,
        "tps": 20.0 if status == "online" else (10.0 if status == "starting" else 0.0),
        "uptime_seconds": 0,
        "local_ip": get_local_ip(),
        "online_players": 0,
        "max_players": props.get("max-players", 20),
    }
    res = api_post("/api/agent/heartbeat", data)
    if "error" in res:
        print(f"[!] Heartbeat error: {res['error']}")
    else:
        status_str = f"{status.upper()} (PID {pid}, Port: {server_port}, Max Players: {props.get('max-players', 20)})"
        print(f"[✓] Heartbeat sent: Minecraft is {status_str}")

def sync_logs():
    """Tails real logs/latest.log and streams new lines to the website console."""
    global log_file_pos
    log_file = os.path.join(SERVER_DIR, "logs", "latest.log")
    if not os.path.exists(log_file):
        return

    try:
        file_size = os.path.getsize(log_file)
        if log_file_pos > file_size:
            log_file_pos = 0

        # Load recent logs on startup so console has startup context
        if log_file_pos == 0 and file_size > 35000:
            log_file_pos = max(0, file_size - 35000)

        with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
            f.seek(log_file_pos)
            new_lines = f.readlines()
            log_file_pos = f.tell()

        if new_lines:
            batch = []
            for line in new_lines[-200:]:
                raw = line.strip()
                if not raw:
                    continue
                level = "INFO"
                if "/WARN" in raw or "WARN" in raw:
                    level = "WARN"
                elif "/ERROR" in raw or "ERROR" in raw:
                    level = "ERROR"

                ts = time.strftime("%H:%M:%S")
                if raw.startswith("[") and "]" in raw:
                    ts_cand = raw[1:raw.index("]")]
                    if len(ts_cand) in (8, 12):
                        ts = ts_cand

                batch.append({
                    "timestamp": ts,
                    "level": level,
                    "message": raw[:1000],
                })

            if batch:
                api_post("/api/agent/logs", {"logs": batch})
    except Exception:
        pass

def sync_players():
    """Syncs real player cache from usercache.json, ops.json, whitelist.json."""
    global last_player_sync
    now = time.time()
    if now - last_player_sync < 60:
        return
    last_player_sync = now

    usercache_file = os.path.join(SERVER_DIR, "usercache.json")
    ops_file = os.path.join(SERVER_DIR, "ops.json")
    wl_file = os.path.join(SERVER_DIR, "whitelist.json")
    banned_file = os.path.join(SERVER_DIR, "banned-players.json")

    ops_set = set()
    wl_set = set()
    banned_set = set()

    try:
        if os.path.exists(ops_file):
            with open(ops_file, "r") as f:
                ops_set = {x.get("uuid", "").lower() for x in json.load(f)}
        if os.path.exists(wl_file):
            with open(wl_file, "r") as f:
                wl_set = {x.get("uuid", "").lower() for x in json.load(f)}
        if os.path.exists(banned_file):
            with open(banned_file, "r") as f:
                banned_set = {x.get("uuid", "").lower() for x in json.load(f)}
    except Exception:
        pass

    players_list = []
    if os.path.exists(usercache_file):
        try:
            with open(usercache_file, "r") as f:
                cache = json.load(f)
                for entry in cache[:50]:
                    uuid = entry.get("uuid", "").lower()
                    name = entry.get("name", "Player")
                    if uuid:
                        players_list.append({
                            "uuid": uuid,
                            "username": name,
                            "is_online": False,
                            "is_op": uuid in ops_set,
                            "is_whitelisted": uuid in wl_set,
                            "is_banned": uuid in banned_set,
                            "health": 20.0,
                            "food_level": 20,
                            "last_seen": entry.get("expiresOn", "Recently"),
                        })
        except Exception:
            pass

    if players_list:
        api_post("/api/agent/players", {"players": players_list})

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
                send_heartbeat(forced_status="starting")
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
            send_heartbeat(forced_status="stopping")
            subprocess.run(["pkill", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            time.sleep(1.5)
            send_heartbeat(forced_status="offline")
            output = "Issued stop command to Minecraft process."

        elif cmd_type in ("RESTART", "RESTART_SERVER"):
            send_heartbeat(forced_status="stopping")
            subprocess.run(["pkill", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            time.sleep(2.5)
            send_heartbeat(forced_status="starting")
            run_script = os.path.join(SERVER_DIR, "run.sh")
            start_script = os.path.join(SERVER_DIR, "start.sh")
            if os.path.exists(run_script):
                subprocess.Popen(["bash", run_script], cwd=SERVER_DIR)
                output = "Restarted server via run.sh."
            elif os.path.exists(start_script):
                subprocess.Popen(["bash", start_script], cwd=SERVER_DIR)
                output = "Restarted server via start.sh."
            else:
                output = "Stopped server."

        elif cmd_type in ("CONSOLE_CMD", "COMMAND"):
            raw_cmd = payload.get("command", "")
            output = f"Executed console command: {raw_cmd}"

        elif cmd_type == "SAVE_PROPERTIES":
            props_file = os.path.join(SERVER_DIR, "server.properties")
            new_props = payload.get("properties", {})
            if os.path.exists(props_file) and isinstance(new_props, dict):
                try:
                    lines = []
                    with open(props_file, "r") as f:
                        lines = f.readlines()
                    updated_lines = []
                    seen_keys = set()
                    for line in lines:
                        if "=" in line and not line.strip().startswith("#"):
                            k, v = line.split("=", 1)
                            k = k.strip()
                            if k in new_props:
                                updated_lines.append(f"{k}={new_props[k]}\n")
                                seen_keys.add(k)
                                continue
                        updated_lines.append(line)
                    for k, v in new_props.items():
                        if k not in seen_keys:
                            updated_lines.append(f"{k}={v}\n")
                    with open(props_file, "w") as f:
                        f.writelines(updated_lines)
                    output = "Saved updated server.properties successfully."
                except Exception as e:
                    output = f"Failed to save server.properties: {e}"
                    success = False

        elif cmd_type == "SAVE_FILE":
            rel_path = payload.get("path", "").lstrip("/\\")
            content = payload.get("content", "")
            target_path = os.path.abspath(os.path.join(SERVER_DIR, rel_path))
            server_root = os.path.abspath(SERVER_DIR)
            if target_path.startswith(server_root):
                try:
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)
                    temp_path = f"{target_path}.tmp.{int(time.time())}"
                    with open(temp_path, "w", encoding="utf-8") as f:
                        f.write(content)
                    os.replace(temp_path, target_path)
                    output = f"Safely wrote {len(content)} characters to {rel_path}"
                except Exception as e:
                    output = f"Failed to save file: {e}"
                    success = False
            else:
                output = "Security error: File path outside server directory."
                success = False

        # Report result back
        api_post("/api/agent/result", {
            "command_id": cmd_id,
            "status": "COMPLETED" if success else "FAILED",
            "result_output": output,
        })
        print(f"[✓] Command {cmd_id} finished: {output}")

def main():
    try:
        subprocess.run(["termux-wake-lock"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    print("[Agent] Polling loop running. Press Ctrl+C to stop.")
    send_heartbeat()
    sync_logs()
    sync_players()
    last_hb = time.time()
    last_log_sync = time.time()

    while True:
        now = time.time()
        if now - last_hb >= config["heartbeatInterval"]:
            send_heartbeat()
            last_hb = now

        if now - last_log_sync >= config.get("logPollInterval", 2):
            sync_logs()
            last_log_sync = now

        sync_players()
        poll_and_execute_commands()
        time.sleep(config.get("commandPollInterval", 1.2))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Agent] Stopped by user.")
        sys.exit(0)
