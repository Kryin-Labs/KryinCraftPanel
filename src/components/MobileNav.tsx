'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Terminal,
  Users,
  FolderTree,
  Sliders,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Console', href: '/dashboard/console', icon: Terminal },
  { name: 'Players', href: '/dashboard/players', icon: Users },
  { name: 'Files', href: '/dashboard/files', icon: FolderTree },
  { name: 'Settings', href: '/dashboard/settings', icon: Sliders },
];

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { serverInfo, players } = useServerStore();
  const onlineCount = players.filter((p) => p.isOnline).length;

  return (
    <div className="lg:hidden flex flex-col font-mono">
      {/* Top Mobile Bar */}
      <header className="h-14 bg-[#0e0d13] border-b border-[#242131] px-4 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#181622] border border-[#2d293d] flex items-center justify-center text-zinc-100">
            <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M16 2V30M3 9.5L29 22.5M29 9.5L3 22.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.3"/>
              <circle cx="16" cy="16" r="3.5" fill="#52ff94" />
            </svg>
          </div>
          <span className="font-bold text-zinc-100 text-sm">KryinHost</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/70 border border-emerald-700/50 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            20.0 TPS
          </span>

          <Link
            href="/"
            className="p-1.5 rounded bg-[#181622] border border-[#262333] text-zinc-400 hover:text-zinc-100"
            title="Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Bottom Sticky Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#0e0d13]/95 backdrop-blur-md border-t border-[#242131] px-2 flex items-center justify-around z-40">
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
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] transition-colors relative ${
                isActive ? 'text-zinc-100 font-bold' : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                {item.name === 'Players' && onlineCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 text-[8px] text-zinc-950 font-bold flex items-center justify-center">
                    {onlineCount}
                  </span>
                )}
              </div>
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
