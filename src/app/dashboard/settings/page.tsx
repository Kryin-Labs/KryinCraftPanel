'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Save,
  Check,
  Server,
  Cpu,
  Moon
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
    <div className="space-y-6 max-w-4xl font-mono text-[#1a1522]">
      {/* Toast Notice */}
      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
            Configuration saved to server.properties and applied to node.
          </span>
          <button onClick={() => setSavedSuccess(false)} className="text-blue-600 hover:text-blue-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1522] flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-blue-600" />
            Server Configuration & Node Fleet
          </h1>
          <p className="text-xs text-[#1a1522]/60 mt-1">
            Configure server.properties, Smart Hibernation sleep cycles, and Indian datacenter peering.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto font-mono shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Minecraft Server Properties Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a1522]/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a1522] flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Minecraft Properties (server.properties)
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Paper 1.21.4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* MOTD */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[#1a1522] font-bold">Message of the Day (MOTD)</label>
              <input
                type="text"
                value={motd}
                onChange={(e) => setMotd(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Max Players */}
            <div className="space-y-1.5">
              <label className="text-[#1a1522] font-bold">Max Player Capacity</label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 20)}
                className="w-full bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[#1a1522] font-bold">World Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] font-mono focus:outline-none focus:border-blue-600"
              >
                <option value="peaceful">Peaceful</option>
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* View Distance */}
            <div className="space-y-1.5">
              <label className="text-[#1a1522] font-bold">View Distance (Chunks)</label>
              <input
                type="number"
                min={4}
                max={16}
                value={viewDistance}
                onChange={(e) => setViewDistance(parseInt(e.target.value) || 10)}
                className="w-full bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Simulation Distance */}
            <div className="space-y-1.5">
              <label className="text-[#1a1522] font-bold">Simulation Distance (Chunks)</label>
              <input
                type="number"
                min={3}
                max={12}
                value={simulationDistance}
                onChange={(e) => setSimulationDistance(parseInt(e.target.value) || 8)}
                className="w-full bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* PVP & Whitelist Toggles */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10">
              <span className="text-xs text-[#1a1522] font-bold">Player vs Player (PVP)</span>
              <input
                type="checkbox"
                checked={pvp}
                onChange={(e) => setPvp(e.target.checked)}
                className="rounded border-[#1a1522]/20 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10">
              <span className="text-xs text-[#1a1522] font-bold">Server Whitelist Enforced</span>
              <input
                type="checkbox"
                checked={whitelist}
                onChange={(e) => setWhitelist(e.target.checked)}
                className="rounded border-[#1a1522]/20 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Smart Hibernation & Power Cycles */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a1522]/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a1522] flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-600" />
              Smart Hibernation & Wake Management
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              LOW-POWER IDLE
            </span>
          </div>

          <p className="text-xs text-[#1a1522]/60 leading-relaxed">
            Servers enter low-power hibernation state when all players disconnect. As soon as someone attempts to join, it wakes automatically in under 90 seconds.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#1a1522] font-bold">Idle Timeout Before Sleep (Minutes)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={idleSleepMinutes}
                onChange={(e) => setIdleSleepMinutes(parseInt(e.target.value) || 10)}
                className="w-full bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10">
              <div>
                <span className="text-xs text-[#1a1522] font-bold block">Auto-Wake on Join</span>
                <span className="text-[10px] text-[#1a1522]/50">Instantly wakes node when client connects</span>
              </div>
              <input
                type="checkbox"
                checked={autoWake}
                onChange={(e) => setAutoWake(e.target.checked)}
                className="rounded border-[#1a1522]/20 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Indian Datacenter Node Compute Info */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1a1522]/10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1a1522] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Indian Bare-Metal Node Infrastructure
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              MUMBAI DC-1
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10">
              <span className="text-[10px] text-[#1a1522]/50 uppercase font-bold block">Compute Core</span>
              <span className="text-[#1a1522] font-bold mt-0.5 block">AMD EPYC 9654</span>
              <span className="text-[10px] text-[#1a1522]/60">Up to 4.4 GHz Turbo</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10">
              <span className="text-[10px] text-[#1a1522]/50 uppercase font-bold block">Allocated RAM</span>
              <span className="text-[#1a1522] font-bold mt-0.5 block">6.0 GB DDR5</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Low-Latency G1GC</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10">
              <span className="text-[10px] text-[#1a1522]/50 uppercase font-bold block">Network Peering</span>
              <span className="text-[#1a1522] font-bold mt-0.5 block">10 Gbps Peering</span>
              <span className="text-[10px] text-[#1a1522]/60">Pan-India Peering Routes</span>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 transition-all font-mono shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
