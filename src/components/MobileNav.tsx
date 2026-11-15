'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Terminal,
  Users,
  FolderTree,
  Sliders,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { createClient } from '@/lib/supabase/client';

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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="lg:hidden flex flex-col font-mono text-[#1a1522]">
      {/* Top Mobile Bar */}
      <header className="h-14 bg-white border-b border-[#1a1522]/10 px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
                <path d="M16 2V30M3 9.5L29 22.5M29 9.5L3 22.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.4"/>
                <circle cx="16" cy="16" r="3.5" fill="#ffffff" />
              </svg>
            </div>
            <span className="font-bold text-[#1a1522] text-sm tracking-tight font-mono hidden sm:inline">KryinHost</span>
          </Link>
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 truncate max-w-[120px]">
            {serverInfo.name || 'Server'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${serverInfo.status === 'online' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${serverInfo.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {serverInfo.status === 'online' ? `${serverInfo.tps.toFixed(1)} TPS` : 'Offline'}
          </span>

          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            title="Log Out"
            className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>

          <Link
            href="/"
            className="p-1.5 rounded-lg bg-[#f8f9fd] border border-[#1a1522]/10 text-[#1a1522]/70 hover:text-[#1a1522]"
            title="Homepage"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Bottom Sticky Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-[#1a1522]/10 px-2 flex items-center justify-around z-40 shadow-lg">
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
                isActive ? 'text-blue-700 font-bold' : 'text-[#1a1522]/60 hover:text-[#1a1522]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-blue-600' : 'text-[#1a1522]/40'}`} />
                {item.name === 'Players' && onlineCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-blue-600 text-[8px] text-white font-bold flex items-center justify-center">
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
