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
  Send,
  Zap
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

export default function DashboardOverviewPage() {
  const {
    serverInfo,
    metrics,
    players,
    logs,
    startServer,
    stopServer,
    restartServer,
    sendConsoleCommand,
    toggleOp,
    kickPlayer
  } = useServerStore();

  const [copied, setCopied] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const onlinePlayers = players.filter((p) => p.isOnline);
  const serverAddress = 'in.kryin.host:25565';
  const bedrockAddress = 'in.kryin.host:19132';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim() || isExecuting) return;
    setIsExecuting(true);
    try {
      await sendConsoleCommand(commandInput.trim());
      setCommandInput('');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleQuickAction = async (action: 'restart' | 'stop' | 'hibernate') => {
    if (action === 'restart') {
      setActionNotice('Restarting server...');
      await restartServer();
    } else if (action === 'stop') {
      setActionNotice('Shutting down server...');
      await stopServer();
    } else if (action === 'hibernate') {
      setActionNotice('Server placed in smart low-power hibernation. Wakes on player join.');
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const ramPercent = Math.min(100, Math.round((metrics.usedRamMb / metrics.totalRamMb) * 100));

  return (
    <div className="space-y-6">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Server Header Banner */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#121019] border border-[#242131] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              {serverInfo.name}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE · 20.0 TPS
            </span>
            <span className="px-2 py-0.5 rounded bg-[#1e1b29] text-zinc-400 text-xs border border-[#302c40]">
              Paper 1.21.4
            </span>
          </div>
          <p className="text-xs text-zinc-400 flex flex-wrap items-center gap-2">
            <span>Node: <strong className="text-zinc-300">Mumbai DC-1 (Bare-Metal)</strong></span>
            <span>•</span>
            <span>Uptime: <strong className="text-zinc-300">{Math.floor(serverInfo.uptimeSeconds / 3600)}h {Math.floor((serverInfo.uptimeSeconds % 3600) / 60)}m</strong></span>
            <span>•</span>
            <span>Geyser Cross-Play: <strong className="text-emerald-400">Active</strong></span>
          </p>
        </div>

        {/* Server Power Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleQuickAction('restart')}
            className="px-3.5 py-2 rounded-lg bg-[#1c1926] hover:bg-[#252233] text-zinc-200 hover:text-white border border-[#2e2a3f] text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Gracefully restart Minecraft server"
          >
            <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Restart</span>
          </button>

          <button
            onClick={() => handleQuickAction('hibernate')}
            className="px-3.5 py-2 rounded-lg bg-[#1c1926] hover:bg-[#252233] text-zinc-200 hover:text-white border border-[#2e2a3f] text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Hibernate when idle, auto-wakes in <90s on player join"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hibernate</span>
          </button>

          <button
            onClick={() => handleQuickAction('stop')}
            className="px-3.5 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-red-200 border border-red-800/40 text-xs font-semibold flex items-center gap-2 transition-colors"
            title="Stop server"
          >
            <Power className="w-3.5 h-3.5 text-red-400" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TPS Card */}
        <div className="p-4 rounded-xl bg-[#121019] border border-[#242131] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Engine Health
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% HEALTH</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100 font-mono">20.0</span>
            <span className="text-xs text-zinc-400">TPS (11.2ms)</span>
          </div>
          <div className="w-full bg-[#1b1926] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* RAM Usage Card */}
        <div className="p-4 rounded-xl bg-[#121019] border border-[#242131] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              Memory Allocation
            </span>
            <span className="text-[10px] text-blue-400 font-semibold">{ramPercent}% USED</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100 font-mono">
              {(metrics.usedRamMb / 1024).toFixed(1)} <span className="text-sm font-normal text-zinc-400">/ {(metrics.totalRamMb / 1024).toFixed(1)} GB</span>
            </span>
            <span className="text-xs text-zinc-400">DDR5 High-Speed</span>
          </div>
          <div className="w-full bg-[#1b1926] h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full rounded-full transition-all" style={{ width: `${ramPercent}%` }} />
          </div>
        </div>

        {/* CPU Load Card */}
        <div className="p-4 rounded-xl bg-[#121019] border border-[#242131] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              Compute Node Load
            </span>
            <span className="text-[10px] text-purple-400 font-semibold">4.4 GHz</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100 font-mono">{metrics.cpuUsagePercent.toFixed(1)}%</span>
            <span className="text-xs text-zinc-400">AMD EPYC</span>
          </div>
          <div className="w-full bg-[#1b1926] h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full transition-all" style={{ width: `${metrics.cpuUsagePercent * 2}%` }} />
          </div>
        </div>

        {/* Active Players Card */}
        <div className="p-4 rounded-xl bg-[#121019] border border-[#242131] space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Connected Players
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">PAN-INDIA</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100 font-mono">
              {onlinePlayers.length} <span className="text-sm font-normal text-zinc-400">/ {serverInfo.maxPlayers}</span>
            </span>
            <span className="text-xs text-zinc-400">Slots</span>
          </div>
          <div className="w-full bg-[#1b1926] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${(onlinePlayers.length / serverInfo.maxPlayers) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Network Connection Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#121019] border border-[#242131] grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Java Address */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#161420] border border-[#262333]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-zinc-200">Java Edition Server IP</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-850">
                PORT 25565
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">{serverAddress}</p>
          </div>
          <button
            onClick={() => handleCopy(serverAddress)}
            className="p-2 rounded-md bg-[#201d2d] hover:bg-[#29253a] text-zinc-300 hover:text-white transition-colors"
            title="Copy Java IP"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Bedrock Address */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[#161420] border border-[#262333]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-zinc-200">Bedrock / Mobile IP</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-850">
                PORT 19132
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">{bedrockAddress}</p>
          </div>
          <button
            onClick={() => handleCopy(bedrockAddress)}
            className="p-2 rounded-md bg-[#201d2d] hover:bg-[#29253a] text-zinc-300 hover:text-white transition-colors"
            title="Copy Bedrock IP"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Live Console Preview & Active Players */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Console Stream & Command Sender */}
        <div className="lg:col-span-2 rounded-xl bg-[#121019] border border-[#242131] flex flex-col overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-[#242131] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Live Console Stream</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <Link
              href="/dashboard/console"
              className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
            >
              <span>Full Screen</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Console Log Feed */}
          <div className="p-4 bg-[#0a090e] font-mono text-xs overflow-y-auto max-h-[340px] space-y-1.5 leading-relaxed select-text">
            {logs.slice(-12).map((log, idx) => {
              const isError = log.level === 'ERROR';
              const isWarn = log.level === 'WARN';
              const isCommand = log.message.startsWith('/') || log.message.includes('executed');

              return (
                <div key={log.id || idx} className="flex items-start gap-2.5">
                  <span className="text-zinc-400 select-none flex-shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-semibold flex-shrink-0 text-[10px] px-1 py-0.2 rounded ${
                      isError
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : isWarn
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-800/80 text-zinc-400'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span
                    className={`break-all ${
                      isError
                        ? 'text-red-300'
                        : isWarn
                        ? 'text-amber-200'
                        : isCommand
                        ? 'text-indigo-300 font-semibold'
                        : 'text-zinc-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Inline Command Composer */}
          <form onSubmit={handleSendCommand} className="p-3 bg-[#121019] border-t border-[#242131] flex items-center gap-2">
            <span className="text-emerald-400 font-bold font-mono pl-1 select-none">&gt;</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Execute command (e.g. /tps, /say hello, /op player, /whitelist list)..."
              className="flex-1 bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              disabled={isExecuting || !commandInput.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Run</span>
              <Send className="w-3 h-3" />
            </button>
          </form>

          {/* Quick Command Suggestions */}
          <div className="px-4 py-2 bg-[#0e0d13] border-t border-[#1e1b29] flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
            <span className="text-zinc-400">Quick:</span>
            {['/tps', '/whitelist list', '/time set day', '/weather clear', '/save-all'].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => setCommandInput(cmd)}
                className="px-2 py-0.5 rounded bg-[#181622] hover:bg-[#221f30] text-zinc-400 hover:text-zinc-200 border border-[#2b273b] font-mono transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Online Players */}
        <div className="rounded-xl bg-[#121019] border border-[#242131] flex flex-col overflow-hidden">
          <div className="p-3.5 sm:p-4 border-b border-[#242131] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide">
                Live Players ({onlinePlayers.length})
              </span>
            </div>
            <Link
              href="/dashboard/players"
              className="text-xs text-zinc-400 hover:text-zinc-100 flex items-center gap-1 transition-colors"
            >
              <span>All Players</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Player Cards */}
          <div className="p-3 space-y-2 flex-1 overflow-y-auto">
            {onlinePlayers.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs">
                No players currently online. Server is idling safely.
              </div>
            ) : (
              onlinePlayers.map((player) => (
                <div
                  key={player.uuid}
                  className="p-3 rounded-lg bg-[#161420] border border-[#262333] flex items-center justify-between gap-3 hover:border-[#38334b] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Head Avatar */}
                    <div className="w-8 h-8 rounded bg-[#201d2d] border border-[#2d293d] flex items-center justify-center font-bold text-xs text-zinc-200 flex-shrink-0">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-zinc-200 truncate font-mono">
                          {player.username}
                        </span>
                        {player.isOp && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            OP
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                        <span className="text-emerald-400">● {player.pingMs || 18}ms</span>
                        <span>•</span>
                        <span className="capitalize">{player.gamemode}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Player Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleOp(player.uuid)}
                      className={`p-1.5 rounded text-[10px] border transition-colors ${
                        player.isOp
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                          : 'bg-[#1e1b29] text-zinc-400 border-[#2e2a3f] hover:text-zinc-200'
                      }`}
                      title={player.isOp ? 'Revoke OP operator' : 'Promote to OP'}
                    >
                      <Shield className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => kickPlayer(player.uuid, 'Admin kicked from web portal')}
                      className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-[10px] transition-colors"
                      title="Kick player"
                    >
                      Kick
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Invite / Whitelist Button */}
          <div className="p-3 bg-[#0e0d13] border-t border-[#1e1b29]">
            <Link
              href="/dashboard/players"
              className="w-full py-2 px-3 rounded-lg bg-[#181622] hover:bg-[#201d2d] text-zinc-300 hover:text-white border border-[#2b273b] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors font-mono"
            >
              <span>Manage Whitelist & Bans</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
