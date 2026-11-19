import { parseMinecraftStats } from '@/lib/minecraftAssets';
import type { MinecraftPlayer, PlayerInventory } from '@/types';

type Coordinates = MinecraftPlayer['coordinates'];
type StoredInventory = Partial<PlayerInventory> & { savedAt?: string };

export interface PlayerRecord {
  uuid: string;
  username: string;
  is_online?: boolean | null;
  ping_ms?: number | null;
  health?: number | null;
  max_health?: number | null;
  food_level?: number | null;
  saturation?: number | null;
  xp_level?: number | null;
  xp_progress?: number | null;
  gamemode?: MinecraftPlayer['gamemode'] | null;
  is_op?: boolean | null;
  is_whitelisted?: boolean | null;
  is_banned?: boolean | null;
  coordinates?: Coordinates & {
    respawn?: MinecraftPlayer['respawnCoordinates'];
    death?: MinecraftPlayer['deathCoordinates'];
  };
  inventory?: StoredInventory | null;
  inventory_saved_at?: string | null;
  statistics?: Record<string, unknown> | null;
  last_seen?: string | null;
  updated_at?: string | null;
}

export function playerUuid(value: string): string | null {
  const clean = value.trim().toLowerCase();
  if (!/^(?:[a-f\d]{32}|[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12})$/.test(clean)) return null;
  return clean.replace(/-/g, '').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5');
}

function time(value?: string | null) {
  const stamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(stamp) ? stamp : 0;
}

function lastPlayed(row: PlayerRecord) {
  // Older agents stored usercache.json's "expiresOn", which is not a visit timestamp.
  const seen = row.last_seen && !/ [+-]\d{4}$/.test(row.last_seen) ? time(row.last_seen) : 0;
  return Math.max(seen, time(row.inventory?.savedAt ?? row.inventory_saved_at));
}

function online(row: PlayerRecord, now: number) {
  return Boolean(row.is_online && now - time(row.updated_at) < 45_000);
}

function rank(left: PlayerRecord, right: PlayerRecord, now: number) {
  return Number(online(right, now)) - Number(online(left, now))
    || lastPlayed(right) - lastPlayed(left)
    || time(right.updated_at) - time(left.updated_at)
    || left.uuid.localeCompare(right.uuid);
}

export function visiblePlayers(rows: PlayerRecord[], now = Date.now()) {
  const seenUuids = new Set<string>();
  const seenNames = new Set<string>();
  return [...rows].sort((left, right) => rank(left, right, now)).filter((row) => {
    const uuid = playerUuid(row.uuid) ?? row.uuid.toLowerCase();
    const name = row.username.trim().toLowerCase();
    if (seenUuids.has(uuid) || seenNames.has(name)) return false;
    seenUuids.add(uuid);
    seenNames.add(name);
    return true;
  });
}

export function playerDetails(rows: PlayerRecord[], now = Date.now()) {
  const best = [...rows].sort((left, right) => rank(left, right, now))[0];
  if (!best) return null;
  const identity = playerUuid(best.uuid) ?? best.uuid.toLowerCase();
  const samePlayer = rows.filter((row) => (playerUuid(row.uuid) ?? row.uuid.toLowerCase()) === identity);
  // UUID formatting variations can share a snapshot. Different UUIDs keep separate inventories.
  const saved = samePlayer.filter((row) => Array.isArray(row.inventory?.hotbar) && Array.isArray(row.inventory?.main))
    .sort((left, right) => time(right.inventory?.savedAt ?? right.updated_at) - time(left.inventory?.savedAt ?? left.updated_at))[0];
  return { ...best, inventory: saved?.inventory };
}

export function toMinecraftPlayer(row: PlayerRecord, now = Date.now()): MinecraftPlayer {
  const inventory = row.inventory;
  const parsed = parseMinecraftStats(row.statistics);
  const isOnline = online(row, now);
  const played = lastPlayed(row);
  const position = row.coordinates;
  return {
    uuid: row.uuid,
    username: row.username,
    isOnline,
    pingMs: isOnline && (row.ping_ms ?? 0) > 0 ? row.ping_ms ?? undefined : undefined,
    health: Number(row.health ?? 20),
    maxHealth: Number(row.max_health ?? 20),
    foodLevel: Number(row.food_level ?? 20),
    saturation: Number(row.saturation ?? 5),
    xpLevel: Number(row.xp_level ?? 0),
    xpProgress: Number(row.xp_progress ?? 0),
    gamemode: row.gamemode ?? 'survival',
    isOp: Boolean(row.is_op),
    isWhitelisted: Boolean(row.is_whitelisted),
    isBanned: Boolean(row.is_banned),
    coordinates: {
      x: Number(position?.x ?? 0), y: Number(position?.y ?? 64), z: Number(position?.z ?? 0),
      world: position?.world ?? 'world',
      dimension: position?.dimension ?? 'minecraft:overworld',
    },
    respawnCoordinates: position?.respawn,
    deathCoordinates: position?.death,
    inventory: {
      armor: inventory?.armor ?? { helmet: null, chestplate: null, leggings: null, boots: null },
      offhand: inventory?.offhand ?? null,
      main: Array.from({ length: 27 }, (_, i) => inventory?.main?.[i] ?? null),
      hotbar: Array.from({ length: 9 }, (_, i) => inventory?.hotbar?.[i] ?? null),
    },
    inventoryAvailable: Boolean(Array.isArray(inventory?.hotbar) && Array.isArray(inventory?.main)),
    inventorySavedAt: inventory?.savedAt,
    statistics: {
      playtimeHours: Math.round((parsed.playtimeTicks / (20 * 3600)) * 10) / 10,
      playerKills: parsed.playerKills, deaths: parsed.deaths, kdr: Number(parsed.kdr) || 0,
      distanceTraveledKm: Math.round((parsed.distanceTotal / 1000) * 10) / 10,
      blocksBroken: parsed.blocksBrokenTotal, itemsUsed: parsed.itemsUsedTotal,
      entitiesKilled: parsed.entitiesKilledTotal, rawStats: row.statistics ?? {},
    },
    lastSeen: isOnline ? 'Online now' : played ? new Date(played).toISOString() : undefined,
  };
}

export function formatLastSeen(value?: string) {
  if (!value) return 'Unknown';
  const stamp = time(value);
  return stamp ? new Date(stamp).toLocaleString() : value;
}
