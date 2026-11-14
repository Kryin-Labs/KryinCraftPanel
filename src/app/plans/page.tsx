'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    id: 'starter',
    name: 'Free Starter',
    badge: 'Community Tier',
    priceMonthly: 0,
    priceQuarterly: 0,
    ram: '2 GB',
    cpu: '1 vCPU Core',
    storage: '10 GB SSD',
    slots: 'Up to 5 Players',
    idealFor: 'Small friend groups, vanilla survival, testing builds.',
    features: [
      'Free Forever with Smart Auto-Sleep',
      'Instant Auto-Wake on Join (<2 mins)',
      'Java & Bedrock Cross-Play (Geyser)',
      'Paper & Purpur 26.3 Support',
      'Web Console & Player Manager',
      'Custom Subdomain (*.kryin.gg)',
    ],
    highlight: false,
    cta: 'Deploy Free Server',
  },
  {
    id: 'dedicated4gb',
    name: 'Indian Dedicated 4GB',
    badge: 'Most Popular · ₹600/mo',
    priceMonthly: 600,
    priceQuarterly: 540,
    ram: '4 GB High-Speed RAM',
    cpu: '2 vCPU Cores',
    storage: '40 GB NVMe',
    slots: '20+ Players (No Lag)',
    idealFor: 'Active Indian SMPs, vanilla+ plugins, no lag survival.',
    features: [
      'Indian Hosted Node (Lowest Ping in India)',
      'Fast No Lag (20.0 Stable TPS)',
      'Console Ready (Bedrock Crossplay)',
      'Smart Auto-Sleep (No 24/7 idle drain)',
      'Auto-Wake in <2 mins on join or web',
      'Paper 26.3 & Purpur Optimized',
      'Full Web Console & SFTP Access',
      'Automated Daily Backups',
    ],
    highlight: true,
    cta: 'Deploy 4GB Server',
  },
  {
    id: 'smp8gb',
    name: 'Power SMP 8GB',
    badge: 'Heavy Plugins',
    priceMonthly: 1150,
    priceQuarterly: 1020,
    ram: '8 GB High-Speed RAM',
    cpu: '3 vCPU Cores',
    storage: '80 GB NVMe',
    slots: '50+ Players',
    idealFor: 'Medium SMPs, Towny, Skyblock, and popular modpacks.',
    features: [
      'Indian Hosted High-Speed Node',
      'Fast No Lag Priority Execution',
      'Console Ready (Bedrock & Java)',
      'Smart Sleep & Auto-Wake on Join',
      'Modpack & Heavy Plugin Support',
      'Full SFTP & MySQL Database',
      'Automated Daily Offsite Backups',
    ],
    highlight: false,
    cta: 'Deploy 8GB Server',
  },
  {
    id: 'smp16gb',
    name: 'Extreme SMP 16GB',
    badge: 'Heavy Modpacks',
    priceMonthly: 2100,
    priceQuarterly: 1850,
    ram: '16 GB High-Freq RAM',
    cpu: '4 vCPU Cores',
    storage: '160 GB NVMe',
    slots: 'Unlimited Players',
    idealFor: 'Large public SMPs, heavy Forge modpacks, creative networks.',
    features: [
      'Maximum Dedicated CPU Priority',
      'Heavy Modpack Support (ATM9, Create)',
      'Smart Sleep & Wake Architecture',
      'Dedicated IP Available',
      'Zero Tick-Lag Guarantee',
      'Hourly Automated Snapshots',
    ],
    highlight: false,
    cta: 'Deploy 16GB Server',
  },
];

