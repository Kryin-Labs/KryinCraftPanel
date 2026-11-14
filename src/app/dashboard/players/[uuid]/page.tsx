'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Heart,
  Zap,
  Shield,
  ShieldAlert,
  Ban,
  UserX,
  Compass,
  Clock,
  Sparkles,
  RotateCcw,
  Skull,
  Utensils,
  MapPin,
  Flame,
  Award,
  Swords,
  Box,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { ConfirmModal } from '@/components/ConfirmModal';
import { InventoryItem } from '@/types';

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uuid = params.uuid as string;

  const {
    players,
    kickPlayer,
    banPlayer,
    unbanPlayer,
    toggleOp,
    toggleWhitelist,
    healPlayer,
    feedPlayer,
    killPlayer,
    setGamemode,
  } = useServerStore();

  const player = players.find((p) => p.uuid === uuid);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);

  if (!player) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Player Not Found</h2>
        <p className="text-xs text-slate-400">UUID {uuid} has not joined or is not registered.</p>
        <Link
          href="/dashboard/players"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Players
        </Link>
      </div>
    );
  }

  // Render an inventory slot with tooltip / hover info
  const renderSlot = (item: InventoryItem | null, label?: string) => {
    return (
      <div
        onClick={() => item && setActiveItem(item)}
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
          item
            ? 'bg-[#182130] border-slate-700 hover:border-blue-400 hover:bg-slate-700/60 shadow-sm'
            : 'bg-[#0f1520]/80 border-slate-800/80'
        }`}
        title={item ? `${item.displayName} (x${item.count})` : label || 'Empty Slot'}
      >
        {label && !item && (
          <span className="text-[9px] text-slate-600 font-mono select-none uppercase">{label}</span>
        )}

        {item && (
          <>
            {/* Simple Minecraft item representation */}
            <div className="text-[10px] font-bold text-center px-1 text-slate-200 truncate select-none">
              {item.displayName.substring(0, 3)}
            </div>

            {/* Stack count */}
            {item.count > 1 && (
              <span className="absolute bottom-0.5 right-1 text-[10px] font-bold font-mono text-white bg-slate-900/90 px-1 rounded shadow">
                {item.count}
              </span>
            )}

            {/* Durability bar if applicable */}
            {item.durability !== undefined && item.maxDurability && (
              <div className="absolute bottom-0 left-1 right-1 h-1 bg-slate-900 rounded overflow-hidden">
                <div
                  className="h-full bg-emerald-400"
                  style={{ width: `${(item.durability / item.maxDurability) * 100}%` }}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/players"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Player List
        </Link>
        <div className="flex items-center gap-2">
          {player.isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online ({player.pingMs}ms)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
              Offline
            </span>
          )}
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="p-6 rounded-2xl bg-[#111722] border border-slate-800/80 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          {/* 3D Skin / Head */}
          <div className="relative w-20 h-20 rounded-2xl bg-slate-800 overflow-hidden border-2 border-slate-700 shadow-xl shrink-0">
            <Image
              src={`https://crafatar.com/avatars/${player.uuid}?size=128&overlay=true`}
              alt={player.username}
              width={80}
              height={80}
              unoptimized
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-wide">{player.username}</h1>
              {player.isOp && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SERVER OP
                </span>
              )}
              {player.isBanned && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  BANNED
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                {player.gamemode}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400">{player.uuid}</p>
            <p className="text-xs text-slate-500">
              IP: {player.ipAddress || '192.168.0.x'} • Last seen: {player.lastSeen}
            </p>
          </div>
        </div>

        {/* Quick Moderation Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => toggleOp(player.uuid)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              player.isOp
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            {player.isOp ? 'De-OP' : 'Grant OP'}
          </button>

          <button
            onClick={() => toggleWhitelist(player.uuid)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 hover:text-white transition-all"
          >
            {player.isWhitelisted ? 'Unwhitelist' : 'Whitelist'}
          </button>

          {player.isOnline && (
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  title: `Kick ${player.username}?`,
                  message: 'This will forcefully disconnect the player immediately.',
                  isDestructive: true,
                  action: () => kickPlayer(player.uuid),
                })
              }
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
            >
              Kick
            </button>
          )}

          {player.isBanned ? (
            <button
              onClick={() => unbanPlayer(player.uuid)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
            >
              Pardon / Unban
            </button>
          ) : (
            <button
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  title: `Ban ${player.username}?`,
                  message: 'Player will be blocked from joining the Paper server.',
                  isDestructive: true,
                  action: () => banPlayer(player.uuid),
                })
              }
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all"
            >
              Ban
            </button>
          )}
        </div>
      </div>

      {/* Vital Stats (Health, Food, XP, Position) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
              <Heart className="w-4 h-4 fill-rose-500" />
              Health Points
            </span>
            <span className="font-mono text-white font-bold">{player.health} / {player.maxHealth}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all"
              style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
            />
          </div>
        </div>

        {/* Hunger */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Utensils className="w-4 h-4" />
              Food Level
            </span>
            <span className="font-mono text-white font-bold">{player.foodLevel} / 20</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${(player.foodLevel / 20) * 100}%` }}
            />
          </div>
        </div>

        {/* XP Level */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Zap className="w-4 h-4 fill-emerald-400" />
              Level {player.xpLevel}
            </span>
            <span className="font-mono text-emerald-400 font-bold">{Math.round(player.xpProgress * 100)}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${player.xpProgress * 100}%` }}
            />
          </div>
        </div>

        {/* Coordinates */}
        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Compass className="w-4 h-4" />
              Coordinates
            </span>
            <span className="text-[11px] capitalize text-slate-300">
              {player.coordinates.dimension.replace('minecraft:', '')}
            </span>
          </div>
          <p className="font-mono text-xs text-white font-bold pt-1">
            X: {player.coordinates.x.toFixed(1)} Y: {player.coordinates.y.toFixed(1)} Z: {player.coordinates.z.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Live Actions Toolbar (Heal, Feed, Kill, Gamemode) */}
      <div className="p-4 rounded-2xl bg-[#111722] border border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Interactive Player Controls:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => healPlayer(player.uuid)}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5" /> Heal
          </button>

          <button
            onClick={() => feedPlayer(player.uuid)}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Utensils className="w-3.5 h-3.5" /> Feed
          </button>

          <button
            onClick={() =>
              setConfirmModal({
                isOpen: true,
                title: `Kill ${player.username}?`,
                message: 'This will issue a kill command to the player.',
                isDestructive: true,
                action: () => killPlayer(player.uuid),
              })
            }
            className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Skull className="w-3.5 h-3.5" /> Kill
          </button>

          {/* Gamemode Selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {(['survival', 'creative', 'adventure', 'spectator'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setGamemode(player.uuid, mode)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                  player.gamemode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory & Equipment Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Equipment (Armor & Offhand) */}
        <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Equipment & Armor
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
              {renderSlot(player.inventory.armor.helmet, 'HELM')}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Helmet</span>
                <span className="text-xs font-semibold text-white">
                  {player.inventory.armor.helmet?.displayName || 'None'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
              {renderSlot(player.inventory.armor.chestplate, 'CHEST')}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Chestplate</span>
                <span className="text-xs font-semibold text-white">
                  {player.inventory.armor.chestplate?.displayName || 'None'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
              {renderSlot(player.inventory.armor.leggings, 'LEGS')}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Leggings</span>
                <span className="text-xs font-semibold text-white">
                  {player.inventory.armor.leggings?.displayName || 'None'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
              {renderSlot(player.inventory.armor.boots, 'BOOTS')}
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Boots</span>
                <span className="text-xs font-semibold text-white">
                  {player.inventory.armor.boots?.displayName || 'None'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl flex items-center gap-3">
            {renderSlot(player.inventory.offhand, 'OFF')}
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Offhand Item</span>
              <span className="text-xs font-semibold text-white">
                {player.inventory.offhand?.displayName || 'Empty'}
              </span>
            </div>
          </div>

          {/* Active Item Inspector Details */}
          {activeItem && (
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/50 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-300">{activeItem.displayName}</span>
                <span className="text-[10px] text-slate-400 font-mono">Count: {activeItem.count}</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">{activeItem.name}</p>
              {activeItem.enchantments && (
                <div className="space-y-0.5 pt-1 border-t border-blue-900/40">
                  {activeItem.enchantments.map((ench, i) => (
                    <span key={i} className="text-[10px] text-purple-300 block">
                      ✦ {ench.name} {ench.level}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Main Inventory + Hotbar */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-400" />
              Inventory & Hotbar Grid
            </h3>
            <span className="text-[11px] text-slate-400">Click item for enchantment details</span>
          </div>

          {/* 3x9 Main Inventory Grid */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Main Inventory (27 Slots)
            </span>
            <div className="grid grid-cols-9 gap-1.5 sm:gap-2 p-2 bg-[#0c1018] rounded-xl border border-slate-800/80">
              {player.inventory.main.map((item, idx) => (
                <React.Fragment key={idx}>{renderSlot(item)}</React.Fragment>
              ))}
            </div>
          </div>

          {/* 1x9 Hotbar Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">
              Hotbar (9 Slots)
            </span>
            <div className="grid grid-cols-9 gap-1.5 sm:gap-2 p-2 bg-blue-950/20 rounded-xl border border-blue-900/40">
              {player.inventory.hotbar.map((item, idx) => (
                <React.Fragment key={idx}>{renderSlot(item, `${idx + 1}`)}</React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lifetime Player Statistics */}
      <div className="p-5 rounded-2xl bg-[#111722] border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          Lifetime Player Statistics
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Total Playtime</span>
            <span className="text-lg font-bold text-white font-mono">
              {player.statistics.playtimeHours} hrs
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Player Kills / Deaths</span>
            <span className="text-lg font-bold text-white font-mono">
              {player.statistics.playerKills} / {player.statistics.deaths}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">
              KDR: {player.statistics.kdr.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Blocks Broken</span>
            <span className="text-lg font-bold text-white font-mono">
              {player.statistics.blocksBroken.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
            <span className="text-[10px] text-slate-400 block uppercase">Distance Travelled</span>
            <span className="text-lg font-bold text-white font-mono">
              {player.statistics.distanceTraveledKm} km
            </span>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        onConfirm={async () => {
          await confirmModal.action();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
