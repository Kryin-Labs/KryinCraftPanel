'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Zap,
  Shield,
  HardDrive,
  Users,
  Terminal,
  Globe,
  Check,
  ArrowRight,
  Cpu,
  Clock,
  HelpCircle,
  FolderTree,
  ChevronRight,
  Radio,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#0e1117] text-zinc-100 selection:bg-emerald-600 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-[#12151d] border-b border-zinc-800 text-[11px] text-zinc-400 py-2 px-4 text-center">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            <strong className="text-zinc-200">High-Performance Nodes Online:</strong> Snapdragon & Ryzen 9 high-frequency hardware • Java 26 & Bedrock Cross-Play Supported
          </span>
          <Link href="/plans" className="text-emerald-400 font-semibold hover:underline ml-2">
            View Plans →
          </Link>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="border-b border-zinc-800/80 bg-[#12151d]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-zinc-100 text-base tracking-tight">KryinHost</span>
              <span className="text-[10px] text-zinc-500 block leading-none">Minecraft Server Hosting</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
            <Link href="#features" className="hover:text-zinc-100 transition-colors">
              Features
            </Link>
            <Link href="/plans" className="hover:text-zinc-100 transition-colors">
              Plans & Pricing
            </Link>
            <Link href="#control-panel" className="hover:text-zinc-100 transition-colors">
              Control Panel
            </Link>
            <Link href="#hardware" className="hover:text-zinc-100 transition-colors">
              Hardware
            </Link>
            <Link href="#faq" className="hover:text-zinc-100 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 text-zinc-300 hover:text-white transition-colors"
            >
              Client Area
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              Deploy Server
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 pb-16 px-4 max-w-5xl mx-auto text-center space-y-6">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          99.99% Hardware Uptime • Over 1,200+ Active Worlds Hosted
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.15]">
          High-Performance Minecraft Hosting.
          <span className="block text-emerald-400 mt-1">Built for Players & Creators.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Instant server provisioning, enterprise Anti-DDoS mitigation, ultra-fast NVMe storage, and zero-lag Java & Bedrock cross-play. Start on our free starter tier or scale up to dedicated high-frequency hardware.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Deploy Free Server</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/plans"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#151821] hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Explore Server Plans</span>
          </Link>
        </div>

        {/* Trust & Spec Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
          <div className="p-3 bg-[#151821] border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Average Ping</span>
            <span className="text-sm font-bold text-zinc-100">&lt; 15 ms Global</span>
          </div>
          <div className="p-3 bg-[#151821] border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Tick Rate</span>
            <span className="text-sm font-bold text-emerald-400">20.0 Stable TPS</span>
          </div>
          <div className="p-3 bg-[#151821] border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Solid State</span>
            <span className="text-sm font-bold text-zinc-100">100% Gen4 NVMe</span>
          </div>
          <div className="p-3 bg-[#151821] border border-zinc-800 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Anti-DDoS Shield</span>
            <span className="text-sm font-bold text-zinc-100">2.5+ Tbps Filtering</span>
          </div>
        </div>
      </section>

      {/* Realistic Control Panel Preview Showcase (Generic Human Clean Design - No Neon) */}
      <section id="control-panel" className="max-w-5xl mx-auto px-4 pb-20">
        <div className="bg-[#151821] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Window Title Bar */}
          <div className="bg-[#12151d] px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
              <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
              <span className="w-3 h-3 rounded-full bg-zinc-700"></span>
              <span className="text-xs font-mono text-zinc-400 ml-2">
                kryinhost-node-01 • Paper 26.3 • Web Terminal & Inventory Inspector
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-semibold font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE (20.0 TPS)
              </span>
            </div>
          </div>

          {/* Quick Metrics Header inside Mockup */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800 text-xs">
            <div className="bg-[#151821] p-3">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Memory Usage</span>
              <span className="text-xs font-bold text-zinc-200 font-mono">4.18 GB / 8.00 GB (52%)</span>
            </div>
            <div className="bg-[#151821] p-3">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">CPU Utilization</span>
              <span className="text-xs font-bold text-zinc-200 font-mono">14.2% (3.8 GHz Clock)</span>
            </div>
            <div className="bg-[#151821] p-3">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Online Players</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">4 / 60 Players</span>
            </div>
            <div className="bg-[#151821] p-3">
              <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Bedrock Bridge</span>
              <span className="text-xs font-bold text-zinc-200 font-mono">Geyser v2.12.1 Ready</span>
            </div>
          </div>

          {/* Console Output Mockup */}
          <div className="p-4 sm:p-5 font-mono text-xs text-zinc-300 bg-[#0e1117] space-y-1.5 leading-relaxed overflow-x-auto border-t border-zinc-800">
            <div className="text-zinc-500">[12:45:01 INFO]: Starting minecraft server version 26.3 (Paper build #249)</div>
            <div className="text-zinc-400">[12:45:02 INFO]: Loading server.properties, difficulty: HARD, view-distance: 8</div>
            <div className="text-zinc-400">[12:45:03 INFO]: [Paper] Using 8 worker threads for world generation & chunk I/O</div>
            <div className="text-emerald-400">[12:45:04 INFO]: [Geyser-Spigot] Started Bedrock listener on 0.0.0.0:19132</div>
            <div className="text-zinc-400">[12:45:04 INFO]: Preparing spawn area: 100% completed</div>
            <div className="text-emerald-400">[12:45:05 INFO]: Done (3.812s)! For help, type &quot;help&quot;</div>
            <div className="text-zinc-300">[12:45:10 INFO]: KryinAgent: Synchronizing player inventory & stats with web panel</div>
            <div className="text-zinc-500 flex items-center gap-2 pt-2 border-t border-zinc-800/80">
              <span className="text-emerald-500">&gt;</span>
              <span className="text-zinc-400">Server listening for incoming Java (25565) & Bedrock (19132) connections...</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Server Plans Section */}
      <section className="py-16 px-4 bg-[#12151d] border-y border-zinc-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60 uppercase tracking-wider">
              Transparent Pricing
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
              Choose the Perfect Server Plan
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Start free with automatic hibernation or scale up with 24/7 dedicated high-frequency resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Free Starter */}
            <div className="bg-[#151821] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Free Forever
                </span>
                <h3 className="text-base font-bold text-zinc-100 mt-2">Free Starter</h3>
                <p className="text-[11px] text-zinc-400 mt-1 min-h-[32px]">
                  Ideal for small friend groups, testing worlds, and vanilla gameplay.
                </p>

                <div className="my-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">$0.00</span>
                    <span className="text-[11px] text-zinc-500">/ forever</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex justify-between"><span className="text-zinc-500">RAM:</span> <span className="font-semibold text-white">2 GB</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">vCPU:</span> <span className="font-semibold text-white">1 Core</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Storage:</span> <span className="font-semibold text-white">10 GB SSD</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Players:</span> <span className="font-semibold text-white">Up to 5</span></div>
                </div>

                <ul className="space-y-2 text-[11px] text-zinc-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Automatic Hibernation & Wake</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Java & Bedrock Cross-Play</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Web Console & Player Manager</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                Deploy Free
              </Link>
            </div>

            {/* Grass Explorer */}
            <div className="bg-[#151821] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  Entry Level
                </span>
                <h3 className="text-base font-bold text-zinc-100 mt-2">Grass Explorer</h3>
                <p className="text-[11px] text-zinc-400 mt-1 min-h-[32px]">
                  For active survival worlds, lightweight plugins, and vanilla+ SMPs.
                </p>

                <div className="my-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">$3.99</span>
                    <span className="text-[11px] text-zinc-500">/ month</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex justify-between"><span className="text-zinc-500">RAM:</span> <span className="font-semibold text-white">4 GB DDR4</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">vCPU:</span> <span className="font-semibold text-white">2 Cores</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Storage:</span> <span className="font-semibold text-white">35 GB NVMe</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Players:</span> <span className="font-semibold text-white">Up to 20</span></div>
                </div>

                <ul className="space-y-2 text-[11px] text-zinc-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> 24/7 Always-On (No Sleep)</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Gen4 NVMe Storage</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Daily Automated Backups</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                Select Explorer
              </Link>
            </div>

            {/* Iron Standard (Featured) */}
            <div className="bg-[#181d29] border-2 border-emerald-600/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg relative">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                  Most Popular
                </span>
                <h3 className="text-base font-bold text-zinc-100 mt-2">Iron Standard</h3>
                <p className="text-[11px] text-zinc-400 mt-1 min-h-[32px]">
                  Recommended for medium communities, Towny, Skyblock, and modded SMPs.
                </p>

                <div className="my-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">$7.99</span>
                    <span className="text-[11px] text-zinc-500">/ month</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex justify-between"><span className="text-zinc-500">RAM:</span> <span className="font-semibold text-white">8 GB DDR4/DDR5</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">vCPU:</span> <span className="font-semibold text-white">3 Cores</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Storage:</span> <span className="font-semibold text-white">80 GB NVMe</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Players:</span> <span className="font-semibold text-white">Up to 60</span></div>
                </div>

                <ul className="space-y-2 text-[11px] text-zinc-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Full Modpack & Plugin Support</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Enterprise Anti-DDoS Scrubbing</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Offsite Cloud Backups & Free MySQL</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
              >
                Select Iron Standard
              </Link>
            </div>

            {/* Diamond Performance */}
            <div className="bg-[#151821] border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  High Performance
                </span>
                <h3 className="text-base font-bold text-zinc-100 mt-2">Diamond Performance</h3>
                <p className="text-[11px] text-zinc-400 mt-1 min-h-[32px]">
                  Heavy Forge & NeoForge packs (ATM 9, Prominence), high player counts.
                </p>

                <div className="my-4 pb-4 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">$14.99</span>
                    <span className="text-[11px] text-zinc-500">/ month</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300 mb-4 pb-4 border-b border-zinc-800">
                  <div className="flex justify-between"><span className="text-zinc-500">RAM:</span> <span className="font-semibold text-white">12 GB High-Freq</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">vCPU:</span> <span className="font-semibold text-white">4 Cores</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Storage:</span> <span className="font-semibold text-white">150 GB NVMe</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Players:</span> <span className="font-semibold text-white">Unlimited</span></div>
                </div>

                <ul className="space-y-2 text-[11px] text-zinc-400 mb-6">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Dedicated High-Clock CPU Priority</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Zero Tick-Lag Guarantee</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Hourly Snapshot Restores</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
              >
                Select Diamond
              </Link>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/plans"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold"
            >
              <span>Compare all 5 server tiers and detailed feature matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Advantages (Features Grid) */}
      <section id="features" className="py-20 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60 uppercase tracking-wider">
            Why KryinHost
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
            Engineered for Flawless Gameplay
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
            Everything your community needs to thrive without lag, downtime, or complicated setups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Cross-play */}
          <div className="p-6 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Java & Bedrock Cross-Play</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Native integration with Geyser and Floodgate. Friends on iPhone, Android, Xbox, PlayStation, Nintendo Switch, and PC play together on the exact same server.
            </p>
          </div>

          {/* 2. Instant Hibernation */}
          <div className="p-6 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Smart Hibernation & Instant Wake</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Free-tier servers sleep when empty to conserve resources, waking in under 2 seconds the instant a player attempts to connect. Paid servers remain always-on 24/7.
            </p>
          </div>

          {/* 3. 1-Click Installer */}
          <div className="p-6 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">1-Click Software & Modpacks</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Switch effortlessly between Paper, Purpur, Fabric, Spigot, Forge, and NeoForge. Install popular CurseForge and Modrinth modpacks with a single click.
            </p>
          </div>

          {/* 4. Anti-DDoS */}
          <div className="p-6 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Enterprise Anti-DDoS Protection</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Multilayer 2.5+ Tbps traffic filtering shields your server from UDP packet floods, bot spam attacks, and targeted denial-of-service threats automatically.
            </p>
          </div>

          {/* 5. NVMe Storage */}
          <div className="p-6 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Gen4 NVMe Solid State Storage</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ultra-fast 7,000 MB/s sequential read/write drives ensure rapid chunk loading, zero autosave hitches, and near-instant world initialization.
            </p>
          </div>

          {/* 6. Modern Web Panel */}
          <div className="p-6 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-100">Modern Web Management Panel</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Live web terminal console, visual player inventory & health inspector, online coordinates, file manager, and automated scheduler right from your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Hardware & Infrastructure Breakdown */}
      <section id="hardware" className="py-16 px-4 bg-[#12151d] border-t border-zinc-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60 uppercase tracking-wider">
              Node Infrastructure
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
              Enterprise Grade Server Hardware
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Minecraft is single-thread heavy. We only utilize high-frequency processors with maximum single-core IPC performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
              <Cpu className="w-6 h-6 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">High-Frequency Clocks</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Processor clock frequencies exceeding 3.8 GHz ensure that entity ticks, redstone contraptions, and mob farms run at a locked 20.0 TPS without tick drop.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
              <HardDrive className="w-6 h-6 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Enterprise ECC RAM</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Error-Correcting Code (ECC) memory prevents unexpected memory flips and eliminates data corruption during intensive chunk generation and world saves.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151821] border border-zinc-800 space-y-3">
              <Radio className="w-6 h-6 text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-100">Redundant 10Gbps Uplinks</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct connections to major Tier 1 network providers ensure low routing hops, minimal packet loss, and sub-15ms pings for domestic players.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="max-w-4xl mx-auto px-4 py-20 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60 uppercase tracking-wider">
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Everything you need to know about setting up and running your server.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How fast is my server ready after creating an account?',
              a: 'Instantly. Your Minecraft server is automatically provisioned and ready to join within 60 seconds of registration.',
            },
            {
              q: 'How does Bedrock & Java Cross-Play work?',
              a: 'Every server comes preconfigured with Geyser and Floodgate. Java edition players join using your custom domain (port 25565), while Bedrock players on mobile, Xbox, or PlayStation join on port 19132 into the same world.',
            },
            {
              q: 'Can I upload my existing Minecraft singleplayer world?',
              a: 'Yes! You have full access to our web-based file manager and SFTP. You can simply drag-and-drop your existing world folder or a zip archive directly into your server directory.',
            },
            {
              q: 'What is the difference between the Free Starter plan and paid plans?',
              a: 'Similar to MineKeep, our Free Starter plan includes automated hibernation—the server goes to sleep when empty and boots up automatically when someone attempts to connect. Paid plans remain online 24/7 without hibernation and offer more RAM and dedicated CPU cores.',
            },
            {
              q: 'Can I install my own plugins and mods?',
              a: 'Yes. You have 100% full file access. You can upload custom .jar plugins to the plugins directory or install Forge/Fabric mods through our 1-click installer.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#151821] border border-zinc-800 rounded-xl overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-zinc-100 hover:text-emerald-400 transition-colors"
              >
                <span>{item.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-zinc-500 transition-transform ${
                    activeFaq === idx ? 'rotate-90 text-emerald-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/60">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-[#12151d] border-t border-zinc-800 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100">
            Ready to Launch Your Minecraft Server?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Create your world in under 60 seconds with our free starter tier or choose high-frequency dedicated hardware. Zero credit card required to start.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Deploy Server Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/plans"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Browse All Plans</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Comprehensive Hosting Footer */}
      <footer className="border-t border-zinc-800/80 bg-[#0e1117] py-12 px-4 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-800/60">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center text-white">
                <Server className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-zinc-200 text-sm tracking-tight">KryinHost</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Enterprise game server hosting. Low-latency Paper, Purpur, and Fabric instances with built-in Bedrock cross-play.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Hosting Solutions</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/plans" className="hover:text-zinc-300 transition-colors">Minecraft Java Server</Link></li>
              <li><Link href="/plans" className="hover:text-zinc-300 transition-colors">Minecraft Bedrock Server</Link></li>
              <li><Link href="/plans" className="hover:text-zinc-300 transition-colors">Modpack Hosting (Forge)</Link></li>
              <li><Link href="/plans" className="hover:text-zinc-300 transition-colors">Free Hibernation Tier</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Navigation & Panel</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><Link href="/login" className="hover:text-zinc-300 transition-colors">Client Control Panel</Link></li>
              <li><Link href="/plans" className="hover:text-zinc-300 transition-colors">Server Plans & Pricing</Link></li>
              <li><Link href="/#hardware" className="hover:text-zinc-300 transition-colors">Node Infrastructure</Link></li>
              <li><Link href="/#faq" className="hover:text-zinc-300 transition-colors">Support & FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Legal & Status</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li><span className="text-zinc-500">Terms of Service</span></li>
              <li><span className="text-zinc-500">Privacy Policy</span></li>
              <li><span className="text-zinc-500">Anti-DDoS SLA</span></li>
              <li className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>All Systems Operational</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 KryinHost Inc. All rights reserved. Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft.</p>
          <p className="text-zinc-600 font-mono">ASUS ROG Phone 5s Node • Snapdragon 888 • OpenJDK 25</p>
        </div>
      </footer>
    </div>
  );
}
