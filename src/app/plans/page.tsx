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
  RefreshCw,
  Sliders,
  ChevronDown,
} from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Free Starter',
    badge: 'Popular for Friends',
    priceMonthly: 0,
    priceQuarterly: 0,
    ram: '2 GB',
    cpu: '1 vCPU Core',
    storage: '10 GB SSD',
    slots: 'Up to 5 Players',
    idealFor: 'Small friend groups, vanilla survival, mini testing worlds.',
    features: [
      'Free Forever with Hibernation',
      'Instant Auto-Wake on Join',
      'Java & Bedrock Cross-Play (Geyser)',
      'Paper & Purpur 26.3 Support',
      'Basic Anti-DDoS Protection',
      'Web Console & Player Manager',
      'Custom Subdomain (*.kryin.gg)',
    ],
    highlight: false,
    cta: 'Deploy Free Server',
  },
  {
    id: 'explorer',
    name: 'Grass Explorer',
    badge: 'Entry Level',
    priceMonthly: 3.99,
    priceQuarterly: 3.39,
    ram: '4 GB',
    cpu: '2 vCPU Cores',
    storage: '35 GB NVMe',
    slots: 'Up to 20 Players',
    idealFor: 'Active survival SMPs, vanilla+ with plugins, lightweight modpacks.',
    features: [
      '24/7 Always-On (No Hibernation)',
      'High-Speed Gen4 NVMe Storage',
      'Java & Bedrock Cross-Play',
      '1-Click Plugin & Mod Installer',
      'Enterprise Anti-DDoS Scrubbing',
      'Automatic Daily Backups',
      'Full Web File Manager & SFTP',
      'Free MySQL Database',
    ],
    highlight: false,
    cta: 'Select Explorer',
  },
  {
    id: 'iron',
    name: 'Iron Standard',
    badge: 'Most Popular',
    priceMonthly: 7.99,
    priceQuarterly: 6.79,
    ram: '8 GB',
    cpu: '3 vCPU Cores',
    storage: '80 GB NVMe',
    slots: 'Up to 60 Players',
    idealFor: 'Medium SMPs, community survival, Towny, Skyblock, and popular modpacks.',
    features: [
      '24/7 Always-On Dedicated Thread',
      '8 GB High-Frequency DDR4/DDR5',
      'Optimized Paper, Purpur & Fabric',
      'Heavy Modpacks (Better MC, Prominence)',
      'Enterprise Anti-DDoS Protection',
      'Automated Daily Offsite Backups',
      'Subdomain & Custom Domain Support',
      'Priority Ticket Support',
    ],
    highlight: true,
    cta: 'Select Iron Standard',
  },
  {
    id: 'diamond',
    name: 'Diamond Performance',
    badge: 'High Performance',
    priceMonthly: 14.99,
    priceQuarterly: 12.74,
    ram: '12 GB',
    cpu: '4 vCPU Cores',
    storage: '150 GB NVMe',
    slots: 'Unlimited Players',
    idealFor: 'Large public SMPs, All The Mods 9, heavy Forge modpacks, creative networks.',
    features: [
      'Dedicated High-Frequency Clock Cores',
      '12 GB Unthrottled Memory',
      'Zero Tick-Lag Guarantee (20.0 TPS)',
      'Unlimited Player Slots',
      'Advanced 2.5 Tbps DDoS Shield',
      'Hourly Automated Snapshots',
      'Dedicated IP Available',
      'Direct Discord Operator Access',
    ],
    highlight: false,
    cta: 'Select Diamond',
  },
  {
    id: 'netherite',
    name: 'Netherite Extreme',
    badge: 'Enterprise Networks',
    priceMonthly: 24.99,
    priceQuarterly: 21.24,
    ram: '16 GB',
    cpu: '6 vCPU Cores',
    storage: '300 GB NVMe',
    slots: 'Unlimited Players',
    idealFor: 'Server networks, BungeeCord, Velocity proxies, large public communities.',
    features: [
      'Maximum Dedicated CPU Priority',
      '16 GB Enterprise Grade ECC RAM',
      'Free Dedicated IPv4 Address Included',
      'Full BungeeCord & Velocity Support',
      'Enterprise Custom Firewall Rules',
      'Instant Snapshot Restores',
      'Custom Reverse Proxy Support',
      '24/7 Phone & Priority Support',
    ],
    highlight: false,
    cta: 'Select Netherite',
  },
];

