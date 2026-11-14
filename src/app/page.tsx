'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  HardDrive,
  Cpu,
  Terminal,
  Users,
  Check,
  Radio,
  ChevronDown,
  Plug,
  Clock,
  Sparkles,
  Copy,
  CheckCheck,
  FileCode,
  Folder,
  File,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* File Structure Data for "Your software factory, defined in code"    */
/* ------------------------------------------------------------------ */

interface CodeFile {
  name: string;
  type: 'file' | 'folder';
  language: string;
  content: string;
  lines: number;
}

const FILE_ITEMS: CodeFile[] = [
  {
    name: 'server.properties',
    type: 'file',
    language: 'properties',
    lines: 12,
    content: `# KryinHost Server Configuration (Indian Datacenter)
server-port=25565
query.port=25565
enable-rcon=true
rcon.port=25575
motd=\\u00a7bKryin Server \\u00a78[\\u00a7aIndian Node 01\\u00a78]
difficulty=hard
gamemode=survival
max-players=40
online-mode=true
auto-sleep.enabled=true
auto-sleep.idle-timeout-minutes=5
auto-wake.port-listen=25565,19132`,
  },
  {
    name: 'paper-global.yml',
    type: 'file',
    language: 'yaml',
    lines: 14,
    content: `# Paper 26.3 Global Optimization Engine
_version: 29
timings:
  enabled: true
  verbose: true
chunk-loading:
  min-load-radius: 2
  max-concurrent-loads: 8
tick-rates:
  sensor:
    villager:
      secondarypoisensor: 40
collisions:
  enable-player-collisions: true
async-chunks:
  threads: -1`,
  },
  {
    name: 'geyser.yml',
    type: 'file',
    language: 'yaml',
    lines: 13,
    content: `# GeyserBridge Crossplay Configuration (Bedrock & Console)
bedrock:
  address: 0.0.0.0
  port: 19132
  clone-remote-port: false
  motd1: "KryinHost Console Crossplay"
  motd2: "PlayStation / Xbox / Switch / Mobile"
remote:
  address: 127.0.0.1
  port: 25565
  auth-type: floodgate
floodgate:
  key-file: key.pem`,
  },
  {
    name: 'auto-sleep.json',
    type: 'file',
    language: 'json',
    lines: 11,
    content: `{
  "policy": "smart-eco-sleep",
  "idleTimeoutSeconds": 300,
  "hibernateOnEmpty": true,
  "wakeOnConnection": true,
  "wakeTimeSecondsTarget": 90,
  "preserveWorldState": true,
  "flushChunksOnSleep": true,
  "region": "ap-south-mumbai",
  "nodeId": "in-mumbai-01"
}`,
  },
];

/* ------------------------------------------------------------------ */
/* RAM Plans Data (No Free Plan)                                      */
/* ------------------------------------------------------------------ */

