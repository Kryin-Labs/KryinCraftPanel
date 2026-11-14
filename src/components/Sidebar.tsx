'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Power,
  Terminal,
  ScrollText,
  Users,
  FolderTree,
  Network,
  ShieldCheck,
  Settings,
  Server,
  Smartphone,
  LogOut,
  Radio,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { StatusBadge } from './StatusBadge';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Control', href: '/dashboard/control', icon: Power },
  { name: 'Console', href: '/dashboard/console', icon: Terminal },
  { name: 'Logs', href: '/dashboard/logs', icon: ScrollText },
  { name: 'Players', href: '/dashboard/players', icon: Users },
  { name: 'Files', href: '/dashboard/files', icon: FolderTree },
  { name: 'Connections', href: '/dashboard/connections', icon: Network },
  { name: 'Share Access', href: '/dashboard/access', icon: ShieldCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { serverInfo, metrics } = useServerStore();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0e131d] border-r border-slate-800/80 p-4 justify-between h-screen sticky top-0 select-none">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1.5 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 group-hover:scale-105 transition-transform">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-wide">KryinCraft</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">ROG Phone 5s Node</p>
          </div>
        </Link>

        {/* Server Status Quick Banner */}
        <div className="p-3 rounded-xl bg-[#141b27] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Server State</span>
            <StatusBadge status={serverInfo.status} size="sm" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-blue-400" />
              {serverInfo.onlinePlayers}/{serverInfo.maxPlayers}
            </span>
            <span className="flex items-center gap-1 font-mono text-emerald-400">
              <Radio className="w-3 h-3" />
              {serverInfo.tps} TPS
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.name === 'Players' && serverInfo.onlinePlayers > 0 && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {serverInfo.onlinePlayers}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Hardware Node Status & User Profile */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              ROG 5s Termux
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              {metrics.batteryPercent}% ({metrics.batteryTempC ? `${metrics.batteryTempC}°C` : 'N/A'})
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(metrics.usedRamMb / metrics.totalRamMb) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>RAM {Math.round((metrics.usedRamMb / 1024) * 10) / 10}GB</span>
            <span>Java {Math.round((metrics.javaHeapUsedMb / 1024) * 10) / 10}GB</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              AO
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">Arth Official</p>
              <p className="text-[10px] text-blue-400 capitalize">Server Owner</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
