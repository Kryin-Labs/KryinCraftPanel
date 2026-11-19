#!/usr/bin/env python3
"""
KryinCraftPanel - Lightweight Python Agent for Android / Termux
Zero external pip dependencies (Standard Python 3 only)
"""

import gzip
import hashlib
import math
import zlib
from datetime import datetime, timezone
from functools import lru_cache
from uuid import UUID
import stat
import os
import base64
import binascii
import re
import tempfile
import sys
import json
import time
import socket
import struct
import subprocess
import urllib.request
import urllib.error
import threading

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
    "commandPollInterval": 0.25,
    "logPollInterval": 0.5,
}

log_lock = threading.Lock()

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
        "broadcast-rcon-to-ops": "false"
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
        elif not is_mc_running and (transition_start_time <= 0 or now - transition_start_time >= 10):
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

    with log_lock:
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
                    # Filter out internal RCON handshake noise from Paper
                    if "Thread RCON Client" in raw or "RCON Listener" in raw:
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

def parse_player_pings(output):
    visible = re.sub(r"\x1b\[[0-9;]*m|§[0-9a-fk-orx]", "", output, flags=re.IGNORECASE)
    return {
        match[1].lower(): int(match[2])
        for match in re.finditer(r"\bPlayer (\S+) has (\d{1,5}) ms ping\b", visible)
        if 0 < int(match[2]) <= 60000
    }


class PlayerNbt:
    """Read Java Edition's big-endian player save with bounded input and depth."""

    numbers = {1: ">b", 2: ">h", 3: ">i", 4: ">q", 5: ">f", 6: ">d"}

    def __init__(self, data):
        self.data = memoryview(data)
        self.offset = 0

    def take(self, size):
        end = self.offset + size
        if size < 0 or end > len(self.data):
            raise ValueError("Truncated player save")
        value = self.data[self.offset:end]
        self.offset = end
        return value

    def number(self, fmt):
        return struct.unpack(fmt, self.take(struct.calcsize(fmt)))[0]

    def string(self):
        return bytes(self.take(self.number(">H"))).decode("utf-8", errors="replace")

    def value(self, tag, depth=0):
        if depth > 40:
            raise ValueError("Player save nesting limit")
        if tag in self.numbers:
            return self.number(self.numbers[tag])
        if tag in (7, 11, 12):
            width = {7: 1, 11: 4, 12: 8}[tag]
            self.take(self.number(">i") * width)
            return None
        if tag == 8:
            return self.string()
        if tag == 9:
            child = self.number(">B")
            count = self.number(">i")
            if not 0 <= count <= 65536 or (count and not child):
                raise ValueError("Invalid player save list")
            return [self.value(child, depth + 1) for _ in range(count)]
        if tag == 10:
            values = {}
            while True:
                child = self.number(">B")
                if child == 0:
                    return values
                name = self.string()
                values[name] = self.value(child, depth + 1)
        raise ValueError("Unknown player save tag")

    def root(self):
        if self.number(">B") != 10:
            raise ValueError("Missing player root compound")
        self.string()
        return self.value(10)


def player_item(stack, slot):
    item_id = stack.get("id")
    count = stack.get("count", stack.get("Count", 1))
    if not isinstance(item_id, str) or len(item_id) > 180 or not re.fullmatch(r"[a-z0-9_.-]+:[a-z0-9_./-]+", item_id):
        return None
    if item_id == "minecraft:air" or not isinstance(count, int) or not 0 < count <= 999:
        return None
    name = item_id.split(":", 1)[1]
    return {"id": item_id, "name": name, "displayName": name.rsplit("/", 1)[-1].replace("_", " ").title(),
            "count": count, "slot": slot}


