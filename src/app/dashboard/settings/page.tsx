'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Smartphone,
  Sliders,
  Bell,
  User,
  Key,
  Save,
  Check,
  Terminal,
  Cpu,
  Layers,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

export default function SettingsPage() {
  const { serverInfo, metrics } = useServerStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [motd, setMotd] = useState('§bKryin Paper Server §8[§aROG 5s Phone§8]');
  const [viewDistance, setViewDistance] = useState(10);
  const [simulationDistance, setSimulationDistance] = useState(8);
  const [maxPlayers, setMaxPlayers] = useState(20);

  // Monitoring intervals
  const [heartbeatSec, setHeartbeatSec] = useState(30);
  const [metricsSec, setMetricsSec] = useState(10);
  const [commandPollSec, setCommandPollSec] = useState(3);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          Server & Agent Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tune Minecraft server parameters, adjust polling intervals for ROG Phone 5s thermal efficiency, and manage credentials.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Minecraft Paper Properties */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              Minecraft Server Configuration (server.properties)
            </h2>
            <span className="text-xs font-mono text-slate-400">Paper 26.3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 md:col-span-2">
              <label className="font-semibold text-slate-300">Message of the Day (MOTD)</label>
              <input
                type="text"
                value={motd}
                onChange={(e) => setMotd(e.target.value)}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Max Players</label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
              <span className="text-[10px] text-slate-500 block">Recommended 10-25 for phone stability</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">View Distance (Chunks)</label>
              <input
                type="number"
                min={4}
                max={16}
                value={viewDistance}
                onChange={(e) => setViewDistance(Number(e.target.value))}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
              <span className="text-[10px] text-slate-500 block">Controls player chunk loading render distance</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Simulation Distance (Chunks)</label>
              <input
                type="number"
                min={3}
                max={12}
                value={simulationDistance}
                onChange={(e) => setSimulationDistance(Number(e.target.value))}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
              />
              <span className="text-[10px] text-slate-500 block">Snapdragon 888 handles 6-8 easily at 20 TPS</span>
            </div>
          </div>
        </div>

        {/* Termux Agent Polling & Thermal Governance */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Termux Agent Polling & Battery Governance
            </h2>
            <span className="text-xs font-mono text-emerald-400">Outbound HTTPS</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            The phone agent never runs an inbound HTTP server or listens on public ports. It uses minimal outbound HTTPS calls to Supabase. You can tune intervals to reduce battery & bandwidth consumption.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Heartbeat Interval</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={heartbeatSec}
                  onChange={(e) => setHeartbeatSec(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
                />
                <span className="text-slate-400 shrink-0">sec</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Default: 30s</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Metrics Interval</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={metricsSec}
                  onChange={(e) => setMetricsSec(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
                />
                <span className="text-slate-400 shrink-0">sec</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Default: 10s</span>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Command Poll Interval</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={commandPollSec}
                  onChange={(e) => setCommandPollSec(Number(e.target.value))}
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500 text-xs"
                />
                <span className="text-slate-400 shrink-0">sec</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Default: 3s</span>
            </div>
          </div>
        </div>

        {/* Security & Token Info */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              Agent Authentication Secret
            </h2>
            <span className="text-xs font-mono text-purple-400">Hashed in Database</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              The Termux agent authenticates its outbound requests using an encrypted bearer token stored in <code className="text-blue-300 font-mono text-[11px]">~/minecraft/agent/config.json</code>. The web frontend never displays the raw secret.
            </p>

            <div className="p-3 bg-[#0a0d14] rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
              <span>Token Hash: 8f4e2...a9b3 (Active)</span>
              <button
                type="button"
                onClick={() => alert('Agent token rotation prepared for Phase 3 Supabase deployment.')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
              >
                Rotate Token
              </button>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" /> Settings updated successfully
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
