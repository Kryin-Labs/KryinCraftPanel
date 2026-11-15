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
import struct
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
    "heartbeatInterval": 3,
    "commandPollInterval": 0.5,
    "logPollInterval": 0.8,
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

def ensure_rcon_configured():
    """Ensures enable-rcon=true and correct password/port are set in server.properties."""
    props_file = os.path.join(SERVER_DIR, "server.properties")
    if not os.path.exists(props_file):
        return

    rcon_pwd = config.get("rconPassword", "334001")
    rcon_port = str(config.get("rconPort", 25575))

    required_settings = {
        "enable-rcon": "true",
        "rcon.port": rcon_port,
        "rcon.password": rcon_pwd,
        "broadcast-rcon-to-ops": "true"
    }

    try:
        lines = []
        with open(props_file, "r", encoding="utf-8", errors="ignore") as f:
            lines = f.readlines()

        modified = False
        seen_keys = set()
        new_lines = []

        for line in lines:
            trimmed = line.strip()
            if trimmed and not trimmed.startswith("#") and "=" in trimmed:
                k, v = trimmed.split("=", 1)
                k = k.strip()
                v = v.strip()
                seen_keys.add(k)
                if k in required_settings:
                    if v != required_settings[k]:
                        new_lines.append(f"{k}={required_settings[k]}\n")
                        modified = True
                    else:
                        new_lines.append(line)
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)

        for k, v in required_settings.items():
            if k not in seen_keys:
                new_lines.append(f"{k}={v}\n")
                modified = True

        if modified:
            with open(props_file, "w", encoding="utf-8") as f:
                f.writelines(new_lines)
            print(f"[✓] Auto-configured RCON in {props_file} (port {rcon_port})")
    except Exception as e:
        print(f"[!] Warning updating RCON settings in server.properties: {e}")

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

def send_rcon_command(command):
    """Executes a command directly in the Minecraft server via RCON."""
    host = config.get("rconHost", "127.0.0.1")
    port = int(config.get("rconPort", 25575))
    password = config.get("rconPassword", "334001")
    if not password:
        return False, "No RCON password configured"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1.5)
        s.connect((host, port))

        # Auth packet (type 3)
        pwd_bytes = password.encode('utf-8')
        packet = struct.pack('<iii', 4 + 4 + len(pwd_bytes) + 2, 1, 3) + pwd_bytes + b'\x00\x00'
        s.sendall(packet)
        auth_resp = s.recv(1024)
        if len(auth_resp) < 12:
            s.close()
            return False, "RCON auth packet incomplete"
        auth_id = struct.unpack('<i', auth_resp[4:8])[0]
        if auth_id == -1:
            s.close()
            return False, "RCON authentication failed"

        # Exec packet (type 2)
        cmd_bytes = command.encode('utf-8')
        packet = struct.pack('<iii', 4 + 4 + len(cmd_bytes) + 2, 2, 2) + cmd_bytes + b'\x00\x00'
        s.sendall(packet)
        exec_resp = s.recv(4096)
        s.close()
        out = exec_resp[12:-2].decode('utf-8', errors='replace').strip()
        return True, out
    except Exception as e:
        return False, str(e)

current_status = "offline"
transition_start_time = 0
online_players_cache = []