const comparisonMatrix = [
  { feature: 'RAM Allocation', starter: '2 GB', explorer: '4 GB', iron: '8 GB', diamond: '12 GB', netherite: '16 GB' },
  { feature: 'vCPU Cores', starter: '1 Core', explorer: '2 Cores', iron: '3 Cores', diamond: '4 Cores', netherite: '6 Cores' },
  { feature: 'NVMe Storage', starter: '10 GB SSD', explorer: '35 GB NVMe', iron: '80 GB NVMe', diamond: '150 GB NVMe', netherite: '300 GB NVMe' },
  { feature: '24/7 Always-On', starter: 'Hibernation', explorer: 'Yes', iron: 'Yes', diamond: 'Yes', netherite: 'Yes' },
  { feature: 'Cross-Play (Geyser/Bedrock)', starter: 'Included', explorer: 'Included', iron: 'Included', diamond: 'Included', netherite: 'Included' },
  { feature: 'Mod & Modpack Support', starter: 'Lightweight', explorer: 'Yes', iron: 'Full Modpacks', ironMod: true, diamond: 'Heavy Packs', netherite: 'Heavy Packs' },
  { feature: 'Automated Backups', starter: 'Manual', explorer: 'Daily', iron: 'Daily Offsite', diamond: 'Hourly Snapshots', netherite: 'Hourly Snapshots' },
  { feature: 'Anti-DDoS Scrubbing', starter: 'Standard', explorer: 'Enterprise', iron: 'Enterprise', diamond: '2.5 Tbps Shield', netherite: '2.5 Tbps + Custom Rules' },
  { feature: 'Dedicated IP', starter: '—', explorer: '+$3/mo', iron: '+$3/mo', diamond: '+$3/mo', netherite: 'Included Free' },
  { feature: 'MySQL Database', starter: '1 Database', explorer: '1 Database', iron: '3 Databases', diamond: 'Unlimited', netherite: 'Unlimited' },
];

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly'>('monthly');

  return (
    <div className="min-h-screen bg-[#0e1117] text-zinc-100 selection:bg-emerald-600 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-[#12151d] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-zinc-100 text-base tracking-tight">KryinHost</span>
              <span className="text-[10px] text-zinc-500 block leading-none">Minecraft Server Hosting</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <Link href="/" className="hover:text-zinc-100 transition-colors">
              Home
            </Link>
            <Link href="/plans" className="text-emerald-400 font-bold">
              Plans & Pricing
            </Link>
            <Link href="/#features" className="hover:text-zinc-100 transition-colors">
              Features
            </Link>
            <Link href="/#hardware" className="hover:text-zinc-100 transition-colors">
              Hardware
            </Link>
            <Link href="/#faq" className="hover:text-zinc-100 transition-colors">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 text-zinc-300 hover:text-white transition-colors"
            >
              Control Panel
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="py-14 sm:py-20 px-4 max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Instant Setup • Free Tier Available • 72-Hour Money-Back Guarantee
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight">
          Simple, Transparent Server Plans
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          High-frequency processors, NVMe SSD storage, unmetered bandwidth, and our streamlined web control panel. Upgrade, downgrade, or cancel anytime with zero lock-in.
        </p>

        {/* Billing cycle toggle */}
        <div className="pt-4 flex items-center justify-center gap-3">
          <div className="bg-[#151821] p-1 rounded-xl border border-zinc-800 inline-flex items-center text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-zinc-800 text-white shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Billed Monthly
            </button>
            <button
              onClick={() => setBillingCycle('quarterly')}
              className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'quarterly'
                  ? 'bg-zinc-800 text-white shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Quarterly</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-bold">
                Save 15%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceQuarterly;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  plan.highlight
                    ? 'bg-[#181d29] border-2 border-emerald-600/80 shadow-lg'
                    : 'bg-[#151821] border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        plan.highlight
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-100">{plan.name}</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 min-h-[32px] leading-snug">
                    {plan.idealFor}
                  </p>

                  {/* Price */}
                  <div className="my-4 pb-4 border-b border-zinc-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-white">
                        {price === 0 ? 'Free' : `$${price.toFixed(2)}`}
                      </span>
                      {price > 0 && (
                        <span className="text-[11px] text-zinc-500 font-medium">/ month</span>
                      )}
                    </div>
                    {billingCycle === 'quarterly' && price > 0 && (
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        Billed ${(price * 3).toFixed(2)} every 3 months
                      </span>
                    )}
                  </div>

                  {/* Specs summary */}
                  <div className="space-y-2 text-xs text-zinc-300 mb-4 pb-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Memory:</span>
                      <span className="font-semibold text-white">{plan.ram}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Processor:</span>
                      <span className="font-semibold text-white">{plan.cpu}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Storage:</span>
                      <span className="font-semibold text-white">{plan.storage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Slots:</span>
                      <span className="font-semibold text-white">{plan.slots}</span>
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2 text-[11px] text-zinc-400 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/login"
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 ${
                    plan.highlight
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="bg-[#151821] border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Detailed Plan Feature Matrix
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Every plan includes our modern web control panel, live server console, and full FTP access.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="pb-3 font-semibold">Plan Feature</th>
                  <th className="pb-3 font-semibold">Free Starter</th>
                  <th className="pb-3 font-semibold">Grass Explorer</th>
                  <th className="pb-3 font-semibold text-emerald-400">Iron Standard</th>
                  <th className="pb-3 font-semibold">Diamond</th>
                  <th className="pb-3 font-semibold">Netherite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {comparisonMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/20">
                    <td className="py-3 font-medium text-white">{row.feature}</td>
                    <td className="py-3 text-zinc-400">{row.starter}</td>
                    <td className="py-3 text-zinc-300">{row.explorer}</td>
                    <td className="py-3 font-semibold text-emerald-400">{row.iron}</td>
                    <td className="py-3 text-zinc-300">{row.diamond}</td>
                    <td className="py-3 text-zinc-300">{row.netherite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* All Plans Include Strip */}
      <section className="border-y border-zinc-800/80 bg-[#12151d] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-zinc-100">Included Free With Every Plan</h3>
            <p className="text-xs text-zinc-400 mt-1">No hidden fees, no artificial limits on tick performance.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white">Instant Activation</h4>
              <p className="text-[11px] text-zinc-400 leading-snug">Server online and joinable in under 60 seconds.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-1.5">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white">Cross-Play Ready</h4>
              <p className="text-[11px] text-zinc-400 leading-snug">Java and Bedrock crossplay built right in.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white">Anti-DDoS Scrubbing</h4>
              <p className="text-[11px] text-zinc-400 leading-snug">Active Layer 4/7 protection against bot attacks.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white">99.9% Uptime SLA</h4>
              <p className="text-[11px] text-zinc-400 leading-snug">High reliability hardware with redundant uplinks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-2xl font-bold text-zinc-100">Frequently Asked Questions</h3>
          <p className="text-xs text-zinc-400">Everything you need to know about our Minecraft hosting service.</p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              How does the Free Starter Plan hibernation work?
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Similar to platforms like MineKeep, free servers enter a low-power hibernation state when all players leave the server. As soon as you or a friend tries to connect using your server IP, the server automatically wakes up in under 2 seconds. Paid plans stay online 24/7 without hibernation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Can I upgrade or downgrade my plan at any time?
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Yes! You can scale your server resources up or down directly from the control panel with a single click. All your world data, plugins, and configurations are preserved completely intact.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Can players on mobile, Xbox, or PlayStation join my server?
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Absolutely. Every server comes with Geyser and Floodgate support, allowing Bedrock players on phones, consoles, and Windows 10/11 to play together with Java edition players on the exact same world.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#151821] border border-zinc-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              Can I upload my existing Minecraft world?
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Yes. You have full access to our web-based file manager and SFTP. You can simply drag and drop your existing singleplayer world folder or zip file into the panel.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#0e1117] py-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KryinHost Inc. High Performance Game Server Hosting.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            <Link href="/plans" className="hover:text-zinc-300 transition-colors">Plans</Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Client Area</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
