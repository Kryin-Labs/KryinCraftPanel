'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Save,
  Check,
  Zap,
  Server,
  Cpu,
  Moon,
  Shield,
  Layers,
  Globe
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

export default function ServerSettingsPage() {
  const { serverInfo, metrics } = useServerStore();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [motd, setMotd] = useState('§bKryinCraft §8[§aIndian Node 01§8]');
  const [viewDistance, setViewDistance] = useState(10);
  const [simulationDistance, setSimulationDistance] = useState(8);
  const [maxPlayers, setMaxPlayers] = useState(20);
  const [difficulty, setDifficulty] = useState('hard');
  const [pvp, setPvp] = useState(true);
  const [whitelist, setWhitelist] = useState(true);
  const [idleSleepMinutes, setIdleSleepMinutes] = useState(10);
  const [autoWake, setAutoWake] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl font-mono">
      {/* Toast Notice */}
      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Configuration saved to server.properties and applied to node.
          </span>
          <button onClick={() => setSavedSuccess(false)} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-5 rounded-xl bg-[#121019] border border-[#242131] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Server Configuration & Node Fleet
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure server.properties, Smart Hibernation sleep cycles, and Indian datacenter peering.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto font-mono"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Minecraft Server Properties Card */}
        <div className="p-5 rounded-xl bg-[#121019] border border-[#242131] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#242131]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Minecraft Properties (server.properties)
            </h2>
            <span className="text-[11px] text-zinc-400">Paper 1.21.4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* MOTD */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-zinc-300 font-semibold">Message of the Day (MOTD)</label>
              <input
                type="text"
                value={motd}
                onChange={(e) => setMotd(e.target.value)}
                className="w-full bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Max Players */}
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Max Player Capacity</label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 20)}
                className="w-full bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">World Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="peaceful">Peaceful</option>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* View Distance */}
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">View Distance (Chunks)</label>
              <input
                type="number"
                min={4}
                max={16}
                value={viewDistance}
                onChange={(e) => setViewDistance(parseInt(e.target.value) || 10)}
                className="w-full bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Simulation Distance */}
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Simulation Distance (Chunks)</label>
              <input
                type="number"
                min={3}
                max={12}
                value={simulationDistance}
                onChange={(e) => setSimulationDistance(parseInt(e.target.value) || 8)}
                className="w-full bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* PVP & Whitelist Toggles */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161420] border border-[#242131]">
              <span className="text-xs text-zinc-300 font-semibold">Player vs Player (PVP)</span>
              <input
                type="checkbox"
                checked={pvp}
                onChange={(e) => setPvp(e.target.checked)}
                className="rounded bg-[#1a1724] border-[#2f2b3e] text-emerald-500 focus:ring-0 w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161420] border border-[#242131]">
              <span className="text-xs text-zinc-300 font-semibold">Server Whitelist Enforced</span>
              <input
                type="checkbox"
                checked={whitelist}
                onChange={(e) => setWhitelist(e.target.checked)}
                className="rounded bg-[#1a1724] border-[#2f2b3e] text-emerald-500 focus:ring-0 w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Smart Hibernation & Power Cycles */}
        <div className="p-5 rounded-xl bg-[#121019] border border-[#242131] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#242131]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              Smart Hibernation & Wake Management
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-850">
              LOW-POWER IDLE
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Servers enter low-power hibernation state when all players disconnect. As soon as someone attempts to join, it wakes automatically in under 90 seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Idle Timeout Before Sleep (Minutes)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={idleSleepMinutes}
                onChange={(e) => setIdleSleepMinutes(parseInt(e.target.value) || 10)}
                className="w-full bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-[#161420] border border-[#242131]">
              <div>
                <span className="text-xs text-zinc-300 font-semibold block">Auto-Wake on Join</span>
                <span className="text-[10px] text-zinc-400">Instantly wakes node when client connects</span>
              </div>
              <input
                type="checkbox"
                checked={autoWake}
                onChange={(e) => setAutoWake(e.target.checked)}
                className="rounded bg-[#1a1724] border-[#2f2b3e] text-emerald-500 focus:ring-0 w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Indian Datacenter Node Compute Info */}
        <div className="p-5 rounded-xl bg-[#121019] border border-[#242131] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#242131]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Indian Bare-Metal Node Infrastructure
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-850">
              MUMBAI DC-1
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#161420] border border-[#242131]">
              <span className="text-[10px] text-zinc-400 uppercase block">Compute Core</span>
              <span className="text-zinc-200 font-bold mt-0.5 block">AMD EPYC 9654</span>
              <span className="text-[10px] text-zinc-400">Up to 4.4 GHz Turbo</span>
            </div>

            <div className="p-3 rounded-lg bg-[#161420] border border-[#242131]">
              <span className="text-[10px] text-zinc-400 uppercase block">Allocated RAM</span>
              <span className="text-zinc-200 font-bold mt-0.5 block">6.0 GB DDR5</span>
              <span className="text-[10px] text-emerald-400">Low-Latency G1GC</span>
            </div>

            <div className="p-3 rounded-lg bg-[#161420] border border-[#242131]">
              <span className="text-[10px] text-zinc-400 uppercase block">Network Peering</span>
              <span className="text-zinc-200 font-bold mt-0.5 block">10 Gbps Peering</span>
              <span className="text-[10px] text-zinc-400">Pan-India Peering Routes</span>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-colors font-mono"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