@lru_cache(maxsize=512)
def read_player_save(path, modified_ns, file_size, world):
    if file_size > 2 * 1024 * 1024:
        return {}
    try:
        with gzip.open(path, "rb") as handle:
            data = handle.read(3 * 1024 * 1024 + 1)
        if len(data) > 3 * 1024 * 1024:
            return {}
        saved = PlayerNbt(data).root()
    except (OSError, ValueError, EOFError, zlib.error):
        return {}

    timestamp = datetime.fromtimestamp(modified_ns / 1_000_000_000, timezone.utc).isoformat()
    result = {"last_saved": timestamp}
    contents = saved.get("Inventory")
    if isinstance(contents, list):
        armor = dict.fromkeys(("helmet", "chestplate", "leggings", "boots"))
        armor_slots = {103: "helmet", 102: "chestplate", 101: "leggings", 100: "boots"}
        inventory = {"main": [None] * 27, "hotbar": [None] * 9, "armor": armor, "offhand": None, "savedAt": timestamp}
        for stack in contents:
            if not isinstance(stack, dict) or not isinstance(stack.get("Slot"), int):
                continue
            slot = stack["Slot"] & 255
            if slot < 9:
                inventory["hotbar"][slot] = player_item(stack, slot)
            elif slot < 36:
                inventory["main"][slot - 9] = player_item(stack, slot)
            elif slot in armor_slots:
                armor[armor_slots[slot]] = player_item(stack, 36 + slot - 100)
            elif slot == 150:
                inventory["offhand"] = player_item(stack, 40)
        result["inventory"] = inventory

    position = saved.get("Pos")
    if isinstance(position, list) and len(position) == 3 and all(isinstance(n, (int, float)) and math.isfinite(n) for n in position):
        dimension = saved.get("Dimension")
        result["coordinates"] = {
            "x": position[0], "y": position[1], "z": position[2], "world": world,
            "dimension": dimension if isinstance(dimension, str) else "minecraft:overworld",
        }
    mode = saved.get("playerGameType")
    if isinstance(mode, int) and 0 <= mode <= 3:
        result["gamemode"] = ("survival", "creative", "adventure", "spectator")[mode]
    for field, key, low, high in (
        ("health", "Health", 0, 999), ("food_level", "foodLevel", 0, 20),
        ("saturation", "foodSaturationLevel", 0, 20), ("xp_level", "XpLevel", 0, 2147483647),
        ("xp_progress", "XpP", 0, 1)
    ):
        value = saved.get(key)
        if isinstance(value, (int, float)) and math.isfinite(value) and low <= value <= high:
            result[field] = value
    return result


def saved_players():
    root = os.path.realpath(SERVER_DIR)
    world = read_server_properties().get("level-name") or "world"
    base = os.path.realpath(os.path.join(root, world))
    if os.path.commonpath([root, base]) != root:
        return {}
    playerdata = os.path.join(base, "playerdata")
    if os.path.realpath(playerdata) != playerdata:
        return {}
    result = {}
    try:
        with os.scandir(playerdata) as entries:
            for entry in entries:
                if not entry.name.endswith(".dat") or not entry.is_file(follow_symlinks=False):
                    continue
                stem = entry.name[:-4]
                try:
                    uuid = str(UUID(stem))
                    metadata = entry.stat(follow_symlinks=False)
                    snapshot = read_player_save(entry.path, metadata.st_mtime_ns, metadata.st_size, world)
                    if snapshot:
                        result[uuid] = snapshot
                except (OSError, ValueError):
                    continue
    except OSError:
        pass
    return result


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
    player_pings = {}
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

        # Ask Spark for per-player RTT on the existing Minecraft connection.
        # Only command-safe names reported by the server are used.
        names = sorted(name for name in live_online_names if re.fullmatch(r"[.a-z0-9_-]{1,32}", name))
        for offset in range(0, len(names), 12):
            arguments = "".join(" --player " + name for name in names[offset:offset + 12])
            ok, response = send_rcon_command("spark ping" + arguments)
            if not ok:
                break
            player_pings.update(parse_player_pings(response))

    online_players_cache = list(live_online_names)

    snapshots = saved_players()
    known_players = {}
    # Prefer the server's game profile names. A UUID prefix is a display fallback only.
    for source in (usercache_file, ops_file, wl_file, banned_file):
        try:
            with open(source, "r", encoding="utf-8") as handle:
                for entry in json.load(handle):
                    if entry.get("name") and entry.get("uuid"):
                        known_players.setdefault(str(UUID(entry["uuid"])), entry["name"])
        except (OSError, ValueError, TypeError, AttributeError):
            continue

    cache_order = {uuid: index for index, uuid in enumerate(known_players)}
    identities = sorted(
        set(known_players) | set(snapshots),
        key=lambda uuid: (snapshots.get(uuid, {}).get("last_saved", ""), -cache_order.get(uuid, len(cache_order)), uuid),
        reverse=True,
    )
    players_list = []
    seen_online = set()
    for uuid in identities:
        name = known_players.get(uuid, uuid[:8])
        snapshot = snapshots.get(uuid, {})
        key = name.lower()
        is_online = key in live_online_names and key not in seen_online
        if is_online:
            seen_online.add(key)
        players_list.append({
            "uuid": uuid,
            "username": name,
            "is_online": is_online,
            "ping_ms": player_pings.get(key) if is_online else None,
            "is_op": uuid in ops_set,
            "is_whitelisted": uuid in wl_set or key in wl_names,
            "is_banned": uuid in banned_set,
            "ban_reason": banned_info.get(uuid),
            "last_seen": "Online now" if is_online else snapshot.get("last_saved"),
            **{key: value for key, value in snapshot.items() if key != "last_saved"},
        })

    for offset in range(0, len(players_list), 50):
        api_post("/api/agent/players", {"players": players_list[offset:offset + 50]})