const RAM_PLANS = [
  {
    ram: '4 GB',
    price: 600,
    vCpu: '2 vCPU Cores',
    storage: '40 GB NVMe',
    slots: '20+ Players',
    idealFor: 'Small SMPs, vanilla survival with friends, zero lag.',
    badge: 'Starter Node',
    highlight: false,
    features: [
      'Indian Hosted Node (Mumbai / Delhi)',
      'Fast · No Lag (20.0 Stable TPS)',
      'Console Ready (Bedrock + Java)',
      'Smart Auto-Sleep (No 24/7 idle waste)',
      'Auto-Wake on player join (<2 mins)',
      'Paper 26.3 & Purpur Optimized',
      'Full Web Console & SFTP Access',
      'Daily Automated Backups',
    ],
  },
  {
    ram: '6 GB',
    price: 800,
    vCpu: '2 vCPU Cores (Boosted)',
    storage: '60 GB NVMe',
    slots: '35+ Players',
    idealFor: 'Active SMPs with plugins, community survival, and shops.',
    badge: 'Most Popular',
    highlight: true,
    features: [
      'Indian Hosted Node (Lowest Ping)',
      'Fast · No Lag (20.0 Stable TPS)',
      'Console Ready (Xbox, PS, Switch, Mobile)',
      'Smart Auto-Sleep (No 24/7 idle waste)',
      'Auto-Wake on player join (<2 mins)',
      'Full Plugin Support (Geyser, Essentials)',
      'Full Web Console & SFTP Access',
      'Daily Automated Backups',
    ],
  },
  {
    ram: '10 GB',
    price: 1000,
    vCpu: '3 vCPU Cores',
    storage: '100 GB NVMe',
    slots: '60+ Players',
    idealFor: 'Large SMPs, Towny, Economy, and heavier modpacks.',
    badge: 'Power Node',
    highlight: false,
    features: [
      'Indian Hosted High-Speed Node',
      'Fast · No Lag Priority Execution',
      'Console Ready (Bedrock & Java)',
      'Smart Auto-Sleep & Auto-Wake (<2 mins)',
      'Modpack & Heavy Plugin Ready',
      'Free MySQL Database Included',
      'Offsite Automated Cloud Backups',
      'Priority Support',
    ],
  },
  {
    ram: '12 GB',
    price: 1500,
    vCpu: '4 vCPU High-Clock Cores',
    storage: '150 GB NVMe',
    slots: 'Unlimited Players',
    idealFor: 'Heavy Forge modpacks (ATM9, Create) & large public networks.',
    badge: 'Extreme SMP',
    highlight: false,
    features: [
      'Maximum Dedicated CPU Priority',
      'Heavy Modpacks (ATM9, Create, Cobblemon)',
      'Console Ready (Crossplay Built-in)',
      'Smart Auto-Sleep & Auto-Wake (<2 mins)',
      'Zero Tick-Lag Guarantee',
      'Hourly Automated Snapshot Restores',
      'Dedicated IP Available',
      'Full SFTP & MySQL Access',
    ],
  },
];

/* ------------------------------------------------------------------ */
/* FAQ Data                                                           */
/* ------------------------------------------------------------------ */

const FAQ = [
  {
    q: 'how does server auto-sleep and wake work?',
    a: 'To keep hosting affordable and eliminate 24/7 idle power waste, servers enter an automatic low-power sleep state when all players disconnect. As soon as any player connects to your server address (or you click Wake in your web dashboard), the server automatically boots up and resumes the world in under 2 minutes with all progress, inventories, and builds 100% saved.',
  },
  {
    q: 'where are the servers hosted?',
    a: 'All our nodes are hosted in top Indian datacenters (Mumbai / Delhi), giving players across India, South Asia, and nearby regions ultra-fast routing, stable 20.0 TPS, and minimal ping.',
  },
  {
    q: 'can console and mobile players join (console ready)?',
    a: 'Yes. Every server comes with Geyser and Floodgate pre-configured. Players on Bedrock (PlayStation, Xbox, Nintendo Switch, iOS, Android, and Windows) connect via port 19132 and play together with Java edition players on port 25565.',
  },
  {
    q: 'can i upload my existing minecraft world or plugins?',
    a: 'Yes. You have full access to our web-based file manager and SFTP. You can simply drag and drop your existing singleplayer world folder, datapacks, or plugin jars into your server directory.',
  },
  {
    q: 'can i upgrade my ram plan later?',
    a: 'Yes. You can upgrade between 4GB (₹600), 6GB (₹800), 10GB (₹1,000), and 12GB (₹1,500) anytime with a single click. Your world files, configs, and player inventories remain completely intact.',
  },
];

