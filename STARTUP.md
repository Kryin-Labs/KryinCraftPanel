# 🚀 KryinCraft Indian Node — Server Startup Guide

This guide explains how to start everything after restarting your phone or opening a fresh Termux session.

---

## ⚡ Quick 30-Second Startup (Cheat Sheet)

Open Termux on your phone and run these commands:

```bash
# 1. Prevent Android from sleeping in background
termux-wake-lock

# 2. (Optional) Start SSH to connect from your PC PowerShell
sshd

# 3. Start the Portal Agent (communicates with website)
nohup python ~/kryin-agent/agent.py > ~/agent.log 2>&1 &

# 4. Start the Playit.gg Global Public Tunnel
nohup playitd > ~/playit.log 2>&1 &
```

> **Now open your Web Dashboard (`https://kryincraftpanel.vercel.app`) and click "Start Game"!**  
> Or start it directly in Termux with: `bash ~/minecraft/server/run.sh &`

---

## 📖 Detailed Step-by-Step Instructions

### Step 1: Prevent Android Sleep
Android aggressively kills background apps unless wake lock is active.
```bash
termux-wake-lock
```
*(You will see a Termux key icon in your Android notification shade).*

---

### Step 2: (Optional) Connect from PC PowerShell via SSH
If you want to control your phone from your Windows PC terminal instead of typing on your phone keyboard:

1. In Termux, start the SSH server:
   ```bash
   sshd
   ```
2. Find your phone's Wi-Fi IP in Termux:
   ```bash
   ip -4 addr show wlan0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'
   ```
   *(Usually `192.168.0.164`)*
3. On your Windows PC, open PowerShell and connect:
   ```powershell
   ssh -p 8022 u0_a311@192.168.0.164
   ```
   *(Enter your password when prompted: `334001`)*

---

### Step 3: Start the KryinCraft Portal Agent
The agent connects your Indian Node to the web panel, reporting live RAM, CPU, player count, and executing panel commands (Start, Stop, Save Files).

```bash
nohup python ~/kryin-agent/agent.py > ~/agent.log 2>&1 &
```

* **To verify it is running:**
  ```bash
  pgrep -a python
  ```
* **To view live agent logs:**
  ```bash
  tail -f ~/agent.log
  ```

---

### Step 4: Start the Playit.gg Public Tunnel
This provides your global public domain (`scooter-stuffing.tun.ply.gg:25565`) so players anywhere in the world can connect without port forwarding.

```bash
nohup playitd > ~/playit.log 2>&1 &
```

* **To verify tunnel is running:**
  ```bash
  pgrep -a playitd
  ```
* **To view tunnel logs:**
  ```bash
  tail -f ~/playit.log
  ```

---

### Step 5: Start the Minecraft Server

You have two ways to start the server:

#### Option A: From the Web Dashboard (Recommended)
1. Go to your dashboard: **[https://kryincraftpanel.vercel.app/dashboard](https://kryincraftpanel.vercel.app/dashboard)**
2. Click **Start Game**.
3. The card turns **Grey** with an animated loader showing `STARTING UP...`.
4. It will automatically wait until Paper finishes booting and turns **Green (Online)**.

#### Option B: Directly from Termux
```bash
cd ~/minecraft/server && nohup bash run.sh > logs/terminal.log 2>&1 &
```

---

## 🛠️ Helpful Status & Diagnostic Commands

| What you want to check | Termux Command |
| :--- | :--- |
| **Check if all 3 processes are running** | `pgrep -a "python\|playitd\|java"` |
| **Check Minecraft live console logs** | `tail -f ~/minecraft/server/logs/latest.log` |
| **Stop Minecraft server** | `pkill -f "paper.*\.jar\|server\.jar"` |
| **Stop Agent** | `pkill -f agent.py` |
| **Stop Playit tunnel** | `pkill -f playitd` |
| **Check free RAM on phone** | `free -m` |

---

## 🌟 Pro-Tip: 1-Click All-in-One Startup Script

You can create a single script that starts everything in 1 second. Run this once in Termux to create it:

```bash
cat << 'EOF' > ~/start-all.sh
#!/bin/bash
termux-wake-lock
sshd
pkill -f agent.py
pkill -f playitd
nohup python ~/kryin-agent/agent.py > ~/agent.log 2>&1 &
nohup playitd > ~/playit.log 2>&1 &
echo "[✓] Wake-lock, SSH, Agent, and Playit started!"
echo "[✓] You can now click Start Game on your website panel."
EOF
chmod +x ~/start-all.sh
```

Next time you restart your phone or Termux, simply type:
```bash
bash ~/start-all.sh
```

**Now you and your friends can join the server! :)**
