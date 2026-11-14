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
  FileText,
  Search,
  CheckCircle2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Primitives directly matching KryinOffice UI                         */
/* ------------------------------------------------------------------ */

function FilledPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--foreground)] px-5 py-2.5 text-[14px] font-medium text-[var(--primary-foreground)] transition-all hover:opacity-90 shadow-sm"
    >
      {children}
    </Link>
  );
}

function GhostPill({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--foreground)] px-5 py-2.5 text-[14px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-[var(--primary-foreground)]"
    >
      {children}
    </Link>
  );
}

function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="v3-link text-[14px]">
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Draggable-Float Wrapper (KryinOffice exact logic)                   */
/* ------------------------------------------------------------------ */

function DraggableFloat({
  className,
  delay,
  children,
}: {
  className?: string;
  delay?: string;
  children: ReactNode;
}) {
  const [d, setD] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number } | null>(null);

  const clamp = (v: number) => Math.max(-40, Math.min(40, v));

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
        <div className="kryin-float" style={delay ? { animationDelay: delay } : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating Artifact Cards (KryinOffice style)                         */
/* ------------------------------------------------------------------ */

function StatArt() {
  return (
    <div className="v3-art w-[230px] p-4 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-[18px]">
      <div className="flex items-center justify-between">
        <p className="v3-tag font-medium text-[12px]">Performance</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--peach)] px-2 py-0.5 text-[10px] font-semibold text-[var(--sienna)]">
          Live
        </span>
      </div>
      <p className="mt-1.5 font-medium text-[28px] leading-none text-[var(--foreground)] font-mono">20.0</p>
      <p className="mt-1 text-[12px] text-[var(--muted-foreground)]">stable TPS · 0.0% tick drop</p>
      <svg viewBox="0 0 200 40" className="mt-2.5 w-full" aria-hidden>
        <polyline
          points="0,20 25,20 50,19 75,20 100,20 125,19 150,20 175,20 200,20"
          fill="none"
          stroke="var(--sienna)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function InsightArt() {
  return (
    <div className="v3-art w-[230px] p-4 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-[18px]">
      <div className="flex items-center gap-2">
        <Radio className="size-3.5 text-[var(--sienna)]" />
        <p className="v3-tag font-medium text-[12px]">Network Latency</p>
      </div>
      <p className="mt-2 text-[13px] leading-snug text-[var(--foreground)] font-medium">
        &lt; 15ms global routing with Tier 1 fiber uplinks
      </p>
      <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">Region: US-East & Frankfurt</p>
    </div>
  );
}

