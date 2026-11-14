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
  Cpu,
  HardDrive,
  Activity,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Wifi,
  ChevronRight,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCode,
  Sliders,
  FolderTree
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { StatusBadge } from '@/components/StatusBadge';

export default function DashboardOverviewPage() {
  const {
    serverInfo,
    metrics,
    players,
    startServer,
    stopServer,
    restartServer,
    toggleOp,
    kickPlayer
  } = useServerStore();

  const [copiedJava, setCopiedJava] = useState(false);
  const [copiedBedrock, setCopiedBedrock] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const onlinePlayers = players.filter((p) => p.isOnline);
  const javaAddress = 'in.kryin.host:25565';
  const bedrockAddress = 'in.kryin.host:19132';

  const copyAddress = (type: 'java' | 'bedrock', text: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'java') {
      setCopiedJava(true);
      setTimeout(() => setCopiedJava(false), 2000);
    } else {
      setCopiedBedrock(true);
      setTimeout(() => setCopiedBedrock(false), 2000);
    }
  };

  const handleQuickAction = async (action: 'start' | 'restart' | 'stop' | 'hibernate') => {
    if (action === 'start') {
      setActionNotice('Starting Paper server on Mumbai Node 01...');
      await startServer();
    } else if (action === 'restart') {
      setActionNotice('Gracefully restarting server and flushing chunks...');
      await restartServer();
    } else if (action === 'stop') {
      setActionNotice('Gracefully stopping server. World chunks safely saved to NVMe.');
      await stopServer();
    } else if (action === 'hibernate') {
      setActionNotice('Server placed in smart low-power hibernation. Wakes on player join in <90s.');
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const ramPercent = Math.min(100, Math.round((metrics.usedRamMb / metrics.totalRamMb) * 100));
  const capacityPercent = Math.min(100, Math.round((onlinePlayers.length / serverInfo.maxPlayers) * 100));

  return (
    <div className="space-y-6 font-mono text-[#1a1522]">
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

      {/* Main Server Header Card with Power Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1522]">
              {serverInfo.name}
            </h1>
            <StatusBadge status={serverInfo.status} size="md" />
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80">
              Paper 1.21.4
            </span>
          </div>

          <p className="text-xs text-[#1a1522]/60 flex flex-wrap items-center gap-2">
            <span>Node: <strong className="text-[#1a1522]">Mumbai DC-1 (India)</strong></span>
            <span>•</span>
            <span>Uptime: <strong className="text-[#1a1522]">{serverInfo.status === 'online' ? `${Math.floor(serverInfo.uptimeSeconds / 3600)}h ${Math.floor((serverInfo.uptimeSeconds % 3600) / 60)}m` : 'Offline'}</strong></span>
            <span>•</span>
            <span>Geyser Crossplay: <strong className={serverInfo.status === 'online' ? 'text-emerald-700' : 'text-[#1a1522]/50'}>{serverInfo.status === 'online' ? 'Online' : 'Offline'}</strong></span>
          </p>
        </div>

        {/* Server Power Hub: Start, Stop, Restart, Hibernate */}
        <div className="flex flex-wrap items-center gap-2">
          {serverInfo.status === 'offline' || (serverInfo.status as any) === 'crashed' ? (
            <button
              onClick={() => handleQuickAction('start')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Start Minecraft Server"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Server</span>
            </button>
          ) : (
            <button
              onClick={() => handleQuickAction('restart')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Gracefully restart Minecraft server"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}

          <button
            onClick={() => handleQuickAction('hibernate')}
            className="px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Hibernate when idle, auto-wakes on join"
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Hibernate</span>
          </button>

          {serverInfo.status === 'online' && (
            <button
              onClick={() => handleQuickAction('stop')}
              className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Gracefully shut down server"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary White & Blue Metric Cards: IP, TPS, Players Online, RAM */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Server IP & Port */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-[#1a1522]/60">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Wifi className="w-3.5 h-3.5 text-blue-600" />
              Server Address
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              PORT 25565
            </span>
          </div>

          <div>
            <div className="text-sm sm:text-base font-bold text-[#1a1522] truncate">
              {javaAddress}
            </div>
            <p className="text-[11px] text-[#1a1522]/50 mt-0.5">
              Java Edition · Direct Mumbai Peering
            </p>
          </div>

          <button
            onClick={() => copyAddress('java', javaAddress)}
            className="w-full py-1.5 px-3 rounded-lg bg-[#f8f9fd] hover:bg-blue-50 text-xs font-semibold text-[#1a1522] border border-[#1a1522]/10 hover:border-blue-300 flex items-center justify-center gap-1.5 transition-all"
          >
            {copiedJava ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied Address!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-blue-600" />
                <span>Copy Server IP</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time TPS */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-[#1a1522]/60">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Activity className={`w-3.5 h-3.5 ${serverInfo.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Engine Health
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${serverInfo.status === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {serverInfo.status === 'online' ? 'STABLE' : 'OFFLINE'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold tracking-tight ${serverInfo.status === 'online' ? 'text-[#1a1522]' : 'text-[#1a1522]/40'}`}>
              {serverInfo.status === 'online' ? serverInfo.tps.toFixed(1) : '--'}
            </span>
            <span className="text-xs text-[#1a1522]/60 font-medium">
              {serverInfo.status === 'online' ? 'TPS (11.2ms MSPT)' : 'Node Standby'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-[#f0f2f8] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${serverInfo.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                style={{ width: serverInfo.status === 'online' ? '100%' : '0%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#1a1522]/50">
              <span>Tick Stability</span>
              <span className={`font-bold ${serverInfo.status === 'online' ? 'text-emerald-700' : 'text-[#1a1522]/40'}`}>
                {serverInfo.status === 'online' ? '100% Zero Lag' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Players Online (like online/out of total) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-[#1a1522]/60">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Connected Players
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${serverInfo.status === 'online' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {serverInfo.status === 'online' ? 'PAN-INDIA' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold tracking-tight ${serverInfo.status === 'online' ? 'text-[#1a1522]' : 'text-[#1a1522]/40'}`}>
              {onlinePlayers.length}
              <span className="text-lg font-normal text-[#1a1522]/50"> / {serverInfo.maxPlayers}</span>
            </span>
            <span className="text-xs text-[#1a1522]/60 font-medium">
              {serverInfo.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-[#f0f2f8] h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all"
                style={{ width: `${serverInfo.status === 'online' ? capacityPercent : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#1a1522]/50">
              <span>Server Capacity</span>
              <span className={`font-bold ${onlinePlayers.length > 0 ? 'text-blue-700' : 'text-[#1a1522]/40'}`}>
                {serverInfo.status === 'online' ? `${capacityPercent}% Utilized` : 'Node Standby'}
              </span>
            </div>
          </div>
        </div>

        {/* Memory (RAM) Allocation */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs text-[#1a1522]/60">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
              Memory Allocation
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${serverInfo.status === 'online' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {serverInfo.status === 'online' ? 'DDR5 HIGH-SPEED' : 'STANDBY'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-bold tracking-tight ${serverInfo.status === 'online' ? 'text-[#1a1522]' : 'text-[#1a1522]/40'}`}>
              {(serverInfo.status === 'online' ? metrics.usedRamMb / 1024 : 0).toFixed(2)}
              <span className="text-sm font-normal text-[#1a1522]/50"> / {(metrics.totalRamMb / 1024).toFixed(1)} GB</span>
            </span>
            <span className="text-xs text-[#1a1522]/60 font-medium">
              {serverInfo.status === 'online' ? `${ramPercent}%` : '0%'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-[#f0f2f8] h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${serverInfo.status === 'online' ? ramPercent : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#1a1522]/50">
              <span>JVM Heap</span>
              <span className={`font-bold ${serverInfo.status === 'online' ? 'text-indigo-700' : 'text-[#1a1522]/40'}`}>
                {serverInfo.status === 'online' ? 'Low-Latency G1GC' : 'Unallocated'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Protocol Box: Java & Bedrock IPs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Java Connection Details */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-[#1a1522]">Java Edition Endpoint</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                TCP : 25565
              </span>
            </div>
            <p className="text-xs text-[#1a1522]/60 font-mono truncate">{javaAddress}</p>
          </div>
          <button
            onClick={() => copyAddress('java', javaAddress)}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex-shrink-0"
            title="Copy Java IP"
          >
            {copiedJava ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Bedrock Connection Details */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-[#1a1522]">Bedrock & Mobile Endpoint</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                UDP : 19132
              </span>
            </div>
            <p className="text-xs text-[#1a1522]/60 font-mono truncate">{bedrockAddress}</p>
          </div>
          <button
            onClick={() => copyAddress('bedrock', bedrockAddress)}
            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors flex-shrink-0"
            title="Copy Bedrock IP"
          >
            {copiedBedrock ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Two Column Layout: Connected Players Roster & Node Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Connected Players Table */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#1a1522]/10 flex items-center justify-between bg-[#fbfbfe]">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-[#1a1522] uppercase tracking-wider">
                Online Players ({onlinePlayers.length} / {serverInfo.maxPlayers})
              </span>
            </div>
            <Link
              href="/dashboard/players"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              <span>Manage Whitelist & Bans</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Players Table / List */}
          <div className="p-4 space-y-2 flex-1">
            {onlinePlayers.length === 0 ? (
              <div className="p-8 text-center text-[#1a1522]/50 text-xs">
                Server is currently offline. No players connected. Start the server or link your Termux node to stream live player telemetry.
              </div>
            ) : (
              onlinePlayers.map((player) => (
                <div
                  key={player.uuid}
                  className="p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/8 flex items-center justify-between gap-3 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Head Avatar */}
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200 flex-shrink-0">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#1a1522] truncate font-mono">
                          {player.username}
                        </span>
                        {player.isOp && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            OP
                          </span>
                        )}
                        {player.isWhitelisted && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                            WHITELIST
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-[#1a1522]/50 font-mono mt-0.5">
                        <span className="text-emerald-700 font-semibold">● {player.pingMs || 18}ms</span>
                        <span>•</span>
                        <span className="capitalize">{player.gamemode}</span>
                        {player.coordinates && (
                          <>
                            <span>•</span>
                            <span>XYZ: {Math.round(player.coordinates.x)}, {Math.round(player.coordinates.y)}, {Math.round(player.coordinates.z)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Player Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleOp(player.uuid)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        player.isOp
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-[#1a1522]/70 border-[#1a1522]/15 hover:bg-slate-50'
                      }`}
                      title={player.isOp ? 'Revoke OP operator' : 'Promote to OP'}
                    >
                      <Shield className="w-3.5 h-3.5 inline mr-1" />
                      <span>{player.isOp ? 'De-OP' : 'OP'}</span>
                    </button>

                    <button
                      onClick={() => kickPlayer(player.uuid, 'Disconnected by administrator')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold transition-all"
                      title="Kick player from server"
                    >
                      Kick
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Control Shortcuts & Node Specs */}
        <div className="space-y-4">
          {/* Dedicated Terminal Console Fast Link Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  DEDICATED CONSOLE
                </span>
                <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Live Server Terminal
              </h3>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                Full-screen RCON command executor, log filters, auto-scroll, and live player broadcast.
              </p>
            </div>

            <Link
              href="/dashboard/console"
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Terminal className="w-4 h-4 text-blue-700" />
              <span>Open Dedicated Console →</span>
            </Link>
          </div>

          {/* Node Infrastructure Specifications */}
          <div className="p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a1522]/60 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Bare-Metal Node Specs
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#1a1522]/8">
                <span className="text-[#1a1522]/60">Datacenter</span>
                <span className="font-bold text-[#1a1522]">Tier-IV Mumbai (IN)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1a1522]/8">
                <span className="text-[#1a1522]/60">Compute Core</span>
                <span className="font-bold text-[#1a1522]">AMD EPYC 9654 (4.4 GHz)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1a1522]/8">
                <span className="text-[#1a1522]/60">Network Uplink</span>
                <span className="font-bold text-emerald-700">10 Gbps Symmetric Peering</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1a1522]/8">
                <span className="text-[#1a1522]/60">Smart Sleep</span>
                <span className="font-bold text-blue-700">Armed (Sleep after 10m)</span>
              </div>
            </div>

            {/* Quick Actions Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/dashboard/files"
                className="py-2 px-3 rounded-lg bg-[#f8f9fd] hover:bg-blue-50 text-[#1a1522] border border-[#1a1522]/10 text-xs font-semibold text-center transition-colors"
              >
                File Manager
              </Link>
              <Link
                href="/dashboard/settings"
                className="py-2 px-3 rounded-lg bg-[#f8f9fd] hover:bg-blue-50 text-[#1a1522] border border-[#1a1522]/10 text-xs font-semibold text-center transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
