'use client';

import React from 'react';
import { ServerStoreProvider } from '@/lib/serverStore';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerStoreProvider>
      <div className="min-h-screen bg-[#f8f9fd] flex flex-col lg:flex-row text-[#1a1522] font-mono antialiased selection:bg-blue-600 selection:text-white">
        {/* Desktop Left Sidebar */}
        <Sidebar />

        {/* Mobile Header & Bottom Navigation */}
        <MobileNav />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-24 lg:pb-12 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </ServerStoreProvider>
  );
}
