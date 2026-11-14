'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Power,
  Terminal,
  Users,
  Menu,
  X,
  ScrollText,
  FolderTree,
  Network,
  ShieldCheck,
  Settings,
  Server,
  LogOut,
  Smartphone,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { StatusBadge } from './StatusBadge';

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const { serverInfo, metrics } = useServerStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainBottomTabs = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Control', href: '/dashboard/control', icon: Power },
    { name: 'Console', href: '/dashboard/console', icon: Terminal },
    { name: 'Players', href: '/dashboard/players', icon: Users },
  ];

  const drawerItems = [
    { name: 'Server Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Server Control', href: '/dashboard/control', icon: Power },
    { name: 'Live Console', href: '/dashboard/console', icon: Terminal },
    { name: 'Server Logs', href: '/dashboard/logs', icon: ScrollText },
    { name: 'Player Manager', href: '/dashboard/players', icon: Users },
    { name: 'File Manager', href: '/dashboard/files', icon: FolderTree },
    { name: 'Connection Ports', href: '/dashboard/connections', icon: Network },
    { name: 'Role & Access', href: '/dashboard/access', icon: ShieldCheck },
    { name: 'Server Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#12151d]/95 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-100 text-sm">KryinHost</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-800 text-[#38bdf8] font-semibold border border-zinc-700/60">
                India Node
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">Paper 26.3 • {serverInfo.tps} TPS</p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={serverInfo.status} size="sm" />
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Slide-out Drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-[#12151d] border-r border-zinc-800 h-full flex flex-col justify-between p-4 z-10 animate-in slide-in-from-left duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Server className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-zinc-100 text-sm">KryinHost Panel</span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hardware state in drawer */}
              <div className="p-2.5 rounded-xl bg-[#151821] border border-zinc-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-300">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <Server className="w-3 h-3 text-zinc-400" />
                    Indian Node 01
                  </span>
                  <span className="font-mono text-emerald-400">Online</span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  RAM: {Math.round((metrics.usedRamMb / 1024) * 10) / 10} / 12 GB • Heap: {Math.round((metrics.javaHeapUsedMb / 1024) * 10) / 10} / 4 GB
                </p>
              </div>

              {/* Drawer Links */}
              <nav className="space-y-1 overflow-y-auto max-h-[60vh]">
                {drawerItems.map((item) => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-zinc-800 text-white font-bold border border-zinc-700/60'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <Link
                href="/login"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-800/80 text-zinc-300 text-xs font-semibold hover:text-red-400 border border-zinc-700/60"
              >
                <span>Sign Out</span>
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#12151d]/95 backdrop-blur-md border-t border-zinc-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mainBottomTabs.map((tab) => {
          const isActive =
            tab.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-zinc-400 hover:text-zinc-200"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
};
