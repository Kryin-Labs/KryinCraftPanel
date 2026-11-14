'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Shield,
  Ban,
  UserX,
  UserCheck,
  Plus,
  Compass,
  Activity,
  Heart,
  Zap,
  Globe,
  Check,
  Radio
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { MinecraftPlayer } from '@/types';

export default function PlayersManagementPage() {
  const {
    players,
    serverInfo,
    kickPlayer,
    banPlayer,
    unbanPlayer,
    toggleOp,
    toggleWhitelist,
    setGamemode,
    teleportPlayer
  } = useServerStore();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'ops' | 'banned'>('all');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const onlinePlayers = players.filter((p) => p.isOnline);
  const opPlayers = players.filter((p) => p.isOp);
  const bannedPlayers = players.filter((p) => p.isBanned);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.username.toLowerCase().includes(search.toLowerCase()) ||
      player.uuid.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'online') return player.isOnline;
    if (activeTab === 'ops') return player.isOp;
    if (activeTab === 'banned') return player.isBanned;
    return true;
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAddWhitelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    showNotice(`Added player "${newPlayerName.trim()}" to whitelist.`);
    setNewPlayerName('');
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Toast Notification */}
      {notice && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-5 rounded-xl bg-[#121019] border border-[#242131] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Player Fleet & Permissions
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time player monitoring, permission management, live coordinates, and kick/ban controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-[#161420] border border-[#262333] flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block uppercase">Online Slots</span>
              <span className="text-sm font-bold text-zinc-100 font-mono">
                {onlinePlayers.length} / {serverInfo.maxPlayers}
              </span>
            </div>
            <div className="w-8 h-8 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center rounded-lg bg-[#121019] border border-[#242131] p-1 text-xs">
          {[
            { id: 'all', label: `All (${players.length})` },
            { id: 'online', label: `Online (${onlinePlayers.length})` },
            { id: 'ops', label: `Operators (${opPlayers.length})` },
            { id: 'banned', label: `Banned (${bannedPlayers.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#221f2f] text-emerald-400 font-bold border border-[#38334c]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Add Whitelist Form */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#121019] border border-[#242131] rounded-lg text-xs text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 w-44 font-mono"
            />
          </div>

          <form onSubmit={handleAddWhitelist} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Add username..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="px-2.5 py-1.5 bg-[#121019] border border-[#242131] rounded-lg text-xs text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 w-36 font-mono"
            />
            <button
              type="submit"
              disabled={!newPlayerName.trim()}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-zinc-950 font-bold transition-colors"
              title="Add to Whitelist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Players List Grid / Table */}
      <div className="rounded-xl bg-[#121019] border border-[#242131] overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            No players found matching your query or filter.
          </div>
        ) : (
          <div className="divide-y divide-[#201d2d]">
            {filteredPlayers.map((player) => {
              return (
                <div
                  key={player.uuid}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#161421] transition-colors"
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#201d2d] border border-[#2d293d] flex items-center justify-center font-bold text-sm text-zinc-100 flex-shrink-0">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-zinc-100 truncate font-mono">
                          {player.username}
                        </span>

                        {player.isOp && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            OP
                          </span>
                        )}

                        {player.isWhitelisted && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            WHITELIST
                          </span>
                        )}

                        {player.isBanned && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                            BANNED
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-zinc-400 font-mono">
                        <span className={player.isOnline ? 'text-emerald-400' : 'text-zinc-400'}>
                          {player.isOnline ? `● Online (${player.pingMs || 18}ms)` : '○ Offline'}
                        </span>
                        <span>•</span>
                        <span>UUID: {player.uuid.slice(0, 8)}...</span>
                        {player.coordinates && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-400">
                              XYZ: {Math.round(player.coordinates.x)}, {Math.round(player.coordinates.y)}, {Math.round(player.coordinates.z)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Gamemode & Controls */}
                  <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                    {/* Gamemode Selector */}
                    <select
                      value={player.gamemode}
                      onChange={(e) => {
                        setGamemode(player.uuid, e.target.value as any);
                        showNotice(`Updated ${player.username}'s gamemode to ${e.target.value}.`);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#1c1926] border border-[#2e2a3f] text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 font-mono"
                    >
                      <option value="survival">Survival</option>
                      <option value="creative">Creative</option>
                      <option value="adventure">Adventure</option>
                      <option value="spectator">Spectator</option>
                    </select>

                    {/* OP Toggle */}
                    <button
                      onClick={() => {
                        toggleOp(player.uuid);
                        showNotice(`Toggled OP status for ${player.username}.`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                        player.isOp
                          ? 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                          : 'bg-[#1c1926] text-zinc-300 border-[#2e2a3f] hover:bg-[#252233]'
                      }`}
                      title={player.isOp ? 'Revoke OP permissions' : 'Grant OP permissions'}
                    >
                      <Shield className="w-3 h-3" />
                      <span>{player.isOp ? 'De-OP' : 'OP'}</span>
                    </button>

                    {/* Kick Button (if online) */}
                    {player.isOnline && (
                      <button
                        onClick={() => {
                          kickPlayer(player.uuid, 'Disconnected by administrator');
                          showNotice(`Kicked ${player.username} from the server.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#1c1926] hover:bg-red-950/40 text-zinc-300 hover:text-red-300 border border-[#2e2a3f] hover:border-red-800 text-xs transition-colors flex items-center gap-1.5"
                        title="Kick player immediately"
                      >
                        <UserX className="w-3 h-3" />
                        <span>Kick</span>
                      </button>
                    )}

                    {/* Ban / Unban Button */}
                    {player.isBanned ? (
                      <button
                        onClick={() => {
                          unbanPlayer(player.uuid);
                          showNotice(`Unbanned ${player.username}.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Unban</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          banPlayer(player.uuid, 'Banned by operator');
                          showNotice(`Banned ${player.username} from server.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-800 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Ban</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
