'use client';

import React, { useState } from 'react';
import {
  Server,
  ChevronDown,
  Plus,
  Check,
} from 'lucide-react';
import { ServerCapacityButton } from './ServerCapacity';
import { useServerStore } from '@/lib/serverStore';

export function ServerSwitcher({ createOnly = false }: { createOnly?: boolean }) {
  const {
    serverInfo,
    serversList,
    activeServerId,
    setActiveServerId,
  } = useServerStore();

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    setActiveServerId(id);
    setIsOpen(false);
  };

  const currentServerName = serversList.find((server) => server.id === activeServerId)?.name || serverInfo.name || 'Select a server';


  return (
    <div className="relative font-mono">
      {createOnly ? (
        <ServerCapacityButton className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
          Create server
        </ServerCapacityButton>
      ) : (
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 rounded-xl bg-[#f8f9fd] hover:bg-blue-50/70 border border-[#1a1522]/10 hover:border-blue-200 transition-all flex items-center justify-between text-left group"
        title="Switch active Minecraft server"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-[#1a1522] truncate max-w-[130px]">
                {currentServerName}
              </span>
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  serverInfo.status === 'online'
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-slate-300'
                }`}
                title={serverInfo.status === 'online' ? 'Online' : 'Offline'}
              />
            </div>
            <p className="text-[10px] text-[#1a1522]/50 truncate">
              {serverInfo.device || 'Termux Node'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#1a1522]/40 transition-transform ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-[#1a1522]/15 rounded-xl shadow-lg z-50 overflow-hidden text-xs animate-fade-in">
            <div className="px-3 py-2 bg-slate-50 border-b border-[#1a1522]/10 flex items-center justify-between text-[11px] text-[#1a1522]/60 font-semibold uppercase tracking-wider">
              <span>Your Servers ({serversList.length})</span>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-[#1a1522]/5">
              {serversList.map((srv) => {
                const isSelected = (activeServerId && srv.id === activeServerId) || (!activeServerId && srv.id === serverInfo.id);
                return (
                  <button
                    key={srv.id}
                    onClick={() => handleSelect(srv.id)}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-blue-50/60 transition-colors ${
                      isSelected ? 'bg-blue-50/40 text-blue-900 font-semibold' : 'text-[#1a1522]'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold truncate">{srv.name}</span>
                        {srv.shared && <span className="rounded bg-blue-100 px-1 text-[9px] text-blue-800">Shared</span>}
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            srv.status === 'online'
                              ? 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`}
                        />
                      </div>
                      <p className="text-[10px] text-[#1a1522]/50 truncate">
                        {srv.publicTunnelJava || srv.localIp || srv.device || 'Termux Node'}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-2 bg-slate-50/80 border-t border-[#1a1522]/10">
              <ServerCapacityButton
                onOpen={() => setIsOpen(false)}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create server</span>
              </ServerCapacityButton>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
