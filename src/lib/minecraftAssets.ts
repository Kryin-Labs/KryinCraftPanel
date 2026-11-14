// Minecraft Asset and Helper Utility
// Resolves authentic textures, SVG hearts, food bars, and stats parsing

export function getItemIconUrl(rawName: string): string {
  if (!rawName) return '';
  const clean = rawName.replace(/^minecraft:/, '').toLowerCase().trim();

  // Special block/item icon overrides
  const specialMap: Record<string, string> = {
    yellow_bed: 'https://minecraft.wiki/images/Invicon_Yellow_Bed.png',
    bed: 'https://minecraft.wiki/images/Invicon_Yellow_Bed.png',
    white_bed: 'https://minecraft.wiki/images/Invicon_White_Bed.png',
    red_bed: 'https://minecraft.wiki/images/Invicon_Red_Bed.png',
    ender_chest: 'https://minecraft.wiki/images/Invicon_Ender_Chest.png',
    chest: 'https://minecraft.wiki/images/Invicon_Chest.png',
    furnace: 'https://minecraft.wiki/images/Invicon_Furnace.png',
    crafting_table: 'https://minecraft.wiki/images/Invicon_Crafting_Table.png',
    totem_of_undying: 'https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/item/totem_of_undying.png',
  };

  if (specialMap[clean]) {
    return specialMap[clean];
  }

  // Common blocks that live in textures/block/
  const blockItems = new Set([
    'sand',
    'dirt',
    'cobblestone',
    'stone',
    'oak_log',
    'birch_log',
    'spruce_log',
    'oak_planks',
    'deepslate',
    'netherrack',
    'iron_ore',
    'coal_ore',
    'gold_ore',
    'diamond_ore',
    'emerald_ore',
    'copper_ore',
    'lapis_ore',
    'redstone_ore',
    'obsidian',
    'gravel',
    'glass',
    'poppy',
    'dandelion',
    'torch',
    'redstone_torch',
    'oak_sapling',
    'white_wool',
    'yellow_wool',
    'red_wool',
    'tnt',
    'bookshelf',
    'mossy_cobblestone',
    'bedrock',
    'sponge',
  ]);

  if (blockItems.has(clean)) {
    return `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/${clean}.png`;
  }

  // Default to items
  return `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/item/${clean}.png`;
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
