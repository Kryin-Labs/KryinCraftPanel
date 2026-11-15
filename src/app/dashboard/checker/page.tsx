'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Globe,
  Wifi,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Radio,
  Cpu,
  ShieldCheck,
  Flame,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

interface PingResponse {
  online: boolean;
  host: string;
  port: number;
  latency_ms: number | null;
  version?: string;
  protocol?: number;
  players?: {
    online: number;
    max: number;
    sample?: Array<{ id: string; name: string }>;
  };
  motd?: string;
  error?: string;
  checked_at: string;
}

export default function ServerCheckerPage() {
  const { serverInfo } = useServerStore();
  const defaultHost = serverInfo.publicTunnelJava || 'scooter-stuffing.tun.ply.gg';
  const defaultPort = '25565';

  const [hostInput, setHostInput] = useState(defaultHost);
  const [portInput, setPortInput] = useState(defaultPort);
  const [isChecking, setIsChecking] = useState(false);
  const [autoCheck, setAutoCheck] = useState(true);
  const [result, setResult] = useState<PingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);
  const [nextCheckIn, setNextCheckIn] = useState(10);

  const performPing = async (targetHost?: string, targetPort?: string) => {
    const h = (targetHost || hostInput || 'scooter-stuffing.tun.ply.gg').trim();
    const p = (targetPort || portInput || '25565').trim();

    setIsChecking(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/server/ping?host=${encodeURIComponent(h)}&port=${encodeURIComponent(p)}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      setResult(data);
      setLastCheckTime(new Date().toLocaleTimeString());
      setNextCheckIn(10);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network request failed');
      setResult(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Run ping on mount
  useEffect(() => {
    performPing();
  }, []);

  // Auto-refresh countdown timer
  useEffect(() => {
    if (!autoCheck) return;

    const interval = setInterval(() => {
      setNextCheckIn((prev) => {
        if (prev <= 1) {
          performPing();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoCheck, hostInput, portInput]);

  return (
    <div className="space-y-6 font-mono text-[#1a1522] max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Activity className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1522]">
              Live Minecraft Protocol Checker
            </h1>
          </div>
          <p className="text-xs text-[#1a1522]/60 mt-1 max-w-2xl">
            Raw TCP Server List Ping (SLP) probe. Connects directly like a real Minecraft client to verify public reachability without opening your game or heating your computer.
          </p>
        </div>

        {/* Heat Saver Tag */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold self-start sm:self-auto">
          <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Save PC Heat • Close Game</span>
        </div>
      </div>

      {/* Target Address Form & Quick Presets */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#1a1522]/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a1522]/8 pb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1a1522]/70">
            Target Minecraft Server Address
          </span>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setHostInput('scooter-stuffing.tun.ply.gg');
                setPortInput('25565');
                performPing('scooter-stuffing.tun.ply.gg', '25565');
              }}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 transition-colors"
            >
              Public Playit Tunnel
            </button>

            {serverInfo.localIp && (
              <button
                onClick={() => {
                  setHostInput(serverInfo.localIp || '192.168.0.164');
                  setPortInput('25565');
                  performPing(serverInfo.localIp, '25565');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300 transition-colors"
              >
                LAN Wi-Fi Direct
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <label className="block text-[11px] font-bold text-[#1a1522]/60 uppercase tracking-wider mb-1">
              Host / Domain
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={hostInput}
                onChange={(e) => setHostInput(e.target.value)}
                placeholder="e.g. scooter-stuffing.tun.ply.gg"
                className="w-full pl-9 pr-3 py-2.5 bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl text-xs sm:text-sm font-bold text-[#1a1522] focus:outline-none focus:border-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-[#1a1522]/60 uppercase tracking-wider mb-1">
              Port
            </label>
            <input
              type="text"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              placeholder="25565"
              className="w-full px-3 py-2.5 bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl text-xs sm:text-sm font-bold text-[#1a1522] focus:outline-none focus:border-blue-600 transition-all font-mono"
            />
          </div>
        </div>

        {/* Action Controls & Auto-refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <button
            onClick={() => performPing()}
            disabled={isChecking}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Pinging Minecraft Protocol...' : 'Ping Server Now'}</span>
          </button>

          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[#1a1522]/70 hover:text-[#1a1522]">
              <input
                type="checkbox"
                checked={autoCheck}
                onChange={(e) => setAutoCheck(e.target.checked)}
                className="rounded border-[#1a1522]/20 text-blue-600 focus:ring-0"
              />
              <span>Auto-refresh ({nextCheckIn}s)</span>
            </label>

            {lastCheckTime && (
              <span className="text-[#1a1522]/50 text-[11px]">
                Last checked: <strong>{lastCheckTime}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Live Probe Results Display */}
      {result && (
        <div
          className={`rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${
            result.online
              ? 'bg-white border-emerald-300 shadow-emerald-500/5'
              : 'bg-white border-rose-300 shadow-rose-500/5'
          }`}
        >
          {/* Top Status Header */}
          <div
            className={`p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white ${
              result.online
                ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700'
                : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
                {result.online ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">
                  Raw Protocol Probe Result
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {result.online ? 'ONLINE & REACHABLE OVER INTERNET' : 'UNREACHABLE / OFFLINE'}
                </h2>
              </div>
            </div>

            {/* Latency Pill */}
            {result.online && result.latency_ms !== null && (
              <div className="flex items-center gap-2 bg-black/25 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/20 self-start sm:self-auto">
                <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  Latency: <strong>{result.latency_ms} ms</strong>
                </span>
              </div>
            )}
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {result.online ? (
              <>
                {/* 4 Stat Badges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {/* Ping Latency */}
                  <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#1a1522]/10 space-y-1">
                    <span className="text-[11px] font-bold text-[#1a1522]/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Round-Trip Ping
                    </span>
                    <div className="text-xl font-extrabold text-[#1a1522]">
                      {result.latency_ms} <span className="text-xs font-normal text-[#1a1522]/60">ms</span>
                    </div>
                  </div>

                  {/* Engine Version */}
                  <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#1a1522]/10 space-y-1">
                    <span className="text-[11px] font-bold text-[#1a1522]/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                      Server Engine
                    </span>
                    <div className="text-base font-extrabold text-[#1a1522] truncate">
                      {result.version || 'Paper'}
                    </div>
                  </div>

                  {/* Players Capacity */}
                  <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#1a1522]/10 space-y-1">
                    <span className="text-[11px] font-bold text-[#1a1522]/60 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      Players Online
                    </span>
                    <div className="text-xl font-extrabold text-emerald-600">
                      {result.players?.online || 0} / {result.players?.max || 20}
                    </div>
                  </div>

                  {/* Protocol */}
                  <div className="p-4 rounded-2xl bg-[#f8f9fd] border border-[#1a1522]/10 space-y-1">
                    <span className="text-[11px] font-bold text-[#1a1522]/60 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      Protocol Version
                    </span>
                    <div className="text-base font-extrabold text-[#1a1522]">
                      v{result.protocol || 777}
                    </div>
                  </div>
                </div>

                {/* Live Online Player Roster */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Currently Connected Players:
                  </span>
                  {result.players?.sample && result.players.sample.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {result.players.sample.map((p) => (
                        <div
                          key={p.id}
                          className="px-3 py-1.5 rounded-xl bg-white border border-blue-300 text-slate-900 font-bold text-xs shadow-2xs flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#1a1522]/60 font-medium">
                      No players currently online (0/{result.players?.max}). Server is in standby ready for joins!
                    </p>
                  )}
                </div>

                {/* MOTD Card */}
                {result.motd && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-zinc-100 font-mono text-xs space-y-1">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                      Server MOTD
                    </span>
                    <div className="text-sm font-semibold">{result.motd}</div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2 text-xs">
                <p className="font-bold flex items-center gap-1.5">
                  <span>⚠️</span> Probe Failure Reason:
                </p>
                <p className="font-mono text-[11px] text-rose-800 bg-white/70 p-2.5 rounded-lg border border-rose-300/60">
                  {result.error || 'Connection timed out'}
                </p>
                <p className="text-[11px] text-rose-700">
                  Make sure your phone node is running <strong>agent.py</strong> and your Minecraft Paper server is started.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
