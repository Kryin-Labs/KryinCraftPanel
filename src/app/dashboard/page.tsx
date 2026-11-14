'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Server,
  Cpu,
  HardDrive,
  BatteryCharging,
  Thermometer,
  Users,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Power,
  Play,
  RotateCcw,
  Zap,
  Info,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function DashboardOverviewPage() {
  const { serverInfo, metrics, history, startServer, stopServer, restartServer } = useServerStore();

  const [confirmAction, setConfirmAction] = useState<'stop' | 'restart' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    if (confirmAction === 'stop') {
      await stopServer();
    } else if (confirmAction === 'restart') {
      await restartServer();
    }
    setIsProcessing(false);
    setConfirmAction(null);
  };

  // SVG Chart points calculation for CPU
  const maxCpu = 50;
  const cpuPoints = history
    .map((pt, i) => {
      const x = (i / (history.length - 1)) * 300;
      const y = 80 - (pt.cpu / maxCpu) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  // SVG Chart points calculation for RAM (Phone vs Java)
  const maxRam = 12288;
  const phoneRamPoints = history
    .map((pt, i) => {
      const x = (i / (history.length - 1)) * 300;
      const y = 80 - (pt.ramPhone / maxRam) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  const javaRamPoints = history
    .map((pt, i) => {
      const x = (i / (history.length - 1)) * 300;
      const y = 80 - (pt.ramJava / maxRam) * 70;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Power Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111722] border border-slate-800/80 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-white tracking-wide">Server Overview</h1>
            <StatusBadge status={serverInfo.status} size="sm" />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>{serverInfo.device}</span>
            <span>•</span>
            <span>Paper {serverInfo.minecraftVersion} (Build #{serverInfo.paperBuild})</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {serverInfo.status === 'offline' ? (
            <button
              onClick={() => startServer()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Server
            </button>
          ) : (
            <>
              <button
                onClick={() => setConfirmAction('restart')}
                disabled={isProcessing || serverInfo.status !== 'online'}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restart
              </button>
              <button
                onClick={() => setConfirmAction('stop')}
                disabled={isProcessing || serverInfo.status !== 'online'}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Power className="w-3.5 h-3.5" />
                Stop
              </button>
            </>
          )}

          <Link
            href="/dashboard/console"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            Console
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Server Status */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Server Status</span>
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white capitalize">{serverInfo.status}</span>
            <span className="text-xs font-mono text-emerald-400">{serverInfo.tps} TPS</span>
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>PID: {serverInfo.pid || 'Inactive'}</span>
            <span>Uptime: {Math.floor(serverInfo.uptimeSeconds / 3600)}h {Math.floor((serverInfo.uptimeSeconds % 3600) / 60)}m</span>
          </div>
        </div>

        {/* Card 2: Players */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Players Online</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white">
              {serverInfo.onlinePlayers} <span className="text-xs text-slate-400 font-normal">/ {serverInfo.maxPlayers}</span>
            </span>
            <Link
              href="/dashboard/players"
              className="text-xs text-blue-400 hover:underline flex items-center gap-0.5"
            >
              Manage
            </Link>
          </div>
          <div className="text-[11px] text-slate-500">
            Bedrock + Java via Geyser {serverInfo.geyserVersion.split('-')[0]}
          </div>
        </div>

        {/* Card 3: Phone RAM Usage */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Phone System RAM</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white">
              {Math.round((metrics.usedRamMb / 1024) * 10) / 10}{' '}
              <span className="text-xs text-slate-400 font-normal">/ 12 GB</span>
            </span>
            <span className="text-xs font-mono text-purple-400">
              {Math.round((metrics.usedRamMb / metrics.totalRamMb) * 100)}%
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Available: {Math.round((metrics.availableRamMb / 1024) * 10) / 10} GB Free
          </div>
        </div>

        {/* Card 4: Termux Agent Status */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Agent Link</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Connected (HTTPS)
            </span>
            <span className="text-[11px] text-slate-400">30s Heartbeat</span>
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            Last: {serverInfo.lastHeartbeat}
          </div>
        </div>
      </div>

      {/* Memory Distinction Banner: Phone RAM vs Java Heap */}
      <div className="p-4 rounded-xl bg-[#131a26] border border-blue-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-semibold text-white">Memory Allocation Breakdown</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Distinguishing Android system RAM from Java virtual machine heap. Paper is restricted to <code className="text-blue-300 font-mono">-Xms1G -Xmx4G</code>, leaving ample headroom for Android 13 stability.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0 text-xs font-mono">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Java Heap Used</span>
            <span className="text-blue-400 font-bold">{Math.round((metrics.javaHeapUsedMb / 1024) * 100) / 100} GB</span> / 4.0 GB
          </div>
          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${(metrics.javaHeapUsedMb / metrics.javaHeapMaxMb) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Hardware Monitoring Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: CPU & Thermal Sensors */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">CPU & Thermals (ROG Phone 5s)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Snapdragon 888 (8 cores)</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">CPU Load</span>
              <span className="text-xl font-bold text-white font-mono">{metrics.cpuUsagePercent}%</span>
              <span className="text-[10px] text-slate-500 block mt-1">/proc/stat metric</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">CPU Temperature</span>
              <span className="text-xl font-bold text-amber-400 font-mono">
                {metrics.cpuTempC ? `${metrics.cpuTempC}°C` : 'Unavailable'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                {metrics.cpuTempC ? 'thermal_zone0 readable' : 'Android permission restricted'}
              </span>
            </div>
          </div>

          {/* Mini CPU History Chart */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>CPU Load Trend (Past 30 min)</span>
              <span className="font-mono text-blue-400">{metrics.cpuUsagePercent}% Now</span>
            </div>
            <div className="h-24 w-full bg-slate-900/80 rounded-xl p-2 border border-slate-800/50 flex items-end">
              <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={cpuPoints}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Battery & Power Management */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Power & Battery Health</h3>
            </div>
            <span className="text-xs font-medium text-emerald-400">{metrics.powerSource}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">Battery Level</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white font-mono">{metrics.batteryPercent}%</span>
                <span className="text-xs text-emerald-400 font-semibold">Charging</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">Dual 3000mAh Cells (6000mAh)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
              <span className="text-xs text-slate-400 block">Battery Temp</span>
              <span className="text-xl font-bold text-slate-200 font-mono">
                {metrics.batteryTempC ? `${metrics.batteryTempC}°C` : 'Unavailable'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Optimal thermal range</span>
            </div>
          </div>

          {/* Mini Memory Chart: Phone RAM vs Java */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-400"></span> Phone RAM
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 ml-2"></span> Java Heap
              </span>
              <span className="font-mono text-xs text-slate-400">12 GB Total</span>
            </div>
            <div className="h-24 w-full bg-slate-900/80 rounded-xl p-2 border border-slate-800/50 flex items-end">
              <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                <polyline
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points={phoneRamPoints}
                />
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points={javaRamPoints}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmAction !== null}
        title={confirmAction === 'stop' ? 'Gracefully Stop Server?' : 'Restart Server?'}
        message={
          confirmAction === 'stop'
            ? 'The agent will trigger a graceful Paper shutdown via local RCON, saving all player inventories, world chunks, and unloading Geyser.'
            : 'The server will safely save the world, terminate the existing Paper instance, and start a fresh Paper 26.3 process.'
        }
        confirmText={confirmAction === 'stop' ? 'Stop Server' : 'Restart Now'}
        isDestructive={confirmAction === 'stop'}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
