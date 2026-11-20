import vanilla from './vanillaItemTextures.json';

// Filenames from minecraft-textures/dist/textures/manifest/26.3.json.
// Load the published rendered PNGs directly from the browser.
const renderedIcons = vanilla.images as Record<string, string | undefined>;
const assetPath = 'minecraft-textures@' + vanilla.packageVersion + '/dist/textures/assets/';

export function itemTextureSources(rawName: string): string[] {
  const id = rawName.toLowerCase().trim();
  if (!/^(?:minecraft:)?[a-z0-9_]+$/.test(id)) return [];
  const filename = renderedIcons[id.replace(/^minecraft:/, '')];
  if (!filename || !/^[a-f\d]{16}\.png$/.test(filename)) return [];
  return [
    'https://cdn.jsdelivr.net/npm/' + assetPath + filename,
    'https://unpkg.com/' + assetPath + filename,
  ];
}
export function getItemIconUrl(rawName: string): string {
  return rawName ? itemTextureSources(rawName)[0] ?? '' : '';
}

export function isShulkerBox(id: string) {
  return /^(?:minecraft:)?(?:[a-z_]+_)?shulker_box$/.test(id);
}

export function getMobIconUrl(rawMob: string): string {
  if (!rawMob) return 'https://mc-heads.net/avatar/MHF_Steve/32';
  const clean = rawMob.replace(/^minecraft:/, '').toLowerCase().trim();

  const mobMap: Record<string, string> = {
    zombie: 'MHF_Zombie',
    skeleton: 'MHF_Skeleton',
    creeper: 'MHF_Creeper',
    spider: 'MHF_Spider',
    cave_spider: 'MHF_CaveSpider',
    enderman: 'MHF_Enderman',
    blaze: 'MHF_Blaze',
    slime: 'MHF_Slime',
    ghast: 'MHF_Ghast',
    piglin: 'MHF_PigZombie',
    zombified_piglin: 'MHF_PigZombie',
    witch: 'MHF_Witch',
    wither_skeleton: 'MHF_WSkeleton',
    villager: 'MHF_Villager',
    cow: 'MHF_Cow',
    pig: 'MHF_Pig',
    sheep: 'MHF_Sheep',
    chicken: 'MHF_Chicken',
    iron_golem: 'MHF_Golem',
  };

  const mhfName = mobMap[clean] || 'MHF_Steve';
  return `https://mc-heads.net/avatar/${mhfName}/32`;
}

