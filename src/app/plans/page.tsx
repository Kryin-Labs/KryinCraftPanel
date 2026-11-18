'use client';

import React from 'react';
import Link from 'next/link';
import { ServerCapacityButton } from '@/components/ServerCapacity';
import {
  Server,
  Check,
  Shield,
  Zap,
  HardDrive,
  Cpu,
  Clock,
  ArrowRight,
  HelpCircle,
  Globe,
  Radio,
  Sparkles,
} from 'lucide-react';

const plans = [
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

const comparisonMatrix = [
  { feature: 'Hosting Location', p4: 'India (Mumbai / Delhi)', p6: 'India (Mumbai / Delhi)', p10: 'India (Mumbai / Delhi)', p12: 'India (Mumbai / Delhi)' },
  { feature: 'RAM Allocation', p4: '4 GB High-Speed', p6: '6 GB High-Speed', p10: '10 GB High-Speed', p12: '12 GB High-Freq' },
  { feature: 'vCPU Cores', p4: '2 Cores (High Clock)', p6: '2 Cores (Boosted)', p10: '3 Cores', p12: '4 Cores' },
  { feature: 'NVMe Storage', p4: '40 GB NVMe', p6: '60 GB NVMe', p10: '100 GB NVMe', p12: '150 GB NVMe' },
  { feature: 'Sleep Architecture', p4: 'Smart Sleep (No 24/7 drain)', p6: 'Smart Sleep', p10: 'Smart Sleep', p12: 'Smart Sleep' },
  { feature: 'Auto-Wake Time', p4: '< 2 Minutes', p6: '< 2 Minutes', p10: '< 2 Minutes', p12: '< 2 Minutes' },
  { feature: 'Console Ready (Bedrock)', p4: 'Included (Port 19132)', p6: 'Included (Port 19132)', p10: 'Included (Port 19132)', p12: 'Included (Port 19132)' },
  { feature: 'Mod & Plugin Support', p4: 'Full Plugins', p6: 'Full Plugins & Spigot', p10: 'Heavy Modpacks', p12: 'Extreme Modpacks' },
  { feature: 'Automated Backups', p4: 'Daily Backups', p6: 'Daily Backups', p10: 'Offsite Cloud', p12: 'Hourly Snapshots' },
  { feature: 'Web Console & SFTP', p4: 'Console + SFTP', p6: 'Console + SFTP', p10: 'Console + SFTP', p12: 'Console + SFTP' },
];

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f3f4f6]">
      {/* Top Header */}
      <header className="border-b border-[#1a1e29] bg-[#000000]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#ffffff] flex items-center justify-center text-[#000000] font-bold">
              <Server className="size-4" />
            </div>
            <div>
              <span className="font-bold text-[#ffffff] text-base tracking-tight">KryinHost</span>
              <span className="text-[10px] text-[#38bdf8] block leading-none font-semibold">Indian Server Hosting</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#94a3b8]">
            <Link href="/" className="hover:text-[#ffffff] transition-colors">
              Home
            </Link>
            <Link href="/plans" className="text-[#ffffff] font-bold">
              Plans & Pricing
            </Link>
            <Link href="/#capabilities" className="hover:text-[#ffffff] transition-colors">
              Capabilities
            </Link>
            <Link href="/#faq" className="hover:text-[#ffffff] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 text-[#94a3b8] hover:text-[#ffffff] transition-colors"
            >
              Control Panel
            </Link>
            <ServerCapacityButton
              className="text-xs font-bold px-4 py-2 rounded-full bg-[#ffffff] hover:bg-[#e2e8f0] text-[#000000] transition-colors shadow-sm"
            >
              Deploy Server
            </ServerCapacityButton>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="py-14 sm:py-20 px-4 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#090b10] border border-[#1a1e29] text-[#38bdf8] text-xs font-semibold">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          Indian Hosted Nodes • 4GB from ₹600/month • Console Ready
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#ffffff] tracking-tight">
          Simple, Transparent Indian Server Plans
        </h1>
        <p className="text-sm sm:text-base text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
          High-speed single-thread performance, NVMe storage, and smart auto-sleep architecture with no 24/7 idle drain. Servers automatically wake in under 2 minutes when players join.
        </p>
      </section>

      {/* Plans Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.ram}
              className={`warp-card p-6 flex flex-col justify-between ${
                plan.highlight
                  ? 'border-[#38bdf8]/60 bg-[#0c0f17] shadow-xl ring-1 ring-[#38bdf8]/20'
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

                <h3 className="text-2xl font-black text-[#ffffff]">{plan.ram} RAM</h3>
                <p className="text-[12px] text-[#94a3b8] mt-1 min-h-[34px] leading-snug">
                  {plan.idealFor}
                </p>

                {/* Price */}
                <div className="my-5 pb-5 border-b border-[#1c202d]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#ffffff] font-mono">
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
                    <span className="text-[#94a3b8]">Storage:</span>
                    <span className="font-semibold">{plan.storage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#94a3b8]">Slots:</span>
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

              <ServerCapacityButton className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                  plan.highlight
                    ? 'bg-[#ffffff] hover:bg-[#e2e8f0] text-[#000000] shadow-md'
                    : 'bg-[#161a26] hover:bg-[#202738] text-[#ffffff] border border-[#1e2433]'
                }`}
              >
                <span>Deploy {plan.ram} Server</span>
                <ArrowRight className="size-3.5" />
              </ServerCapacityButton>
            </div>
          ))}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="warp-card p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#ffffff]">
              Plan Comparison Matrix
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              Every plan runs on high-speed Indian nodes with Paper 26.3, web console, and SFTP access.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#94a3b8]">
              <thead>
                <tr className="border-b border-[#1c202d] text-[#ffffff]">
                  <th className="pb-3 font-semibold">Plan Feature</th>
                  <th className="pb-3 font-semibold">4 GB (₹600)</th>
                  <th className="pb-3 font-semibold text-[#38bdf8]">6 GB (₹800)</th>
                  <th className="pb-3 font-semibold">10 GB (₹1,000)</th>
                  <th className="pb-3 font-semibold">12 GB (₹1,500)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c202d]">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#12151e]/50">
                    <td className="py-3 font-medium text-[#ffffff]">{row.feature}</td>
                    <td className="py-3">{row.p4}</td>
                    <td className="py-3 font-semibold text-[#38bdf8]">{row.p6}</td>
                    <td className="py-3">{row.p10}</td>
                    <td className="py-3">{row.p12}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1e29] bg-[#000000] py-8 text-xs text-[#64748b]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KryinHost Inc. Indian Game Server Hosting.</p>
          <div className="flex items-center gap-4 text-[#94a3b8]">
            <Link href="/" className="hover:text-[#ffffff] transition-colors">Home</Link>
            <Link href="/plans" className="hover:text-[#ffffff] transition-colors">Plans</Link>
            <Link href="/login" className="hover:text-[#ffffff] transition-colors">Control Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
