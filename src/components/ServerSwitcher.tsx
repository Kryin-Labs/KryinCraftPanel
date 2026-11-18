'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Server,
  ChevronDown,
  Plus,
  Check,
  Cpu,
  Wifi,
  X,
  Copy,
  Terminal,
  Zap,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

export function ServerSwitcher({ createOnly = false }: { createOnly?: boolean }) {
  const {
    serverInfo,
    serversList,
    activeServerId,
    setActiveServerId,
    addServer,
  } = useServerStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{
    server: any;
    agentToken: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleSelect = (id: string) => {
    setActiveServerId(id);
    setIsOpen(false);
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;
    setIsSubmitting(true);
    setCreateError('');

    const res = await addServer(newServerName.trim(), newDeviceName.trim() || 'Secondary Node');
    setIsSubmitting(false);

    if (res.success && res.server) {
      setCreatedResult({
        server: res.server,
        agentToken: res.agentToken || '',
      });
      setNewServerName('');
      setNewDeviceName('');
    } else {
      setCreateError(res.error || 'Could not create the server.');
    }
  };

  const copyText = (text: string, type: 'token' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  const currentServerName = serversList.find((server) => server.id === activeServerId)?.name || serverInfo.name || 'Select a server';

  function openCreateServer() {
    setIsOpen(false);
    setShowAddModal(true);
    setCreatedResult(null);
    setCreateError('');
  }

  return (
    <div className="relative font-mono">
      {createOnly ? (
        <button type="button" onClick={openCreateServer} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
          Create server
        </button>
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
              <button
                onClick={openCreateServer}
                className="w-full py-1.5 px-2.5 rounded-lg bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create server</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Add Server Node Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#1a1522]/15 shadow-2xl max-w-md w-full p-6 text-[#1a1522] animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1522]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Server className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm">Add New Server Node</h3>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setCreatedResult(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#1a1522]/50 hover:text-[#1a1522]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!createdResult ? (
              <form onSubmit={handleCreateServer} className="space-y-4 text-xs">
              {createError && <p role="alert" className="text-xs text-red-700">{createError}</p>}
                <p className="text-[#1a1522]/70 text-[11px] leading-relaxed">
                  Register a secondary Android phone, Linux node, or PC. Each server node receives a unique agent token and connects to this unified portal.
                </p>

                <div className="space-y-1.5">
                  <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                    Server Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Survival SMP, Modded Realm, Bedwars"
                    value={newServerName}
                    onChange={(e) => setNewServerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#1a1522]/20 focus:border-blue-600 focus:outline-hidden text-xs bg-[#f8f9fd]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                    Device / Location Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Secondary Phone, Home PC, Delhi Node"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#1a1522]/20 focus:border-blue-600 focus:outline-hidden text-xs bg-[#f8f9fd]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1a1522] font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newServerName.trim()}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering...' : 'Register Node'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs">
                  <p className="font-bold">✓ Server Registered Successfully!</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    <strong>{createdResult.server.name}</strong> has been added to your dashboard.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                    Agent Security Token (Save this)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={createdResult.agentToken}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[#1a1522]/20 bg-slate-50 font-mono text-[11px]"
                    />
                    <button
                      onClick={() => copyText(createdResult.agentToken, 'token')}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold flex items-center gap-1"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                    1-Line Device Launch Command
                  </label>
                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono break-all flex items-start justify-between gap-2">
                    <code>
                      python3 agent.py --token {createdResult.agentToken} --server-id {createdResult.server.id}
                    </code>
                    <button
                      onClick={() =>
                        copyText(
                          `python3 agent.py --token ${createdResult.agentToken} --server-id ${createdResult.server.id}`,
                          'cmd'
                        )
                      }
                      className="text-slate-400 hover:text-white flex-shrink-0"
                      title="Copy command"
                    >
                      {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setCreatedResult(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    Done & View Server
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
