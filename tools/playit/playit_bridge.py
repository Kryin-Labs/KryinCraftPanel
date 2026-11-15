import os
import sys
import subprocess
import time
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PLAYIT_EXE = os.path.join(SCRIPT_DIR, "playitd.exe")
PLAYIT_TOML = os.path.join(SCRIPT_DIR, "playit.toml")
LOG_FILE = os.path.join(SCRIPT_DIR, "playit_bedrock.log")
PORT = 8089

process = None

def get_running_process():
    global process
    if process is not None:
        if process.poll() is None:
            return process
        else:
            process = None
    # Also check if any other playitd process is running on Windows
    try:
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", "Get-Process -Name 'playitd' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Id"],
            stderr=subprocess.DEVNULL
        ).decode().strip()
        if out:
            pids = [int(p) for p in out.split() if p.isdigit()]
            if pids:
                return pids[0]
    except Exception:
        pass
    return None

def start_playit():
    global process
    existing = get_running_process()
    if existing:
        pid = existing.pid if hasattr(existing, 'pid') else existing
        return True, f"Playit Bedrock already running (PID: {pid})", pid

    try:
        log_f = open(LOG_FILE, "a", encoding="utf-8")
        log_f.write(f"\n--- Starting playitd at {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
        log_f.flush()
        
        process = subprocess.Popen(
            [PLAYIT_EXE, "--secret-path", PLAYIT_TOML],
            cwd=SCRIPT_DIR,
            stdout=log_f,
            stderr=subprocess.STDOUT,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        )
        time.sleep(0.5)
        if process.poll() is not None:
            return False, f"Playit Bedrock exited immediately with code {process.returncode}", None
        return True, f"Playit Bedrock started (PID: {process.pid})", process.pid
    except Exception as e:
        return False, str(e), None

def stop_playit():
    global process
    killed = False
    if process is not None and process.poll() is None:
        try:
            process.terminate()
            process.wait(timeout=3)
            killed = True
        except Exception:
            try:
                process.kill()
                killed = True
            except Exception:
                pass
        process = None

    # Also make sure no other playitd.exe is running
    try:
        subprocess.run(
            ["powershell", "-NoProfile", "-Command", "Stop-Process -Name 'playitd' -Force -ErrorAction SilentlyContinue"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False
        )
        killed = True
    except Exception:
        pass

    return True, "Playit Bedrock stopped"

def get_recent_logs(lines=25):
    if not os.path.exists(LOG_FILE):
        return []
    try:
        with open(LOG_FILE, "r", encoding="utf-8", errors="ignore") as f:
            all_lines = f.readlines()
            return [l.rstrip("\r\n") for l in all_lines[-lines:]]
    except Exception as e:
        return [f"Error reading log: {e}"]

class BridgeHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split("?")[0].rstrip("/")
        if not path:
            path = "/"

        if path in ("", "/", "/status", "/api/status"):
            proc = get_running_process()
            is_running = proc is not None
            pid = proc.pid if hasattr(proc, 'pid') else proc
            data = {
                "running": is_running,
                "pid": pid,
                "service": "Playit Bedrock Bridge",
                "target": "molecule-edition.tun.ply.gg:41715 -> 192.168.0.164:19132",
                "logs": get_recent_logs(15)
            }
            self.send_json(200, data)

        elif path in ("/start", "/api/start"):
            ok, msg, pid = start_playit()
            self.send_json(200 if ok else 500, {
                "success": ok,
                "message": msg,
                "pid": pid,
                "running": True if ok else False
            })

        elif path in ("/stop", "/api/stop"):
            ok, msg = stop_playit()
            self.send_json(200, {
                "success": ok,
                "message": msg,
                "running": False
            })

        elif path in ("/logs", "/api/logs"):
            logs = get_recent_logs(40)
            text = "\n".join(logs)
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(text.encode("utf-8"))

        else:
            self.send_json(404, {"error": "Not Found"})

    def do_POST(self):
        self.do_GET()

    def send_json(self, code, data):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        # Suppress noisy HTTP request logging
        return

def run_server():
    server = HTTPServer(("0.0.0.0", PORT), BridgeHandler)
    print(f"[*] Playit Bedrock Bridge HTTP Service listening on 0.0.0.0:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Stopping server...")
        stop_playit()
        server.server_close()

if __name__ == "__main__":
    # If run with argument --start-playit, auto start playit on boot
    if "--autostart" in sys.argv or "-a" in sys.argv:
        start_playit()
    run_server()
