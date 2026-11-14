'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
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
  ChevronDown,
  Plug,
  Clock,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Interactive UI Primitives                                           */
/* ------------------------------------------------------------------ */

function FilledPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f3f4f6] px-5 py-2.5 text-[14px] font-semibold text-[#0a0c10] transition-all hover:bg-white hover:shadow-md active:scale-95"
    >
      {children}
    </Link>
  );
}

function GhostPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#262c3d] bg-[#11141c]/60 px-5 py-2.5 text-[14px] font-medium text-[#f3f4f6] transition-all hover:bg-[#1a202e] hover:border-[#384259] active:scale-95"
    >
      {children}
    </Link>
  );
}

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="v3-link text-[14px] font-medium text-[#fb923c] hover:underline">
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Telemetry & Feature Showcase Cards (Dark Theme)                    */
/* ------------------------------------------------------------------ */

function StatArt() {
  return (
    <div className="v3-art p-5 bg-[#12151f] border border-[#1e2433] rounded-[20px] transition-all duration-300 hover:border-[#fb923c]/50 hover:shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <p className="v3-tag font-medium text-[12px] text-[#8e98a8]">Fast · No Lag</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#fb923c]/15 border border-[#fb923c]/30 px-2 py-0.5 text-[10px] font-bold text-[#fb923c]">
            Live 20.0
          </span>
        </div>
        <p className="mt-2 font-bold text-[28px] leading-none text-[#f3f4f6] font-mono">20.0 TPS</p>
        <p className="mt-1.5 text-[12px] text-[#8e98a8]">0.0% tick drop · High single-thread clock</p>
      </div>
      <div className="mt-4 pt-3 border-t border-[#1e2433]">
        <svg viewBox="0 0 200 32" className="w-full h-7" aria-hidden>
          <polyline
            points="0,16 25,16 50,15 75,16 100,16 125,15 150,16 175,16 200,16"
            fill="none"
            stroke="#fb923c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function NodeArt() {
  return (
    <div className="v3-art p-5 bg-[#12151f] border border-[#1e2433] rounded-[20px] transition-all duration-300 hover:border-[#fb923c]/50 hover:shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radio className="size-3.5 text-[#fb923c]" />
            <p className="v3-tag font-medium text-[12px] text-[#8e98a8]">Server Region</p>
          </div>
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="mt-2 text-[17px] font-bold leading-snug text-[#f3f4f6]">
          Indian Hosted Server
        </p>
        <p className="mt-1.5 text-[12px] text-[#8e98a8] leading-relaxed">
          Direct low-latency fiber routing for Mumbai, Delhi & Indian subcontinent.
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-[#8e98a8]">
        <span>Location: India</span>
        <span className="font-semibold text-emerald-400">Lowest Ping</span>
      </div>
    </div>
  );
}

function CrossplayArt() {
  return (
    <div className="v3-art p-5 bg-[#12151f] border border-[#1e2433] rounded-[20px] transition-all duration-300 hover:border-[#fb923c]/50 hover:shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <p className="v3-tag font-medium text-[12px] text-[#8e98a8]">Cross-Platform</p>
          <Plug className="size-3.5 text-[#fb923c]" />
        </div>
        <p className="mt-2 text-[17px] font-bold text-[#f3f4f6]">
          Console Ready
        </p>
        <div className="mt-2 rounded-[10px] bg-[#161a26] p-2.5 font-mono text-[11px] text-[#8e98a8] border border-[#1e2433]">
          <span className="text-[#fb923c] font-semibold">GeyserBridge</span> (Java + Bedrock)
        </div>
      </div>
      <div className="mt-3 text-[11px] text-[#8e98a8]">
        Xbox, PlayStation, Switch, Mobile & PC
      </div>
    </div>
  );
}

function SleepArt() {
  return (
    <div className="v3-art p-5 bg-[#12151f] border border-[#1e2433] rounded-[20px] transition-all duration-300 hover:border-[#fb923c]/50 hover:shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <p className="v3-tag font-medium text-[12px] text-[#8e98a8]">Architecture</p>
          <Zap className="size-3.5 text-[#fb923c]" />
        </div>
        <p className="mt-2 text-[17px] font-bold text-[#f3f4f6]">
          Smart Auto-Sleep
        </p>
        <p className="mt-1.5 text-[12px] text-[#8e98a8] leading-relaxed">
          No 24/7 idle power drain. Sleeps when empty & auto-wakes on join in under 2 minutes.
        </p>
      </div>
      <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-[#8e98a8]">
        <span>Auto-Sleep: Active</span>
        <span className="font-semibold text-[#fb923c]">World 100% Saved</span>
      </div>
    </div>
  );
}

/* Deploy prompt capsule */
function ComposerArt() {
  return (
    <div className="v3-art w-full max-w-xl p-2.5 sm:p-3 shadow-xl border border-[#262c3d] bg-[#12151f]/95 backdrop-blur-md rounded-[22px]">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="flex items-center justify-center size-9 rounded-full bg-[#181d2a] border border-[#262c3d] text-[#fb923c]">
          <Terminal className="size-4" />
        </div>
        <span className="flex-1 text-[13px] sm:text-[14px] text-[#8e98a8] font-normal text-left truncate">
          Deploy 4GB Indian Server starting at ₹600/mo…
        </span>
        <div className="hidden sm:flex items-center gap-1.5 mr-1">
          <span className="rounded-md bg-[#181d2a] px-2 py-0.5 text-[11px] font-mono text-[#6b778d] border border-[#262c3d]">
            ⌘K
          </span>
        </div>
        <FilledPill href="/login">
          <span>Deploy</span>
          <ArrowRight className="size-3.5" />
        </FilledPill>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page Data Constants                                                */
/* ------------------------------------------------------------------ */

const TRUST = [
  'Indian Hosted Node',
  'Paper 26.3',
  'Purpur',
  'Fabric',
  'Geyser Crossplay',
  'Console Ready',
  'Fast No Lag',
  'Gen4 NVMe',
];

const FEATURES = [
  {
    tag: 'Cross-Platform Engine',
    title: 'Java & Bedrock Console Ready',
    body: 'Geyser and Floodgate are pre-configured out of the box. Friends playing on mobile (iOS/Android), consoles (PlayStation, Xbox, Nintendo Switch), and PC join the same world seamlessly.',
  },
  {
    tag: 'Smart Sleep Architecture',
    title: 'Low-power sleep & auto-wake',
    body: 'To eliminate 24/7 idle resource waste and keep pricing ultra-affordable, servers enter an automatic sleep state when all players disconnect. As soon as a player connects, it wakes automatically in under 2 minutes.',
  },
  {
    tag: 'Dedicated Performance',
    title: 'Indian single-thread speed',
    body: 'High-frequency CPU cores, Gen4 NVMe arrays, and optimized Paper 26.3 runtimes ensure your server runs fast with zero lag and a rock-solid 20.0 TPS.',
    peach: true,
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Select server plan',
    body: 'Choose our Free Starter plan or the Indian Dedicated 4GB Node (₹600/mo) with instant deployment.',
  },
  {
    n: '02',
    title: 'Connect instantly',
    body: 'Join via Java or Bedrock console with your free *.kryin.gg address. No port forwarding needed.',
  },
  {
    n: '03',
    title: 'Control from the web',
    body: 'Full web console, live player inventory inspector, 1-click server wake, and automated backups.',
  },
];

const CAPABILITIES = [
  { icon: Globe, label: 'Java & Bedrock Cross-Play', note: 'Pre-configured Geyser & Floodgate' },
  { icon: Zap, label: 'Smart Auto-Sleep & Wake', note: 'No 24/7 idle drain, wakes on join' },
  { icon: Radio, label: 'Indian Hosted Server', note: 'Low-latency Mumbai & Delhi nodes' },
  { icon: Shield, label: 'Fast No Lag Guarantee', note: 'High single-thread clock & 20.0 TPS' },
  { icon: HardDrive, label: 'Gen4 NVMe Storage', note: 'Ultra-fast chunk loading & world saves' },
  { icon: Terminal, label: 'Real-Time Web Console', note: 'Full command execution & logs' },
  { icon: Users, label: 'Visual Player Inspector', note: 'View inventory, equipment & stats' },
  { icon: Clock, label: 'Automated Daily Backups', note: 'Safe snapshots & 1-click restore' },
];

const FAQ = [
  {
    q: 'How does server auto-sleep and wake work?',
    a: 'To keep hosting affordable and eliminate 24/7 idle power waste, servers enter an automatic low-power sleep state when all players disconnect. As soon as any player connects to your server address (or you click Wake in your web dashboard), the server automatically boots up and resumes the world in under 2 minutes with all progress, inventories, and builds 100% saved.',
  },
  {
    q: 'Is the 4GB RAM server hosted in India?',
    a: 'Yes! Our nodes are hosted in top Indian datacenters (Mumbai / Delhi), giving players across India, South Asia, and nearby regions ultra-fast routing, stable 20.0 TPS, and minimal ping.',
  },
  {
    q: 'Can console and mobile players join (Console Ready)?',
    a: 'Yes. Every server comes with Geyser and Floodgate pre-configured. Players on Bedrock (PlayStation, Xbox, Nintendo Switch, iOS, Android, and Windows) connect via port 19132 and play together with Java edition players on port 25565.',
  },
  {
    q: 'Can I upload my existing world or plugins?',
    a: 'Yes. You have full access to our web file manager and SFTP. Simply drag and drop your world folder, datapacks, or plugin jars into your server directory.',
  },
  {
    q: 'Can I upgrade my server plan later?',
    a: 'Yes. You can upgrade from the Free tier to 4GB RAM (₹600/mo) or 8GB RAM anytime. Your world files, configs, and player inventories remain completely intact.',
  },
];

/* ------------------------------------------------------------------ */
/* Main Home Page Component                                           */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="theme-v3 relative min-h-dvh bg-[#0a0c10] text-[#f3f4f6]">
      {/* Top Navigation */}
      <header
        className={`fixed inset-x-0 top-0 z-50 flex flex-col items-center overflow-hidden px-5 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0c10]/90 backdrop-blur-md border-b border-[#1e2433] py-3 shadow-lg'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="flex w-full max-w-[1200px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#fb923c] text-[#0a0c10] shadow-sm font-bold">
              <Server className="size-4" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-[#f3f4f6]">KryinHost</span>
            <span className="hidden sm:inline-flex text-[11px] font-semibold text-[#fb923c] bg-[#fb923c]/15 px-2 py-0.5 rounded-full border border-[#fb923c]/30">
              India
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex text-[14px] text-[#8e98a8]">
            <Link href="#features" className="hover:text-[#f3f4f6] transition-colors">
              Features
            </Link>
            <Link href="#plans" className="hover:text-[#f3f4f6] transition-colors">
              Plans & Pricing
            </Link>
            <Link href="#capabilities" className="hover:text-[#f3f4f6] transition-colors">
              Capabilities
            </Link>
            <Link href="#faq" className="hover:text-[#f3f4f6] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-[14px] text-[#8e98a8] hover:text-[#f3f4f6] transition-colors sm:inline-flex"
            >
              Sign in
            </Link>
            <FilledPill href="/login">Get started</FilledPill>
          </div>
        </div>
      </header>

      {/* ===== Hero Section (No Overlapping Elements) ===== */}
      <section className="relative flex flex-col justify-center items-center overflow-hidden pt-36 pb-16 sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-20">
        {/* Subtle warm amber ambient glow & dotted grid */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[620px] w-full"
          style={{
            background:
              'radial-gradient(50% 60% at 50% 15%, rgba(251, 146, 60, 0.12) 0%, rgba(17, 20, 28, 0.4) 60%, transparent 100%)',
          }}
          aria-hidden
        />
        <div className="kryin-grid pointer-events-none absolute inset-0 opacity-20" aria-hidden />

        <div className="relative mx-auto w-full max-w-[1200px] px-6">
          {/* Main Hero Container */}
          <div className="relative z-10 mx-auto max-w-3xl text-center flex flex-col items-center">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#1e2433] bg-[#12151f]/90 px-3.5 py-1.5 text-[12px] font-medium text-[#f3f4f6] shadow-sm backdrop-blur-md mb-6">
              <span className="flex size-2 rounded-full bg-[#fb923c] animate-pulse" />
              <span className="text-[#fb923c] font-semibold">Indian Hosted Node</span>
              <span className="h-3 w-[1px] bg-[#1e2433]" />
              <span className="text-[#8e98a8]">Paper 26.3 · Console Ready</span>
              <ArrowRight className="size-3 text-[#8e98a8]" />
            </div>

            {/* Main Headline */}
            <h1 className="text-[38px] leading-[1.08] text-[#f3f4f6] sm:text-[54px] md:text-[64px] lg:text-[72px] tracking-tight">
              Minecraft server hosting with <span className="v3-em text-[#fb923c]">fast, zero lag</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-[#8e98a8] sm:text-[17px]">
              Indian hosted servers featuring smart auto-sleep hibernation (no 24/7 idle power drain), instant auto-wake on join, Bedrock & Java crossplay, and live web management.
            </p>

            {/* Deploy prompt capsule */}
            <div className="relative z-10 mx-auto mt-8 flex w-full max-w-xl justify-center">
              <ComposerArt />
            </div>

            {/* Key feature pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[13px] font-medium text-[#8e98a8]">
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#fb923c]" />
                <span className="text-[#f3f4f6]">4GB Server from ₹600/mo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#fb923c]" />
                <span>Indian Hosted (Low Ping)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#fb923c]" />
                <span>Console & Bedrock Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[#fb923c]" />
                <span>Smart Auto-Sleep & Wake</span>
              </div>
            </div>
          </div>

          {/* Telemetry & Feature Grid directly below hero - completely non-overlapping */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatArt />
            <NodeArt />
            <CrossplayArt />
            <SleepArt />
          </div>
        </div>
      </section>

      {/* ===== Product Artifact Showcase ===== */}
      <section className="relative px-6 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="v3-art overflow-hidden p-2 bg-[#12151f] border border-[#1e2433] rounded-[24px]">
            <div className="rounded-[18px] bg-[#161a26] p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-5">
                <div className="rounded-[16px] border border-[#1e2433] bg-[#12151f] p-5 sm:col-span-2">
                  <p className="v3-tag text-[12px] text-[#8e98a8]">Server Instance</p>
                  <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-[#1e2433] bg-[#161a26] p-3">
                    <span className="flex size-9 items-center justify-center rounded-[10px] bg-[#fb923c]/20 text-[#fb923c]">
                      <Server className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-[#f3f4f6]">Paper 26.3 Node</p>
                      <p className="flex items-center gap-1 text-[13px] text-emerald-400 font-medium">
                        <Check className="size-3 text-emerald-400" /> 20.0 TPS Stable · Fast
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['Paper 26.3', 'Geyser', 'Crossplay', 'NVMe', 'Auto-Sleep'].map((t) => (
                      <span key={t} className="v3-tag bg-[#161a26] px-2 py-0.5 rounded border border-[#1e2433] text-[11px] text-[#8e98a8]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[#1e2433] bg-[#12151f] p-5 sm:col-span-3">
                  <p className="v3-tag text-[12px] text-[#8e98a8]">Active State & Controls</p>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-[12px] border border-[#1e2433] bg-[#161a26] p-3">
                      <p className="text-[12px] text-[#8e98a8]">Server Address</p>
                      <p className="text-[14px] font-mono text-[#f3f4f6]">play.kryin.gg • Ports: 25565 (Java) / 19132 (Bedrock)</p>
                    </div>
                    <div className="flex items-center justify-between rounded-[12px] border border-[#1e2433] bg-[#161a26] p-3">
                      <p className="text-[14px] text-[#f3f4f6]">Hardware Node Location</p>
                      <span className="rounded-full bg-[#fb923c]/15 border border-[#fb923c]/30 px-2 py-0.5 text-[12px] font-bold text-[#fb923c]">
                        India (Mumbai Datacenter)
                      </span>
                    </div>
                    <div className="rounded-[12px] border border-[#fb923c]/30 bg-[#fb923c]/10 p-3">
                      <p className="text-[12px] text-[#fb923c] font-semibold">Smart Sleep Enabled</p>
                      <p className="text-[13px] text-[#f3f4f6]">Server sleeps when empty to eliminate 24/7 idle drain; wakes on join in &lt;2 mins.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Trusted-by Strip ===== */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center v3-tag text-[13px] text-[#6b778d]">Built specifically for Minecraft communities in India</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST.map((t) => (
              <span key={t} className="text-[15px] font-medium text-[#8e98a8]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="bg-[#11141c] px-6 py-20 border-y border-[#1e2433]">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="v3-tag text-[13px] text-[#fb923c] font-semibold">Built for Players</p>
            <h2 className="text-[34px] sm:text-[48px] text-[#f3f4f6]">
              Modern Minecraft <span className="v3-em text-[#fb923c]">hosting</span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-[22px] p-7 border transition-all duration-300 hover:shadow-lg ${
                  f.peach
                    ? 'border-[#fb923c]/50 bg-[#fb923c]/10'
                    : 'border-[#1e2433] bg-[#151924] hover:border-[#2a3348]'
                }`}
              >
                <p className={`text-[12px] font-semibold uppercase tracking-wider ${f.peach ? 'text-[#fb923c]' : 'text-[#8e98a8]'}`}>
                  {f.tag}
                </p>
                <h3 className="mt-2.5 text-[22px] font-bold text-[#f3f4f6]">
                  {f.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[#8e98a8]">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3 Numbered Steps ===== */}
      <section className="px-6 py-20 bg-[#0a0c10] border-b border-[#1e2433]">
        <div className="mx-auto max-w-[1200px] space-y-12">
          <div className="text-center max-w-md mx-auto space-y-2">
            <p className="v3-tag text-[13px] text-[#fb923c] font-semibold">Fast Provisioning</p>
            <h2 className="text-[34px] sm:text-[46px] text-[#f3f4f6]">
              How it works in 3 steps
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[20px] bg-[#12151f] p-7 border border-[#1e2433] space-y-3 hover:border-[#2a3348] transition-all">
                <span className="text-3xl font-mono font-bold text-[#fb923c]">{s.n}</span>
                <h3 className="text-[19px] font-bold text-[#f3f4f6]">{s.title}</h3>
                <p className="text-[14px] text-[#8e98a8] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Capabilities Grid ===== */}
      <section id="capabilities" className="px-6 py-20 bg-[#11141c]">
        <div className="mx-auto max-w-[1200px] space-y-10">
          <div className="text-center max-w-md mx-auto space-y-2">
            <p className="v3-tag text-[13px] text-[#fb923c] font-semibold">Everything You Need</p>
            <h2 className="text-[34px] sm:text-[46px] text-[#f3f4f6]">
              Server Capabilities
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="rounded-[18px] bg-[#151924] p-5 border border-[#1e2433] hover:border-[#2a3348] hover:shadow-md transition-all space-y-2.5"
                >
                  <div className="size-9 rounded-xl bg-[#fb923c]/15 border border-[#fb923c]/30 flex items-center justify-center text-[#fb923c]">
                    <Icon className="size-4" />
                  </div>
                  <h4 className="text-[15px] font-semibold text-[#f3f4f6]">{c.label}</h4>
                  <p className="text-[12px] text-[#8e98a8] leading-relaxed">{c.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Server Plans & Pricing (Starting from ₹600) ===== */}
      <section id="plans" className="px-6 py-24 bg-[#0a0c10] border-y border-[#1e2433]">
        <div className="mx-auto max-w-[1200px] space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#fb923c]/15 border border-[#fb923c]/30 text-[#fb923c]">
              Indian Hosted Plans
            </span>
            <h2 className="text-[34px] sm:text-[50px] text-[#f3f4f6] font-bold">
              Choose your server tier
            </h2>
            <p className="text-[15px] text-[#8e98a8] leading-relaxed">
              4GB RAM high-speed Indian server starting from just ₹600/mo. Smart sleep architecture saves resources with no 24/7 idle drain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Free Starter',
                badge: 'Community Tier',
                price: '₹0',
                cycle: 'forever',
                ram: '2 GB RAM',
                cpu: '1 vCPU Core',
                storage: '10 GB SSD',
                slots: '5 Slots',
                features: [
                  'Smart Auto-Sleep when empty',
                  'Auto-Wake on player join (<2 mins)',
                  'Java & Bedrock Crossplay',
                  'Web Console & Inventory Viewer',
                  'Custom Subdomain (*.kryin.gg)',
                ],
                highlight: false,
                cta: 'Deploy Free Server',
              },
              {
                name: 'Indian Dedicated 4GB',
                badge: 'Most Popular · ₹600/mo',
                price: '₹600',
                cycle: 'month',
                ram: '4 GB High-Speed RAM',
                cpu: '2 vCPU Cores',
                storage: '40 GB NVMe Storage',
                slots: '20+ Players (No Lag)',
                features: [
                  'Indian Hosted Node (Lowest Ping)',
                  'Fast No Lag (20.0 Stable TPS)',
                  'Console Ready (Bedrock Crossplay)',
                  'Smart Sleep (No 24/7 idle waste)',
                  'Auto-Wake in <2 mins on join or web',
                  'Paper 26.3 & Purpur Optimized',
                  'Full Web Console & SFTP Access',
                  'Daily Automated Backups',
                ],
                highlight: true,
                cta: 'Deploy 4GB Server',
              },
              {
                name: 'Power SMP 8GB',
                badge: 'Heavy Plugins',
                price: '₹1,150',
                cycle: 'month',
                ram: '8 GB High-Speed RAM',
                cpu: '3 vCPU Cores',
                storage: '80 GB NVMe Storage',
                slots: '50+ Players',
                features: [
                  'Indian Hosted High-Speed Node',
                  'Fast No Lag Priority Execution',
                  'Console Ready (Bedrock & Java)',
                  'Smart Sleep & Auto-Wake on Join',
                  'Modpack & Heavy Plugin Support',
                  'Full SFTP & MySQL Database',
                  'Hourly Snapshot Backups',
                ],
                highlight: false,
                cta: 'Deploy 8GB Server',
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`rounded-[24px] p-7 flex flex-col justify-between transition-all duration-300 ${
                  p.highlight
                    ? 'border-2 border-[#fb923c] bg-[#151924] shadow-xl ring-1 ring-[#fb923c]/20 relative'
                    : 'border border-[#1e2433] bg-[#12151f] hover:border-[#2a3348] hover:bg-[#151924]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#fb923c]/15 border border-[#fb923c]/30 text-[#fb923c]">
                      {p.badge}
                    </span>
                    {p.highlight && (
                      <span className="text-[10px] font-bold uppercase text-emerald-400 flex items-center gap-1">
                        <Sparkles className="size-3" /> Recommended
                      </span>
                    )}
                  </div>
                  <h4 className="text-[20px] font-bold text-[#f3f4f6] mt-3">{p.name}</h4>

                  <div className="my-4 pb-4 border-b border-[#1e2433]">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#f3f4f6] font-mono">{p.price}</span>
                    <span className="text-xs text-[#8e98a8] ml-1.5">/ {p.cycle}</span>
                  </div>

                  <div className="space-y-2 text-xs text-[#f3f4f6] mb-5 pb-5 border-b border-[#1e2433]">
                    <div className="flex justify-between"><span className="text-[#8e98a8]">RAM:</span> <span className="font-semibold">{p.ram}</span></div>
                    <div className="flex justify-between"><span className="text-[#8e98a8]">CPU:</span> <span className="font-semibold">{p.cpu}</span></div>
                    <div className="flex justify-between"><span className="text-[#8e98a8]">Storage:</span> <span className="font-semibold">{p.storage}</span></div>
                    <div className="flex justify-between"><span className="text-[#8e98a8]">Slots:</span> <span className="font-semibold">{p.slots}</span></div>
                  </div>

                  <ul className="space-y-2.5 text-[13px] text-[#8e98a8] mb-6">
                    {p.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2">
                        <Check className="size-4 text-[#fb923c] shrink-0 mt-0.5" />
                        <span className="text-[#cbd5e1]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <FilledPill href="/login">{p.cta}</FilledPill>
              </div>
            ))}
          </div>

          {/* Eco sleep banner notice */}
          <div className="max-w-2xl mx-auto rounded-[16px] border border-[#1e2433] bg-[#12151f] p-4 text-center text-[13px] text-[#8e98a8]">
            <span className="text-[#fb923c] font-semibold">How Smart Sleep Works:</span> When no players are online, servers enter a low-power sleep state to prevent 24/7 idle drain. As soon as a player connects, it wakes automatically in under 2 minutes with all progress saved.
          </div>
        </div>
      </section>

      {/* ===== FAQ Accordion ===== */}
      <section id="faq" className="px-6 py-20 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <p className="v3-tag text-[13px] text-[#fb923c] font-semibold">Questions & Answers</p>
          <h2 className="text-[34px] sm:text-[46px] text-[#f3f4f6]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-[18px] border border-[#1e2433] bg-[#12151f] p-5 transition-all [&_summary::-webkit-details-marker]:hidden hover:border-[#2a3348]"
            >
              <summary className="flex cursor-pointer items-center justify-between text-[15px] font-semibold text-[#f3f4f6] hover:text-[#fb923c] transition-colors">
                <span>{item.q}</span>
                <ChevronDown className="size-4 text-[#8e98a8] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-[#8e98a8] border-t border-[#1e2433] pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== Bottom CTA Banner ===== */}
      <section className="px-6 py-20 bg-[#11141c] border-t border-[#1e2433] text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-[34px] sm:text-[48px] text-[#f3f4f6] font-bold">
            Ready to deploy your Minecraft world?
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#8e98a8] leading-relaxed">
            Get started with our free tier or launch a high-speed 4GB Indian Hosted Server for ₹600/month with zero lag and console ready cross-play.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <FilledPill href="/login">Deploy Server Now</FilledPill>
            <GhostPill href="#plans">View 4GB Plan</GhostPill>
          </div>
        </div>
      </section>

      {/* ===== Executive Footer ===== */}
      <footer className="border-t border-[#1e2433] bg-[#0a0c10] py-12 px-6 text-[13px] text-[#8e98a8]">
        <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded bg-[#fb923c] text-[#0a0c10] font-bold">
              <Server className="size-3.5" />
            </div>
            <span className="font-bold text-[14px] text-[#f3f4f6]">KryinHost</span>
            <span className="text-[#6b778d]">·</span>
            <span>Indian Game Server Infrastructure</span>
          </div>

          <div className="flex items-center gap-6 text-[13px]">
            <Link href="/" className="hover:text-[#f3f4f6] transition-colors">Home</Link>
            <Link href="#plans" className="hover:text-[#f3f4f6] transition-colors">Plans</Link>
            <Link href="/login" className="hover:text-[#f3f4f6] transition-colors">Client Area</Link>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Indian Nodes Online
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] mt-6 pt-6 border-t border-[#1e2433] flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#6b778d]">
          <p>© 2026 KryinHost Inc. All rights reserved. Not an official Minecraft product.</p>
          <p className="font-mono">Indian Hosted · Snapdragon 888 & High-Freq Nodes · OpenJDK 25</p>
        </div>
      </footer>
    </div>
  );
}
