# 🚀 KryinCraft Indian Node — Complete Management & Startup Guide

This guide covers the new unified CLI suite (`minecraft`), lifecycle scripts in `~`, status commands, and Playit tunnels for **Indian Node**.

---

## ☀️ Tomorrow Morning Startup (Cheat Sheet)

Because `~/.bashrc` automatically starts `sshd` and `termux-wake-lock` when Termux opens, starting everything is effortless:

### Method 1: Directly on Your Phone (Fastest)
1. Open the **Termux** app on your phone.
2. Type:
   ```bash
   fullstart
   ```
   *(That's it! Minecraft server, Bedrock Playit tunnel, and the Portal Agent will all start. The website will immediately update to **Online**).*

---

### Method 2: From Your Computer (PowerShell)
1. Open Termux on your phone once (this automatically turns on SSH and wake-lock).
2. On your Windows PC, open PowerShell and connect:
   ```powershell
   ssh -p 8022 u0_a311@192.168.0.164
   ```
   *(Password: `334001`)*
3. Type:
   ```bash
   fullstart
   ```

---

### 🌐 Does the Website Automatically Update Status?
**Yes, 100%!**  
The moment `fullstart` starts the Agent (`agent.py`):
- The agent immediately connects to your web panel (`https://kryincraftpanel.vercel.app`) and Supabase.
- The website status badge switches to **ONLINE** with zero delay.
- Live RAM usage, TPS (20.0), and online players will sync continuously.
- You can also click Start / Stop / Restart directly on the website anytime!

| Direct Command | Equivalent Full Command | Action |
| :--- | :--- | :--- |
| **`localserver`** | `minecraft localserver` | Starts only the Minecraft Server (Paper + Playit Java) |
| **`agentstart`** | `minecraft agentstart` | Starts the KryinCraft Portal Agent |
| **`bedrockstart`** | `minecraft bedrockstart` | Starts Bedrock Playit EXE on Windows |
| **`fullstart`** | `minecraft fullstart` | Starts EVERYTHING (MC + Bedrock + Agent) |
| **`stop mc`** | `minecraft stop mc` | Graceful stop of Minecraft Server (saves worlds) |
| **`stop bedrock`** | `minecraft stop bedrock` | Stops Bedrock Playit EXE |
| **`stop agent`** | `minecraft stop agent` | Stops Portal Agent |
| **`fullstop`** (or **`stop`**) | `minecraft fullstop` | Stops ALL running processes |
| **`status`** | `minecraft status` | Displays overview table for all 3 services |
| **`status mc`** | `minecraft status mc` | Streams live Minecraft server console |
| **`status agent`** | `minecraft status agent` | Streams live Agent logs |
| **`status bedrock`** | `minecraft status bedrock`| Shows Bedrock tunnel & Windows daemon status |
| **`update agent`** | `minecraft update agent` | Pulls latest agent from GitHub and restarts it |
| **`update server`** | `minecraft update server`| Pulls latest Paper startup configs from GitHub |
| **`update scripts`**| `minecraft update scripts`| Pulls latest CLI and lifecycle scripts from GitHub |
| **`update all`** | `minecraft update all` | Pulls and updates everything from GitHub |
| **`minecraft`** | `minecraft help` | Shows the full command reference menu |

*(Both styles work identically — use whichever feels faster for you!)*

```
========================================================================================================
                          KRYINCRAFT NODE MANAGEMENT CONSOLE (INDIAN NODE)                              
========================================================================================================

COMMANDS                 INFO                      DESCRIPTION                                       
--------------------------------------------------------------------------------------------------------
localserver              'launches localserver.sh' Start Only Minecraft Server (Including Playit JAVA)
agentstart               'launches agentstart.sh'  Start KryinCraft Portal Agent                     
bedrockstart             'launches bedrockstart.sh' Start Bedrock Playit EXE (molecule-edition)       
fullstart                'launches fullstart.sh'   Start All (Minecraft + Bedrock Playit + Agent)    
--------------------------------------------------------------------------------------------------------
stop mc                  'launches stop-mc.sh'     Graceful Stop Minecraft Server (Saves Worlds & Shuts Down)
stop bedrock             'launches stop-bedrock.sh' Stop Bedrock Playit EXE                           
stop agent               'launches stop-agent.sh'  Stop Portal Agent                                 
fullstop                 'launches fullstop.sh'    Stop ALL Running Processes (MC + Bedrock + Agent) 
--------------------------------------------------------------------------------------------------------
status mc                'status mc'               Live Minecraft Server Console (tail latest.log)   
status agent             'status agent'            Live Portal Agent Log Stream (tail agent.log)     
status bedrock           'status bedrock'          Bedrock Playit EXE & Tunnel Status                
status                   'status all'              Display Overview Table for All 3 Services & Ports 
--------------------------------------------------------------------------------------------------------
update agent             'update agent'            Pull Latest Agent from GitHub & Auto-Restart      
update server            'update server'           Pull Latest Server Configs & Shims from GitHub    
update scripts           'update scripts'          Pull Latest Shell & CLI Scripts from GitHub       
update all               'update all'              Update Everything from GitHub Repository          
--------------------------------------------------------------------------------------------------------
help                     'minecraft help'          Display this command reference guide              
========================================================================================================
```

---

## 🎮 CLI Quick Reference (Type anywhere in Termux)

| What You Want To Do | Command | What It Does |
| :--- | :--- | :--- |
| **Start Minecraft Only** | `minecraft localserver` (or `minecraft start`) | Launches Paper 1.21.4 server. Playit Java starts automatically inside plugin. |
| **Start Agent Only** | `minecraft agentstart` (or `minecraft agent`) | Launches the portal agent to sync with website panel. |
| **Start Bedrock Tunnel** | `minecraft bedrockstart` | Signals the Windows bridge to start the Bedrock Playit EXE. |
| **Start EVERYTHING** | `minecraft fullstart` | Starts Minecraft Paper Server + Bedrock Playit EXE + Agent in one go! |
| **Stop Minecraft** | `minecraft stop mc` | Gracefully sends `stop` via RCON, saves worlds cleanly, and exits. |
| **Stop Bedrock Tunnel** | `minecraft stop bedrock` | Stops the Playit Bedrock EXE on Windows. |
| **Stop Agent** | `minecraft stop agent` | Stops the KryinCraft portal agent cleanly. |
| **Stop EVERYTHING** | `minecraft fullstop` | Stops all 3 services immediately. |
| **View Minecraft Console** | `minecraft status mc` | Streams the live Minecraft server console in real-time (`tail -f`). Press `Ctrl+C` to return. |
| **View Agent Logs** | `minecraft status agent` | Streams live agent logs syncing with dashboard. |
| **Check Bedrock Status** | `minecraft status bedrock` | Shows Windows Playit daemon status, logs, and local UDP 19132 listener. |
| **High-level Status Table** | `minecraft status` | Shows an overview table of all 3 services, PIDs, and active ports. |

---

## 📂 Modular Scripts in Home Directory (`~`)

All scripts are located right in your Termux home directory (`~`):

| Script | Purpose |
| :--- | :--- |
| `~/localserver.sh` (or `~/localstart.sh`) | Starts Paper Minecraft server only. Includes duplicate-run detection and backgrounding. |
| `~/agentstart.sh` | Starts the Python agent (`~/kryin-agent/agent.py`). |
| `~/bedrockstart.sh` | Signals Windows host to start `playitd.exe` for Bedrock. |
| `~/fullstart.sh` | Orchestrates starting Minecraft, Bedrock Playit EXE, and the Agent. |
| `~/stop-mc.sh` (or `~/stop-minecraft.sh`) | Gracefully shuts down Minecraft via RCON/SIGTERM, ensuring chunk & player saves. |
| `~/stop-bedrock.sh` (or `~/stop-playitbedrock.sh`) | Signals Windows host to stop `playitd.exe`. |
| `~/stop-agent.sh` | Stops the agent process. |
| `~/fullstop.sh` | Stops Minecraft, Bedrock Playit, and Agent in sequence. |
| `~/status.sh [mc\|agent\|bedrock\|all]` | Inspects services and streams live logs. |

You can run them directly anytime:
```bash
~/fullstart.sh
~/stop-mc.sh
~/status.sh
```

---

## 🖥️ Playit Bedrock Windows Daemon & Bridge

For Bedrock Edition, Playit runs as an official Windows 64-bit binary (`playitd.exe`) forwarding UDP RakNet traffic from `molecule-edition.tun.ply.gg:41715` to Indian Node (`192.168.0.164:19132`).

- **Location on Windows:** `tools\playit\`
- **Start Service:** Double-click `tools\playit\start-service.bat`
  *(Runs a lightweight local HTTP controller on port 8089 that responds to Indian Node commands)*
- **Stop Service:** Double-click `tools\playit\stop-playit.bat`

When you type `minecraft fullstart` or `minecraft bedrockstart` on your phone, Indian Node communicates directly with the Windows Bridge (`192.168.0.51:8089`) to launch or stop the daemon automatically!

---

## 🌐 Public Connection Addresses

| Platform | Address | Port | Notes |
| :--- | :--- | :--- | :--- |
| **Java Edition** (PC / Mac / Linux / Pojav) | `molecule-two.tun.ply.gg` | `25565` (Default) | Built into Paper plugin (`playit.jar`) with auto-SRV lookup |
| **Bedrock Edition (Internet Players)** | `molecule-edition.tun.ply.gg` | `19132` | Playit NetherNet NXS tunnel (Floodgate enabled, no Java account needed!) |
| **Local Wi-Fi (Java)** | `192.168.0.164` | `25565` | Direct LAN connection for devices on home Wi-Fi |
| **Local Wi-Fi (Bedrock)** | `192.168.0.164` | `19132` | Direct LAN connection for devices on home Wi-Fi |
| **Web Dashboard** | `https://kryincraftpanel.vercel.app` | - | Real-time Pterodactyl-parity control panel |

### ⚠️ Important Note on Bedrock Ports & Local IP:
- **Local IP (`192.168.0.164`):** In Playit's dashboard, `192.168.0.164` is the Indian Node's actual LAN IP on your home Wi-Fi. (Never use `192.168.0.1` because that is your home router, not your phone!).
- **Bedrock Port in Minecraft Client:**
  - When playing from **outside your house (friends/mobile data)**: Enter Server Address `molecule-edition.tun.ply.gg` and Port **`19132`**.
  - When playing from **inside your house (same Wi-Fi)**: Enter Server Address `192.168.0.164` and Port `19132`.
- **Floodgate & NetherNet:**  
  Floodgate is installed so Bedrock players can join directly without needing a Java Edition account. Geyser is pre-configured with Playit's NXS signaling:
  ```yaml
  signaling:
    mode: nxs
    nxs:
      endpoint: "https://nethernet.playit.gg"
      token: "pnx1.5125431.4QRi-m5aMzsMCdmgxqWwQF6oYjes4SbqhuVg1g6unHY"
      assisted-joins: true
  ```
  Native Android compatibility is provided via our optimized Bionic-Musl ABI shim (`libc.musl-aarch64.so.1`).