def launch_minecraft():
    for filename in ("run.sh", "start.sh"):
        if os.path.isfile(os.path.join(SERVER_DIR, filename)):
            command = ["bash", filename]
            break
    else:
        jars = sorted(name for name in os.listdir(SERVER_DIR)
                      if name.endswith(".jar") and ("paper" in name or "server" in name))
        if not jars:
            raise FileNotFoundError("No Minecraft startup script or server jar")
        command = ["java", "-Xms1G", "-Xmx4G", "-Djava.net.preferIPv4Addresses=true", "-jar", jars[0], "--nogui"]

    for attempt in range(2):
        try:
            subprocess.Popen(command, cwd=SERVER_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return
        except OSError:
            if attempt:
                raise
            time.sleep(0.5)

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

                try:
                    launch_minecraft()
                    output = "Minecraft process launch requested."
                except OSError:
                    success = False
                    output = "Could not launch Minecraft. Check the startup script and Java on the device."
                    send_heartbeat(forced_status="offline")
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

            try:
                launch_minecraft()
                output = "Minecraft process relaunch requested."
            except OSError:
                success = False
                output = "Could not relaunch Minecraft. Check the startup script and Java on the device."
                send_heartbeat(forced_status="offline")
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
                    success = False
                    output = f"Command failed: {rcon_out}"
                    api_post("/api/agent/logs", {
                        "logs": [{
                            "timestamp": ts,
                            "level": "WARN",
                            "message": f"[{ts} WARN]: [Server] {output}"
                        }]
                    })

            # Instantly flush Paper's output from latest.log so web terminal updates in real-time
            time.sleep(0.08)
            sync_logs()

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

        elif cmd_type in ("READ_SERVER_ICON", "SAVE_SERVER_ICON"):
            icon_path = os.path.join(SERVER_DIR, "server-icon.png")
            temporary_path = None
            try:
                if cmd_type == "READ_SERVER_ICON":
                    if os.path.islink(icon_path):
                        raise ValueError("Server icon must be a regular file.")
                    if os.path.isfile(icon_path):
                        with open(icon_path, "rb") as f:
                            content = f.read(49501)
                        output = json.dumps({"icon": base64.b64encode(content).decode("ascii") if len(content) <= 49500 else None})
                    else:
                        output = json.dumps({"icon": None})
                else:
                    encoded = payload.get("icon")
                    if not isinstance(encoded, str) or len(encoded) > 66000:
                        raise ValueError("Invalid icon size.")
                    content = base64.b64decode(encoded, validate=True)
                    if (len(content) < 33 or not content.startswith(b"\x89PNG\r\n\x1a\n\x00\x00\x00\x0dIHDR")
                            or struct.unpack(">II", content[16:24]) != (64, 64)):
                        raise ValueError("Expected a 64 x 64 PNG.")
                    with tempfile.NamedTemporaryFile(dir=SERVER_DIR, prefix=".server-icon-", delete=False) as f:
                        temporary_path = f.name
                        f.write(content)
                    os.replace(temporary_path, icon_path)
                    temporary_path = None
                    output = json.dumps({"path": "/server-icon.png"})
            except (OSError, ValueError, binascii.Error) as e:
                success = False
                output = str(e)
            finally:
                if temporary_path is not None:
                    os.unlink(temporary_path)

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

def command_worker_loop():
    print("[Agent] Fast-poll command worker thread active (sub-300ms latency).", flush=True)
    poll_interval = max(0.2, min(float(config.get("commandPollInterval", 0.25)), 1.0))
    while True:
        try:
            poll_and_execute_commands()
        except Exception as e:
            print(f"[!] Command poll error: {e}", flush=True)
        time.sleep(poll_interval)


def read_backup_key():
    # Keep the key in Termux's private home, outside the Minecraft server directory.
    key_path = os.path.expanduser("~/.config/kryin/backup.key")
    try:
        descriptor = os.open(key_path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
        with os.fdopen(descriptor, "r", encoding="ascii") as key_file:
            metadata = os.fstat(key_file.fileno())
            if not stat.S_ISREG(metadata.st_mode) or metadata.st_mode & 0o077:
                return None
            token = key_file.read(64).strip()
            return token if re.fullmatch(r"[A-Za-z0-9_-]{43}", token) else None
    except (OSError, UnicodeError):
        return None


def call_backup_service(token, body):
    request = urllib.request.Request(
        f"{BACKEND_URL}/api/agent/backups",
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=12) as response:
            return json.load(response)
    except (OSError, ValueError):
        return {}


def backup_startup_key():
    running, pid = check_minecraft_process()
    if not running or not pid:
        return None
    try:
        # Start ticks distinguish restarts even if Linux recycles a PID.
        with open(f"/proc/{int(pid)}/stat", encoding="ascii") as handle:
            start_ticks = handle.read().rsplit(")", 1)[1].split()[19]
        boot_id = ""
        try:
            with open("/proc/sys/kernel/random/boot_id", encoding="ascii") as handle:
                boot_id = handle.read().strip()
        except OSError:
            pass
        return hashlib.sha256(f"{boot_id}:{pid}:{start_ticks}".encode("ascii")).hexdigest()
    except (OSError, ValueError, IndexError):
        return None


def collect_backup_configs(policy):
    files = []
    omitted = 0
    total = 0
    root = os.path.realpath(SERVER_DIR)
    plugin_root = os.path.join(root, "plugins")
    config_root = os.path.join(root, "config")
    paths = list(policy["rootFiles"])
    if not os.path.islink(config_root):
        paths += list(policy["configFiles"])
    plugin_path = re.compile(policy["pluginPath"], re.IGNORECASE | re.ASCII)
    sensitive = re.compile(policy["sensitive"], re.IGNORECASE | re.ASCII)
    try:
        if not os.path.islink(plugin_root):
            with os.scandir(plugin_root) as entries:
                folders = sorted(entry.name for entry in entries if entry.is_dir(follow_symlinks=False))[:400]
            for name in folders:
                try:
                    with os.scandir(os.path.join(plugin_root, name)) as entries:
                        paths.extend(sorted(
                            f"plugins/{name}/{entry.name}" for entry in entries
                            if entry.is_file(follow_symlinks=False) and plugin_path.fullmatch(f"plugins/{name}/{entry.name}")
                        ))
                except OSError:
                    omitted += 1
    except OSError:
        pass

    for relative in paths:
        path = os.path.normpath(os.path.join(root, relative))
        if not os.path.lexists(path):
            continue
        if len(files) >= policy["maxFiles"]:
            omitted += 1
            continue
        try:
            if os.path.realpath(path) != path:
                omitted += 1
                continue
            descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
            with os.fdopen(descriptor, "rb") as handle:
                if not stat.S_ISREG(os.fstat(handle.fileno()).st_mode):
                    omitted += 1
                    continue
                content_bytes = handle.read(policy["fileMax"] + 1)
            if len(content_bytes) > policy["fileMax"]:
                omitted += 1
                continue
            content = content_bytes.decode("utf-8-sig")
        except (OSError, UnicodeError):
            omitted += 1
            continue

        if relative == "server.properties":
            permitted = set(policy["properties"])
            safe_lines = []
            continuing = False
            for line in content.splitlines():
                key = re.match(r"^\s*([a-z\d.-]+)(?:\s*[=:]|\s+)", line)
                continues = bool((len(line) - len(line.rstrip("\\"))) % 2)
                if not continuing and not continues and key and key[1] in permitted and not sensitive.search(line):
                    safe_lines.append(line)
                continuing = continues
            content = "\n".join(safe_lines) + "\n"
        size = len(content.encode("utf-8"))
        if not content.strip() or re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", content) or sensitive.search(content) or total + size > policy["totalMax"]:
            omitted += 1
            continue
        total += size
        files.append({"path": relative, "content": content})
    return files, omitted


def backup_worker_loop():
    while True:
        token = read_backup_key()
        if token:
            try:
                job = call_backup_service(token, {"action": "claim", "startup": backup_startup_key()})
                if job.get("id") and job.get("lease"):
                    files, omitted = collect_backup_configs(job["policy"])
                    call_backup_service(token, {
                        "action": "complete", "id": job["id"], "lease": job["lease"],
                        "files": files, "omitted": omitted,
                    })
            except (OSError, ValueError, KeyError, TypeError):
                print("[Backup] Could not collect configuration files. The job will retry.", flush=True)
        time.sleep(8 if token else 30)


def main():
    try:
        subprocess.run(["termux-wake-lock"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    ensure_rcon_configured()

    # Launch dedicated command worker thread IMMEDIATELY on boot
    cmd_thread = threading.Thread(target=command_worker_loop, daemon=True, name="KryinCommandWorker")
    cmd_thread.start()
    threading.Thread(target=backup_worker_loop, daemon=True, name="KryinBackupWorker").start()

    print("[Agent] Polling loop running. Press Ctrl+C to stop.", flush=True)
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

        if now - last_log_sync >= config.get("logPollInterval", 0.5):
            sync_logs()
            last_log_sync = now

        if now - last_player_time >= 8.0:
            sync_players()
            last_player_time = now

        time.sleep(0.15)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[Agent] Stopped by user.")
        sys.exit(0)
