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
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  Server,
  LogOut,
  User as UserIcon,
  Activity,
  ScrollText,
} from 'lucide-react';
import { canVisitDashboardPage } from '@/lib/serverPermissions';
import { useServerStore } from '@/lib/serverStore';
import { StatusBadge } from './StatusBadge';
import { ServerSwitcher } from './ServerSwitcher';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Console', href: '/dashboard/console', icon: Terminal },
  { name: 'Logs', href: '/dashboard/logs', icon: ScrollText },
  { name: 'Ping Checker', href: '/dashboard/checker', icon: Activity },
  { name: 'Players', href: '/dashboard/players', icon: Users },
  { name: 'Files', href: '/dashboard/files', icon: FolderTree },
  { name: 'Access', href: '/dashboard/access', icon: ShieldCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Sliders },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { serverInfo, players, permissions, serverRole } = useServerStore();
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const onlineCount = players.filter((p) => p.isOnline).length;
  const serverIp = serverInfo.publicTunnelJava || (serverInfo.localIp ? `${serverInfo.localIp}:25565` : '');

  const copyIp = () => {
    if (!serverIp) return;
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#1a1522]/10 p-4 justify-between fixed top-0 left-0 bottom-0 z-30 select-none font-mono text-[#1a1522] shadow-[1px_0_0_rgba(0,0,0,0.02)] overflow-y-auto">
      <div className="space-y-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-2 py-1.5 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L3 9.5V22.5L16 30L29 22.5V9.5L16 2Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M16 2V30M3 9.5L29 22.5M29 9.5L3 22.5" stroke="currentColor" strokeWidth="1.4" strokeOpacity="0.4"/>
              <circle cx="16" cy="16" r="3.5" fill="#ffffff" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#1a1522] text-sm tracking-tight font-mono">KryinHost</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-[#1a1522]/50 truncate font-mono">Cloud Portal</p>
          </div>
        </Link>

        {/* Multi-Device Server Selector */}
        <ServerSwitcher />

        {/* Server State Quick Card */}
        <div className="p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[11px] font-bold text-[#1a1522] block truncate">{serverInfo.name || 'Loading Server...'}</span>
              <span className="text-[9px] text-[#1a1522]/50 block truncate">{serverInfo.device || 'Indian Node'}</span>
            </div>
            <StatusBadge status={serverInfo.status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1a1522]/10 text-[11px]">
            <div>
              <span className="text-[10px] text-[#1a1522]/50 block">TPS</span>
              <span className={`font-bold ${serverInfo.status === 'online' ? 'text-emerald-700' : 'text-[#1a1522]/40'}`}>
                {serverInfo.status === 'online' ? serverInfo.tps.toFixed(1) : '--'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#1a1522]/50 block">Players</span>
              <span className={`font-bold ${onlineCount > 0 ? 'text-blue-700' : 'text-[#1a1522]/40'}`}>
                {onlineCount} / {serverInfo.maxPlayers}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-[#1a1522]/40 px-2 py-1 font-bold">
            Navigation
          </p>
          {navItems.filter((item) => canVisitDashboardPage(item.href, permissions, serverRole === 'owner')).map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/90 shadow-xs'
                    : 'text-[#1a1522]/70 hover:text-[#1a1522] hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600' : 'text-[#1a1522]/50'}`} />
                <span>{item.name}</span>
                {item.name === 'Players' && onlineCount > 0 && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold">
                    {onlineCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="space-y-3 pt-3 border-t border-[#1a1522]/10">
        {/* Copy IP Widget */}
        <div className="p-2.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10">
          <span className="text-[10px] text-[#1a1522]/60 block mb-1 font-bold uppercase">Server Address</span>
          <button
            onClick={copyIp}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50/50 text-[11px] text-[#1a1522] border border-[#1a1522]/15 transition-colors text-left font-mono shadow-xs"
          >
            <span className="truncate font-semibold">{serverIp}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#1a1522]/40 flex-shrink-0" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-1 text-[11px]">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 text-[#1a1522]/70 hover:text-[#1a1522] transition-colors font-medium"
          >
            <ArrowLeft className="w-3 h-3 text-[#1a1522]/40" />
            <span>Homepage</span>
          </Link>
        </div>

        {/* User Account & Logout */}
        <div className="pt-2.5 border-t border-[#1a1522]/10 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold shrink-0">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#1a1522] truncate block" title={userEmail || 'Operator'}>
                {userEmail ? userEmail.split('@')[0] : 'Operator'}
              </span>
              <span className="text-[9px] text-[#1a1522]/50 truncate block" title={userEmail || ''}>
                {userEmail || 'Active Session'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            title="Log Out"
            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
