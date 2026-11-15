'use client';

import React, { useState, useEffect } from 'react';
import { Play, RotateCw, Square, Skull, AlertTriangle, X } from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

interface PowerButtonsProps {
  className?: string;
  compact?: boolean;
}

export function PowerButtons({ className = '', compact = false }: PowerButtonsProps) {
  const { serverInfo, startServer, stopServer, restartServer, killServer } = useServerStore();
  const status = serverInfo.status;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stoppingDuration, setStoppingDuration] = useState(0);

  // Track how long the server has been stuck in 'stopping' state
  useEffect(() => {
    let timer: any = null;
    if (status === 'stopping') {
      const startTime = Date.now();
      timer = setInterval(() => {
        setStoppingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setStoppingDuration(0);
      setIsConfirmOpen(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status]);

  const isStopping = status === 'stopping';
  const isKillable = isStopping || stoppingDuration > 10;

  const handleStart = async () => {
    if (status !== 'offline' || actionLoading) return;
    setActionLoading('start');
    try {
      await startServer();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestart = async () => {
    if (status === 'offline' || actionLoading) return;
    setActionLoading('restart');
    try {
      await restartServer();
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopOrKill = async () => {
    if (status === 'offline' || actionLoading) return;
    if (isKillable) {
      setIsConfirmOpen(true);
      return;
    }
    setActionLoading('stop');
    try {
      await stopServer();
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmKill = async () => {
    setIsConfirmOpen(false);
    setActionLoading('kill');
    try {
      await killServer();
    } finally {
      setActionLoading(null);
    }
  };

  const btnPadding = compact ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-xs sm:text-sm';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={status !== 'offline' || Boolean(actionLoading)}
        className={`${btnPadding} rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
          status === 'offline'
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
            : status === 'starting'
            ? 'bg-amber-600/90 text-white border border-amber-500 cursor-not-allowed'
            : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-50'
        }`}
        title="Start Minecraft Server"
      >
        {status === 'starting' || actionLoading === 'start' ? (
          <RotateCw className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current" />
        )}
        <span>{status === 'starting' || actionLoading === 'start' ? 'Starting...' : 'Start'}</span>
      </button>

      {/* Restart Button */}
      <button
        onClick={handleRestart}
        disabled={status === 'offline' || isStopping || Boolean(actionLoading)}
        className={`${btnPadding} rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
          status !== 'offline' && !isStopping
            ? 'bg-zinc-800 hover:bg-zinc-700 text-white cursor-pointer active:scale-95'
            : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-50'
        }`}
        title="Restart Minecraft Server"
      >
        <RotateCw className={`w-3.5 h-3.5 ${actionLoading === 'restart' ? 'animate-spin' : ''}`} />
        <span>{actionLoading === 'restart' ? 'Restarting...' : 'Restart'}</span>
      </button>

      {/* Stop / Kill Button */}
      <button
        onClick={handleStopOrKill}
        disabled={status === 'offline' && !isStopping}
        className={`${btnPadding} rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
          isKillable
            ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse border border-red-500 shadow-md cursor-pointer active:scale-95'
            : status !== 'offline'
            ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer active:scale-95'
            : 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-50'
        }`}
        title={isKillable ? `Forcibly terminate process (${stoppingDuration}s)` : 'Safely Stop Server'}
      >
        {isKillable ? (
          <>
            <Skull className="w-3.5 h-3.5" />
            <span>{actionLoading === 'kill' ? 'Killing...' : stoppingDuration > 5 ? `Kill (${stoppingDuration}s)` : 'Kill'}</span>
          </>
        ) : (
          <>
            {isStopping || actionLoading === 'stop' ? (
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Square className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isStopping || actionLoading === 'stop' ? 'Stopping...' : 'Stop'}</span>
          </>
        )}
      </button>

      {/* Kill Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 font-mono text-[#1a1522]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-red-600 font-bold text-base">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <span>Forcibly Stop Process?</span>
              </div>
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Forcibly stopping the Paper engine sends an immediate <code className="bg-red-50 text-red-700 px-1 py-0.5 rounded font-bold">SIGKILL (-9)</code> signal on Indian Node. Unsaved world data or chunks may fail to write to disk.
            </p>

            {stoppingDuration > 0 && (
              <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Process has been stopping for <strong>{stoppingDuration} seconds</strong>.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmKill}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Skull className="w-3.5 h-3.5" />
                <span>Continue (SIGKILL)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
