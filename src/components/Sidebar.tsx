'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Terminal,
  Users,
  FolderTree,
  Sliders,
  Copy,
  Check,
  ExternalLink,
  ArrowLeft,
  CircleDot,
  Server
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Console', href: '/dashboard/console', icon: Terminal },
  { name: 'Players', href: '/dashboard/players', icon: Users },
  { name: 'Files', href: '/dashboard/files', icon: FolderTree },
  { name: 'Settings', href: '/dashboard/settings', icon: Sliders },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { serverInfo, players } = useServerStore();
  const [copied, setCopied] = useState(false);

  const onlineCount = players.filter((p) => p.isOnline).length;
  const serverIp = 'in.kryin.host:25565';

  const copyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0e0d13] border-r border-[#242131] p-4 justify-between h-screen sticky top-0 select-none font-mono text-zinc-300">
      <div className="space-y-5">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 px-2 py-2 group">
          <div className="w-8 h-8 rounded-md bg-[#181622] border border-[#2d293d] flex items-center justify-center text-zinc-100 group-hover:border-zinc-400 transition-colors">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M16 2V30M3 9.5L29 22.5M29 9.5L3 22.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.3"/>
              <circle cx="16" cy="16" r="3.5" fill="#52ff94" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-100 text-sm tracking-tight font-mono">KryinHost</span>
              <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-[#1e1b29] text-emerald-400 border border-emerald-900/40">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 truncate">Mumbai Node 01</p>
          </div>
        </Link>

        {/* Server Telemetry Badge */}
        <div className="p-3 rounded-lg bg-[#14121c] border border-[#262333] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Server Status</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/70 border border-emerald-700/50 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#262333] text-[11px]">
            <div>
              <span className="text-[10px] text-zinc-400 block">TPS</span>
              <span className="text-zinc-200 font-semibold">{serverInfo.tps.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block">Players</span>
              <span className="text-zinc-200 font-semibold">{onlineCount}/{serverInfo.maxPlayers}</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400 px-2 py-1 font-semibold">
            Server Controls
          </p>
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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors ${
                  isActive
                    ? 'bg-[#221f2f] text-zinc-100 font-bold border border-[#37334b]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#181622]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>{item.name}</span>
                {item.name === 'Players' && onlineCount > 0 && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                    {onlineCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="space-y-3 pt-3 border-t border-[#242131]">
        {/* Copy IP Widget */}
        <div className="p-2.5 rounded-md bg-[#14121c] border border-[#262333]">
          <span className="text-[10px] text-zinc-400 block mb-1">Server Address</span>
          <button
            onClick={copyIp}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded bg-[#1b1926] hover:bg-[#232031] text-[11px] text-zinc-300 border border-[#2b273b] transition-colors text-left font-mono"
          >
            <span className="truncate">{serverIp}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-zinc-400 flex-shrink-0" />
            )}
          </button>
        </div>

        {/* Back to Home & OPanel Link */}
        <div className="flex flex-col gap-1 text-[11px]">
          <Link
            href="http://localhost:3001/panel/terminal"
            target="_blank"
            className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#181622] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3 text-zinc-400" />
              OPanel Suite
            </span>
            <span className="text-[9px] text-zinc-400">:3001</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-[#181622] text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3 h-3 text-zinc-400" />
            <span>Landing Page</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
