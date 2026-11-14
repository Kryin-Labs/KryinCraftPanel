'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Page Data Constants                                                */
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

const CAPABILITIES = [
  {
    tag: '01 // NETWORK',
    icon: Radio,
    label: 'Indian Datacenter Nodes',
    desc: 'Direct peering in Mumbai and Delhi datacenters for minimal ping and zero routing packet loss across the Indian subcontinent.',
  },
  {
    tag: '02 // ARCHITECTURE',
    icon: Zap,
    label: 'Smart Auto-Sleep & Wake',
    desc: 'Eliminates 24/7 idle power drain. When empty, servers enter a low-power sleep state and automatically wake in under 2 minutes when players join.',
  },
  {
    tag: '03 // CROSSPLAY',
    icon: Plug,
    label: 'Console Ready Built-In',
    desc: 'Pre-configured Geyser & Floodgate. Friends on mobile (iOS/Android), consoles (Xbox, PlayStation, Nintendo Switch), and PC join seamlessly.',
  },
  {
    tag: '04 // PERFORMANCE',
    icon: Shield,
    label: 'Fast · No Lag Guarantee',
    desc: 'Dedicated single-thread clock priority and Paper 26.3 runtime holding a rock-solid 20.0 TPS with zero tick lag.',
  },
  {
    tag: '05 // STORAGE',
    icon: HardDrive,
    label: 'Gen4 NVMe Arrays',
    desc: '7,000 MB/s read/write speeds ensure instant chunk loading, smooth teleportation, and lag-free world autosaves.',
  },
  {
    tag: '06 // CONTROL',
    icon: Terminal,
    label: 'Real-Time Web Console',
    desc: 'Interactive live command stream, visual player inventory viewer, 1-click server restart, and SFTP file access.',
  },
];

const FAQ = [
  {
    q: 'How does server auto-sleep and wake work?',
    a: 'To keep hosting affordable and eliminate 24/7 idle power waste, servers enter an automatic low-power sleep state when all players disconnect. As soon as any player connects to your server address (or you click Wake in your web dashboard), the server automatically boots up and resumes the world in under 2 minutes with all progress, inventories, and builds 100% saved.',
  },
  {
    q: 'Where are the servers hosted?',
    a: 'All our nodes are hosted in top Indian datacenters (Mumbai / Delhi), giving players across India, South Asia, and nearby regions ultra-fast routing, stable 20.0 TPS, and minimal ping.',
  },
  {
    q: 'Can console and mobile players join (Console Ready)?',
    a: 'Yes. Every server comes with Geyser and Floodgate pre-configured. Players on Bedrock (PlayStation, Xbox, Nintendo Switch, iOS, Android, and Windows) connect via port 19132 and play together with Java edition players on port 25565.',
  },
  {
    q: 'Can I upload my existing Minecraft world or plugins?',
    a: 'Yes. You have full access to our web-based file manager and SFTP. You can simply drag and drop your existing singleplayer world folder, datapacks, or plugin jars into your server directory.',
  },
  {
    q: 'Can I upgrade my RAM plan later?',
    a: 'Yes. You can upgrade from 4GB (₹600) to 6GB (₹800), 10GB (₹1,000), or 12GB (₹1,500) anytime with a single click. Your world files, configs, and player inventories remain completely intact.',
  },
];