function DecisionArt() {
  return (
    <div className="v3-art w-[235px] p-4 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-[18px]">
      <div className="flex items-center justify-between">
        <p className="v3-tag font-medium text-[12px]">Active Build</p>
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <p className="mt-2 text-[14px] font-medium leading-snug text-[var(--foreground)]">
        Paper 26.3 (Build #249) Running
      </p>
      <div className="mt-2.5 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
        <span className="truncate max-w-[140px]">ROG Phone 5s Node</span>
        <span className="font-semibold text-[var(--sienna)]">Online</span>
      </div>
    </div>
  );
}

function McpArt() {
  return (
    <div className="v3-art w-[230px] p-4 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-[18px]">
      <div className="flex items-center justify-between">
        <p className="v3-tag font-medium text-[12px]">Unified Cross-Play</p>
        <Plug className="size-3.5 text-[var(--sienna)]" />
      </div>
      <div className="mt-2 rounded-[10px] bg-[var(--fog)] p-2.5 font-mono text-[11px] leading-relaxed text-[var(--muted-foreground)] border border-[var(--border)]">
        <span className="text-[var(--sienna)] font-semibold">GeyserBridge</span>(Java: 25565, Bedrock: 19132)
      </div>
      <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">iOS, Android, Consoles & PC</p>
    </div>
  );
}

/* Floating ask-anything composer matching KryinOffice */
function ComposerArt() {
  return (
    <div className="v3-art w-full max-w-lg p-3 shadow-lg border border-[var(--border)] transition-all duration-300 hover:shadow-xl hover:border-black/20 bg-white/95 backdrop-blur-md rounded-[20px]">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center size-9 rounded-full bg-[var(--fog)] border border-[var(--border)] text-[var(--sienna)]">
          <Terminal className="size-4" />
        </div>
        <span className="flex-1 text-[13px] sm:text-[14px] text-[var(--muted-foreground)] font-normal text-left truncate">
          Deploy Paper 26.3 with Bedrock crossplay…
        </span>
        <div className="hidden sm:flex items-center gap-1.5 mr-1">
          <span className="rounded-md bg-[var(--fog)] px-2 py-0.5 text-[11px] font-mono text-[var(--ash)] border border-[var(--border)]">
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
/* Data constants                                                      */
/* ------------------------------------------------------------------ */

const TRUST = ['Paper 26.3', 'Purpur', 'Fabric', 'Geyser Cross-Play', '2.5 Tbps Anti-DDoS', 'Gen4 NVMe', 'Low Ping'];

const FEATURES: Array<{ tag: string; title: string; body: string; peach?: boolean }> = [
  {
    tag: 'Cross-Platform Engine',
    title: 'Java & Bedrock unified',
    body: 'Geyser and Floodgate are pre-configured out of the box. Friends on mobile, consoles, and PC join the same world seamlessly.',
  },
  {
    tag: 'Smart Eco Architecture',
    title: 'Hibernation & instant wake',
    body: 'Servers sleep when empty to conserve memory and power, booting up automatically in under 2 seconds the moment a player connects.',
  },
  {
    tag: 'Dedicated Performance',
    title: 'Pure single-thread speed',
    body: 'High-frequency processors, Gen4 NVMe arrays, and zero CPU throttling ensure your server holds a rock-solid 20.0 TPS.',
    peach: true,
  },
];

const STEPS = [
  { n: '01', title: 'Pick your software', body: 'Choose Paper 26.3, Purpur, or Fabric. Instant 60-second activation.' },
  { n: '02', title: 'Share your address', body: 'Connect from Java edition or Bedrock with your free *.kryin.gg domain.' },
  { n: '03', title: 'Control from the web', body: 'Live web console, player inventory viewer, and automatic daily backups.' },
];

const CAPABILITIES = [
  { icon: Globe, label: 'Java & Bedrock Cross-Play', note: 'Pre-configured Geyser & Floodgate' },
  { icon: Zap, label: 'Smart Hibernation & Wake', note: 'Zero resource waste when idle' },
  { icon: RefreshCw, label: '1-Click Modpack Switcher', note: 'Paper, Purpur, Fabric & Forge' },
  { icon: Shield, label: 'Enterprise Anti-DDoS', note: '2.5+ Tbps multilayer protection' },
  { icon: HardDrive, label: 'Gen4 NVMe Storage', note: '7,000 MB/s speed, zero chunk lag' },
  { icon: Terminal, label: 'Real-Time Web Console', note: 'Live command streaming & RCON' },
  { icon: Users, label: 'Visual Player Inspector', note: 'Inspect inventory, health & coords' },
  { icon: Clock, label: 'Automated Daily Backups', note: 'Daily snapshots & 1-click restore' },
];

const FAQ = [
  {
    q: 'How fast is my server ready after registration?',
    a: 'Instantly. Your Paper 26.3 server instance is provisioned and joinable in under 60 seconds.',
  },
  {
    q: 'How does Bedrock & Java Cross-Play work?',
    a: 'Every server has Geyser and Floodgate preconfigured. Java edition players join with port 25565, while Bedrock players on mobile or console join with port 19132 into the exact same world.',
  },
  {
    q: 'Can I upload my existing Minecraft singleplayer world?',
    a: 'Yes. You have full access to our web file manager and SFTP. Simply drag and drop your world folder or zip archive.',
  },
  {
    q: 'How does the Free Starter plan hibernation work?',
    a: 'Similar to MineKeep, free servers enter a low-power hibernation state when all players disconnect. As soon as someone attempts to join, it wakes automatically in under 2 seconds.',
  },
];

/* ------------------------------------------------------------------ */
/* Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="theme-v3 relative min-h-dvh">
      {/* Navigation matching KryinOffice */}
      <header
        className={`fixed inset-x-0 top-0 z-50 flex flex-col items-center overflow-hidden px-5 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md border-b border-[var(--border)] py-3 shadow-xs' : 'bg-transparent py-4'
        }`}
      >
        <div className="flex w-full max-w-[1200px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--foreground)] text-white shadow-xs">
              <Server className="size-4" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-[var(--foreground)]">KryinHost</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex text-[14px] text-[var(--muted-foreground)]">
            <Link href="#features" className="hover:text-[var(--foreground)] transition-colors">
              Features
            </Link>
            <Link href="/plans" className="hover:text-[var(--foreground)] transition-colors">
              Plans & Pricing
            </Link>
            <Link href="#capabilities" className="hover:text-[var(--foreground)] transition-colors">
              Capabilities
            </Link>
            <Link href="#faq" className="hover:text-[var(--foreground)] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-[14px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors sm:inline-flex"
            >
              Sign in
            </Link>
            <FilledPill href="/login">Get started</FilledPill>
          </div>
        </div>
      </header>

      {/* ===== Hero: serif headline + artifact collage (KryinOffice exact layout) ===== */}
      <section className="relative min-h-[75vh] lg:min-h-[82vh] flex flex-col justify-center items-center overflow-hidden pt-36 pb-16 sm:pt-44 sm:pb-20 lg:pt-48 lg:pb-24">
        {/* Peach atmospheric wash & ambient mesh */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[580px] w-full"
          style={{
            background:
              'radial-gradient(55% 65% at 50% 20%, var(--peach) 0%, oklch(0.96 0.03 160 / 0.18) 50%, transparent 80%)',
            opacity: 0.85,
          }}
          aria-hidden
        />
        <div className="kryin-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />

        <div className="relative mx-auto w-full max-w-[1240px] px-6">
          {/* Floating artifacts around the hero (positioned flanking the content) */}
          <DraggableFloat className="absolute -left-2 top-8 z-20 hidden xl:block -rotate-[2deg]" delay="0s">
            <StatArt />
          </DraggableFloat>
          <DraggableFloat className="absolute -left-6 top-[18rem] z-20 hidden lg:block rotate-[2deg]" delay="1.2s">
            <InsightArt />
          </DraggableFloat>
          <DraggableFloat className="absolute -right-2 top-10 z-20 hidden xl:block rotate-[3deg]" delay="1.5s">
            <DecisionArt />
          </DraggableFloat>
          <DraggableFloat className="absolute -right-6 top-[19rem] z-20 hidden lg:block -rotate-[2deg]" delay="0.8s">
            <McpArt />
          </DraggableFloat>

          {/* Hero text & CTA container */}
          <div className="relative z-10 mx-auto max-w-4xl text-center flex flex-col items-center">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/90 px-3.5 py-1 text-[12px] font-medium text-[var(--foreground)] shadow-xs backdrop-blur-md mb-6 transition-all hover:bg-white hover:shadow-sm">
              <span className="flex size-2 rounded-full bg-[var(--sienna)] animate-pulse" />
              <span className="text-[var(--sienna)] font-semibold">Kryin Server Engine v3.0</span>
              <span className="h-3 w-[1px] bg-[var(--border)]" />
              <span className="text-[var(--muted-foreground)]">High-Performance Game Hosting</span>
              <ArrowRight className="size-3 text-[var(--muted-foreground)]" />
            </div>

            {/* Main Serif Headline */}
            <h1 className="text-[40px] leading-[1.04] text-[var(--foreground)] sm:text-[60px] md:text-[72px] lg:text-[80px]">
              Minecraft hosting for pure performance and <span className="v3-em">zero lag</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-[var(--muted-foreground)] sm:text-[17px]">
              KryinHost transforms high-frequency hardware into effortless server hosting — instant Java & Bedrock cross-play, 2.5 Tbps Anti-DDoS, and real-time web management.
            </p>

            {/* Ask-anything Composer CTA */}
            <div className="relative z-10 mx-auto mt-9 flex w-full max-w-xl justify-center">
              <ComposerArt />
            </div>

            {/* Feature highlights strip under CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[13px] font-medium text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[var(--sienna)]" />
                <span>Paper 26.3 & Purpur Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[var(--sienna)]" />
                <span>Geyser Cross-Play Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="size-3.5 text-[var(--sienna)]" />
                <span>Zero Configuration Setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Product artifact showcase (big floating card) ===== */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="v3-art overflow-hidden p-2">
            <div className="rounded-[16px] bg-[var(--fog)] p-6 sm:p-10">
              <div className="grid gap-4 sm:grid-cols-5">
                <div className="rounded-[16px] border border-[var(--border)] bg-white p-5 sm:col-span-2">
                  <p className="v3-tag">Server Instance</p>
                  <div className="mt-3 flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--fog)] p-3">
                    <span className="flex size-9 items-center justify-center rounded-[10px] bg-[var(--peach)] text-[var(--sienna)]">
                      <Server className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-[var(--foreground)]">Paper 26.3 (Build #249)</p>
                      <p className="flex items-center gap-1 text-[13px] text-[var(--muted-foreground)]">
                        <Check className="size-3 text-emerald-500" /> 20.0 TPS Stable
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {['paper', 'geyser', 'crossplay', 'nvme'].map((t) => (
                      <span key={t} className="v3-tag bg-[var(--fog)] px-2 py-0.5 rounded border border-[var(--border)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-[16px] border border-[var(--border)] bg-white p-5 sm:col-span-3">
                  <p className="v3-tag">Active State & Controls</p>
                  <div className="mt-3 space-y-2.5">
                    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--fog)] p-3">
                      <p className="text-[12px] text-[var(--muted-foreground)]">Network Endpoint</p>
                      <p className="text-[14px] font-mono text-[var(--foreground)]">play.kryin.gg • Ports: 25565 / 19132</p>
                    </div>
                    <div className="flex items-center justify-between rounded-[12px] border border-[var(--border)] bg-[var(--fog)] p-3">
                      <p className="text-[14px] text-[var(--foreground)]">Hardware Node Status</p>
                      <span className="rounded-full bg-[var(--peach)] px-2 py-0.5 text-[12px] font-semibold text-[var(--sienna)]">
                        Snapdragon 888
                      </span>
                    </div>
                    <div className="rounded-[12px] border border-[var(--peach)] bg-[var(--peach)]/40 p-3">
                      <p className="text-[12px] text-[var(--sienna)] font-semibold">Anti-DDoS Shield</p>
                      <p className="text-[14px] text-[var(--foreground)]">2.5 Tbps active scrub enabled • 0 packet drops</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Trusted-by strip ===== */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center v3-tag">One engine for everything your Minecraft community runs</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {TRUST.map((t) => (
              <span key={t} className="text-[16px] font-medium text-[var(--ash)]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Feature trio (one peach accent card) ===== */}
      <section id="features" className="bg-[var(--fog)] px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="max-w-2xl text-[34px] leading-tight text-[var(--foreground)] sm:text-[56px]">
            Hosting <span className="v3-em">platform</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[24px] p-8 border border-[var(--border)] transition-all hover:shadow-md"
                style={
                  f.peach
                    ? { background: 'var(--peach)', color: 'var(--sienna)' }
                    : { background: 'var(--mist)' }
                }
              >
                <p className="text-[13px] font-medium" style={{ color: f.peach ? 'var(--sienna)' : 'var(--ash)' }}>
                  {f.tag}
                </p>
                <h3 className="mt-2 text-[24px]" style={{ color: f.peach ? 'var(--sienna)' : 'var(--foreground)' }}>
                  {f.title}
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed" style={{ color: f.peach ? 'var(--sienna)' : 'var(--foreground)' }}>
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3 Numbered Steps ===== */}
      <section className="px-6 py-24 bg-white border-b border-[var(--border)]">
        <div className="mx-auto max-w-[1200px] space-y-12">
          <div>
            <p className="v3-tag">Fast Provisioning</p>
            <h2 className="text-[34px] sm:text-[50px] text-[var(--foreground)] mt-1">
              How it works in three steps
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[20px] bg-[var(--fog)] p-8 border border-[var(--border)] space-y-3">
                <span className="text-3xl font-mono font-medium text-[var(--sienna)]">{s.n}</span>
                <h3 className="text-[20px] text-[var(--foreground)]">{s.title}</h3>
                <p className="text-[14px] text-[var(--muted-foreground)] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Capabilities Grid ===== */}
      <section id="capabilities" className="px-6 py-24 bg-[var(--fog)]">
        <div className="mx-auto max-w-[1200px] space-y-10">
          <div>
            <p className="v3-tag">Server Infrastructure</p>
            <h2 className="text-[34px] sm:text-[50px] text-[var(--foreground)] mt-1">
              Built-in tools for total sovereignty
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAPABILITIES.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="rounded-[18px] bg-white p-5 border border-[var(--border)] shadow-xs hover:shadow-md transition-all space-y-2"
                >
                  <div className="size-9 rounded-xl bg-[var(--peach)] flex items-center justify-center text-[var(--sienna)]">
                    <Icon className="size-4" />
                  </div>
                  <h4 className="text-[15px] font-semibold text-[var(--foreground)]">{c.label}</h4>
                  <p className="text-[12px] text-[var(--muted-foreground)]">{c.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Plans Showcase ===== */}
      <section id="plans" className="px-6 py-24 bg-white border-y border-[var(--border)]">
        <div className="mx-auto max-w-[1200px] space-y-10">
          <div className="text-center space-y-1">
            <p className="v3-tag">Simple Pricing</p>
            <h2 className="text-[34px] sm:text-[52px] text-[var(--foreground)]">
              Choose your server tier
            </h2>
            <p className="text-[15px] text-[var(--muted-foreground)] max-w-md mx-auto">
              Start free with automatic hibernation or scale up with 24/7 dedicated resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
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
                features: ['Optimized Paper & Fabric', 'Modpack & Plugin Support', 'Enterprise Anti-DDoS Shield', 'Offsite Cloud Backups & MySQL'],
                highlight: true,
                cta: 'Select Iron',
              },
              {
                name: 'Diamond Extreme',
                badge: 'High Performance',
                price: '$14.99',
                cycle: 'month',
                ram: '12 GB High-Freq',
                cpu: '4 vCPU',
                storage: '150 GB NVMe',
                slots: 'Unlimited',
                features: ['Dedicated CPU Clock Priority', 'Zero Tick-Lag Guarantee', 'Heavy Modpacks (ATM 9)', 'Hourly Snapshot Restores'],
                highlight: false,
                cta: 'Select Diamond',
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className={`rounded-[22px] p-6 flex flex-col justify-between transition-all ${
                  p.highlight
                    ? 'border-2 border-[var(--sienna)] bg-[var(--peach)]/30 shadow-lg'
                    : 'border border-[var(--border)] bg-[var(--fog)] hover:bg-white hover:shadow-md'
                }`}
              >
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[var(--border)] text-[var(--sienna)]">
                    {p.badge}
                  </span>
                  <h4 className="text-[18px] font-bold text-[var(--foreground)] mt-2.5">{p.name}</h4>

                  <div className="my-4 pb-4 border-b border-[var(--border)]">
                    <span className="text-3xl font-extrabold text-[var(--foreground)] font-mono">{p.price}</span>
                    <span className="text-xs text-[var(--muted-foreground)] ml-1">/ {p.cycle}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--foreground)] mb-4 pb-4 border-b border-[var(--border)]">
                    <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">RAM:</span> <span>{p.ram}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">vCPU:</span> <span>{p.cpu}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Storage:</span> <span>{p.storage}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Slots:</span> <span>{p.slots}</span></div>
                  </div>

                  <ul className="space-y-2 text-[12px] text-[var(--muted-foreground)] mb-6">
                    {p.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <Check className="size-3.5 text-[var(--sienna)]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <FilledPill href="/login">{p.cta}</FilledPill>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <ArrowLink href="/plans">Compare all 5 server plans & full feature matrix</ArrowLink>
          </div>
        </div>
      </section>

      {/* ===== FAQ Accordion ===== */}
      <section id="faq" className="px-6 py-24 max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-1">
          <p className="v3-tag">Questions & Answers</p>
          <h2 className="text-[34px] sm:text-[46px] text-[var(--foreground)]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-[18px] border border-[var(--border)] bg-[var(--fog)] p-5 transition-all [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between text-[15px] font-medium text-[var(--foreground)] hover:text-[var(--sienna)] transition-colors">
                <span>{item.q}</span>
                <ChevronDown className="size-4 text-[var(--muted-foreground)] transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted-foreground)] border-t border-[var(--border)] pt-3">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ===== Bottom CTA Banner ===== */}
      <section className="px-6 py-24 bg-[var(--fog)] border-t border-[var(--border)] text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-[34px] sm:text-[54px] text-[var(--foreground)]">
            Ready to deploy your Minecraft world?
          </h2>
          <p className="text-[16px] text-[var(--muted-foreground)] leading-relaxed">
            Create your server in under 60 seconds on our free tier or scale with dedicated high-frequency hardware.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <FilledPill href="/login">Deploy Server Now</FilledPill>
            <GhostPill href="/plans">Browse All Plans</GhostPill>
          </div>
        </div>
      </section>

      {/* ===== Executive Footer matching KryinOffice ===== */}
      <footer className="border-t border-[var(--border)] bg-white py-12 px-6 text-[13px] text-[var(--muted-foreground)]">
        <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded bg-[var(--foreground)] text-white">
              <Server className="size-3.5" />
            </div>
            <span className="font-bold text-[14px] text-[var(--foreground)]">KryinHost</span>
            <span className="text-[var(--ash)]">·</span>
            <span>Game Server Infrastructure</span>
          </div>

          <div className="flex items-center gap-6 text-[13px]">
            <Link href="/" className="hover:text-[var(--foreground)] transition-colors">Home</Link>
            <Link href="/plans" className="hover:text-[var(--foreground)] transition-colors">Plans</Link>
            <Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Client Area</Link>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              All Systems Operational
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] mt-6 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[var(--ash)]">
          <p>© 2026 KryinHost Inc. All rights reserved. Not an official Minecraft product.</p>
          <p className="font-mono">ASUS ROG Phone 5s Node · Snapdragon 888 · OpenJDK 25</p>
        </div>
      </footer>
    </div>
  );
}
