# KryinCraftPanel 🎮📱

> Ultralight, secure, mobile-first Minecraft server management panel for **Paper 26.3** running on **Indian Node** under Android & Termux.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Paper](https://img.shields.io/badge/Paper-26.3%20%23249-1e293b?style=flat)](https://papermc.io/)
[![Geyser](https://img.shields.io/badge/Geyser--Spigot-2.12.1-22c55e?style=flat)](https://geysermc.org/)

---

## 🌟 Overview & Architecture

**KryinCraftPanel** decouples the heavy web interface from the resource-constrained mobile node environment:

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Frontend                      │
│        Next.js App Router (Mobile-First UI)            │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Cloud                       │
│    PostgreSQL • Auth • RLS • Edge Functions Queue      │
└───────────────────────────▲────────────────────────────┘
                            │ Outbound HTTPS Polling
                            │ (No inbound ports opened)
┌───────────────────────────┴────────────────────────────┐
│              Indian Node (Android / Termux)            │
│                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │ Termux Agent (Python3)  │  │ Paper 26.3 Server   │  │
│  │  - Outbound Polling     │◄─┤  - Java 25 (-Xmx4G) │  │
│  │  - Local RCON Control   │─►│  - Geyser-Spigot    │  │
│  │  - Hardware Telemetry   │  │  - Port 25565 /19132│  │
│  └─────────────────────────┘  └─────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- **Zero heavy runtimes on node:** No Node.js, Next.js, Docker, or databases on Indian Node. Standard Python3 and Java 25 standard libraries and Termux shell utilities only.
- **Outbound-only security:** The node agent communicates with Supabase exclusively via outbound HTTPS requests. The web panel never attempts to connect directly to the node's private IP.
- **Safe Process Management:** Graceful server stop and restart via local RCON (`127.0.0.1:25575`). Single-instance lockfile protection prevents duplicate Paper processes.
- **Dual-protocol network:** Java Edition on TCP `25565`, Bedrock Edition on UDP `19132` via Geyser-Spigot (with NetherNet WebRTC and RakNet dual transport support).

---

## 📱 Hardware & Environment Target

| Property | Value |
| :--- | :--- |
| **Node Name** | Indian Node |
| **Architecture** | 64-bit ARM (`aarch64`, user `u0_a311`) |
| **Operating System** | Android 13 with Termux |
| **Java Runtime** | OpenJDK 25.0.3 |
| **Minecraft Server** | Paper 26.3 (Build #249) |
| **Heap Allocation** | `-Xms1G -Xmx4G` |
| **Cross-play Engine** | Geyser-Spigot 2.12.1-b1302 (NetherNet + RakNet) |
| **Server Directory** | `~/minecraft/server` |
| **Agent Directory** | `~/kryin-agent` |

---

## 🎮 CLI & Node Management

The node includes a unified command suite in Termux:

| Command | Action |
| :--- | :--- |
| **`localserver`** | Starts only Paper Minecraft server (with built-in Playit Java tunnel) |
| **`agentstart`** | Starts the KryinCraft Portal Agent |
| **`bedrockstart`** | Starts the Bedrock Playit daemon |
| **`fullstart`** | Starts everything (Paper + Bedrock Playit + Agent) in one go |
| **`stop mc`** | Gracefully stops Paper via RCON, saves worlds cleanly, and exits |
| **`stop bedrock`**| Stops Bedrock Playit daemon |
| **`stop agent`** | Stops the KryinCraft Portal Agent |
| **`fullstop`** | Stops all running services |
| **`status [mc\|agent\|bedrock]`** | Displays live stream of console or agent logs |
| **`update [all\|agent\|server\|scripts]`** | Pulls latest updates directly from GitHub without manual curl |
| **`minecraft`** | Displays the full command reference menu |

---

## 🌐 Connection Endpoints

| Platform | Server Address | Port | Protocol | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Java Edition** | `molecule-two.tun.ply.gg` | `25565` | TCP | Paper plugin with auto-SRV lookup |
| **Bedrock Edition (External)** | `molecule-edition.tun.ply.gg` | `41715` | UDP | Public Playit tunnel (Do NOT use 19132) |
| **LAN Java** | `192.168.0.164` | `25565` | TCP | Home Wi-Fi direct connection |
| **LAN Bedrock** | `192.168.0.164` | `19132` | UDP | Home Wi-Fi direct connection |
| **Web Dashboard** | `https://kryincraftpanel.vercel.app` | - | HTTPS | Real-time Pterodactyl-parity control panel |

---

## 🖥️ Website Features & Routes

- **`/login`** — Supabase authentication, session persistence, role checks.
- **`/dashboard`** — Real-time server telemetry, TPS meter, uptime, honest hardware monitoring (Total RAM vs Java Heap distinction, CPU load, thermal readings), and SVG history charts.
- **`/dashboard/control`** — Safe start, stop, and restart controls with confirmation modals and lockfile protection.
- **`/dashboard/console`** — Live Minecraft console output, authorized command execution, quick command shortcuts, auto-scroll, and pause/resume.
- **`/dashboard/logs`** — Server log inspector with severity filters (`INFO`, `WARN`, `ERROR`, `DEBUG`), search, and `latest.log` download.
- **`/dashboard/players`** — Online/offline player rosters, Crafatar avatar rendering, coordinates, health, and quick actions.
- **`/dashboard/players/[uuid]`** — Comprehensive player manager: health/hunger/saturation, XP levels, equipment & 3x9 inventory viewer, live controls (Heal, Feed, Kill, Gamemode, Teleport, Kick, Ban, OP), and lifetime statistics.
- **`/dashboard/access`** — Role-based access control (`Owner`, `Admin`, `Operator`, `Viewer`), granular permission matrix, invite links, and tamper-evident audit logs.
- **`/dashboard/files`** — Web file manager strictly restricted to `~/minecraft/server` with path traversal guards and in-browser config editor.
- **`/dashboard/connections`** — Java (TCP 25565) and Bedrock (UDP 19132) connection endpoints, tunnel configs, and local direct LAN addresses.
- **`/dashboard/settings`** — Server properties tuning, agent polling interval adjustments for thermal efficiency, and token management.

---

## 🚀 Local Development

```bash
# Clone the repository
git clone https://github.com/Kryin-Labs/KryinCraftPanel.git
cd KryinCraftPanel

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
