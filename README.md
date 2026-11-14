# KryinCraftPanel 🎮📱

> Ultralight, secure, mobile-first Minecraft server management panel for **Paper 26.3** running on an **ASUS ROG Phone 5s** under Android 13 & Termux.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Paper](https://img.shields.io/badge/Paper-26.3%20%23249-1e293b?style=flat)](https://papermc.io/)
[![Geyser](https://img.shields.io/badge/Geyser--Spigot-2.12.1-22c55e?style=flat)](https://geysermc.org/)

---

## 🌟 Overview & Architecture

**KryinCraftPanel** decouples the heavy web interface from the resource-constrained phone environment:

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
│      ASUS ROG Phone 5s (Android 13 / Termux)           │
│                                                        │
│  ┌─────────────────────────┐  ┌─────────────────────┐  │
│  │ Termux Agent (Java/sh)  │  │ Paper 26.3 Server   │  │
│  │  - Outbound Polling     │◄─┤  - Java 25 (-Xmx4G) │  │
│  │  - Local RCON Control   │─►│  - Geyser-Spigot    │  │
│  │  - Hardware Telemetry   │  │  - Port 25565 /19132│  │
│  └─────────────────────────┘  └─────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

- **Zero heavy runtimes on phone:** No Node.js, Next.js, Docker, or databases on the ROG Phone 5s. Standard Java 25 standard libraries and Termux shell utilities only.
- **Outbound-only security:** The phone agent communicates with Supabase exclusively via outbound HTTPS requests. The web panel never attempts to connect directly to the phone's private IP.
- **Safe Process Management:** Graceful server stop and restart via local RCON (`127.0.0.1:25575`). Single-instance lockfile protection prevents duplicate Paper processes.
- **Dual-protocol network:** Java Edition on TCP `25565`, Bedrock Edition on UDP `19132` via Geyser-Spigot.

---

## 📱 Hardware & Environment Target

| Property | Value |
| :--- | :--- |
| **Device** | ASUS ROG Phone 5s |
| **Processor** | Qualcomm Snapdragon 888 (8 cores) |
| **System RAM** | 12 GB LPDDR5 |
| **Android Version** | Android 13 |
| **Environment** | Termux (`aarch64`, user `u0_a311`) |
| **Java** | OpenJDK 25.0.3 |
| **Minecraft Server** | Paper 26.3 (Build #249) |
| **Heap Allocation** | `-Xms1G -Xmx4G` |
| **Cross-play** | Geyser-Spigot 2.12.1-b1302 |
| **Server Root** | `~/minecraft/server` |

---

## 🖥️ Website Features & Routes

- **`/login`** — Supabase authentication, session persistence, role checks.
- **`/dashboard`** — Real-time server telemetry, TPS meter, uptime, honest hardware monitoring (Total Phone RAM vs Java Heap distinction, Snapdragon 888 CPU load, thermal readings, bypass battery charge metrics), and SVG history charts.
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
git clone https://github.com/ArthOfficial/KryinCraftPanel.git
cd KryinCraftPanel

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📋 Development Roadmap

- [x] **Phase 1: Repository Setup & UI Architecture** (All responsive pages, mobile navigation, dark charcoal theme, interactive mock store)
- [ ] **Phase 2: Supabase Schema & Row Level Security** (PostgreSQL tables, RLS policies, Auth integration)
- [ ] **Phase 3: Backend Edge Functions & Command Queue** (Encrypted agent tokens, polling queue, audit logger)
- [ ] **Phase 4: Ultralight Termux Agent** (Java 25 outbound polling agent, RCON bridge, thermal monitor)
- [ ] **Phase 5: Minecraft Integration & Testing** (Live Paper companion telemetry, inventory sync)
- [ ] **Phase 6: Vercel Production Deployment**
