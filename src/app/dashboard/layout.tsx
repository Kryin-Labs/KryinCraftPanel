'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ServerSwitcher } from '@/components/ServerSwitcher';
import { UsernameGate } from '@/components/UsernameGate';
import { canVisitDashboardPage } from '@/lib/serverPermissions';
import { ServerStoreProvider, useServerStore } from '@/lib/serverStore';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { AuthGuard } from '@/components/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UsernameGate>
        <ServerStoreProvider>
          <div className="min-h-screen bg-[#f8f9fd] text-[#1a1522] font-mono antialiased selection:bg-blue-600 selection:text-white">
            {/* Desktop Left Sidebar (Fixed to screen viewport) */}
            <Sidebar />

            {/* Mobile Header & Bottom Navigation */}
            <MobileNav />

            {/* Main Content Area (Offset by lg:pl-64 so it never overlaps fixed sidebar) */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
              <main className="flex-1 min-w-0 pb-24 lg:pb-12 p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto w-full">
                <CreateFirstServer />
                <ServerPageGate>{children}</ServerPageGate>
              </main>
            </div>
          </div>
        </ServerStoreProvider>
      </UsernameGate>
    </AuthGuard>
  );
}

function ServerPageGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeServerId, serverRole, permissions, isLoading, serversList, loadError } = useServerStore();

  if (pathname === '/dashboard/access' || pathname === '/dashboard/checker') return children;
  if (loadError && !serverRole) return <p role="alert" className="p-4 text-sm">Could not load your servers. The panel will retry automatically.</p>;
  if (isLoading || (activeServerId && serversList.some((server) => server.id === activeServerId) && !serverRole)) {
    return <p role="status" className="p-4 text-sm">Loading server access…</p>;
  }
  if (!serverRole) return null;
  if (pathname.startsWith('/dashboard/players/') && !permissions.includes('console')) {
    return <p className="p-4 text-sm">Open Players to view the player list. Player controls require console access.</p>;
  }
  if (!canVisitDashboardPage(pathname, permissions, serverRole === 'owner')) {
    return <p className="p-4 text-sm">You don’t have permission to open this page for the selected server.</p>;
  }
  return <React.Fragment key={activeServerId}>{children}</React.Fragment>;
}

function CreateFirstServer() {
  const pathname = usePathname();
  const { isLoading, loadError, serversList } = useServerStore();
  const show = pathname === '/dashboard' && !isLoading && !loadError && serversList.length === 0;
  return (
    <section hidden={!show} className="max-w-xl space-y-3 rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-bold">Your servers</h1>
      <p className="text-sm text-slate-600">Create a server or ask a server owner to share access using your username.</p>
      <ServerSwitcher createOnly />
    </section>
  );
}
