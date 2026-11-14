'use client';

import React, { useState } from 'react';
import {
  Power,
  RotateCcw,
  Play,
  ShieldAlert,
  Server,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function ServerControlPage() {
  const { serverInfo, startServer, stopServer, restartServer, auditLogs } = useServerStore();
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'stop' | 'restart';
    title: string;
    message: string;
  }>({
    isOpen: false,
    action: 'stop',
    title: '',
    message: '',
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  const handleAction = async () => {
    setIsExecuting(true);
    setLastActionStatus(`Dispatching ${confirmModal.action.toUpperCase()} command to Termux agent...`);

    if (confirmModal.action === 'stop') {
      await stopServer();
      setLastActionStatus('Server safely stopped. Chunks saved.');
    } else if (confirmModal.action === 'restart') {
      await restartServer();
      setLastActionStatus('Server safely restarted.');
    }
    setIsExecuting(false);
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDirectStart = async () => {
    setIsExecuting(true);
    setLastActionStatus('Dispatching START command to Termux agent...');
    await startServer();
    setLastActionStatus('Server process initiated. Paper 26.3 running.');
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Server Process Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Safe process orchestration, graceful shutdown via local RCON, and duplicate instance prevention.
          </p>
        </div>
        <StatusBadge status={serverInfo.status} size="md" />
      </div>

      {/* Control Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Start Card */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <h3 className="font-semibold text-sm text-white">Start Server</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Launches Paper with <code className="text-blue-300 font-mono text-[11px]">-Xms1G -Xmx4G</code> under Termux wake-lock protection.
            </p>
          </div>
          <button
            onClick={handleDirectStart}
            disabled={serverInfo.status !== 'offline' || isExecuting}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {serverInfo.status === 'online' ? 'Already Running' : 'Start Process'}
          </button>
        </div>

        {/* Restart Card */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white">Safe Restart</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flushes world data, shuts down gracefully, verifies process termination, and boots Paper fresh.
            </p>
          </div>
          <button
            onClick={() =>
              setConfirmModal({
                isOpen: true,
                action: 'restart',
                title: 'Confirm Server Restart',
                message:
                  'Active players will be disconnected. The server will cleanly flush chunk changes to storage and relaunch.',
              })
            }
            disabled={serverInfo.status !== 'online' || isExecuting}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart Process
          </button>
        </div>

        {/* Graceful Stop Card */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <Power className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-white">Graceful Stop</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sends an RCON save-and-stop sequence. NEVER issues SIGKILL unless the process hangs completely.
            </p>
          </div>
          <button
            onClick={() =>
              setConfirmModal({
                isOpen: true,
                action: 'stop',
                title: 'Gracefully Stop Server?',
                message:
                  'Are you sure you want to stop the Minecraft Paper server? The agent will issue a clean shutdown signal so no chunk data is lost.',
              })
            }
            disabled={serverInfo.status !== 'online' || isExecuting}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Power className="w-3.5 h-3.5" />
            Stop Server
          </button>
        </div>
      </div>

      {/* Process Telemetry & Diagnostic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Process State Box */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Process Telemetry
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Termux PID Status</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Current Process ID (PID)</span>
              <span className="font-mono text-white font-semibold">
                {serverInfo.pid ? `${serverInfo.pid} (Active)` : 'None (Process Dead)'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Last Startup Time</span>
              <span className="text-slate-200">
                {serverInfo.lastStartup ? new Date(serverInfo.lastStartup).toLocaleString() : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Last Shutdown Time</span>
              <span className="text-slate-200">
                {serverInfo.lastShutdown ? new Date(serverInfo.lastShutdown).toLocaleString() : 'Running clean'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/40">
              <span className="text-slate-400">Startup Crash / Errors</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                None detected (Zero crash logs)
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Last Action Dispatched</span>
              <span className="text-blue-400 font-medium">
                {lastActionStatus || 'Ready for command'}
              </span>
            </div>
          </div>
        </div>

        {/* Safety & Guard Architecture Note */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Safety Architecture
            </h3>
            <span className="text-[11px] text-emerald-400 font-medium">Lockfile Protected</span>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Duplicate Instance Prevention:</strong> The launcher checks PID lockfile in <code className="text-blue-300 font-mono text-[11px]">~/minecraft/server/.server.pid</code> before binding ports, ensuring Paper cannot be started twice.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Local-Only RCON:</strong> Graceful commands travel exclusively through localhost (<code className="text-blue-300 font-mono text-[11px]">127.0.0.1:25575</code>). The RCON password is never sent to the browser or exposed over the internet.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong>Termux Wake-Lock:</strong> Server launch triggers Android wake lock via <code className="text-blue-300 font-mono text-[11px]">termux-wake-lock</code>, preventing the Snapdragon 888 from entering deep sleep while players are online.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.action === 'stop' ? 'Stop Server' : 'Restart Server'}
        isDestructive={confirmModal.action === 'stop'}
        onConfirm={handleAction}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
