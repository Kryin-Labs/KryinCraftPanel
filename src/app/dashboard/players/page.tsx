'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Ban,
  UserX,
  ExternalLink,
  Heart,
  Zap,
  Globe,
  Compass,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function PlayersListPage() {
  const { players, serverInfo, kickPlayer, banPlayer, unbanPlayer, toggleOp } = useServerStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'ops' | 'banned'>('all');

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.username.toLowerCase().includes(search.toLowerCase()) ||
      player.uuid.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'online') return player.isOnline;
    if (filter === 'ops') return player.isOp;
    if (filter === 'banned') return player.isBanned;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Server Capacity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111722] border border-slate-800/80 p-5 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Player Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time player monitoring, skin resolution, live inventory inspections, and moderation controls.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Server Capacity</span>
              <span className="text-sm font-bold text-white font-mono">
                {players.filter((p) => p.isOnline).length} / {serverInfo.maxPlayers}
              </span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {Math.round((players.filter((p) => p.isOnline).length / serverInfo.maxPlayers) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: 'All Players' },
              { id: 'online', label: 'Online' },
              { id: 'ops', label: 'Operators' },
              { id: 'banned', label: 'Banned' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                filter === t.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username or UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 pl-9 pr-3 py-2 bg-[#111722] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-500 bg-[#111722] border border-slate-800/80 rounded-2xl">
            No players found matching your criteria.
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.uuid}
              className={`p-4 rounded-2xl bg-[#111722] border transition-all space-y-4 ${
                player.isBanned
                  ? 'border-rose-900/40 bg-rose-950/10'
                  : player.isOnline
                  ? 'border-slate-800 hover:border-blue-500/50'
                  : 'border-slate-800/60 opacity-80'
              }`}
            >
              {/* Player Top Card */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700/80 shrink-0">
                  <Image
                    src={`https://crafatar.com/avatars/${player.uuid}?size=64&overlay=true`}
                    alt={player.username}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if avatar fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {player.isOnline && (
                    <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#111722] animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-sm truncate">{player.username}</h3>
                    {player.isOp && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        title="Server Operator"
                      >
                        OP
                      </span>
                    )}
                    {player.isBanned && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        BANNED
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 truncate" title={player.uuid}>
                    {player.uuid}
                  </p>
                </div>
              </div>

              {/* Status and Health Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                    Health
                  </span>
                  <span className="font-mono font-bold text-slate-200">
                    {player.health}/{player.maxHealth}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                    XP Level
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    Lv. {player.xpLevel}
                  </span>
                </div>
              </div>

              {/* Position & Dimension info */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between py-1 border-t border-slate-800/50">
                <span className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-blue-400" />
                  {player.coordinates.dimension.replace('minecraft:', '')}
                </span>
                <span className="font-mono text-slate-400">
                  {Math.round(player.coordinates.x)}, {Math.round(player.coordinates.y)}, {Math.round(player.coordinates.z)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={`/dashboard/players/${player.uuid}`}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 text-center transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Inspect</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                {player.isOnline && (
                  <button
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: `Kick ${player.username}?`,
                        message: `Are you sure you want to kick ${player.username} from the server?`,
                        action: () => kickPlayer(player.uuid),
                      })
                    }
                    className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 rounded-xl transition-colors"
                    title="Kick player"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                )}

                {player.isBanned ? (
                  <button
                    onClick={() => unbanPlayer(player.uuid)}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-colors"
                    title="Pardon / Unban"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        title: `Ban ${player.username}?`,
                        message: `Are you sure you want to ban ${player.username} from the server? They will not be able to reconnect.`,
                        action: () => banPlayer(player.uuid),
                      })
                    }
                    className="p-2 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700/80 rounded-xl transition-colors"
                    title="Ban player"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={async () => {
          await confirmModal.action();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