/* ------------------------------------------------------------------ */
/* Main Warp-Style Home Page Component                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'telemetry' | 'players'>('console');

  const copyAddress = () => {
    navigator.clipboard.writeText('play.kryin.gg');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f3f4f6] selection:bg-[#38bdf8] selection:text-[#000000]">
      {/* Top Navigation Bar */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1a1e29] bg-[#000000]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#ffffff] text-[#000000] font-black">
              <Server className="size-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[16px] tracking-tight text-[#ffffff]">KryinHost</span>
              <span className="rounded border border-[#1e2433] bg-[#0d0f16] px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#38bdf8]">
                India
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex text-[13px] text-[#94a3b8] font-medium">
            <Link href="#plans" className="hover:text-[#ffffff] transition-colors">
              Plans & Pricing
            </Link>
            <Link href="#capabilities" className="hover:text-[#ffffff] transition-colors">
              Features
            </Link>
            <Link href="#terminal" className="hover:text-[#ffffff] transition-colors">
              Live Console
            </Link>
            <Link href="#faq" className="hover:text-[#ffffff] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-medium text-[#94a3b8] hover:text-[#ffffff] transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[#ffffff] px-4 py-2 text-[13px] font-semibold text-[#000000] hover:bg-[#e2e8f0] transition-all active:scale-95"
            >
              Deploy Server
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero Section (Warp Style) ===== */}
      <section className="relative overflow-hidden pt-36 pb-16 sm:pt-40 sm:pb-20">
        {/* Subtle grid background */}
        <div className="warp-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 text-center">
          {/* Top Announcement Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1e2433] bg-[#090b10] px-3.5 py-1.5 text-[12px] font-medium text-[#94a3b8] mb-8 hover:border-[#2e3547] transition-all">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[#ffffff]">Indian Hosted Nodes</span>
            <span className="h-3 w-[1px] bg-[#1e2433]" />
            <span className="text-[#38bdf8]">4GB RAM from ₹600/mo</span>
            <ArrowRight className="size-3 text-[#94a3b8]" />
          </div>

          {/* Bold Modern Headline */}
          <h1 className="text-[42px] leading-[1.06] font-extrabold tracking-[-0.03em] text-[#ffffff] sm:text-[60px] md:text-[72px]">
            The modern Minecraft <br className="hidden sm:inline" />
            server hosting platform.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-[16px] sm:text-[18px] text-[#94a3b8] leading-relaxed">
            High-speed Indian hosted servers with smart auto-sleep architecture, zero 24/7 idle drain, and instant Bedrock & Java crossplay.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#plans"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffffff] px-6 py-3 text-[14px] font-semibold text-[#000000] hover:bg-[#e2e8f0] transition-all active:scale-95 shadow-md"
            >
              <span>View Plans (From ₹600)</span>
              <ArrowRight className="size-4" />
            </Link>

            <button
              onClick={copyAddress}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1e2433] bg-[#090b10] px-5 py-3 text-[14px] font-mono text-[#f3f4f6] hover:bg-[#12151e] hover:border-[#2e3547] transition-all active:scale-95"
            >
              <span>play.kryin.gg</span>
              {copied ? <CheckCheck className="size-4 text-emerald-400" /> : <Copy className="size-4 text-[#94a3b8]" />}
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[13px] font-medium text-[#94a3b8]">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-[#38bdf8]" />
              <span>Indian Hosted (Low Ping)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-[#38bdf8]" />
              <span>Fast · No Lag (20.0 TPS)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-[#38bdf8]" />
              <span>Console Ready (Bedrock + Java)</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-4 text-[#38bdf8]" />
              <span>Smart Sleep (<span className="text-[#f3f4f6]">No 24/7 idle waste</span>)</span>
            </div>
          </div>
        </div>

        {/* ===== Warp Terminal Window Mockup ===== */}
        <div id="terminal" className="relative mx-auto max-w-4xl px-4 sm:px-6 mt-14">
          <div className="warp-terminal overflow-hidden">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between border-b border-[#1c202d] bg-[#0c0e14] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ff5f56]" />
                <span className="size-3 rounded-full bg-[#ffbd2e]" />
                <span className="size-3 rounded-full bg-[#27c93f]" />
                <span className="ml-2 text-[12px] font-mono text-[#94a3b8]">
                  kryin-node-01 — Paper 26.3 — Mumbai
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1">
                {(['console', 'telemetry', 'players'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 rounded-md text-[11px] font-mono capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-[#1c202d] text-[#ffffff] font-semibold'
                        : 'text-[#94a3b8] hover:text-[#f3f4f6]'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Content Body */}
            <div className="p-5 font-mono text-[13px] leading-relaxed bg-[#050608] min-h-[220px]">
              {activeTab === 'console' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#38bdf8]">
                    <span>❯</span>
                    <span>kryin-host status --node=mumbai-primary</span>
                  </div>
                  <div className="text-[#94a3b8] space-y-1 pl-4 border-l-2 border-[#1c202d]">
                    <p className="text-emerald-400">✔ Node: Indian Datacenter (Mumbai Node 01) • Online</p>
                    <p className="text-[#f3f4f6]">✔ Version: Paper 26.3 • Build #249 • Java 25 Runtime</p>
                    <p className="text-[#f3f4f6]">✔ Performance: 20.0 TPS • 0.0% tick drop • Fast No Lag</p>
                    <p className="text-[#38bdf8]">✔ GeyserBridge: Active • Java: 25565 • Bedrock: 19132 (Console Ready)</p>
                    <p className="text-[#fb923c]">✔ Smart Sleep: Enabled • Auto-wakes on player join in &lt;2 mins</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-[#94a3b8]">
                    <span className="text-[#38bdf8]">❯</span>
                    <span className="text-[#94a3b8] animate-pulse">Server ready for connections on play.kryin.gg</span>
                  </div>
                </div>
              )}

              {activeTab === 'telemetry' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[#94a3b8] border-b border-[#1c202d] pb-2 text-[12px]">
                    <span>METRIC</span>
                    <span>CURRENT VALUE</span>
                    <span>STATUS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#f3f4f6]">Ticks Per Second (TPS)</span>
                    <span className="text-emerald-400 font-bold">20.00 TPS</span>
                    <span className="text-emerald-400 text-[11px]">OPT_PERFECT</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#f3f4f6]">RAM Allocation</span>
                    <span className="text-[#38bdf8]">4.0 GB / 4.0 GB High-Speed</span>
                    <span className="text-[#38bdf8] text-[11px]">UNTHROTTLED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#f3f4f6]">Auto-Sleep Mode</span>
                    <span className="text-[#fb923c]">Smart Eco Standby</span>
                    <span className="text-[#fb923c] text-[11px]">READY_ON_JOIN</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#f3f4f6]">Server Host Location</span>
                    <span className="text-[#f3f4f6]">Mumbai, India (Subcontinent Tier 1)</span>
                    <span className="text-emerald-400 text-[11px]">LOW_PING</span>
                  </div>
                </div>
              )}

              {activeTab === 'players' && (
                <div className="space-y-2">
                  <p className="text-[#94a3b8] text-[12px] mb-2">Connected Cross-Platform Players (Sample Telemetry):</p>
                  <div className="rounded-lg border border-[#1c202d] bg-[#0c0e14] p-3 space-y-1.5 text-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">• NarcoGam3X (OP)</span>
                      <span className="text-[#94a3b8]">Java Edition • Ping: 18ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#38bdf8] font-bold">• Steve_Console</span>
                      <span className="text-[#94a3b8]">Bedrock (PlayStation / Xbox) • Ping: 24ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 4 RAM Plans Section (NO Free Plan) ===== */}
      <section id="plans" className="border-t border-[#1a1e29] bg-[#050608] py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="rounded-full border border-[#1e2433] bg-[#0d0f16] px-3 py-1 font-mono text-[11px] font-semibold text-[#38bdf8] uppercase tracking-wider">
              Indian Hosted Plans
            </span>
            <h2 className="text-[36px] sm:text-[46px] font-extrabold tracking-tight text-[#ffffff]">
              Simple RAM-Based Plans
            </h2>
            <p className="text-[15px] text-[#94a3b8]">
              High-speed Indian nodes. Fast, no lag, console ready, with smart sleep architecture (no 24/7 idle power drain).
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {RAM_PLANS.map((plan) => (
              <div
                key={plan.ram}
                className={`warp-card p-6 flex flex-col justify-between ${
                  plan.highlight
                    ? 'border-[#38bdf8]/60 bg-[#0c0f17] shadow-xl ring-1 ring-[#38bdf8]/20 relative'
                    : 'bg-[#090b10]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        plan.highlight
                          ? 'bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40'
                          : 'bg-[#161a26] text-[#94a3b8] border border-[#1e2433]'
                      }`}
                    >
                      {plan.badge}
                    </span>
                    {plan.highlight && (
                      <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                        <Sparkles className="size-3" /> Recommended
                      </span>
                    )}
                  </div>

                  <h3 className="text-[24px] font-black text-[#ffffff] tracking-tight">{plan.ram} RAM</h3>
                  <p className="text-[12px] text-[#94a3b8] mt-1 min-h-[34px] leading-snug">
                    {plan.idealFor}
                  </p>

                  {/* Price */}
                  <div className="my-5 pb-5 border-b border-[#1c202d]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#ffffff] font-mono tracking-tight">
                        ₹{plan.price}
                      </span>
                      <span className="text-xs text-[#94a3b8] font-medium">/ month</span>
                    </div>
                  </div>

                  {/* Specs summary */}
                  <div className="space-y-1.5 text-xs text-[#f3f4f6] mb-5 pb-5 border-b border-[#1c202d]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#94a3b8]">RAM:</span>
                      <span className="font-semibold text-[#ffffff]">{plan.ram}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94a3b8]">vCPU:</span>
                      <span className="font-semibold">{plan.vCpu}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94a3b8]">NVMe Storage:</span>
                      <span className="font-semibold">{plan.storage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#94a3b8]">Player Slots:</span>
                      <span className="font-semibold">{plan.slots}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 text-[12px] text-[#94a3b8] mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="size-3.5 text-[#38bdf8] shrink-0 mt-0.5" />
                        <span className="text-[#cbd5e1]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                    plan.highlight
                      ? 'bg-[#ffffff] hover:bg-[#e2e8f0] text-[#000000] shadow-md'
                      : 'bg-[#161a26] hover:bg-[#202738] text-[#ffffff] border border-[#1e2433]'
                  }`}
                >
                  <span>Deploy {plan.ram} Server</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>

          {/* Smart Sleep explanation card */}
          <div className="warp-card max-w-3xl mx-auto p-5 text-center text-[13px] text-[#94a3b8] space-y-1">
            <p>
              <span className="text-[#38bdf8] font-bold">Smart Sleep Architecture:</span> To eliminate 24/7 idle power drain and keep hosting costs low, servers enter an automatic low-power sleep state when all players disconnect.
            </p>
            <p className="text-[12px] text-[#64748b]">
              When any player connects to your address, the server wakes automatically in under 2 minutes with all world progress and inventories 100% saved.
            </p>
          </div>
        </div>
      </section>

      {/* ===== Capabilities Grid ===== */}
      <section id="capabilities" className="border-t border-[#1a1e29] bg-[#000000] py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-2 max-w-md mx-auto">
            <span className="font-mono text-[11px] font-semibold text-[#38bdf8] uppercase tracking-wider">
              Engineering
            </span>
            <h2 className="text-[34px] sm:text-[44px] font-extrabold tracking-tight text-[#ffffff]">
              Hosting Capabilities
            </h2>
            <p className="text-[14px] text-[#94a3b8]">
              Built for speed, reliability, and simple web-first server management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.tag} className="warp-card p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-[#64748b]">{c.tag}</span>
                    <div className="size-8 rounded-lg bg-[#161a26] border border-[#1e2433] flex items-center justify-center text-[#38bdf8]">
                      <Icon className="size-4" />
                    </div>
                  </div>
                  <h3 className="text-[17px] font-bold text-[#ffffff]">{c.label}</h3>
                  <p className="text-[13px] text-[#94a3b8] leading-relaxed">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ Accordion ===== */}
      <section id="faq" className="border-t border-[#1a1e29] bg-[#050608] py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-[11px] font-semibold text-[#38bdf8] uppercase tracking-wider">
              Help & Information
            </span>
            <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight text-[#ffffff]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group warp-card p-5 transition-all [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between text-[15px] font-semibold text-[#ffffff] hover:text-[#38bdf8] transition-colors">
                  <span>{item.q}</span>
                  <ChevronDown className="size-4 text-[#94a3b8] transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[13px] leading-relaxed text-[#94a3b8] border-t border-[#1c202d] pt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Bottom CTA Banner ===== */}
      <section className="border-t border-[#1a1e29] bg-[#000000] py-20 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-[36px] sm:text-[48px] font-extrabold tracking-tight text-[#ffffff]">
            Launch your Minecraft server today.
          </h2>
          <p className="text-[15px] text-[#94a3b8] leading-relaxed">
            Choose from 4GB (₹600) to 12GB (₹1,500) high-speed Indian nodes. Fast, zero lag, console ready, and instant auto-wake.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="#plans"
              className="rounded-full bg-[#ffffff] px-6 py-3 text-[14px] font-semibold text-[#000000] hover:bg-[#e2e8f0] transition-all shadow-md active:scale-95"
            >
              Get Started with 4GB (₹600/mo)
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-[#1e2433] bg-[#090b10] px-6 py-3 text-[14px] font-medium text-[#f3f4f6] hover:bg-[#12151e] transition-all"
            >
              Sign In to Control Panel
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Clean Warp Footer ===== */}
      <footer className="border-t border-[#1a1e29] bg-[#000000] py-10 px-4 sm:px-6 text-[13px] text-[#64748b]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded bg-[#ffffff] text-[#000000] font-bold">
              <Server className="size-3.5" />
            </div>
            <span className="font-bold text-[14px] text-[#ffffff]">KryinHost</span>
            <span>·</span>
            <span>Indian Game Server Hosting</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-[#94a3b8]">
            <Link href="#plans" className="hover:text-[#ffffff] transition-colors">Plans</Link>
            <Link href="#capabilities" className="hover:text-[#ffffff] transition-colors">Capabilities</Link>
            <Link href="/login" className="hover:text-[#ffffff] transition-colors">Control Panel</Link>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Indian Nodes Online
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-6 pt-6 border-t border-[#1a1e29] flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#64748b]">
          <p>© 2026 KryinHost Inc. All rights reserved. Not an official Minecraft product.</p>
          <p className="font-mono">Indian Datacenter Nodes (Mumbai & Delhi) · Paper 26.3 · OpenJDK 25</p>
        </div>
      </footer>
    </div>
  );
}