// Format Minecraft ticks to "X hours, Y minutes"
export function formatPlaytime(ticks: number): string {
  if (!ticks || isNaN(ticks)) return '0 hours, 0 minutes';
  const totalSeconds = Math.floor(ticks / 20);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours} hours, ${minutes} minutes`;
}

// Convert centimeters to block count
export function cmToBlocks(cm: number): number {
  if (!cm || isNaN(cm)) return 0;
  return Math.round(cm / 100);
}

// Format friendly display name from Minecraft identifier (e.g. "diamond_sword" -> "Diamond Sword")
export function formatMinecraftName(raw: string): string {
  if (!raw) return '';
  const clean = raw.replace(/^minecraft:/, '');
  return clean
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatEnchantmentLevel(level: number): string {
  if (!Number.isInteger(level) || level < 1 || level > 3999) return String(level);
  let remaining = level;
  let roman = '';
  for (const [value, symbol] of [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'],
    [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ] as const) {
    roman += symbol.repeat(Math.floor(remaining / value));
    remaining %= value;
  }
  return roman;
}

const statGroupNames = new Map([
  ['custom', 'General'],
  ['mined', 'Blocks broken'],
  ['crafted', 'Items crafted'],
  ['used', 'Items used'],
  ['broken', 'Items broken'],
  ['picked_up', 'Items picked up'],
  ['dropped', 'Items dropped'],
  ['killed', 'Entities killed'],
  ['killed_by', 'Killed by'],
]);

export function minecraftStatGroups(raw: unknown) {
  if (!isStatObject(raw)) return [];
  const stats = isStatObject(raw.stats) ? raw.stats : raw;
  return Object.entries(stats).flatMap(([key, values]) => {
    if (!isStatObject(values)) return [];
    const category = key.replace(/^minecraft:/, '');
    const rows = Object.entries(values)
      .flatMap(([id, count]) => {
        if (typeof count !== 'number' || !Number.isFinite(count)) return [];
        const distance = category === 'custom' && id.endsWith('_one_cm');
        const time = category === 'custom' &&
          /^(?:minecraft:)?(?:play_time|play_one_minute|total_world_time|time_since_death|time_since_rest|sneak_time)$/.test(id);
        const name = formatMinecraftName(distance ? id.slice(0, -'_one_cm'.length) : id);
        return [{ id, name, count, unit: distance ? ' cm' : time ? ' ticks' : '' }];
      })
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
    return rows.length ? [{ key, name: statGroupNames.get(category) ?? formatMinecraftName(key), rows }] : [];
  });
}

function isStatObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Parse real Minecraft stats file (world/stats/<UUID>.json)
export interface ParsedPlayerStats {
  playtimeText: string;
  playtimeTicks: number;
  playerKills: number;
  deaths: number;
  kdr: string;
  distanceTotal: number;
  distanceWalked: number;
  distanceSprinted: number;
  distanceSwum: number;
  distanceFallen: number;
  distanceElytra: number;
  blocksBrokenTotal: number;
  blocksBrokenList: { name: string; count: number; rawKey: string }[];
  itemsUsedTotal: number;
  itemsUsedList: { name: string; count: number; rawKey: string }[];
  entitiesKilledTotal: number;
  entitiesKilledList: { name: string; count: number; rawKey: string }[];
}

export function parseMinecraftStats(statsObj: any): ParsedPlayerStats {
  const stats = statsObj?.stats || statsObj || {};
  const custom = stats['minecraft:custom'] || {};
  const mined = stats['minecraft:mined'] || {};
  const used = stats['minecraft:used'] || {};
  const killed = stats['minecraft:killed'] || {};

  const playtimeTicks =
    Number(
      custom['minecraft:play_time'] ??
      custom['minecraft:play_one_minute'] ??
      custom['play_time'] ??
      0
    ) || 0;

  const playerKills = Number(custom['minecraft:player_kills'] ?? custom['player_kills'] ?? 0) || 0;
  const deaths = Number(custom['minecraft:deaths'] ?? custom['deaths'] ?? 0) || 0;
  const kdr = deaths > 0 ? (playerKills / deaths).toFixed(2) : playerKills.toString();

  const walkCm = Number(custom['minecraft:walk_one_cm'] ?? 0) || 0;
  const sprintCm = Number(custom['minecraft:sprint_one_cm'] ?? 0) || 0;
  const swimCm = Number(custom['minecraft:swim_one_cm'] ?? 0) || 0;
  const fallCm = Number(custom['minecraft:fall_one_cm'] ?? 0) || 0;
  const aviateCm = Number(custom['minecraft:aviate_one_cm'] ?? 0) || 0;

  const distanceWalked = cmToBlocks(walkCm);
  const distanceSprinted = cmToBlocks(sprintCm);
  const distanceSwum = cmToBlocks(swimCm);
  const distanceFallen = cmToBlocks(fallCm);
  const distanceElytra = cmToBlocks(aviateCm);
  const distanceTotal =
    distanceWalked + distanceSprinted + distanceSwum + distanceFallen + distanceElytra;

  // Blocks broken (real mined statistics)
  const blocksBrokenList: { name: string; count: number; rawKey: string }[] = [];
  let blocksBrokenTotal = 0;
  for (const [key, val] of Object.entries(mined)) {
    const num = Number(val) || 0;
    if (num > 0) {
      blocksBrokenTotal += num;
      blocksBrokenList.push({
        name: formatMinecraftName(key),
        count: num,
        rawKey: key,
      });
    }
  }
  blocksBrokenList.sort((a, b) => b.count - a.count);

  // Items used (real used statistics)
  const itemsUsedList: { name: string; count: number; rawKey: string }[] = [];
  let itemsUsedTotal = 0;
  for (const [key, val] of Object.entries(used)) {
    const num = Number(val) || 0;
    if (num > 0) {
      itemsUsedTotal += num;
      itemsUsedList.push({
        name: formatMinecraftName(key),
        count: num,
        rawKey: key,
      });
    }
  }
  itemsUsedList.sort((a, b) => b.count - a.count);

  // Entities killed (real killed statistics)
  const entitiesKilledList: { name: string; count: number; rawKey: string }[] = [];
  let entitiesKilledTotal = 0;
  for (const [key, val] of Object.entries(killed)) {
    const num = Number(val) || 0;
    if (num > 0) {
      entitiesKilledTotal += num;
      entitiesKilledList.push({
        name: formatMinecraftName(key),
        count: num,
        rawKey: key,
      });
    }
  }
  entitiesKilledList.sort((a, b) => b.count - a.count);

  return {
    playtimeText: formatPlaytime(playtimeTicks),
    playtimeTicks,
    playerKills,
    deaths,
    kdr,
    distanceTotal,
    distanceWalked,
    distanceSprinted,
    distanceSwum,
    distanceFallen,
    distanceElytra,
    blocksBrokenTotal,
    blocksBrokenList,
    itemsUsedTotal,
    itemsUsedList,
    entitiesKilledTotal,
    entitiesKilledList,
  };
}
