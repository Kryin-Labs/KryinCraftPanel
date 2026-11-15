'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Play,
  RotateCw,
  Power,
  Moon,
  Users,
  Activity,
  Terminal,
  Copy,
  Check,
  Wifi,
  Zap,
  Pencil,
  Trash2,
  Plus,
  X,
  Sliders,
  FolderTree,
  Radio,
  Globe,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { StatusBadge } from '@/components/StatusBadge';
import { AdSidebar } from '@/components/AdBanner';
import { ServerIpEndpoint } from '@/types';

export default function DashboardOverviewPage() {
  const {
    serverInfo,
    metrics,
    players,
    startServer,
    stopServer,
    restartServer,
    isDeviceConnected,
    isLoading,
    isRefreshing,
    refreshStatus,
    saveIpEndpoints,
  } = useServerStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Multi-IP Endpoint Form State
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [editingEndpointId, setEditingEndpointId] = useState<string | null>(null);
  const [endpointForm, setEndpointForm] = useState<{
    label: string;
    host: string;
    port: string;
    type: 'java' | 'bedrock' | 'lan' | 'other';
  }>({
    label: '',
    host: '',
    port: '25565',
    type: 'java',
  });
  const [isSavingIp, setIsSavingIp] = useState(false);

  const onlinePlayers = players.filter((p) => p.isOnline);

  const endpoints: ServerIpEndpoint[] =
    serverInfo.ipEndpoints && serverInfo.ipEndpoints.length > 0
      ? serverInfo.ipEndpoints
      : [
          {
            id: 'ep-java-default',
            type: 'java',
            label: 'Playit.gg Java',
            host: serverInfo.publicTunnelJava || 'scooter-stuffing.tun.ply.gg',
            port: 25565,
            isPrimary: true,
          },
        ];

  const copyEndpointAddress = (id: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = () => {
    setEditingEndpointId(null);
    setEndpointForm({
      label: 'Playit.gg Java',
      host: '',
      port: '25565',
      type: 'java',
    });
    setShowAddIpModal(true);
  };

  const handleOpenEditModal = (ep: ServerIpEndpoint) => {
    setEditingEndpointId(ep.id);
    setEndpointForm({
      label: ep.label,
      host: ep.host,
      port: String(ep.port),
      type: ep.type,
    });
    setShowAddIpModal(true);
  };

  const handleSaveEndpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpointForm.host.trim()) return;

    let updatedList: ServerIpEndpoint[];
    if (editingEndpointId) {
      updatedList = endpoints.map((ep) =>
        ep.id === editingEndpointId
          ? {
              ...ep,
              label: endpointForm.label.trim() || 'Server Endpoint',
              host: endpointForm.host.trim(),
              port: endpointForm.port.trim() || (endpointForm.type === 'bedrock' ? '19132' : '25565'),
              type: endpointForm.type,
            }
          : ep
      );
    } else {
      const newEp: ServerIpEndpoint = {
        id: 'ep-' + Date.now(),
        label: endpointForm.label.trim() || (endpointForm.type === 'bedrock' ? 'Bedrock Endpoint' : 'Java Endpoint'),
        host: endpointForm.host.trim(),
        port: endpointForm.port.trim() || (endpointForm.type === 'bedrock' ? '19132' : '25565'),
        type: endpointForm.type,
        isPrimary: endpoints.length === 0,
      };
      updatedList = [...endpoints, newEp];
    }

    setIsSavingIp(true);
    const res = await saveIpEndpoints(updatedList);
    setIsSavingIp(false);

    if (res.success) {
      setShowAddIpModal(false);
      setEditingEndpointId(null);
      setActionNotice('Server IP with Port saved directly to Supabase database!');
      setTimeout(() => setActionNotice(null), 3500);
    } else {
      setActionNotice(`Failed to save IP: ${res.error}`);
    }
  };

  const handleDeleteEndpoint = async (id: string) => {
    const updatedList = endpoints.filter((ep) => ep.id !== id);
    setIsSavingIp(true);
    const res = await saveIpEndpoints(updatedList);
    setIsSavingIp(false);
    if (res.success) {
      setActionNotice('IP endpoint removed from database.');
      setTimeout(() => setActionNotice(null), 2500);
    }
  };

  const handleQuickAction = async (action: 'start' | 'restart' | 'stop' | 'hibernate') => {
    if (!isDeviceConnected) {
      setActionNotice('Cannot start game: Your phone/device daemon is not connected. Launch the agent on your device first.');
      setTimeout(() => setActionNotice(null), 4500);
      return;
    }

    if (action === 'start') {
      setActionNotice(`Starting Paper server ${serverInfo.name}...`);
      await startServer();
    } else if (action === 'restart') {
      setActionNotice(`Gracefully restarting ${serverInfo.name}...`);
      await restartServer();
    } else if (action === 'stop') {
      setActionNotice(`Gracefully stopping ${serverInfo.name}...`);
      await stopServer();
    } else if (action === 'hibernate') {
      setActionNotice('Server placed in smart hibernation.');
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const isServerOnline = serverInfo.status === 'online';

  return (
    <div className="flex flex-col xl:flex-row items-start gap-6 font-mono text-[#1a1522]">
      {/* Primary Dashboard Container */}
      <div className="flex-1 min-w-0 space-y-6 w-full">
        {/* Action Notification Toast */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>{actionNotice}</span>
            </span>
            <button
              onClick={() => setActionNotice(null)}
              className="text-blue-600 hover:text-blue-800 font-bold ml-3"
            >
              ✕
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* 1. MAIN SERVER CARD: Server Name, Node, Status & Controls */}
        {/* ================================================================ */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col items-center text-center space-y-5">
          {/* Centered Server Name & Node Tag */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a1522]">
                {serverInfo.name || (isLoading ? 'Loading Server...' : 'Minecraft Server')}
              </h1>
              <button
                onClick={refreshStatus}
                disabled={isRefreshing}
                title="Instant live status sync"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-[#1a1522]/60 font-medium">
              Node: <strong className="text-[#1a1522]">Indian Node</strong>
            </p>
          </div>

          {/* Dual Status Bar: Device Connection & Minecraft Server State */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {/* Device Connection Indicator */}
            {isLoading && !isDeviceConnected ? (
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold bg-blue-50 text-blue-800 border-blue-200 shadow-2xs animate-pulse"
                title="Checking device connection status..."
              >
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Checking Device...</span>
              </div>
            ) : isDeviceConnected ? (
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs bg-emerald-50 text-emerald-800 border-emerald-300"
                title="Device daemon is online and communicating. Ready to start game!"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Device: Connected</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs bg-amber-50 text-amber-800 border-amber-300"
                title="Device daemon is offline. Website cannot start game until device connects."
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Device: Not Connected</span>
              </div>
            )}

            {/* Minecraft Process State Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
              <span className="text-[#1a1522]/60 font-semibold">Minecraft:</span>
              {isLoading && serverInfo.status === 'offline' ? (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  <span>Syncing...</span>
                </div>
              ) : (
                <StatusBadge status={serverInfo.status} size="sm" />
              )}
            </div>

            {/* Active Players & TPS Live Counter */}
            {isServerOnline && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold">
                <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
                <span>{serverInfo.tps.toFixed(1)} TPS</span>
                <span>•</span>
                <span>{onlinePlayers.length} / {serverInfo.maxPlayers} Players</span>
              </div>
            )}
          </div>

          {/* Connection Guidance Alert if Device is Offline */}
          {!isDeviceConnected && (
            <div className="p-3 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-xl text-xs max-w-lg text-left leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <span>⚠️</span> Phone / Device Daemon Offline
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                The portal cannot send commands to start the game because your device is not currently pinging. Run the agent command in Termux to connect your phone.
              </p>
            </div>
          )}

          {/* Power Actions Hub */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {!isServerOnline ? (
              <button
                onClick={() => handleQuickAction('start')}
                disabled={!isDeviceConnected}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                  isDeviceConnected
                    ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer shadow-emerald-600/20'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
                title={isDeviceConnected ? 'Launch Minecraft Server' : 'Device not connected: Cannot start game'}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Game</span>
              </button>
            ) : (
              <button
                onClick={() => handleQuickAction('restart')}
                disabled={!isDeviceConnected}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                title="Restart Minecraft server"
              >
                <RotateCw className="w-4 h-4" />
                <span>Restart</span>
              </button>
            )}

            <button
              onClick={() => handleQuickAction('hibernate')}
              disabled={!isDeviceConnected || !isServerOnline}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Hibernate server when idle"
            >
              <Moon className="w-4 h-4" />
              <span>Hibernate</span>
            </button>

            {isServerOnline && (
              <button
                onClick={() => handleQuickAction('stop')}
                disabled={!isDeviceConnected}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Gracefully stop server"
              >
                <Power className="w-4 h-4" />
                <span>Stop Server</span>
              </button>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 2. MULTIPLE IP ENDPOINTS MANAGER (Saved Directly in Database)    */}
        {/* ================================================================ */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a1522]/8 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#1a1522] flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Server Addresses & Ports
              </h2>
              <p className="text-xs text-[#1a1522]/60 mt-0.5">
                Saved in database. Players can use any of these configured IP and port endpoints to connect.
              </p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add IP & Port</span>
            </button>
          </div>

          {/* Endpoints List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {endpoints.map((ep) => {
              const fullAddress = ep.port && !ep.host.includes(':') ? `${ep.host}:${ep.port}` : ep.host;
              const isCopied = copiedId === ep.id;

              return (
                <div
                  key={ep.id}
                  className="p-4 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border uppercase tracking-wider ${
                        ep.type === 'bedrock'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : ep.type === 'lan'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {ep.type === 'bedrock' ? 'BEDROCK (UDP)' : ep.type === 'lan' ? 'LAN DIRECT' : 'JAVA (TCP)'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(ep)}
                        className="p-1 rounded-md text-[#1a1522]/50 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit IP and Port"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {endpoints.length > 1 && (
                        <button
                          onClick={() => handleDeleteEndpoint(ep.id)}
                          className="p-1 rounded-md text-[#1a1522]/50 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove endpoint"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#1a1522]/70 block">
                      {ep.label || 'Connection Endpoint'}
                    </span>
                    <span className="text-sm font-bold font-mono text-[#1a1522] block mt-0.5 break-all">
                      {fullAddress}
                    </span>
                  </div>

                  <button
                    onClick={() => copyEndpointAddress(ep.id, fullAddress)}
                    className="w-full py-1.5 px-3 rounded-lg bg-white hover:bg-blue-50 text-xs font-semibold text-[#1a1522] border border-[#1a1522]/10 hover:border-blue-300 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-blue-600" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================ */}
        {/* 3. QUICK NAVIGATION SHORTCUTS                                    */}
        {/* ================================================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/console"
            className="p-4 rounded-xl bg-white border border-[#1a1522]/10 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Terminal className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1a1522]">Live Console</span>
            <span className="text-[10px] text-[#1a1522]/50">RCON Terminal</span>
          </Link>

          <Link
            href="/dashboard/players"
            className="p-4 rounded-xl bg-white border border-[#1a1522]/10 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1a1522]">Players & Ops</span>
            <span className="text-[10px] text-[#1a1522]/50">Whitelist & Bans</span>
          </Link>

          <Link
            href="/dashboard/files"
            className="p-4 rounded-xl bg-white border border-[#1a1522]/10 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FolderTree className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1a1522]">File Manager</span>
            <span className="text-[10px] text-[#1a1522]/50">Configs & Worlds</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className="p-4 rounded-xl bg-white border border-[#1a1522]/10 hover:border-blue-400 hover:shadow-xs transition-all flex flex-col items-center text-center space-y-1.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-[#1a1522]">Settings</span>
            <span className="text-[10px] text-[#1a1522]/50">Properties & Node</span>
          </Link>
        </div>
      </div>

      {/* Right Column: Server Promotion Showcase */}
      <AdSidebar />

      {/* ================================================================ */}
      {/* ADD / EDIT IP WITH PORT MODAL                                    */}
      {/* ================================================================ */}
      {showAddIpModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#1a1522]/15 shadow-2xl max-w-md w-full p-6 text-[#1a1522] animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-[#1a1522]/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm">
                  {editingEndpointId ? 'Edit Server IP & Port' : 'Add Server IP & Port'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddIpModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-[#1a1522]/50 hover:text-[#1a1522]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEndpoint} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                  Protocol / Type
                </label>
                <select
                  value={endpointForm.type}
                  onChange={(e) =>
                    setEndpointForm({
                      ...endpointForm,
                      type: e.target.value as any,
                      port: e.target.value === 'bedrock' ? '19132' : '25565',
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#1a1522]/20 bg-[#f8f9fd] text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                >
                  <option value="java">Java Edition (TCP : 25565)</option>
                  <option value="bedrock">Bedrock & Mobile / Geyser (UDP : 19132)</option>
                  <option value="lan">Local LAN (Direct)</option>
                  <option value="other">Custom Endpoint</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                  Display Label
                </label>
                <input
                  type="text"
                  placeholder="e.g. Playit.gg Java, Bedrock Mobile, Home LAN"
                  value={endpointForm.label}
                  onChange={(e) => setEndpointForm({ ...endpointForm, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#1a1522]/20 bg-[#f8f9fd] text-xs focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                    Host / Domain / IP
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. scooter-stuffing.tun.ply.gg"
                    value={endpointForm.host}
                    onChange={(e) => setEndpointForm({ ...endpointForm, host: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#1a1522]/20 bg-[#f8f9fd] text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[11px] text-[#1a1522]/80 block">
                    Port
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="25565"
                    value={endpointForm.port}
                    onChange={(e) => setEndpointForm({ ...endpointForm, port: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#1a1522]/20 bg-[#f8f9fd] text-xs font-mono focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddIpModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#1a1522] font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingIp || !endpointForm.host.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSavingIp ? 'Saving...' : 'Save to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