def determine_status():
    global current_status, transition_start_time
    is_mc_running, pid = check_minecraft_process()
    props = read_server_properties()
    server_port = props.get("server-port", 25565)
    now = time.time()

    if current_status == "starting":
        if is_mc_running and check_port_open(server_port):
            current_status = "online"
            transition_start_time = 0
        elif not is_mc_running and transition_start_time > 0 and (now - transition_start_time > 120):
            current_status = "offline"
            transition_start_time = 0
    elif current_status == "stopping":
        if not is_mc_running:
            current_status = "offline"
            transition_start_time = 0
        elif transition_start_time > 0 and (now - transition_start_time > 30):
            subprocess.run(["pkill", "-9", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            current_status = "offline"
            transition_start_time = 0
    else:
        if is_mc_running:
            is_ready = check_port_open(server_port)
            current_status = "online" if is_ready else "starting"
        else:
            current_status = "offline"

    return current_status, pid, is_mc_running

def send_heartbeat(forced_status=None):
    global current_status, transition_start_time, online_players_cache
    if forced_status:
        current_status = forced_status
        if forced_status in ("starting", "stopping"):
            transition_start_time = time.time()
        else:
            transition_start_time = 0

    status, pid, is_running = determine_status()
    total_ram, used_ram = get_ram_usage()
    props = read_server_properties()
    server_port = props.get("server-port", 25565)

    online_count = len(online_players_cache) if status == "online" else 0

    data = {
        "status": status,
        "pid": pid if (status in ("online", "starting")) else None,
        "tps": 20.0 if status == "online" else (10.0 if status == "starting" else 0.0),
        "uptime_seconds": 0,
        "local_ip": get_local_ip(),
        "online_players": online_count,
        "max_players": props.get("max-players", 20),
    }
    res = api_post("/api/agent/heartbeat", data)
    if "error" in res:
        print(f"[!] Heartbeat error: {res['error']}")
    else:
        status_str = f"{status.upper()} (PID {pid}, Port: {server_port}, Players: {online_count}/{props.get('max-players', 20)})"
        print(f"[✓] Heartbeat sent: Minecraft is {status_str}")

def sync_logs():
    """Tails real logs/latest.log and streams new lines to the website console."""
    global log_file_pos, current_status, transition_start_time
    log_file = os.path.join(SERVER_DIR, "logs", "latest.log")
    if not os.path.exists(log_file):
        return

    try:
        file_size = os.path.getsize(log_file)
        if log_file_pos > file_size:
            log_file_pos = 0

        with open(log_file, "r", encoding="utf-8", errors="ignore") as f:
            f.seek(log_file_pos)
            new_lines = f.readlines()
            log_file_pos = f.tell()

        if new_lines:
            # Instant boot & shutdown detection (Pterodactyl-style responsiveness)
            for line in new_lines:
                raw_check = line.strip()
                if "Done (" in raw_check or "For help, type \"help\"" in raw_check or "playit.gg: tunnel setup" in raw_check:
                    current_status = "online"
                    transition_start_time = 0
                    send_heartbeat(forced_status="online")
                    break
                elif "Stopping server" in raw_check or "Closing Server" in raw_check:
                    current_status = "stopping"
                    transition_start_time = time.time()
                    send_heartbeat(forced_status="stopping")
                    break

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
    """Syncs real player cache matching opanel approach (usercache, ops, whitelist, bans, playerdata, live RCON)."""
    global last_player_sync, online_players_cache
    now = time.time()
    if now - last_player_sync < 10:
        return
    last_player_sync = now

    usercache_file = os.path.join(SERVER_DIR, "usercache.json")
    ops_file = os.path.join(SERVER_DIR, "ops.json")
    wl_file = os.path.join(SERVER_DIR, "whitelist.json")
    banned_file = os.path.join(SERVER_DIR, "banned-players.json")
    playerdata_dir = os.path.join(SERVER_DIR, "world", "playerdata")

    ops_set = set()
    wl_set = set()
    wl_names = set()
    banned_set = set()
    banned_info = {}

    try:
        if os.path.exists(ops_file):
            with open(ops_file, "r", encoding="utf-8") as f:
                for x in json.load(f):
                    ops_set.add(x.get("uuid", "").lower())
        if os.path.exists(wl_file):
            with open(wl_file, "r", encoding="utf-8") as f:
                for x in json.load(f):
                    wl_set.add(x.get("uuid", "").lower())
                    if x.get("name"):
                        wl_names.add(x.get("name").lower())
        if os.path.exists(banned_file):
            with open(banned_file, "r", encoding="utf-8") as f:
                for x in json.load(f):
                    u = x.get("uuid", "").lower()
                    banned_set.add(u)
                    banned_info[u] = x.get("reason", "Banned by an operator.")
    except Exception as e:
        print(f"[!] Warning reading player JSON files: {e}")

    # Query live RCON for connected players
    live_online_names = set()
    is_running, _ = check_minecraft_process()
    if is_running:
        rcon_ok, rcon_out = send_rcon_command("list")
        if rcon_ok and ":" in rcon_out:
            players_part = rcon_out.split(":", 1)[1].strip()
            if players_part:
                for p_name in players_part.split(","):
                    clean = p_name.strip()
                    if clean:
                        live_online_names.add(clean.lower())

    online_players_cache = list(live_online_names)

    # Collect known players by UUID
    known_players = {}

    # 1. usercache.json
    if os.path.exists(usercache_file):
        try:
            with open(usercache_file, "r", encoding="utf-8") as f:
                for entry in json.load(f):
                    uuid = entry.get("uuid", "").lower()
                    name = entry.get("name", "Player")
                    if uuid:
                        known_players[uuid] = {
                            "uuid": uuid,
                            "username": name,
                            "last_seen": entry.get("expiresOn", "Recently"),
                        }
        except Exception:
            pass

    # 2. world/playerdata/*.dat (discover offline players not in usercache)
    if os.path.isdir(playerdata_dir):
        try:
            for fname in os.listdir(playerdata_dir):
                if fname.endswith(".dat"):
                    dat_uuid = fname[:-4].lower()
                    if dat_uuid not in known_players:
                        dat_path = os.path.join(playerdata_dir, fname)
                        mtime = time.strftime("%Y-%m-%d %H:%M", time.localtime(os.path.getmtime(dat_path)))
                        known_players[dat_uuid] = {
                            "uuid": dat_uuid,
                            "username": dat_uuid[:8],
                            "last_seen": mtime,
                        }
        except Exception:
            pass

    # Build unified payload
    players_list = []
    for uuid, pdata in known_players.items():
        uname = pdata["username"]
        is_online = uname.lower() in live_online_names
        players_list.append({
            "uuid": uuid,
            "username": uname,
            "is_online": is_online,
            "is_op": uuid in ops_set,
            "is_whitelisted": uuid in wl_set or uname.lower() in wl_names,
            "is_banned": uuid in banned_set,
            "ban_reason": banned_info.get(uuid, None),
            "health": 20.0,
            "food_level": 20,
            "last_seen": "Online now" if is_online else pdata.get("last_seen", "Standby"),
        })

    if players_list:
        api_post("/api/agent/players", {"players": players_list})

def poll_and_execute_commands():
    global current_status, transition_start_time, log_file_pos
    res = api_get("/api/agent/commands")
    commands = res.get("commands", []) if isinstance(res, dict) else []

    for cmd in commands:
        cmd_id = cmd.get("id")
        payload = cmd.get("payload", {}) if isinstance(cmd.get("payload"), dict) else {}
        action_type = payload.get("action")
        cmd_type = (action_type or cmd.get("command_type", "")).upper()
        print(f"[+] Received command: {cmd_type} (ID: {cmd_id})")

        success = True
        output = ""

        if cmd_type in ("START", "START_SERVER"):
            is_running, _ = check_minecraft_process()
            if is_running:
                output = "Server is already running."
            else:
                ensure_rcon_configured()
                current_status = "starting"
                transition_start_time = time.time()
                send_heartbeat(forced_status="starting")

                # Purge old console logs on startup so the new session is clean and fresh
                api_post("/api/agent/logs", {"clear": True, "logs": []})

                log_file = os.path.join(SERVER_DIR, "logs", "latest.log")
                if os.path.exists(log_file):
                    log_file_pos = os.path.getsize(log_file)
                else:
                    log_file_pos = 0

                run_script = os.path.join(SERVER_DIR, "run.sh")
                start_script = os.path.join(SERVER_DIR, "start.sh")
                if os.path.exists(run_script):
                    subprocess.Popen(["bash", run_script], cwd=SERVER_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    output = "Started Paper server via run.sh"
                elif os.path.exists(start_script):
                    subprocess.Popen(["bash", start_script], cwd=SERVER_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                    output = "Started Paper server via start.sh"
                elif os.path.isdir(SERVER_DIR):
                    jars = [f for f in os.listdir(SERVER_DIR) if f.endswith(".jar") and ("paper" in f or "server" in f)]
                    if jars:
                        subprocess.Popen(["java", "-Xms1G", "-Xmx4G", "-Djava.net.preferIPv4Addresses=true", "-jar", jars[0], "--nogui"], cwd=SERVER_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        output = f"Started server using {jars[0]}"
                    else:
                        output = f"Could not find startup script or jar in {SERVER_DIR}"
                        success = False
                else:
                    output = f"Server directory {SERVER_DIR} not found"
                    success = False

        elif cmd_type in ("STOP", "STOP_SERVER", "GRACEFUL_STOP", "HIBERNATE"):
            current_status = "stopping"
            transition_start_time = time.time()
            send_heartbeat(forced_status="stopping")

            # Try graceful RCON stop first
            rcon_ok, rcon_res = send_rcon_command("stop")
            if not rcon_ok:
                subprocess.run(["pkill", "-15", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            
            # Wait for process to exit cleanly (up to 8s)
            for _ in range(40):
                is_running, _ = check_minecraft_process()
                if not is_running:
                    break
                time.sleep(0.2)

            # If still running after 8s, terminate
            is_running, _ = check_minecraft_process()
            if is_running:
                subprocess.run(["pkill", "-9", "-f", "paper.*\\.jar|server\\.jar"], check=False)
                time.sleep(0.3)

            current_status = "offline"
            transition_start_time = 0
            log_file_pos = 0
            send_heartbeat(forced_status="offline")
            # Clear logs on server stop
            api_post("/api/agent/logs", {"clear": True, "logs": []})
            output = "Server stopped cleanly."

        elif cmd_type in ("KILL", "KILL_SERVER", "FORCE_STOP"):
            current_status = "stopping"
            send_heartbeat(forced_status="stopping")
            subprocess.run(["pkill", "-9", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            time.sleep(0.2)
            current_status = "offline"
            transition_start_time = 0
            log_file_pos = 0
            send_heartbeat(forced_status="offline")
            api_post("/api/agent/logs", {"clear": True, "logs": []})
            output = "Forcibly killed Minecraft process (SIGKILL)."

        elif cmd_type in ("RESTART", "RESTART_SERVER"):
            current_status = "stopping"
            transition_start_time = time.time()
            send_heartbeat(forced_status="stopping")
            rcon_ok, _ = send_rcon_command("stop")
            if not rcon_ok:
                subprocess.run(["pkill", "-15", "-f", "paper.*\\.jar|server\\.jar"], check=False)
            
            for _ in range(35):
                is_running, _ = check_minecraft_process()
                if not is_running:
                    break
                time.sleep(0.2)
            
            is_running, _ = check_minecraft_process()
            if is_running:
                subprocess.run(["pkill", "-9", "-f", "paper.*\\.jar|server\\.jar"], check=False)
                time.sleep(0.5)

            # Clear logs on fresh restart
            api_post("/api/agent/logs", {"clear": True, "logs": []})
            log_file_pos = 0
            ensure_rcon_configured()

            current_status = "starting"
            transition_start_time = time.time()
            send_heartbeat(forced_status="starting")

            run_script = os.path.join(SERVER_DIR, "run.sh")
            start_script = os.path.join(SERVER_DIR, "start.sh")
            if os.path.exists(run_script):
                subprocess.Popen(["bash", run_script], cwd=SERVER_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                output = "Restarted server via run.sh."
            elif os.path.exists(start_script):
                subprocess.Popen(["bash", start_script], cwd=SERVER_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                output = "Restarted server via start.sh."
            else:
                output = "Stopped server."

        elif cmd_type in ("CONSOLE_CMD", "COMMAND"):
            raw_cmd = payload.get("command", "").strip()
            if raw_cmd.startswith("/"):
                raw_cmd = raw_cmd[1:]

            ts = time.strftime("%H:%M:%S")
            rcon_ok, rcon_out = send_rcon_command(raw_cmd)
            if rcon_ok:
                output = rcon_out if rcon_out else f"Executed: {raw_cmd}"
                if rcon_out:
                    api_post("/api/agent/logs", {
                        "logs": [{
                            "timestamp": ts,
                            "level": "INFO",
                            "message": f"[{ts} INFO]: {rcon_out}"
                        }]
                    })
            else:
                fallback_success = False
                try:
                    tmux_check = subprocess.run(["tmux", "list-sessions"], capture_output=True, text=True)
                    if tmux_check.returncode == 0:
                        for line in tmux_check.stdout.splitlines():
                            sess_name = line.split(":")[0]
                            if any(w in sess_name.lower() for w in ("mc", "minecraft", "paper", "server")):
                                subprocess.run(["tmux", "send-keys", "-t", sess_name, raw_cmd, "C-m"], check=True)
                                output = f"Sent to Minecraft tmux ({sess_name}): {raw_cmd}"
                                fallback_success = True
                                break
                except Exception:
                    pass

                if not fallback_success:
                    output = f"Command failed: {rcon_out}"
                    api_post("/api/agent/logs", {
                        "logs": [{
                            "timestamp": ts,
                            "level": "WARN",
                            "message": f"[{ts} WARN]: [Server] {output}"
                        }]
                    })

        elif cmd_type == "WHITELIST":
            raw_target = payload.get("player") or payload.get("command", "").replace("whitelist add ", "").replace("whitelist remove ", "").strip()
            sub_action = payload.get("action", "add")
            cmd_str = f"whitelist {sub_action} {raw_target}" if raw_target else "whitelist list"
            rcon_ok, rcon_out = send_rcon_command(cmd_str)
            output = rcon_out or f"Executed: {cmd_str}"
            if rcon_out:
                ts = time.strftime("%H:%M:%S")
                api_post("/api/agent/logs", {
                    "logs": [{
                        "timestamp": ts,
                        "level": "INFO",
                        "message": f"[{ts} INFO]: {rcon_out}"
                    }]
                })
            sync_players()

        elif cmd_type in ("OP", "DEOP", "KICK", "BAN", "UNBAN", "GAMEMODE", "TELEPORT", "HEAL", "FEED"):
            target = payload.get("player") or payload.get("target", "").strip()
            reason = payload.get("reason", "")
            if cmd_type == "OP":
                c = f"op {target}"
            elif cmd_type == "DEOP":
                c = f"deop {target}"
            elif cmd_type == "KICK":
                c = f"kick {target} {reason}".strip()
            elif cmd_type == "BAN":
                c = f"ban {target} {reason}".strip()
            elif cmd_type == "UNBAN":
                c = f"pardon {target}"
            elif cmd_type == "GAMEMODE":
                gm = payload.get("gamemode", "survival")
                c = f"gamemode {gm} {target}"
            elif cmd_type == "TELEPORT":
                coords = payload.get("coords", "0 70 0")
                c = f"tp {target} {coords}"
            elif cmd_type == "HEAL":
                c = f"effect give {target} minecraft:instant_health 1 255 true"
            elif cmd_type == "FEED":
                c = f"effect give {target} minecraft:saturation 1 255 true"
            else:
                c = f"{cmd_type.lower()} {target}"
            rcon_ok, rcon_out = send_rcon_command(c)
            output = rcon_out or f"Executed: {c}"
            if rcon_out:
                ts = time.strftime("%H:%M:%S")
                api_post("/api/agent/logs", {
                    "logs": [{
                        "timestamp": ts,
                        "level": "INFO",
                        "message": f"[{ts} INFO]: {rcon_out}"
                    }]
                })
            sync_players()

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
                    output = json.dumps({"success": True, "path": ("/" + rel_path).replace("\\", "/"), "size": len(content)})
                except Exception as e:
                    output = f"Failed to save file: {e}"
                    success = False
            else:
                output = "Security error: File path outside server directory."
                success = False

        elif cmd_type == "LIST_FILES":
            rel_dir = payload.get("directory", "").strip().lstrip("/\\")
            target_dir = os.path.abspath(os.path.join(SERVER_DIR, rel_dir)) if rel_dir else os.path.abspath(SERVER_DIR)
            server_root = os.path.abspath(SERVER_DIR)
            if target_dir.startswith(server_root) and os.path.isdir(target_dir):
                try:
                    entries = []
                    with os.scandir(target_dir) as it:
                        for entry in it:
                            try:
                                stat = entry.stat()
                                is_dir = entry.is_dir()
                                entries.append({
                                    "name": entry.name,
                                    "path": ("/" + os.path.relpath(entry.path, server_root)).replace("\\", "/"),
                                    "isDirectory": is_dir,
                                    "size": 0 if is_dir else stat.st_size,
                                    "modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
                                    "extension": "" if is_dir else os.path.splitext(entry.name)[1].lstrip("."),
                                })
                            except Exception:
                                continue
                    entries.sort(key=lambda x: (not x["isDirectory"], x["name"].lower()))
                    output = json.dumps({
                        "directory": ("/" + rel_dir).rstrip("/") if rel_dir else "/",
                        "files": entries,
                    })
                except Exception as e:
                    output = f"Failed to list directory: {e}"
                    success = False
            else:
                # If target directory doesn't exist yet, return empty list
                output = json.dumps({
                    "directory": ("/" + rel_dir).rstrip("/") if rel_dir else "/",
                    "files": [],
                })

        elif cmd_type == "READ_FILE":
            rel_path = payload.get("path", "").strip().lstrip("/\\")
            target_path = os.path.abspath(os.path.join(SERVER_DIR, rel_path))
            server_root = os.path.abspath(SERVER_DIR)
            if target_path.startswith(server_root) and os.path.isfile(target_path):
                try:
                    max_bytes = 4 * 1024 * 1024  # 4MB max text read
                    with open(target_path, "r", encoding="utf-8", errors="replace") as f:
                        file_content = f.read(max_bytes)
                    output = json.dumps({
                        "path": ("/" + rel_path).replace("\\", "/"),
                        "name": os.path.basename(target_path),
                        "content": file_content,
                    })
                except Exception as e:
                    output = f"Failed to read file: {e}"
                    success = False
            else:
                output = "File not found or outside server directory."
                success = False

        elif cmd_type == "DELETE_FILE":
            rel_path = payload.get("path", "").strip().lstrip("/\\")
            target_path = os.path.abspath(os.path.join(SERVER_DIR, rel_path))
            server_root = os.path.abspath(SERVER_DIR)
            if target_path.startswith(server_root) and target_path != server_root:
                try:
                    if os.path.isdir(target_path):
                        import shutil
                        shutil.rmtree(target_path)
                    elif os.path.isfile(target_path):
                        os.remove(target_path)
                    output = json.dumps({"success": True, "path": ("/" + rel_path).replace("\\", "/")})
                except Exception as e:
                    output = f"Failed to delete: {e}"
                    success = False
            else:
                output = "Cannot delete: target outside server directory."
                success = False

        elif cmd_type == "CREATE_FOLDER":
            rel_dir = payload.get("directory", "").strip().lstrip("/\\")
            name = payload.get("name", "").strip().replace("/", "").replace("\\", "")
            target_dir = os.path.abspath(os.path.join(SERVER_DIR, rel_dir, name))
            server_root = os.path.abspath(SERVER_DIR)
            if target_dir.startswith(server_root) and name:
                try:
                    os.makedirs(target_dir, exist_ok=True)
                    output = json.dumps({"success": True, "path": ("/" + os.path.relpath(target_dir, server_root)).replace("\\", "/")})
                except Exception as e:
                    output = f"Failed to create folder: {e}"
                    success = False
            else:
                output = "Invalid folder path."
                success = False

        elif cmd_type == "CREATE_FILE":
            rel_dir = payload.get("directory", "").strip().lstrip("/\\")
            name = payload.get("name", "").strip().replace("/", "").replace("\\", "")
            content = payload.get("content", "")
            target_file = os.path.abspath(os.path.join(SERVER_DIR, rel_dir, name))
            server_root = os.path.abspath(SERVER_DIR)
            if target_file.startswith(server_root) and name:
                try:
                    os.makedirs(os.path.dirname(target_file), exist_ok=True)
                    with open(target_file, "w", encoding="utf-8") as f:
                        f.write(content)
                    output = json.dumps({"success": True, "path": ("/" + os.path.relpath(target_file, server_root)).replace("\\", "/")})
                except Exception as e:
                    output = f"Failed to create file: {e}"
                    success = False
            else:
                output = "Invalid file path."
                success = False

        # Report result back with EXECUTED (satisfies server_commands check constraint)
        api_post("/api/agent/result", {
            "command_id": cmd_id,
            "status": "EXECUTED" if success else "FAILED",
            "result_output": output,
        })
        print(f"[✓] Command {cmd_id} finished: {output[:120]}")

def main():
    try:
        subprocess.run(["termux-wake-lock"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    ensure_rcon_configured()

    print("[Agent] Polling loop running. Press Ctrl+C to stop.")
    send_heartbeat()
    sync_logs()
    sync_players()
    last_hb = time.time()
    last_log_sync = time.time()
    last_player_time = time.time()

    while True:
        now = time.time()
        if now - last_hb >= config.get("heartbeatInterval", 3):
            send_heartbeat()
            last_hb = now

        if now - last_log_sync >= config.get("logPollInterval", 0.6):
            sync_logs()
            last_log_sync = now

        if now - last_player_time >= 8.0:
            sync_players()
            last_player_time = now

        poll_and_execute_commands()
        time.sleep(config.get("commandPollInterval", 0.5))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Agent] Stopped by user.")
        sys.exit(0)
