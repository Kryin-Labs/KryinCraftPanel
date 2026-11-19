'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';

import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  ChevronDown,
  ChevronUp,
  Skull,
  User,
  Shield,
  Hammer,
  Swords,
  Sparkles,
  MapPin,
  Clock,
  Gauge,
  Box,
  Bed,
  Check,
  X,
  Send,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { ConfirmModal } from '@/components/ConfirmModal';
import { InventoryItem, MinecraftPlayer } from '@/types';
import { formatLastSeen, playerUuid } from '@/lib/playerRecords';
import {
  getItemIconUrl,
  getMobIconUrl,
  parseMinecraftStats,
} from '@/lib/minecraftAssets';
import { MinecraftHeart, MinecraftDrumstick } from '@/components/MinecraftIcons';

export default function PlayerDetailPage() {
  const params = useParams<{ uuid: string }>();
  const rawUuid = (params.uuid as string) || '';
  const uuid = playerUuid(rawUuid);

  const {
    activeServerId,
    permissions,
    players,
    toggleOp,
    toggleWhitelist,
    banPlayer,
    unbanPlayer,
    healPlayer,
    feedPlayer,
    starvePlayer,
    killPlayer,
    setGamemode,
    teleportPlayer,
  } = useServerStore();

  const [player, setPlayer] = useState<MinecraftPlayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retry, setRetry] = useState(0);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const activeIdentity = player ? playerUuid(player.uuid) : uuid;
  const canControl = permissions.includes('console') && players.some((entry) =>
    activeIdentity ? playerUuid(entry.uuid) === activeIdentity : entry.uuid === player?.uuid);

  useEffect(() => {
    setPlayer(null);
    setSelectedItem(null);
    setLoading(true);
    setLoadError('');
    if (!activeServerId) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    const query = new URLSearchParams({ serverId: activeServerId, player: rawUuid });
    let running = false;
    let timeout: ReturnType<typeof setTimeout>;

    async function loadPlayer() {
      clearTimeout(timeout);
      if (controller.signal.aborted || running || document.visibilityState === 'hidden') return;
      running = true;
      try {
        const response = await fetch('/api/server/players?' + query, { signal: controller.signal });
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) {
          if ([400, 401, 403, 404].includes(response.status)) setPlayer(null);
          throw new Error(data.error || 'Could not load this player.');
        }
        setPlayer(data.player);
        setLoadError('');
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : 'Could not load this player.');
      } finally {
        running = false;
        if (!controller.signal.aborted) {
          setLoading(false);
          if (document.visibilityState === 'visible') timeout = setTimeout(loadPlayer, 8_000);
        }
      }
    }

    void loadPlayer();
    document.addEventListener('visibilitychange', loadPlayer);
    return () => {
      controller.abort();
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', loadPlayer);
    };
  }, [activeServerId, rawUuid, retry]);
  const [gamemodeDropdownOpen, setGamemodeDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<{
    item: InventoryItem;
    x: number;
    y: number;
  } | null>(null);

  const [expandedAccordions, setExpandedAccordions] = useState<{
    position: boolean;
    respawn: boolean;
    death: boolean;
  }>({
    position: true,
    respawn: false,
    death: false,
  });

  const [tpModalOpen, setTpModalOpen] = useState(false);
  const [tpCoords, setTpCoords] = useState('-1908 63 1179');

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

  // Parse statistics from Minecraft JSON stats format
  const parsedStats = useMemo(() => {
    return parseMinecraftStats(player?.statistics?.rawStats || player?.statistics);
  }, [player]);

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading player inventory…</p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-16 text-center space-y-4 bg-[#111722] border border-slate-800 rounded-2xl max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-white">Player inventory unavailable</h2>
        <p className="text-xs text-slate-400">
          {loadError || 'The selected server does not have a record for this player.'}
        </p>
        <button type="button" className="mr-3 text-xs font-semibold text-blue-300 underline"
          onClick={() => setRetry((value) => value + 1)}>Retry</button>
        <Link
          href="/dashboard/players"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Players
        </Link>
      </div>
    );
  }

  // Format UUID for display in uppercase
  const displayUuid = player.uuid.toUpperCase();

  // Render Minecraft inventory slot
  const renderItemSlot = (item: InventoryItem | null) => {
    return (
      <button
        type="button"
        disabled={!item}
        aria-label={item ? item.displayName + ', ' + item.count : 'Empty inventory slot'}
        onClick={() => setSelectedItem(item)}
        onMouseEnter={(e) => {
          if (item) {
            const rect = e.currentTarget.getBoundingClientRect();
            setHoveredItem({
              item,
              x: rect.left + rect.width / 2,
              y: rect.top - 8,
            });
          }
        }}
        onMouseLeave={() => setHoveredItem(null)}
        className="relative aspect-square w-[clamp(1.45rem,7vw,2.75rem)] bg-[#273242] border-2 border-t-[#18212e] border-l-[#18212e] border-b-[#3d4c60] border-r-[#3d4c60] flex items-center justify-center select-none cursor-pointer transition-colors hover:bg-[#324054]"
      >
        {item && (
          <>
            <img
              src={item.iconUrl || getItemIconUrl(item.name || item.id)}
              alt={item.displayName}
              className="h-[72%] w-[72%] object-contain drop-shadow pointer-events-none"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                // Fallback to mcasset item texture if block failed
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('/item/')) {
                  target.src = `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/item/${item.id.replace('minecraft:', '')}.png`;
                }
              }}
            />

            {/* Stack count in authentic Minecraft text shadow */}
            {item.count > 1 && (
              <span
                className="absolute bottom-0.5 right-1 text-[11px] font-bold font-mono text-white leading-none pointer-events-none"
                style={{
                  textShadow:
                    '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 2px #000',
                }}
              >
                {item.count}
              </span>
            )}

            {/* Durability bar */}
            {item.durability !== undefined && item.maxDurability && (
              <div className="absolute bottom-0.5 left-1 right-1 h-1 bg-[#10141a] rounded-[1px] overflow-hidden pointer-events-none">
                <div
                  className={`h-full ${
                    item.durability / item.maxDurability > 0.5
                      ? 'bg-[#22c55e]'
                      : item.durability / item.maxDurability > 0.25
                      ? 'bg-[#eab308]'
                      : 'bg-[#ef4444]'
                  }`}
                  style={{
                    width: `${Math.max(5, (item.durability / item.maxDurability) * 100)}%`,
                  }}
                />
              </div>
            )}
          </>
        )}
      </button>
    );
  };

  // Hearts calculation (10 hearts total = 20 HP)
  const heartsArray = Array.from({ length: 10 }, (_, i) => {
    const heartVal = (i + 1) * 2;
    if (player.health >= heartVal) return 'full';
    if (player.health >= heartVal - 1) return 'half';
    return 'empty';
  });

  // Food drumsticks calculation (10 drumsticks = 20 Food)
  const drumsticksArray = Array.from({ length: 10 }, (_, i) => {
    const foodVal = (i + 1) * 2;
    if (player.foodLevel >= foodVal) return 'full';
    if (player.foodLevel >= foodVal - 1) return 'half';
    return 'empty';
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-slate-200">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/players"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Players
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER (Exact Match) */}
      {/* ========================================================================= */}
      <div className="bg-[#1e2632] border border-[#2d3a4d] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        {/* Left: Avatar + Name + UUID */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#2b3545] border border-[#3e4c60] overflow-hidden shrink-0 shadow-inner flex items-center justify-center">
            <img
              src={`https://mc-heads.net/avatar/${player.username}/64`}
              alt={player.username}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">{player.username}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  player.isOnline
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#313c4c] text-slate-300 border border-slate-600/50'
                }`}
              >
                {player.isOnline ? player.pingMs ? 'Online · ' + player.pingMs + ' ms' : 'Online · Ping unavailable' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{displayUuid}</span>
            </div>
          </div>
        </div>

        {/* Right: Gamemode Selector Dropdown */}
        {canControl && <div className="relative self-end sm:self-center">
          <button
            onClick={() => setGamemodeDropdownOpen(!gamemodeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#2a3444] hover:bg-[#344052] border border-[#3e4d62] text-xs font-semibold text-white rounded-lg transition-all shadow-sm"
          >
            <Box className="w-3.5 h-3.5 text-slate-300" />
            <span className="capitalize">{player.gamemode}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {gamemodeDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-[#1a232f] border border-[#374457] rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
              {(['survival', 'creative', 'adventure', 'spectator'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setGamemode(player.uuid, mode);
                    setGamemodeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-medium capitalize flex items-center justify-between hover:bg-[#2b384a] ${
                    player.gamemode === mode ? 'text-blue-400 font-bold bg-[#243040]' : 'text-slate-300'
                  }`}
                >
                  {mode}
                  {player.gamemode === mode && <Check className="w-3 h-3 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>}
      </div>

      {/* ========================================================================= */}
      {/* 2. MIDDLE TWO COLUMNS: Health & Experience + Control */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top-Left Card: Health and Experience (7 Cols) */}
        <div className="lg:col-span-7 bg-[#212c3b] border border-[#2d3a4d] rounded-xl p-4 space-y-4 shadow-md">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Health and experience
          </h2>

          {/* Centered Level & Neon Green XP Bar */}
          <div className="space-y-1">
            <div className="text-center">
              <span className="text-xs font-bold text-[#4ade80] font-mono">
                Level {player.xpLevel}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#16202c] rounded-full overflow-hidden p-0.5 border border-[#2c394c]">
              <div
                className="h-full bg-[#22c55e] rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, player.xpProgress * 100))}%` }}
              />
            </div>
          </div>

          {/* Row 1: Kill | 10 Hearts | Heal */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              hidden={!canControl}
              onClick={() =>
                setConfirmModal({
                  isOpen: true,
                  title: `Kill ${player.username}?`,
                  message: 'This will issue a kill command to the player.',
                  isDestructive: true,
                  action: () => killPlayer(player.uuid),
                })
              }
              className="px-4 py-1.5 bg-[#ea6c65] hover:bg-[#d85c55] active:scale-95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <Skull className="w-3.5 h-3.5" />
              Kill
            </button>

            {/* 10 Minecraft Hearts */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto px-1">
              {heartsArray.map((state, idx) => (
                <MinecraftHeart key={idx} state={state as any} />
              ))}
            </div>

            <button
              hidden={!canControl}
              onClick={() => healPlayer(player.uuid)}
              className="px-4 py-1.5 bg-[#26ba8c] hover:bg-[#209f77] active:scale-95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Heal
            </button>
          </div>

          {/* Row 2: Starve | 10 Food Drumsticks | Feed */}
          <div className="flex items-center justify-between gap-2">
            <button
              hidden={!canControl}
              onClick={() => starvePlayer(player.uuid)}
              className="px-3.5 py-1.5 bg-[#ea7b5b] hover:bg-[#d96a4a] active:scale-95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <Skull className="w-3.5 h-3.5" />
              Starve
            </button>

            {/* 10 Minecraft Food Drumsticks */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto px-1">
              {drumsticksArray.map((state, idx) => (
                <MinecraftDrumstick key={idx} state={state as any} />
              ))}
            </div>

            <button
              hidden={!canControl}
              onClick={() => feedPlayer(player.uuid)}
              className="px-4 py-1.5 bg-[#26ba8c] hover:bg-[#209f77] active:scale-95 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Feed
            </button>
          </div>
        </div>

        {/* Top-Right Card: Control (5 Cols) */}
        {canControl && <div className="lg:col-span-5 bg-[#212c3b] border border-[#2d3a4d] rounded-xl p-4 space-y-2.5 shadow-md flex flex-col justify-between">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
            Control
          </h2>

          {/* Row 1: Whitelisted */}
          <div className="flex items-center justify-between bg-[#2a3648] border border-[#3a475a] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <User className="w-4 h-4 text-slate-300" />
              <span>Whitelisted</span>
            </div>
            <button
              onClick={() => toggleWhitelist(player.uuid)}
              className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm text-white transition-all shadow ${
                player.isWhitelisted
                  ? 'bg-[#10b981] hover:bg-[#059669]'
                  : 'bg-[#ef4444] hover:bg-[#dc2626]'
              }`}
            >
              {player.isWhitelisted ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>

          {/* Row 2: Banned */}
          <div className="flex items-center justify-between bg-[#2a3648] border border-[#3a475a] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Hammer className="w-4 h-4 text-slate-300" />
              <span>Banned</span>
            </div>
            <button
              onClick={() =>
                player.isBanned ? unbanPlayer(player.uuid) : banPlayer(player.uuid)
              }
              className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm text-white transition-all shadow ${
                player.isBanned
                  ? 'bg-[#10b981] hover:bg-[#059669]'
                  : 'bg-[#ef4444] hover:bg-[#dc2626]'
              }`}
            >
              {player.isBanned ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>

          {/* Row 3: Operator */}
          <div className="flex items-center justify-between bg-[#2a3648] border border-[#3a475a] rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Shield className="w-4 h-4 text-slate-300" />
              <span>Operator</span>
            </div>
            <button
              onClick={() => toggleOp(player.uuid)}
              className={`w-7 h-7 rounded flex items-center justify-center font-bold text-sm text-white transition-all shadow ${
                player.isOp
                  ? 'bg-[#10b981] hover:bg-[#059669]'
                  : 'bg-[#ef4444] hover:bg-[#dc2626]'
              }`}
            >
              {player.isOp ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>
        </div>}
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ROW: Inventory (Left) + Information (Right) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Inventory Card (7 Cols) */}
        <div className="lg:col-span-7 bg-[#212c3b] border border-[#2d3a4d] rounded-xl p-4 space-y-3 shadow-md">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Inventory
          </h2>

          {player.inventoryAvailable ? (
            <>
              <p className="text-xs text-slate-300">
                {player.inventorySavedAt ? 'Saved ' + formatLastSeen(player.inventorySavedAt) : 'Last saved inventory'}
              </p>
              <div className="flex min-w-0 flex-col items-center gap-3 rounded-lg border border-slate-950 bg-[#1b232f] p-2 sm:flex-row sm:items-start sm:justify-center sm:p-4">
                <div className="flex shrink-0 flex-wrap justify-center gap-1.5 sm:flex-col">
                  {renderItemSlot(player.inventory.armor.helmet)}
                  {renderItemSlot(player.inventory.armor.chestplate)}
                  {renderItemSlot(player.inventory.armor.leggings)}
                  {renderItemSlot(player.inventory.armor.boots)}
                  {renderItemSlot(player.inventory.offhand)}
                </div>
                <div className="min-w-0 max-w-full space-y-2 overflow-x-auto">
                  <div className="grid w-max grid-cols-9 gap-0.5 sm:gap-1">
                    {player.inventory.main.map((item, idx) => <React.Fragment key={idx}>{renderItemSlot(item)}</React.Fragment>)}
                  </div>
                  <div className="grid w-max grid-cols-9 gap-0.5 border-t border-sky-500 pt-2 sm:gap-1">
                    {player.inventory.hotbar.map((item, idx) => <React.Fragment key={idx}>{renderItemSlot(item)}</React.Fragment>)}
                  </div>
                </div>
              </div>
              {selectedItem && <p role="status" className="text-xs font-semibold text-white">{selectedItem.displayName} · {selectedItem.count}</p>}
            </>
          ) : <p className="text-sm text-slate-300">Waiting for the device to sync a saved inventory for this player.</p>}
        </div>
        {/* Information Card (5 Cols) */}
        <div className="lg:col-span-5 bg-[#212c3b] border border-[#2d3a4d] rounded-xl p-4 space-y-3 shadow-md">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Information
          </h2>

          <div className="space-y-2">
            {/* Accordion 1: Current position (Expanded by default) */}
            <div className="bg-[#2a3648] border border-[#3a475a] rounded-lg overflow-hidden transition-all">
              <button
                onClick={() =>
                  setExpandedAccordions((prev) => ({ ...prev, position: !prev.position }))
                }
                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#324054] transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <MapPin className="w-4 h-4 text-slate-300" />
                  <span>Current position</span>
                </div>
                {expandedAccordions.position ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedAccordions.position && (
                <div className="px-3 pb-3 pt-1 border-t border-[#3a475a]/60 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 font-mono text-xs">
                    <p className="text-white font-bold">
                      X {player.coordinates.x.toFixed(2)}{'  '}
                      Y {player.coordinates.y.toFixed(2)}{'  '}
                      Z {player.coordinates.z.toFixed(2)}
                    </p>
                    <p className="text-slate-400 text-[11px] flex items-center gap-1 font-sans">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {player.coordinates.dimension || 'minecraft:overworld'}
                    </p>
                  </div>

                  <button
                    hidden={!canControl}
                    onClick={() => {
                      setTpCoords(
                        `${Math.round(player.coordinates.x)} ${Math.round(
                          player.coordinates.y
                        )} ${Math.round(player.coordinates.z)}`
                      );
                      setTpModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-[#374457] hover:bg-[#435268] active:scale-95 text-white text-xs font-semibold rounded-lg border border-slate-600/60 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    Teleport
                  </button>
                </div>
              )}
            </div>

            {/* Accordion 2: Respawn location */}
            <div className="bg-[#2a3648] border border-[#3a475a] rounded-lg overflow-hidden transition-all">
              <button
                onClick={() =>
                  setExpandedAccordions((prev) => ({ ...prev, respawn: !prev.respawn }))
                }
                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#324054] transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Bed className="w-4 h-4 text-slate-300" />
                  <span>Respawn location</span>
                </div>
                {expandedAccordions.respawn ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedAccordions.respawn && (
                <div className="px-3 pb-3 pt-1 border-t border-[#3a475a]/60 space-y-0.5 font-mono text-xs">
                  <p className="text-white font-bold">
                    X {(player.respawnCoordinates?.x ?? -1850).toFixed(2)}{'  '}
                    Y {(player.respawnCoordinates?.y ?? 64).toFixed(2)}{'  '}
                    Z {(player.respawnCoordinates?.z ?? 1200).toFixed(2)}
                  </p>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {player.respawnCoordinates?.dimension || 'minecraft:overworld'}
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: Last death location */}
            <div className="bg-[#2a3648] border border-[#3a475a] rounded-lg overflow-hidden transition-all">
              <button
                onClick={() =>
                  setExpandedAccordions((prev) => ({ ...prev, death: !prev.death }))
                }
                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#324054] transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Skull className="w-4 h-4 text-slate-300" />
                  <span>Last death location</span>
                </div>
                {expandedAccordions.death ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedAccordions.death && (
                <div className="px-3 pb-3 pt-1 border-t border-[#3a475a]/60 space-y-0.5 font-mono text-xs">
                  <p className="text-white font-bold">
                    X {(player.deathCoordinates?.x ?? -1920.1).toFixed(2)}{'  '}
                    Y {(player.deathCoordinates?.y ?? 45).toFixed(2)}{'  '}
                    Z {(player.deathCoordinates?.z ?? 1150.8).toFixed(2)}
                  </p>
                  <p className="text-slate-400 text-[11px] font-sans">
                    {player.deathCoordinates?.dimension || 'minecraft:overworld'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM FULL-WIDTH: Statistics (Exact Match to Minecraft JSON stats) */}
      {/* ========================================================================= */}
      <div className="bg-[#212c3b] border border-[#2d3a4d] rounded-xl p-5 space-y-6 shadow-md">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider">
          Statistics
        </h2>

        {/* Top 4 Highlight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Playtime */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Playtime</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {parsedStats.playtimeText}
              </span>
            </div>
          </div>

          {/* Card 2: Player Kills */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Swords className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Player Kills</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {parsedStats.playerKills}
              </span>
            </div>
          </div>

          {/* Card 3: Deaths */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Skull className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Deaths</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {parsedStats.deaths}
              </span>
            </div>
          </div>

          {/* Card 4: KDR */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">KDR</span>
              <span className="text-xs sm:text-sm font-bold text-white font-mono">
                {parsedStats.kdr}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Categorized Columns: Distance, Blocks Broken, Items Used, Entities Killed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-3 border-t border-slate-700/40">
          {/* Column 1: Distance travelled (in blocks) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#38bdf8]">
              Distance travelled (in blocks)
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>Total</span>
                <span className="font-mono font-bold text-white">
                  {parsedStats.distanceTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Distance Walked</span>
                <span className="font-mono text-slate-200">
                  {parsedStats.distanceWalked.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Distance Sprinted</span>
                <span className="font-mono text-slate-200">
                  {parsedStats.distanceSprinted.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Distance Swum</span>
                <span className="font-mono text-slate-200">
                  {parsedStats.distanceSwum.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Distance Fallen</span>
                <span className="font-mono text-slate-200">
                  {parsedStats.distanceFallen.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Distance by Elytra</span>
                <span className="font-mono text-slate-200">
                  {parsedStats.distanceElytra.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Blocks broken */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#38bdf8]">Blocks broken</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>Total</span>
                <span className="font-mono font-bold text-white">
                  {parsedStats.blocksBrokenTotal.toLocaleString()}
                </span>
              </div>

              {parsedStats.blocksBrokenList.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic py-1">No blocks broken yet</div>
              ) : (
                parsedStats.blocksBrokenList.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <img
                        src={getItemIconUrl(item.rawKey)}
                        alt={item.name}
                        className="w-4 h-4 object-contain shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-200 shrink-0">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Items used */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#38bdf8]">Items used</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>Total</span>
                <span className="font-mono font-bold text-white">
                  {parsedStats.itemsUsedTotal.toLocaleString()}
                </span>
              </div>

              {parsedStats.itemsUsedList.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic py-1">No items used yet</div>
              ) : (
                parsedStats.itemsUsedList.slice(0, 8).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <img
                        src={getItemIconUrl(item.rawKey)}
                        alt={item.name}
                        className="w-4 h-4 object-contain shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-200 shrink-0">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: Entities killed */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#38bdf8]">Entities killed</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-medium">
                <span>Total</span>
                <span className="font-mono font-bold text-white">
                  {parsedStats.entitiesKilledTotal.toLocaleString()}
                </span>
              </div>

              {parsedStats.entitiesKilledList.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic py-1">No entities killed yet</div>
              ) : (
                parsedStats.entitiesKilledList.slice(0, 8).map((mob, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <img
                        src={getMobIconUrl(mob.rawKey)}
                        alt={mob.name}
                        className="w-4 h-4 object-contain rounded-sm shrink-0"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <span className="truncate">{mob.name}</span>
                    </div>
                    <span className="font-mono text-slate-200 shrink-0">
                      {mob.count.toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATING MINECRAFT TOOLTIP (Purple Box Exact Styling) */}
      {/* ========================================================================= */}
      {hoveredItem && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-[#100010] border-2 border-[#5000ff] rounded px-2.5 py-1 text-white shadow-2xl space-y-0.5"
          style={{ left: hoveredItem.x, top: hoveredItem.y }}
        >
          <div className="text-xs font-bold tracking-wide">
            {hoveredItem.item.displayName}
          </div>
          {hoveredItem.item.count > 1 && (
            <div className="text-[10px] text-slate-400 font-mono">
              Stack: {hoveredItem.item.count}
            </div>
          )}
          {hoveredItem.item.durability !== undefined && hoveredItem.item.maxDurability && (
            <div className="text-[10px] text-emerald-400 font-mono">
              Durability: {hoveredItem.item.durability} / {hoveredItem.item.maxDurability}
            </div>
          )}
          {hoveredItem.item.enchantments && hoveredItem.item.enchantments.length > 0 && (
            <div className="pt-0.5 border-t border-[#3d0080]/60 space-y-0.5">
              {hoveredItem.item.enchantments.map((ench, i) => (
                <div key={i} className="text-[10px] text-[#c084fc]">
                  {ench.name} {ench.level}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Teleport Modal */}
      {canControl && tpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1b232f] border border-[#2d3a4d] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              Teleport {player.username}
            </h3>
            <p className="text-xs text-slate-400">
              Enter target coordinates (X Y Z) or destination player name:
            </p>
            <input
              type="text"
              value={tpCoords}
              onChange={(e) => setTpCoords(e.target.value)}
              placeholder="e.g. 0 70 0 or PlayerName"
              className="w-full px-3 py-2 bg-[#111722] border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-400"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setTpModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await teleportPlayer(player.uuid, tpCoords);
                  setTpModalOpen(false);
                }}
                className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow"
              >
                Teleport Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={canControl && confirmModal.isOpen}
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
