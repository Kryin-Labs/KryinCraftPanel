'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
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
  RefreshCw,
  Radio,
  Sliders,
  ChevronDown,
  Plug,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Primitives matching KryinOffice UI                                  */
/* ------------------------------------------------------------------ */

function FilledPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f4f4f5] text-[#0f1115] px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all hover:bg-white hover:scale-[1.02] shadow-sm"
    >
      {children}
    </Link>
  );
}

function GhostPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-xs sm:text-sm text-[#f4f4f5] transition-all hover:bg-white/10 hover:border-white/30"
    >
      {children}
    </Link>
  );
}

function DraggableFloat({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [d, setD] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number } | null>(null);

  const clamp = (v: number) => Math.max(-36, Math.min(36, v));

  function onDown(e: React.PointerEvent) {
    drag.current = { px: e.clientX - d.x, py: e.clientY - d.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setD({ x: clamp(e.clientX - drag.current.px), y: clamp(e.clientY - drag.current.py) });
  }
  function onUp() {
    drag.current = null;
    setD({ x: 0, y: 0 });
  }

  return (
    <div className={className}>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="pointer-events-auto cursor-grab touch-none select-none active:cursor-grabbing"
        style={{
          transform: `translate(${d.x}px, ${d.y}px)`,
          transition: drag.current ? 'none' : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="kryin-float">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating Artifact Cards (KryinOffice style)                         */
/* ------------------------------------------------------------------ */

function TpsArt() {
  return (
    <div className="w-[240px] p-4 border border-white/10 bg-[#16181d]/95 backdrop-blur-md rounded-[18px] shadow-xl text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Tick Performance</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/80">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Locked
        </span>
      </div>
      <p className="mt-2 font-mono text-[28px] font-bold leading-none text-white">20.0 TPS</p>
      <p className="mt-1 text-[11px] text-zinc-400">0.0% tick loss • 50.0ms target</p>
      <svg viewBox="0 0 200 36" className="mt-2.5 w-full" aria-hidden>
        <polyline
          points="0,20 25,20 50,19 75,20 100,20 125,19 150,20 175,20 200,20"
          fill="none"
          stroke="#10b981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function GeyserArt() {
  return (
    <div className="w-[230px] p-4 border border-white/10 bg-[#16181d]/95 backdrop-blur-md rounded-[18px] shadow-xl text-left">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Bedrock Bridge</span>
        <Globe className="w-3.5 h-3.5 text-emerald-400" />
      </div>
      <p className="mt-2 text-xs font-semibold text-zinc-100">Cross-Play Active</p>
      <div className="mt-2 rounded-[8px] bg-[#1a1d24] p-2 font-mono text-[10px] text-zinc-400 border border-white/5 space-y-1">
        <div className="flex justify-between"><span>Java:</span> <span className="text-zinc-200">25565</span></div>
        <div className="flex justify-between"><span>Bedrock:</span> <span className="text-emerald-400">19132</span></div>
      </div>
      <p className="mt-2 text-[10px] text-zinc-500">Geyser + Floodgate preconfigured</p>
    </div>
  );
}

function TerminalArt() {
  return (
    <div className="w-full max-w-md p-4 border border-white/10 bg-[#16181d]/95 backdrop-blur-md rounded-[20px] shadow-2xl text-left font-mono text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <span className="text-[11px] text-zinc-400 ml-1.5">Paper 26.3 • Live Console</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
      </div>
      <div className="space-y-1 text-[11px] text-zinc-300">
        <p className="text-zinc-500">[INFO]: Loading server.properties</p>
        <p className="text-zinc-400">[INFO]: Using 8 worker threads for worldgen</p>
        <p className="text-emerald-400">[INFO]: [Geyser-Spigot] Started Bedrock listener on port 19132</p>
        <p className="text-zinc-200">[INFO]: Done (3.81s)! Listening on 0.0.0.0:25565</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data constants                                                      */
/* ------------------------------------------------------------------ */

const MARQUEE_ITEMS = [
  'Paper 26.3',
  'Purpur',
  'Fabric',
  'Geyser Cross-Play',
  '2.5+ Tbps Anti-DDoS',
  'Gen4 NVMe Arrays',
  'Sub-15ms Latency',
  'Automated Backups',
  'Web Terminal',
  'Zero Tick Lag',
  'Custom Subdomains',
  '1-Click Modpacks',
];

const CAPABILITIES = [
  { icon: Globe, label: 'Java & Bedrock Cross-Play', note: 'Preconfigured Geyser & Floodgate' },
  { icon: Zap, label: 'Smart Hibernation & Wake', note: 'Auto-sleep when empty, instant wake' },
  { icon: RefreshCw, label: '1-Click Modpack Switcher', note: 'Paper, Purpur, Fabric & Forge' },
  { icon: Shield, label: 'Enterprise Anti-DDoS', note: '2.5+ Tbps multilayer traffic filtering' },
  { icon: HardDrive, label: 'Gen4 NVMe Storage', note: '7,000 MB/s speed, zero chunk stutter' },
  { icon: Terminal, label: 'Real-Time Web Console', note: 'Live command execution & log streaming' },
  { icon: Users, label: 'Visual Player Inspector', note: 'Inspect inventory, health & coordinates' },
  { icon: Clock, label: 'Automated Daily Backups', note: 'Hourly snapshots & 1-click restore' },
];

const PLANS_DATA = [
  {
    name: 'Free Starter',
    badge: 'Popular for Friends',
    price: '$0.00',
    cycle: 'forever',
    ram: '2 GB',
    cpu: '1 vCPU',
    storage: '10 GB SSD',
    slots: '5 Slots',
    features: ['Smart Auto-Hibernation', 'Instant Auto-Wake on Join', 'Java & Bedrock Cross-Play', 'Web Console & Player Manager'],
    highlight: false,
    cta: 'Deploy Free',
  },
  {
    name: 'Grass Explorer',
    badge: 'Entry Level',
    price: '$3.99',
    cycle: 'month',
    ram: '4 GB DDR4',
    cpu: '2 vCPU',
    storage: '35 GB NVMe',
    slots: '20 Slots',
    features: ['24/7 Always-On (No Sleep)', 'High-Speed Gen4 NVMe', 'Daily Automated Backups', 'Full Web File Manager & SFTP'],
    highlight: false,
    cta: 'Select Explorer',
  },
  {
    name: 'Iron Standard',
    badge: 'Most Popular',
    price: '$7.99',
    cycle: 'month',
    ram: '8 GB DDR4/DDR5',
    cpu: '3 vCPU',
    storage: '80 GB NVMe',
    slots: '60 Slots',
    features: ['Optimized Paper, Purpur & Fabric', 'Full Modpack & Plugin Support', 'Enterprise Anti-DDoS Scrubbing', 'Offsite Cloud Backups & Free MySQL'],
    highlight: true,
    cta: 'Select Iron',
  },
  {
    name: 'Diamond Performance',
    badge: 'Extreme Power',
    price: '$14.99',
    cycle: 'month',
    ram: '12 GB High-Freq',
    cpu: '4 vCPU',
    storage: '150 GB NVMe',
    slots: 'Unlimited',
    features: ['Dedicated High-Clock CPU Priority', 'Zero Tick-Lag Guarantee', 'Heavy Modpacks (ATM 9, Better MC)', 'Hourly Snapshot Restores'],
    highlight: false,
    cta: 'Select Diamond',
  },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f4f4f5] selection:bg-emerald-600 selection:text-white">
      {/* Navigation matching KryinOffice executive style */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0f1115]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-lg'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">KryinHost</span>
              <span className="text-[10px] text-zinc-500 block leading-none">Game Server Infrastructure</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/plans" className="hover:text-white transition-colors">
              Plans & Pricing
            </Link>
            <Link href="#hardware" className="hover:text-white transition-colors">
              Hardware
            </Link>
            <Link href="#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <FilledPill href="/login">Get Started</FilledPill>
          </div>
        </div>
      </header>

      {/* Hero Section with radial dotted background */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-5 overflow-hidden">
        {/* Kryin-grid background */}
        <div className="kryin-grid absolute inset-0 pointer-events-none" />

        <div className="max-w-[1100px] mx-auto text-center relative z-10 space-y-6">
          {/* Micro-badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#16181d]/80 px-3.5 py-1 text-xs text-zinc-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>High-frequency nodes online • Java 26 & Bedrock cross-play ready</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            High-performance Minecraft hosting.
            <span className="block text-emerald-400 mt-1">Built with zero lag & instant cross-play.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Instant deployment, 2.5+ Tbps Anti-DDoS mitigation, ultra-fast NVMe storage, and built-in mobile/console cross-play. Start free or scale with high-frequency hardware.
          </p>

          {/* Action Pills */}
          <div className="flex items-center justify-center gap-3.5 pt-2">
            <FilledPill href="/login">
              <span>Deploy Free Server</span>
              <ArrowRight className="w-4 h-4" />
            </FilledPill>
            <GhostPill href="/plans">
              <span>Explore Server Plans</span>
            </GhostPill>
          </div>

          {/* Floating Product Artifacts Showcase (KryinOffice style) */}
          <div className="pt-12 relative max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-4">
            <DraggableFloat className="w-full md:w-auto">
              <TerminalArt />
            </DraggableFloat>
            <div className="flex flex-col sm:flex-row md:flex-col gap-4">
              <DraggableFloat>
                <TpsArt />
              </DraggableFloat>
              <DraggableFloat>
                <GeyserArt />
              </DraggableFloat>
            </div>
          </div>
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="kryin-divider max-w-6xl mx-auto my-4" />

      {/* Infinite Keyword Marquee Strip */}
      <section className="py-6 overflow-hidden">
        <div className="flex whitespace-nowrap kryin-marquee gap-8 text-xs font-mono text-zinc-400">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span key={idx} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Hairline Divider */}
      <div className="kryin-divider max-w-6xl mx-auto my-4" />

      {/* Core Advantages (KryinOffice 3-block feature presentation) */}
      <section id="features" className="py-20 px-5 max-w-[1200px] mx-auto space-y-12">
        <div className="text-center space-y-2">
          <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            Engineered For Pure Performance
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything your Minecraft community needs to thrive.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            No lag spikes, no convoluted configurations, and zero compromises on hardware quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-[20px] bg-[#16181d] border border-white/10 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Cross-Platform</span>
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Java & Bedrock Unified</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Geyser and Floodgate are pre-installed. Players on mobile (iOS/Android), consoles (Xbox/PS5/Switch), and PC join the exact same world effortlessly.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-[#16181d] border border-white/10 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Zero Waste</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Smart Hibernation & Wake</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Similar to MineKeep, free-tier servers sleep when empty to conserve resources, waking in under 2 seconds the moment a player connects.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-[#16181d] border border-white/10 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">Unmetered IO</span>
              <HardDrive className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white">Gen4 NVMe Solid State</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Blazing 7,000 MB/s read speeds ensure rapid chunk loading, zero autosave hitches, and near-instant world initialization.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Numbered Steps (01, 02, 03) like KryinOffice */}
      <section className="py-16 px-5 bg-[#121417] border-y border-white/10">
        <div className="max-w-[1200px] mx-auto space-y-10">
          <div className="text-center space-y-1">
            <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Instant Workflow
            </p>
            <h3 className="text-xl sm:text-3xl font-bold text-white">How it works in three steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[18px] bg-[#16181d] border border-white/10 space-y-2">
              <span className="text-2xl font-mono font-bold text-emerald-400">01</span>
              <h4 className="text-sm font-bold text-white">Deploy in 60 seconds</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose your Minecraft version (Paper 26.3, Purpur, or Fabric) and launch instantly with zero credit card required.
              </p>
            </div>

            <div className="p-6 rounded-[18px] bg-[#16181d] border border-white/10 space-y-2">
              <span className="text-2xl font-mono font-bold text-emerald-400">02</span>
              <h4 className="text-sm font-bold text-white">Connect from any device</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Share your free subdomain (`yourname.kryin.gg`) with friends on PC or consoles using port 19132.
              </p>
            </div>

            <div className="p-6 rounded-[18px] bg-[#16181d] border border-white/10 space-y-2">
              <span className="text-2xl font-mono font-bold text-emerald-400">03</span>
              <h4 className="text-sm font-bold text-white">Control from the web</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Stream live logs, inspect player inventories, manage plugins, and configure backups directly from your browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8-Grid Capabilities Stack */}
      <section className="py-20 px-5 max-w-[1200px] mx-auto space-y-10">
        <div className="text-center space-y-2">
          <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            Complete Infrastructure
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built-in tools for total server sovereignty
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-[16px] bg-[#16181d] border border-white/10 space-y-2 hover:border-white/20 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-[#22252b] border border-white/10 flex items-center justify-center text-emerald-400">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-white">{cap.label}</h4>
                <p className="text-[11px] text-zinc-400 leading-snug">{cap.note}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Server Plans Section with KryinOffice Card Design */}
      <section className="py-20 px-5 bg-[#121417] border-y border-white/10">
        <div className="max-w-[1200px] mx-auto space-y-10">
          <div className="text-center space-y-2">
            <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
              Transparent Pricing
            </p>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Choose your server tier
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Start free with automatic hibernation or scale up with 24/7 dedicated resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PLANS_DATA.map((plan, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-[22px] flex flex-col justify-between transition-all ${
                  plan.highlight
                    ? 'bg-[#181d26] border-2 border-emerald-500/80 shadow-xl'
                    : 'bg-[#16181d] border border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      plan.highlight
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                        : 'bg-[#22252b] text-zinc-400 border border-white/10'
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <h4 className="text-base font-bold text-white mt-2">{plan.name}</h4>

                  <div className="my-4 pb-4 border-b border-white/10">
                    <span className="text-3xl font-extrabold text-white font-mono">{plan.price}</span>
                    <span className="text-xs text-zinc-500 ml-1">/ {plan.cycle}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300 mb-4 pb-4 border-b border-white/10 font-mono">
                    <div className="flex justify-between"><span className="text-zinc-500 font-sans">RAM:</span> <span>{plan.ram}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500 font-sans">vCPU:</span> <span>{plan.cpu}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500 font-sans">Storage:</span> <span>{plan.storage}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500 font-sans">Slots:</span> <span>{plan.slots}</span></div>
                  </div>

                  <ul className="space-y-2 text-[11px] text-zinc-400 mb-6">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className={`w-full py-2.5 rounded-full text-xs font-bold text-center transition-all ${
                    plan.highlight
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-[#22252b] hover:bg-zinc-700 text-zinc-200 border border-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold"
            >
              <span>Compare all 5 server plans & feature matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-3xl mx-auto px-5 py-20 space-y-8">
        <div className="text-center space-y-1">
          <p className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
            Common Questions
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How fast is my server ready after registration?',
              a: 'Instantly. Your Paper 26.3 server instance is provisioned and listening for connections within 60 seconds.',
            },
            {
              q: 'How does Bedrock & Java Cross-Play work?',
              a: 'Every server has Geyser and Floodgate built-in. Java edition players join with port 25565, while Bedrock players on mobile or console join with port 19132 into the exact same world.',
            },
            {
              q: 'Can I upload my existing Minecraft singleplayer world?',
              a: 'Yes. You have full access to our web file manager and SFTP. Simply drag and drop your world folder or zip archive.',
            },
            {
              q: 'How does the Free Starter plan hibernation work?',
              a: 'Similar to MineKeep, free servers enter a low-power hibernation state when all players disconnect. As soon as someone attempts to join, it wakes automatically in under 2 seconds.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#16181d] border border-white/10 rounded-[16px] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-zinc-100 hover:text-emerald-400 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-white/5">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 px-5 bg-[#121417] border-t border-white/10 text-center">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to deploy your Minecraft world?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Create your world in under 60 seconds with our free starter tier or choose high-frequency dedicated hardware.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <FilledPill href="/login">
              <span>Deploy Server Now</span>
              <ArrowRight className="w-4 h-4" />
            </FilledPill>
            <GhostPill href="/plans">
              <span>Browse All Plans</span>
            </GhostPill>
          </div>
        </div>
      </section>

      {/* Executive Footer */}
      <footer className="border-t border-white/10 bg-[#0f1115] py-12 px-5 text-xs text-zinc-500">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white">
              <Server className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-200 text-sm tracking-tight">KryinHost</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">Game Server Infrastructure</span>
          </div>

          <div className="flex items-center gap-5 text-[11px] text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/plans" className="hover:text-white transition-colors">Plans</Link>
            <Link href="/login" className="hover:text-white transition-colors">Client Area</Link>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              All Systems Operational
            </span>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-600">
          <p>© 2026 KryinHost Inc. All rights reserved. Not an official Minecraft product.</p>
          <p className="font-mono">ASUS ROG Phone 5s Node • Snapdragon 888 • OpenJDK 25</p>
        </div>
      </footer>
    </div>
  );
}
