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
  Radio,
  Check
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

export default function PlayersPage() {
  const { permissions, players } = useServerStore();
  if (permissions.includes('console')) return <PlayerControls />;
  return (
    <section className="space-y-3">
      <h1 className="text-xl font-bold">Players</h1>
      <p className="text-xs text-slate-600">Ping is measured by the game server over each player’s active connection.</p>
      {!players.length && <p className="text-sm text-slate-600">No player records yet.</p>}
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {players.map((player) => (
          <li key={player.uuid} className="flex justify-between gap-2 px-4 py-3 text-sm">
            <span>{player.username}</span>
            <span className="text-slate-600">{player.isOnline ? player.pingMs ? 'Online · ' + player.pingMs + ' ms' : 'Online · Ping unavailable' : 'Offline'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PlayerControls() {
  const {
    players,
    serverInfo,
    kickPlayer,
    banPlayer,
    unbanPlayer,
    toggleOp,
    toggleWhitelist,
    addWhitelistPlayer,
    setGamemode
  } = useServerStore();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'ops' | 'whitelist' | 'banned'>('all');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const onlinePlayers = players.filter((p) => p.isOnline);
  const opPlayers = players.filter((p) => p.isOp);
  const wlPlayers = players.filter((p) => p.isWhitelisted);
  const bannedPlayers = players.filter((p) => p.isBanned);

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.username.toLowerCase().includes(search.toLowerCase()) ||
      player.uuid.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'online') return player.isOnline;
    if (activeTab === 'ops') return player.isOp;
    if (activeTab === 'whitelist') return player.isWhitelisted;
    if (activeTab === 'banned') return player.isBanned;
    return true;
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlayerName.trim();
    if (!name) return;
    await addWhitelistPlayer(name);
    showNotice(`Added player "${name}" to whitelist on server.`);
    setNewPlayerName('');
  };

  return (
    <div className="space-y-6 font-mono text-[#1a1522]">
      {/* Toast Notification */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-blue-600 hover:text-blue-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1522] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Player Fleet & Access Control
          </h1>
          <p className="text-xs text-[#1a1522]/60 mt-1">
            Real-time player monitoring, permission management, live coordinates, and kick/ban controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-[#1a1522]/50 block uppercase font-bold">Online Slots</span>
              <span className="text-sm font-bold text-[#1a1522] font-mono">
                {onlinePlayers.length} / {serverInfo.maxPlayers}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${serverInfo.status === 'online' ? 'bg-emerald-50 border border-emerald-200 text-emerald-600' : 'bg-slate-100 border border-slate-200 text-slate-500'}`}>
              <Radio className={`w-4 h-4 ${serverInfo.status === 'online' ? 'animate-pulse' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center rounded-xl bg-white border border-[#1a1522]/10 p-1 text-xs shadow-xs flex-wrap">
          {[
            { id: 'all', label: `All (${players.length})` },
            { id: 'online', label: `Online (${onlinePlayers.length})` },
            { id: 'ops', label: `Ops (${opPlayers.length})` },
            { id: 'whitelist', label: `Whitelist (${wlPlayers.length})` },
            { id: 'banned', label: `Banned (${bannedPlayers.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-[#1a1522]/60 hover:text-[#1a1522]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Add Whitelist Form */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1a1522]/40" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 bg-white border border-[#1a1522]/15 rounded-xl text-xs text-[#1a1522] placeholder:text-[#1a1522]/40 focus:outline-none focus:border-blue-600 w-44 font-mono shadow-2xs"
            />
          </div>

          <form onSubmit={handleAddWhitelist} className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder="Add username..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="px-3 py-2 bg-white border border-[#1a1522]/15 rounded-xl text-xs text-[#1a1522] placeholder:text-[#1a1522]/40 focus:outline-none focus:border-blue-600 w-36 font-mono shadow-2xs"
            />
            <button
              type="submit"
              disabled={!newPlayerName.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold transition-all shadow-xs"
              title="Add to Whitelist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Players List Grid / Table */}
      <div className="rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs overflow-hidden">
        {filteredPlayers.length === 0 ? (
          <div className="p-12 text-center text-[#1a1522]/50 text-xs">
            No players found matching your query or filter.
          </div>
        ) : (
          <div className="divide-y divide-[#1a1522]/8">
            {filteredPlayers.map((player) => {
              return (
                <div
                  key={player.uuid}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#f8f9fd] transition-colors"
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1a1522] truncate font-mono">
                          {player.username}
                        </span>

                        {player.isOp && (
                          <span className="text-[9px] px-2 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            OP
                          </span>
                        )}

                        {player.isWhitelisted && (
                          <span className="text-[9px] px-2 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                            WHITELIST
                          </span>
                        )}

                        {player.isBanned && (
                          <span className="text-[9px] px-2 py-0.2 rounded bg-red-50 text-red-700 border border-red-200 font-bold" title={(player as any).banReason || 'Banned'}>
                            BANNED
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#1a1522]/50 font-mono">
                        <span className={player.isOnline ? 'text-emerald-700 font-bold' : 'text-[#1a1522]/40'}>
                          {player.isOnline ? `● Online · ${player.pingMs ? player.pingMs + ' ms' : 'Ping unavailable'}` : '○ Offline'}
                        </span>
                        <span>•</span>
                        <span>UUID: {player.uuid.slice(0, 8)}...</span>
                        {player.coordinates && (
                          <>
                            <span>•</span>
                            <span>
                              XYZ: {Math.round(player.coordinates.x)}, {Math.round(player.coordinates.y)}, {Math.round(player.coordinates.z)}
                            </span>
                          </>
                        )}
                        {player.lastSeen && (
                          <>
                            <span>•</span>
                            <span>Seen: {player.lastSeen}</span>
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
                      className="px-3 py-1.5 rounded-lg bg-[#f8f9fd] border border-[#1a1522]/15 text-xs text-[#1a1522] font-semibold focus:outline-none focus:border-blue-600 font-mono"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        player.isOp
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-[#1a1522]/70 border-[#1a1522]/15 hover:bg-slate-50'
                      }`}
                      title={player.isOp ? 'Revoke OP permissions' : 'Grant OP permissions'}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>{player.isOp ? 'De-OP' : 'OP'}</span>
                    </button>

                    {/* Whitelist Toggle */}
                    <button
                      onClick={() => {
                        toggleWhitelist(player.uuid);
                        showNotice(`Toggled whitelist for ${player.username}.`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        player.isWhitelisted
                          ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                          : 'bg-white text-[#1a1522]/70 border-[#1a1522]/15 hover:bg-slate-50'
                      }`}
                      title={player.isWhitelisted ? 'Remove from whitelist' : 'Add to whitelist'}
                    >
                      <span>{player.isWhitelisted ? 'Un-Whitelist' : 'Whitelist'}</span>
                    </button>

                    {/* Kick Button (if online) */}
                    {player.isOnline && (
                      <button
                        onClick={() => {
                          kickPlayer(player.uuid, 'Disconnected by administrator');
                          showNotice(`Kicked ${player.username} from the server.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                        title="Kick player immediately"
                      >
                        <UserX className="w-3.5 h-3.5" />
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
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Unban</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          banPlayer(player.uuid, 'Banned by operator');
                          showNotice(`Banned ${player.username} from server.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
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