const comparisonMatrix = [
  { feature: 'Hosting Location', starter: 'India / Shared', dedicated4gb: 'India (Mumbai)', smp8gb: 'India (Mumbai)', smp16gb: 'India (Mumbai)' },
  { feature: 'RAM Allocation', starter: '2 GB', dedicated4gb: '4 GB High-Speed', smp8gb: '8 GB High-Speed', smp16gb: '16 GB High-Freq' },
  { feature: 'vCPU Cores', starter: '1 Core', dedicated4gb: '2 Cores (High Clock)', smp8gb: '3 Cores', smp16gb: '4 Cores' },
  { feature: 'NVMe Storage', starter: '10 GB SSD', dedicated4gb: '40 GB NVMe', smp8gb: '80 GB NVMe', smp16gb: '160 GB NVMe' },
  { feature: 'Sleep Architecture', starter: 'Smart Sleep', dedicated4gb: 'Smart Sleep (No 24/7 drain)', smp8gb: 'Smart Sleep', smp16gb: 'Smart Sleep' },
  { feature: 'Auto-Wake Time', starter: '< 2 Minutes', dedicated4gb: '< 2 Minutes', smp8gb: '< 2 Minutes', smp16gb: '< 2 Minutes' },
  { feature: 'Console Ready (Bedrock)', starter: 'Included', dedicated4gb: 'Included (Port 19132)', smp8gb: 'Included', smp16gb: 'Included' },
  { feature: 'Mod & Plugin Support', starter: 'Lightweight', dedicated4gb: 'Full Plugins', smp8gb: 'Heavy Modpacks', smp16gb: 'Extreme Modpacks' },
  { feature: 'Automated Backups', starter: 'Manual', dedicated4gb: 'Daily Backups', smp8gb: 'Daily Offsite', smp16gb: 'Hourly Snapshots' },
  { feature: 'Web Console & SFTP', starter: 'Web Console', dedicated4gb: 'Console + Full SFTP', smp8gb: 'Console + Full SFTP', smp16gb: 'Console + Full SFTP' },
];

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#f3f4f6]">
      {/* Top Header */}
      <header className="border-b border-[#1e2433] bg-[#0a0c10]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-[#fb923c] flex items-center justify-center text-[#0a0c10] font-bold shadow-sm">
              <Server className="size-4" />
            </div>
            <div>
              <span className="font-bold text-[#f3f4f6] text-base tracking-tight">KryinHost</span>
              <span className="text-[10px] text-[#fb923c] block leading-none font-semibold">Indian Server Hosting</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#8e98a8]">
            <Link href="/" className="hover:text-[#f3f4f6] transition-colors">
              Home
            </Link>
            <Link href="/plans" className="text-[#fb923c] font-bold">
              Plans & Pricing
            </Link>
            <Link href="/#features" className="hover:text-[#f3f4f6] transition-colors">
              Features
            </Link>
            <Link href="/#capabilities" className="hover:text-[#f3f4f6] transition-colors">
              Capabilities
            </Link>
            <Link href="/#faq" className="hover:text-[#f3f4f6] transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 text-[#8e98a8] hover:text-[#f3f4f6] transition-colors"
            >
              Control Panel
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-full bg-[#f3f4f6] hover:bg-white text-[#0a0c10] transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="py-14 sm:py-20 px-4 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12151f] border border-[#1e2433] text-[#fb923c] text-xs font-semibold">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          Indian Hosted Nodes • 4GB Server from ₹600/month • Console Ready
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#f3f4f6] tracking-tight">
          Simple, Transparent Indian Server Plans
        </h1>
        <p className="text-sm sm:text-base text-[#8e98a8] max-w-2xl mx-auto leading-relaxed">
          High-speed single-thread performance, NVMe storage, and smart auto-sleep architecture with no 24/7 idle drain. Servers automatically wake in under 2 minutes when players join.
        </p>

        {/* Billing cycle toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-[#12151f] p-1 rounded-full border border-[#1e2433] inline-flex items-center text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#fb923c] text-[#0a0c10] shadow-sm font-bold'
                  : 'text-[#8e98a8] hover:text-[#f3f4f6]'
              }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                billingCycle === 'quarterly'
                  ? 'bg-[#fb923c] text-[#0a0c10] shadow-sm font-bold'
                  : 'text-[#8e98a8] hover:text-[#f3f4f6]'
              }`}
            >
              <span>Quarterly</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0a0c10] text-[#fb923c] font-bold">
                Save 10%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceQuarterly;

            return (
              <div
                key={plan.id}
                className={`rounded-[22px] p-6 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-[#151924] border-2 border-[#fb923c] shadow-xl ring-1 ring-[#fb923c]/20'
                    : 'bg-[#12151f] border border-[#1e2433] hover:border-[#2a3348]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        plan.highlight
                          ? 'bg-[#fb923c]/20 text-[#fb923c] border border-[#fb923c]/40'
                          : 'bg-[#1e2433] text-[#8e98a8]'
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

                  <h3 className="text-lg font-bold text-[#f3f4f6] mt-2">{plan.name}</h3>
                  <p className="text-[12px] text-[#8e98a8] mt-1 min-h-[34px] leading-snug">
                    {plan.idealFor}
                  </p>

                  {/* Price */}
                  <div className="my-4 pb-4 border-b border-[#1e2433]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-[#f3f4f6] font-mono">
                        {price === 0 ? 'Free' : `₹${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-[11px] text-[#8e98a8] font-medium">/ month</span>
                      )}
                    </div>
                    {billingCycle === 'quarterly' && price > 0 && (
                      <span className="text-[10px] text-[#fb923c] block mt-0.5">
                        Billed ₹{price * 3} every 3 months
                      </span>
                    )}
                  </div>

                  {/* Specs summary */}
                  <div className="space-y-1.5 text-xs text-[#f3f4f6] mb-4 pb-4 border-b border-[#1e2433]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8e98a8]">Memory:</span>
                      <span className="font-semibold">{plan.ram}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8e98a8]">Processor:</span>
                      <span className="font-semibold">{plan.cpu}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8e98a8]">Storage:</span>
                      <span className="font-semibold">{plan.storage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8e98a8]">Slots:</span>
                      <span className="font-semibold">{plan.slots}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2 text-[12px] text-[#8e98a8] mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="size-3.5 text-[#fb923c] shrink-0 mt-0.5" />
                        <span className="text-[#cbd5e1]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className={`w-full py-2.5 rounded-full text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                    plan.highlight
                      ? 'bg-[#fb923c] hover:bg-[#ea580c] text-[#0a0c10] shadow-md'
                      : 'bg-[#181d2a] hover:bg-[#202738] text-[#f3f4f6] border border-[#1e2433]'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-[#12151f] border border-[#1e2433] rounded-[24px] p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#f3f4f6]">
              Detailed Plan Feature Matrix
            </h2>
            <p className="text-xs text-[#8e98a8] mt-1">
              Every plan includes our modern web control panel, live server console, and full FTP access.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8e98a8]">
              <thead>
                <tr className="border-b border-[#1e2433] text-[#f3f4f6]">
                  <th className="pb-3 font-semibold">Plan Feature</th>
                  <th className="pb-3 font-semibold">Free Starter</th>
                  <th className="pb-3 font-semibold text-[#fb923c]">Indian 4GB Node</th>
                  <th className="pb-3 font-semibold">Power SMP 8GB</th>
                  <th className="pb-3 font-semibold">Extreme 16GB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2433]">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161a26]/50">
                    <td className="py-3 font-medium text-[#f3f4f6]">{row.feature}</td>
                    <td className="py-3">{row.starter}</td>
                    <td className="py-3 font-semibold text-[#fb923c]">{row.dedicated4gb}</td>
                    <td className="py-3">{row.smp8gb}</td>
                    <td className="py-3">{row.smp16gb}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* All Plans Include Strip */}
      <section className="border-y border-[#1e2433] bg-[#11141c] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-[#f3f4f6]">Included With Every Indian Hosted Server</h3>
            <p className="text-xs text-[#8e98a8] mt-1">Fast, no lag, console ready, and no 24/7 idle power drain.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-[16px] bg-[#151924] border border-[#1e2433] space-y-1.5">
              <Zap className="size-4 text-[#fb923c]" />
              <h4 className="font-bold text-[#f3f4f6]">Smart Auto-Sleep</h4>
              <p className="text-[11px] text-[#8e98a8] leading-snug">Sleeps when empty, auto-wakes on player join in under 2 mins.</p>
            </div>
            <div className="p-4 rounded-[16px] bg-[#151924] border border-[#1e2433] space-y-1.5">
              <Globe className="size-4 text-[#fb923c]" />
              <h4 className="font-bold text-[#f3f4f6]">Console Ready</h4>
              <p className="text-[11px] text-[#8e98a8] leading-snug">Bedrock & Java crossplay built right in for Xbox, PS, Switch & PC.</p>
            </div>
            <div className="p-4 rounded-[16px] bg-[#151924] border border-[#1e2433] space-y-1.5">
              <Radio className="size-4 text-[#fb923c]" />
              <h4 className="font-bold text-[#f3f4f6]">Indian Hosted</h4>
              <p className="text-[11px] text-[#8e98a8] leading-snug">Mumbai/Delhi nodes with lowest latency for Indian players.</p>
            </div>
            <div className="p-4 rounded-[16px] bg-[#151924] border border-[#1e2433] space-y-1.5">
              <Clock className="size-4 text-[#fb923c]" />
              <h4 className="font-bold text-[#f3f4f6]">Fast No Lag</h4>
              <p className="text-[11px] text-[#8e98a8] leading-snug">High single-thread clock speed holding stable 20.0 TPS.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold text-[#f3f4f6]">Frequently Asked Questions</h3>
          <p className="text-xs text-[#8e98a8]">Everything you need to know about our Indian Minecraft server hosting.</p>
        </div>

        <div className="space-y-3">
          <div className="p-5 rounded-[18px] bg-[#12151f] border border-[#1e2433] space-y-2">
            <h4 className="text-sm font-bold text-[#f3f4f6] flex items-center gap-2">
              <HelpCircle className="size-4 text-[#fb923c]" />
              How does the server sleep & auto-wake architecture work?
            </h4>
            <p className="text-xs text-[#8e98a8] leading-relaxed">
              To keep hosting affordable and eliminate 24/7 idle power waste, servers enter an automatic low-power sleep state when all players disconnect. As soon as any player connects to your server address (or you click Wake in your web dashboard), the server automatically boots up and resumes the world in under 2 minutes with all progress, inventories, and builds 100% saved.
            </p>
          </div>

          <div className="p-5 rounded-[18px] bg-[#12151f] border border-[#1e2433] space-y-2">
            <h4 className="text-sm font-bold text-[#f3f4f6] flex items-center gap-2">
              <HelpCircle className="size-4 text-[#fb923c]" />
              Is the 4GB RAM server hosted in India?
            </h4>
            <p className="text-xs text-[#8e98a8] leading-relaxed">
              Yes! Our nodes are hosted in top Indian datacenters (Mumbai / Delhi), giving players across India, South Asia, and nearby regions ultra-fast routing, stable 20.0 TPS, and minimal ping.
            </p>
          </div>

          <div className="p-5 rounded-[18px] bg-[#12151f] border border-[#1e2433] space-y-2">
            <h4 className="text-sm font-bold text-[#f3f4f6] flex items-center gap-2">
              <HelpCircle className="size-4 text-[#fb923c]" />
              Can players on mobile, Xbox, or PlayStation join (Console Ready)?
            </h4>
            <p className="text-xs text-[#8e98a8] leading-relaxed">
              Absolutely. Every server comes with Geyser and Floodgate support, allowing Bedrock players on phones, consoles (PlayStation, Xbox, Nintendo Switch), and Windows 10/11 to play together with Java edition players on the exact same world.
            </p>
          </div>

          <div className="p-5 rounded-[18px] bg-[#12151f] border border-[#1e2433] space-y-2">
            <h4 className="text-sm font-bold text-[#f3f4f6] flex items-center gap-2">
              <HelpCircle className="size-4 text-[#fb923c]" />
              Can I upload my existing Minecraft world?
            </h4>
            <p className="text-xs text-[#8e98a8] leading-relaxed">
              Yes. You have full access to our web-based file manager and SFTP. You can simply drag and drop your existing singleplayer world folder or zip file into the panel.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2433] bg-[#0a0c10] py-8 text-xs text-[#6b778d]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KryinHost Inc. Indian Game Server Hosting.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[#f3f4f6] transition-colors">Home</Link>
            <Link href="/plans" className="hover:text-[#f3f4f6] transition-colors">Plans</Link>
            <Link href="/login" className="hover:text-[#f3f4f6] transition-colors">Client Area</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
