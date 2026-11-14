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
    <aside className="hidden lg:flex flex-col w-64 bg-[#12151d] border-r border-zinc-800 p-4 justify-between h-screen sticky top-0 select-none">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-1.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-500 transition-colors">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-100 text-base tracking-tight">KryinHost</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700/80">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Server Management</p>
          </div>
        </Link>

        {/* Server Status Quick Banner */}
        <div className="p-3 rounded-xl bg-[#151821] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-medium">Server State</span>
            <StatusBadge status={serverInfo.status} size="sm" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-zinc-400" />
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
                    ? 'bg-zinc-800 text-white font-bold border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
                {item.name === 'Players' && serverInfo.onlinePlayers > 0 && (
                  <span
                    className={`ml-auto text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-400'
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
      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <div className="p-2.5 rounded-xl bg-[#151821] border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
              ROG 5s Node
            </span>
            <span className="text-[10px] font-mono text-zinc-300">
              {metrics.batteryPercent}% ({metrics.batteryTempC ? `${metrics.batteryTempC}°C` : 'N/A'})
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${(metrics.usedRamMb / metrics.totalRamMb) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>RAM {Math.round((metrics.usedRamMb / 1024) * 10) / 10}GB</span>
            <span>Java {Math.round((metrics.javaHeapUsedMb / 1024) * 10) / 10}GB</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 text-xs font-bold">
              AO
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-200 truncate">Arth Official</p>
              <p className="text-[10px] text-emerald-400 capitalize">Server Owner</p>
            </div>
          </div>
          <Link
            href="/login"
            title="Sign out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