/* ------------------------------------------------------------------ */
/* Main Warp-Replicated Page Component                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const selectedFile = FILE_ITEMS[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div data-ds="warp-next" className="w-page w-homepage bg-white text-[#1a1522] min-h-screen">
      {/* ===== Top Navigation (Warp w-topnav) ===== */}
      <nav className="w-topnav" aria-label="Primary">
        <div className="w-topnav-bar">
          <div className="w-wrap w-topnav-wrap flex items-center justify-between">
            <Link className="w-topnav-logo flex items-center gap-2" aria-label="KryinHost home" href="/">
              <div className="flex size-7 items-center justify-center rounded bg-[#1a1522] text-white">
                <Server className="size-4" />
              </div>
              <span className="font-bold text-[16px] tracking-tight text-[#1a1522]">KryinHost</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-[#1a1522]/20 text-[#1a1522]/70 font-semibold">
                IN
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-[14px] text-[#1a1522]/80 font-medium">
              <Link href="#code" className="hover:text-[#1a1522] transition-colors">Server as Code</Link>
              <Link href="#measurement" className="hover:text-[#1a1522] transition-colors">Measurement</Link>
              <Link href="#control" className="hover:text-[#1a1522] transition-colors">Control Plane</Link>
              <Link href="#plans" className="hover:text-[#1a1522] transition-colors font-semibold">Plans & Pricing</Link>
              <Link href="#faq" className="hover:text-[#1a1522] transition-colors">FAQ</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[13px] font-medium text-[#1a1522]/80 hover:text-[#1a1522] transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="#plans"
                className="w-btn w-btn-solid text-[13px] font-semibold"
                style={{ background: '#eef17c', color: '#1a1522' }}
              >
                Deploy Server
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section (The software factory infrastructure platform) ===== */}
      <section className="w-hero">
        <div className="w-wrap">
          <div className="w-hero-body pt-12 pb-6 text-center">
            <div className="w-hero-head max-w-4xl mx-auto space-y-4">
              <h1 className="w-headline text-[38px] sm:text-[54px] md:text-[64px] font-bold tracking-tight text-[#1a1522] leading-[1.08]">
                The software factory infrastructure platform
              </h1>
              <p className="w-lead text-[16px] sm:text-[19px] text-[#1a1522]/70 max-w-2xl mx-auto leading-relaxed">
                build on Kryin: servers as code, any runtime or harness, with telemetry, auto-sleep, and Bedrock crossplay built in.
              </p>
              <div className="w-hero-actions pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="#plans"
                  className="w-btn w-btn-solid font-semibold px-6 py-3 rounded text-[14px]"
                  style={{ background: '#1a1522', color: '#ffffff' }}
                >
                  deploy server (from ₹600)
                </Link>
                <Link
                  href="#code"
                  className="w-btn w-btn-outline font-medium px-5 py-3 rounded text-[14px] border border-[#1a1522]/20 text-[#1a1522] hover:bg-[#1a1522]/5"
                >
                  explore configuration
                </Link>
              </div>
            </div>
          </div>

          {/* Hero Media Figure (28-Column Node Grid Mockup) */}
          <div className="w-hero-media max-w-5xl mx-auto mt-6">
            <figure className="w-fig border border-[#1a1522]/15 rounded-lg overflow-hidden bg-white shadow-sm">
              <figcaption className="w-fig-bar flex items-center justify-between px-4 py-2.5 bg-[#f6f5fb] border-b border-[#1a1522]/10 text-[12px] font-mono text-[#1a1522]/70">
                <span className="w-fig-caption font-semibold">[ fig. 1 — the server cluster ]</span>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Indian Datacenter Nodes · Mumbai & Delhi Online
                </span>
              </figcaption>
              <div className="w-fig-well p-5 bg-[#fafafc]">
                <div className="w-fig-figure">
                  <div className="w-fig-body space-y-3">
                    <div className="w-fig-meta flex items-center justify-between text-[11px] font-mono text-[#1a1522]/60 border-b border-[#1a1522]/10 pb-2">
                      <span>[ fig. t4 · the factory cluster ]</span>
                      <span>8 × 28 · live telemetry · 20.0 TPS</span>
                    </div>

                    {/* Interactive 28-column grid representing active server instances / ticks */}
                    <div className="w-fig-plane grid grid-cols-14 sm:grid-cols-28 gap-1 py-2">
                      {Array.from({ length: 56 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-6 rounded-xs flex items-center justify-center text-[9px] font-mono transition-all hover:scale-110 cursor-pointer"
                          style={{
                            background:
                              i === 12 || i === 24 || i === 38
                                ? '#38bdf8'
                                : i % 5 === 0
                                ? '#22c55e'
                                : '#e8e7ee',
                            color: i % 5 === 0 || i === 12 || i === 24 ? '#fff' : '#1a1522',
                          }}
                          title={`Node shard #${i + 1}: Active (20.0 TPS, <18ms)`}
                        >
                          ▩
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#1a1522]/70 pt-2 border-t border-[#1a1522]/10">
                      <span>Address: play.kryin.gg (Java: 25565, Bedrock: 19132)</span>
                      <span className="font-semibold text-emerald-700">Stable 20.0 TPS · Zero Lag</span>
                    </div>
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ===== SECTION: Your software factory, defined in code. ===== */}
      <section id="code" className="w-section py-16 border-t border-[#1a1522]/15">
        <div className="w-wrap max-w-5xl mx-auto px-4 sm:px-6">
          <div className="w-section-heading mb-8 space-y-2">
            <h2 className="w-headline text-[32px] sm:text-[40px] font-bold text-[#1a1522] tracking-tight">
              Your software factory, defined in code.
            </h2>
            <p className="w-lead text-[16px] text-[#1a1522]/70 max-w-2xl leading-relaxed">
              Factories-as-code allows for a versioned and measured approach to optimizing costs and performance of your factories.
            </p>
          </div>

          {/* Interactive File Structure View (Exact Warp w-code component) */}
          <div className="w-section-content">
            <div className="w-code border border-[#1a1522]/15 rounded-lg overflow-hidden bg-white shadow-sm flex flex-col md:flex-row min-h-[380px]">
              {/* Left File Tree Navigation */}
              <nav className="w-code-tree md:w-64 border-r border-[#1a1522]/15 bg-[#f6f5fb] p-3 shrink-0" aria-label="Files">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1a1522]/50 px-2 py-1 mb-1">
                  Server Tree
                </p>
                <ul className="space-y-1 font-mono text-[13px]">
                  {FILE_ITEMS.map((item, idx) => (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => setSelectedFileIndex(idx)}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition-all ${
                          selectedFileIndex === idx
                            ? 'bg-[#1a1522] text-white font-semibold'
                            : 'text-[#1a1522]/80 hover:bg-[#1a1522]/10'
                        }`}
                      >
                        <FileCode className="size-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{item.name}</span>
                      </button>
                    </li>
                  ))}

                  <li className="pt-2 text-[12px] text-[#1a1522]/50 px-2 flex items-center gap-1.5">
                    <Folder className="size-3.5" />
                    <span>plugins/</span>
                  </li>
                  <li className="text-[11px] text-[#1a1522]/70 pl-6 space-y-1">
                    <p>• Geyser-Spigot.jar</p>
                    <p>• Floodgate.jar</p>
                    <p>• ViaVersion.jar</p>
                  </li>

                  <li className="pt-2 text-[12px] text-[#1a1522]/50 px-2 flex items-center gap-1.5">
                    <Folder className="size-3.5" />
                    <span>world/</span>
                  </li>
                  <li className="text-[11px] text-[#1a1522]/70 pl-6">
                    <p>• playerdata/ & stats/</p>
                  </li>
                </ul>
              </nav>

              {/* Right Code Pane with Syntax Styling */}
              <div className="w-code-pane flex-1 flex flex-col bg-[#ffffff]">
                <div className="w-code-bar flex items-center justify-between px-4 py-2.5 bg-[#fbf9fe] border-b border-[#1a1522]/10 text-[12px] font-mono text-[#1a1522]/70">
                  <span className="w-code-path font-bold text-[#1a1522]">{selectedFile.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] uppercase tracking-wider">{selectedFile.language}</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="p-1 rounded hover:bg-[#1a1522]/10 text-[#1a1522]/70 transition-colors"
                      title="Copy contents"
                    >
                      {copied ? <CheckCheck className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="w-code-body p-4 font-mono text-[12px] sm:text-[13px] leading-relaxed overflow-x-auto flex-1 bg-[#ffffff]">
                  <pre className="text-[#1a1522]">
                    <code>
                      {selectedFile.content.split('\n').map((line, lineIdx) => (
                        <div key={lineIdx} className="flex gap-4">
                          <span className="w-6 text-right select-none text-[#1a1522]/30">{lineIdx + 1}</span>
                          <span className={line.startsWith('#') ? 'text-[#1a1522]/50 italic' : line.includes('=') ? 'text-blue-700' : 'text-[#1a1522]'}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* 4 Numbered Navigation Markers Under Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                {
                  n: '01',
                  label: 'Server definition',
                  desc: 'The shared foundation for your server. Defines ports (25565), MOTD, max players, and game rules.',
                },
                {
                  n: '02',
                  label: 'Paper 26.3 Engine',
                  desc: 'High single-thread clock execution and optimized chunk rendering for a stable 20.0 TPS with zero lag.',
                },
                {
                  n: '03',
                  label: 'Console Crossplay',
                  desc: 'Geyser & Floodgate bridge allowing Bedrock clients on Xbox, PlayStation, Switch, iOS & Android to join.',
                },
                {
                  n: '04',
                  label: 'Smart Auto-Sleep',
                  desc: 'Low-power sleep mode when empty; wakes automatically in under 2 minutes when players join (no 24/7 idle drain).',
                },
              ].map((item) => (
                <div key={item.n} className="p-4 rounded-lg border border-[#1a1522]/15 bg-[#fbf9fe] space-y-1.5">
                  <span className="font-mono text-xs font-bold text-[#1a1522]/40">{item.n}</span>
                  <h4 className="font-bold text-[14px] text-[#1a1522]">{item.label}</h4>
                  <p className="text-[12px] text-[#1a1522]/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION: Baked-in measurement and self-improvement ===== */}
      <section id="measurement" className="w-section py-16 bg-[#f6f5fb] border-t border-[#1a1522]/15">
        <div className="w-wrap max-w-5xl mx-auto px-4 sm:px-6">
          <div className="w-section-heading mb-8 space-y-2">
            <h2 className="w-headline text-[32px] sm:text-[40px] font-bold text-[#1a1522] tracking-tight">
              Baked-in measurement and self-improvement
            </h2>
            <p className="w-lead text-[16px] text-[#1a1522]/70 max-w-2xl leading-relaxed">
              evals, benchmarks, and self-improvement loops drive measurable gains.
            </p>
          </div>

          <div className="w-section-content">
            <figure className="w-fig border border-[#1a1522]/15 rounded-lg overflow-hidden bg-white shadow-sm">
              <figcaption className="w-fig-bar flex items-center justify-between px-4 py-2.5 bg-[#fbf9fe] border-b border-[#1a1522]/10 text-[12px] font-mono text-[#1a1522]/70">
                <span className="w-fig-caption">[ fig. 2 · telemetry loop · live instance ]</span>
                <span className="text-[11px] text-emerald-600 font-bold">100% TICK FIDELITY</span>
              </figcaption>

              <div className="w-fig-well p-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Metric 1 */}
                  <div className="p-4 rounded-lg border border-[#1a1522]/15 bg-[#fafafc] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#1a1522]/60 uppercase">TPS Stability</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">PASS</span>
                    </div>
                    <p className="text-[28px] font-mono font-bold text-[#1a1522]">20.0 TPS</p>
                    <p className="text-[12px] text-[#1a1522]/70">0.0% tick drop over last 24h</p>
                    <svg viewBox="0 0 200 30" className="w-full h-8 pt-2" aria-hidden>
                      <polyline
                        points="0,15 25,15 50,14 75,15 100,15 125,14 150,15 175,15 200,15"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-4 rounded-lg border border-[#1a1522]/15 bg-[#fafafc] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#1a1522]/60 uppercase">Memory Allocation</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">DEDICATED</span>
                    </div>
                    <p className="text-[28px] font-mono font-bold text-[#1a1522]">4GB – 12GB</p>
                    <p className="text-[12px] text-[#1a1522]/70">High-speed DDR4/DDR5 unthrottled</p>
                    <div className="w-full bg-[#1a1522]/10 rounded-full h-2 mt-4">
                      <div className="bg-[#1a1522] h-2 rounded-full w-[70%]" />
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 rounded-lg border border-[#1a1522]/15 bg-[#fafafc] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-[#1a1522]/60 uppercase">Subcontinent Ping</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">LOWEST</span>
                    </div>
                    <p className="text-[28px] font-mono font-bold text-[#1a1522]">&lt; 18ms</p>
                    <p className="text-[12px] text-[#1a1522]/70">Mumbai & Delhi direct fiber routing</p>
                    <div className="text-[11px] font-mono text-[#1a1522]/60 pt-3">
                      Tier 1 Indian peering points
                    </div>
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ===== SECTION: Control your coding agent chaos ===== */}
      <section id="control" className="w-section py-16 border-t border-[#1a1522]/15">
        <div className="w-wrap max-w-5xl mx-auto px-4 sm:px-6">
          <div className="w-section-heading mb-8 space-y-2">
            <h2 className="w-headline text-[32px] sm:text-[40px] font-bold text-[#1a1522] tracking-tight">
              Control your coding agent chaos
            </h2>
            <p className="w-lead text-[16px] text-[#1a1522]/70 max-w-2xl leading-relaxed">
              continuous improvement, better governance and security, by default.
            </p>
          </div>

          <div className="w-section-content">
            <figure className="w-fig border border-[#1a1522]/15 rounded-lg overflow-hidden bg-white shadow-sm">
              <figcaption className="w-fig-bar flex items-center justify-between px-4 py-2.5 bg-[#fbf9fe] border-b border-[#1a1522]/10 text-[12px] font-mono text-[#1a1522]/70">
                <span className="w-fig-caption">[ fig. 3 · control plane · player & server management ]</span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">ONLINE</span>
              </figcaption>

              <div className="w-fig-well p-6 bg-white space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Console Streaming */}
                  <div className="border border-[#1a1522]/15 rounded-lg p-4 bg-[#fbf9fe] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#1a1522]">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="size-4" /> Real-Time Console Stream
                      </span>
                      <span className="text-emerald-600">CONNECTED</span>
                    </div>
                    <div className="font-mono text-[11px] bg-[#1a1522] text-[#f3f4f6] p-3 rounded space-y-1">
                      <p className="text-emerald-400">[INFO] Paper 26.3 initialized (Build #249)</p>
                      <p className="text-blue-400">[INFO] Geyser-Spigot listening on 0.0.0.0:19132</p>
                      <p className="text-[#94a3b8]">[INFO] Auto-sleep monitoring active (idle: 0 players)</p>
                      <p className="text-yellow-400">[WARN] Standby armed: server will sleep after 5m empty</p>
                    </div>
                  </div>

                  {/* Player & Sleep Governance */}
                  <div className="border border-[#1a1522]/15 rounded-lg p-4 bg-[#fbf9fe] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-[#1a1522]">
                      <span className="flex items-center gap-1.5">
                        <Users className="size-4" /> Player & Sleep Governance
                      </span>
                      <span className="text-blue-600">CROSSPLAY</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded bg-white border border-[#1a1522]/10">
                        <span className="font-semibold text-[#1a1522]">NarcoGam3X (OP)</span>
                        <span className="text-[#1a1522]/60 font-mono">Java · 18ms · Survival</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-white border border-[#1a1522]/10">
                        <span className="font-semibold text-[#1a1522]">Steve_Console</span>
                        <span className="text-[#1a1522]/60 font-mono">Bedrock · Xbox · 24ms</span>
                      </div>
                      <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                        <b>Smart Sleep Active:</b> Server automatically sleeps when no players are connected. Wakes in &lt;2 mins upon connection.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </div>
      </section>

      {/* ===== SECTION: Use Warp everywhere (plans instead of this) ===== */}
      <section id="plans" className="w-section py-20 bg-[#fbf9fe] border-t border-[#1a1522]/15">
        <div className="w-wrap max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="w-section-heading text-center max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-mono font-bold text-[#1a1522]/60 uppercase tracking-wider">
              Indian Hosted Plans
            </span>
            <h2 className="w-headline text-[34px] sm:text-[44px] font-bold text-[#1a1522] tracking-tight">
              Use Warp everywhere (plans instead of this)
            </h2>
            <p className="w-lead text-[15px] text-[#1a1522]/70 leading-relaxed">
              High-speed Indian nodes. Fast, zero lag, console ready, with smart sleep architecture (no 24/7 idle power drain).
            </p>
          </div>

          {/* 4 Cards Grid (Warp w-cards layout) */}
          <ul className="w-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {RAM_PLANS.map((plan) => (
              <li
                key={plan.ram}
                className={`w-card border rounded-lg p-6 flex flex-col justify-between transition-all bg-white shadow-sm ${
                  plan.highlight
                    ? 'border-[#1a1522] ring-2 ring-[#1a1522]/10'
                    : 'border-[#1a1522]/15 hover:border-[#1a1522]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1a1522]/5 text-[#1a1522] border border-[#1a1522]/10">
                      {plan.badge}
                    </span>
                    {plan.highlight && (
                      <span className="text-[10px] font-bold uppercase text-emerald-700 flex items-center gap-1 font-mono">
                        <Sparkles className="size-3" /> Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="w-item-title text-[24px] font-bold text-[#1a1522] mt-2 font-mono">
                    {plan.ram} RAM
                  </h3>
                  <p className="w-item-body text-[12px] text-[#1a1522]/70 mt-1 min-h-[34px] leading-snug">
                    {plan.idealFor}
                  </p>

                  {/* Price */}
                  <div className="my-4 pb-4 border-b border-[#1a1522]/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold font-mono text-[#1a1522]">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs text-[#1a1522]/60 font-mono">/ month</span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="space-y-1.5 text-xs text-[#1a1522] mb-5 pb-5 border-b border-[#1a1522]/10 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#1a1522]/60">RAM:</span>
                      <span className="font-semibold">{plan.ram}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#1a1522]/60">vCPU:</span>
                      <span className="font-semibold">{plan.vCpu}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#1a1522]/60">NVMe:</span>
                      <span className="font-semibold">{plan.storage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#1a1522]/60">Slots:</span>
                      <span className="font-semibold">{plan.slots}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 text-[12px] text-[#1a1522]/80 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="size-3.5 text-[#1a1522] shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="w-card-action">
                  <Link
                    href="/login"
                    className={`w-btn w-full py-2.5 rounded text-xs font-bold text-center block transition-all ${
                      plan.highlight
                        ? 'w-btn-solid bg-[#1a1522] text-white hover:opacity-90'
                        : 'w-btn-outline border border-[#1a1522]/30 text-[#1a1522] hover:bg-[#1a1522]/5'
                    }`}
                  >
                    Deploy {plan.ram} Server
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Smart Sleep Notice */}
          <div className="max-w-3xl mx-auto rounded-lg border border-[#1a1522]/15 bg-white p-4 text-center text-[13px] text-[#1a1522]/70 space-y-1">
            <p>
              <b className="text-[#1a1522]">Smart Sleep Architecture:</b> To eliminate 24/7 idle power drain and keep hosting costs low, servers enter an automatic low-power sleep state when all players disconnect.
            </p>
            <p className="text-[12px] text-[#1a1522]/50">
              When any player connects to your address, the server wakes automatically in under 2 minutes with all world progress and inventories 100% saved.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION: Frequently asked questions ===== */}
      <section id="faq" className="w-section py-16 border-t border-[#1a1522]/15">
        <div className="w-wrap max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="w-section-heading text-center space-y-2">
            <h2 className="w-headline text-[32px] sm:text-[40px] font-bold text-[#1a1522] tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="w-faq-list space-y-3">
            {FAQ.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="w-faq-item border border-[#1a1522]/15 rounded-lg bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-faq-row w-full flex items-center justify-between p-4 text-left font-mono text-[14px] font-semibold text-[#1a1522] hover:bg-[#f6f5fb] transition-colors"
                  >
                    <span className="w-faq-q">{item.q}</span>
                    <span className="w-faq-toggle text-[12px] font-bold text-[#1a1522]/60">
                      {isOpen ? '[-]' : '[+]'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="w-faq-a p-4 border-t border-[#1a1522]/10 bg-[#fafafc] text-[13px] leading-relaxed text-[#1a1522]/70">
                      <div>{item.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Footer (Warp w-footer) ===== */}
      <footer className="w-footer border-t border-[#1a1522]/15 bg-[#f6f5fb] py-12 px-4 sm:px-6 text-[13px] text-[#1a1522]/60">
        <div className="w-wrap max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded bg-[#1a1522] text-white font-bold">
              <Server className="size-3.5" />
            </div>
            <span className="font-bold text-[14px] text-[#1a1522]">KryinHost</span>
            <span>·</span>
            <span>Indian Game Server Infrastructure</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] font-mono text-[#1a1522]/70">
            <Link href="#plans" className="hover:text-[#1a1522] transition-colors">Plans</Link>
            <Link href="#code" className="hover:text-[#1a1522] transition-colors">Configuration</Link>
            <Link href="/login" className="hover:text-[#1a1522] transition-colors">Control Panel</Link>
            <span className="text-emerald-700 font-bold">Indian Nodes Online</span>
          </div>
        </div>

        <div className="w-wrap max-w-5xl mx-auto mt-6 pt-6 border-t border-[#1a1522]/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] font-mono text-[#1a1522]/50">
          <p>© 2026 KryinHost Inc. All rights reserved. Not an official Minecraft product.</p>
          <p>Indian Datacenter Nodes (Mumbai & Delhi) · Paper 26.3 · OpenJDK 25</p>
        </div>
      </footer>
    </div>
  );
}
