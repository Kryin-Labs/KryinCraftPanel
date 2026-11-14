import {
  ServerInfo,
  HardwareMetrics,
  MetricHistoryPoint,
  MinecraftPlayer,
  ConsoleLogEntry,
  ServerFile,
  RoleMember,
  AuditLog,
  TunnelConfig
} from '@/types';

export const initialServerInfo: ServerInfo = {
  id: 'rog-5s-primary',
  name: 'Kryin Paper Server',
  status: 'online',
  pid: 18492,
  minecraftVersion: '26.3',
  paperBuild: 249,
  geyserVersion: '2.12.1-b1302',
  device: 'ASUS ROG Phone 5s (Snapdragon 888)',
  androidVersion: 'Android 13 (Termux aarch64)',
  uptimeSeconds: 84320, // ~23.4 hours
  lastStartup: '2026-11-13T08:00:00Z',
  lastShutdown: null,
  agentConnected: true,
  lastHeartbeat: 'Just now (4s ago)',
  onlinePlayers: 2,
  maxPlayers: 20,
  tps: 19.98,
};

export const initialMetrics: HardwareMetrics = {
  totalRamMb: 12288, // 12 GB
  usedRamMb: 4915,   // ~40% phone RAM used
  availableRamMb: 7373,
  javaHeapUsedMb: 1433, // 1.4 GB used
  javaHeapMaxMb: 4096,  // 4.0 GB allocated max (-Xmx4G)
  cpuUsagePercent: 14.8,
  cpuTempC: 43.5, // From /sys/class/thermal/thermal_zoneX where readable
  batteryPercent: 82,
  batteryTempC: 34.6,
  isCharging: true,
  powerSource: 'Bypass Charging (USB-PD)',
  timestamp: new Date().toISOString(),
};

export const metricHistory: MetricHistoryPoint[] = [
  { time: '14:00', cpu: 12, ramPhone: 4720, ramJava: 1310 },
  { time: '14:05', cpu: 18, ramPhone: 4850, ramJava: 1380 },
  { time: '14:10', cpu: 24, ramPhone: 4920, ramJava: 1420 },
  { time: '14:15', cpu: 15, ramPhone: 4890, ramJava: 1390 },
  { time: '14:20', cpu: 29, ramPhone: 5120, ramJava: 1510 },
  { time: '14:25', cpu: 19, ramPhone: 4960, ramJava: 1450 },
  { time: '14:30', cpu: 14, ramPhone: 4915, ramJava: 1433 },
];

export const initialPlayers: MinecraftPlayer[] = [
  {
    uuid: '7c19cd5f-5e95-3cb4-a898-b1c67755680e',
    username: 'NarcoGam3X',
    isOnline: false,
    pingMs: 0,
    health: 20,
    maxHealth: 20,
    foodLevel: 19,
    saturation: 5.0,
    xpLevel: 31,
    xpProgress: 0.92,
    gamemode: 'survival',
    isOp: true,
    isWhitelisted: false,
    isBanned: false,
    coordinates: {
      x: -1908.53,
      y: 63.0,
      z: 1179.39,
      world: 'world',
      dimension: 'minecraft:overworld',
    },
    respawnCoordinates: {
      x: -1850.0,
      y: 64.0,
      z: 1200.0,
      dimension: 'minecraft:overworld',
    },
    deathCoordinates: {
      x: -1920.1,
      y: 45.0,
      z: 1150.8,
      dimension: 'minecraft:overworld',
    },
    inventory: {
      armor: {
        helmet: {
          id: 'diamond_helmet',
          name: 'minecraft:diamond_helmet',
          displayName: 'Diamond Helmet',
          count: 1,
          slot: 39,
          durability: 290,
          maxDurability: 363,
          enchantments: [
            { name: 'Protection', level: 4 },
            { name: 'Respiration', level: 3 },
          ],
        },
        chestplate: {
          id: 'diamond_chestplate',
          name: 'minecraft:diamond_chestplate',
          displayName: 'Diamond Chestplate',
          count: 1,
          slot: 38,
          durability: 460,
          maxDurability: 528,
          enchantments: [
            { name: 'Protection', level: 4 },
            { name: 'Unbreaking', level: 3 },
          ],
        },
        leggings: {
          id: 'diamond_leggings',
          name: 'minecraft:diamond_leggings',
          displayName: 'Diamond Leggings',
          count: 1,
          slot: 37,
          durability: 410,
          maxDurability: 495,
          enchantments: [{ name: 'Protection', level: 4 }],
        },
        boots: {
          id: 'diamond_boots',
          name: 'minecraft:diamond_boots',
          displayName: 'Diamond Boots',
          count: 1,
          slot: 36,
          durability: 370,
          maxDurability: 429,
          enchantments: [
            { name: 'Feather Falling', level: 4 },
            { name: 'Protection', level: 4 },
          ],
        },
      },
      offhand: {
        id: 'totem_of_undying',
        name: 'minecraft:totem_of_undying',
        displayName: 'Totem of Undying',
        count: 22,
        slot: 40,
      },
      main: [
        { id: 'sand', name: 'minecraft:sand', displayName: 'Sand', count: 64, slot: 9 },
        { id: 'iron_ingot', name: 'minecraft:iron_ingot', displayName: 'Iron Ingot', count: 64, slot: 10 },
        { id: 'cooked_mutton', name: 'minecraft:cooked_mutton', displayName: 'Cooked Mutton', count: 14, slot: 11 },
        { id: 'oak_log', name: 'minecraft:oak_log', displayName: 'Oak Log', count: 8, slot: 12 },
        { id: 'iron_ingot', name: 'minecraft:iron_ingot', displayName: 'Iron Ingot', count: 2, slot: 13 },
        { id: 'sand', name: 'minecraft:sand', displayName: 'Sand', count: 64, slot: 14 },
        { id: 'beef', name: 'minecraft:beef', displayName: 'Raw Beef', count: 3, slot: 15 },
        { id: 'cobblestone', name: 'minecraft:cobblestone', displayName: 'Cobblestone', count: 1, slot: 16 },
        { id: 'sand', name: 'minecraft:sand', displayName: 'Sand', count: 64, slot: 17 },
        { id: 'bread', name: 'minecraft:bread', displayName: 'Bread', count: 1, slot: 18 },
        { id: 'saddle', name: 'minecraft:saddle', displayName: 'Saddle', count: 1, slot: 19 },
        { id: 'cobblestone', name: 'minecraft:cobblestone', displayName: 'Cobblestone', count: 1, slot: 20 },
        { id: 'poppy', name: 'minecraft:poppy', displayName: 'Poppy', count: 1, slot: 21 },
        { id: 'yellow_bed', name: 'minecraft:yellow_bed', displayName: 'Yellow Bed', count: 1, slot: 22 },
        { id: 'wooden_pickaxe', name: 'minecraft:wooden_pickaxe', displayName: 'Wooden Pickaxe', count: 1, slot: 23, durability: 35, maxDurability: 59 },
        { id: 'bone', name: 'minecraft:bone', displayName: 'Bone', count: 6, slot: 24 },
        { id: 'arrow', name: 'minecraft:arrow', displayName: 'Arrow', count: 30, slot: 25 },
        { id: 'sand', name: 'minecraft:sand', displayName: 'Sand', count: 64, slot: 26 },
        { id: 'sand', name: 'minecraft:sand', displayName: 'Sand', count: 64, slot: 27 },
        { id: 'coal', name: 'minecraft:coal', displayName: 'Coal', count: 2, slot: 28 },
        { id: 'leather', name: 'minecraft:leather', displayName: 'Leather', count: 5, slot: 29 },
        { id: 'wooden_axe', name: 'minecraft:wooden_axe', displayName: 'Wooden Axe', count: 1, slot: 30, durability: 42, maxDurability: 59 },
        { id: 'arrow', name: 'minecraft:arrow', displayName: 'Arrow', count: 8, slot: 31 },
        { id: 'iron_ingot', name: 'minecraft:iron_ingot', displayName: 'Iron Ingot', count: 1, slot: 32 },
        { id: 'stick', name: 'minecraft:stick', displayName: 'Stick', count: 1, slot: 33 },
        null,
        { id: 'sand', name: 'minecraft:sand', displayName: 'Sand', count: 64, slot: 35 },
      ],
      hotbar: [
        { id: 'diamond_sword', name: 'minecraft:diamond_sword', displayName: 'Diamond Sword', count: 1, slot: 0, durability: 1350, maxDurability: 1561, enchantments: [{ name: 'Sharpness', level: 5 }, { name: 'Looting', level: 3 }] },
        { id: 'diamond_pickaxe', name: 'minecraft:diamond_pickaxe', displayName: 'Diamond Pickaxe', count: 1, slot: 1, durability: 1420, maxDurability: 1561, enchantments: [{ name: 'Efficiency', level: 5 }, { name: 'Fortune', level: 3 }] },
        { id: 'diamond_axe', name: 'minecraft:diamond_axe', displayName: 'Diamond Axe', count: 1, slot: 2, durability: 1200, maxDurability: 1561, enchantments: [{ name: 'Efficiency', level: 4 }] },
        { id: 'diamond_shovel', name: 'minecraft:diamond_shovel', displayName: 'Diamond Shovel', count: 1, slot: 3, durability: 1150, maxDurability: 1561, enchantments: [{ name: 'Efficiency', level: 4 }] },
        { id: 'wooden_shovel', name: 'minecraft:wooden_shovel', displayName: 'Wooden Shovel', count: 1, slot: 4, durability: 24, maxDurability: 59 },
        { id: 'golden_shovel', name: 'minecraft:golden_shovel', displayName: 'Golden Shovel', count: 1, slot: 5, durability: 20, maxDurability: 32 },
        { id: 'stick', name: 'minecraft:stick', displayName: 'Stick', count: 1, slot: 6 },
        { id: 'dirt', name: 'minecraft:dirt', displayName: 'Dirt', count: 12, slot: 7 },
        { id: 'water_bucket', name: 'minecraft:water_bucket', displayName: 'Water Bucket', count: 1, slot: 8 },
      ],
    },
    statistics: {
      playtimeHours: 29.9,
      playerKills: 3,
      deaths: 12,
      kdr: 0.25,
      distanceTraveledKm: 88.8,
      blocksBroken: 11182,
      itemsUsed: 31778,
      entitiesKilled: 233,
      rawStats: {
        stats: {
          'minecraft:custom': {
            'minecraft:play_time': 2152800,
            'minecraft:player_kills': 3,
            'minecraft:deaths': 12,
            'minecraft:walk_one_cm': 3077800,
            'minecraft:sprint_one_cm': 2491600,
            'minecraft:swim_one_cm': 1243000,
            'minecraft:fall_one_cm': 482100,
            'minecraft:aviate_one_cm': 1593000,
          },
          'minecraft:mined': {
            'minecraft:dirt': 1994,
            'minecraft:stone': 1715,
            'minecraft:deepslate': 1240,
            'minecraft:netherrack': 980,
            'minecraft:iron_ore': 450,
            'minecraft:coal_ore': 380,
          },
          'minecraft:used': {
            'minecraft:dirt': 5177,
            'minecraft:diamond_shovel': 4242,
            'minecraft:diamond_pickaxe': 3890,
            'minecraft:torch': 1650,
            'minecraft:cobblestone': 1420,
            'minecraft:cooked_beef': 240,
          },
          'minecraft:killed': {
            'minecraft:zombie': 90,
            'minecraft:skeleton': 47,
            'minecraft:creeper': 35,
            'minecraft:spider': 28,
            'minecraft:enderman': 14,
            'minecraft:blaze': 8,
          },
        },
        DataVersion: 3953,
      },
    },
    ipAddress: '192.168.0.164',
    lastSeen: 'Recently',
  },
  {
    uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
    username: 'Notch',
    isOnline: true,
    pingMs: 24,
    health: 18,
    maxHealth: 20,
    foodLevel: 20,
    saturation: 15.0,
    xpLevel: 46,
    xpProgress: 0.72,
    gamemode: 'survival',
    isOp: true,
    isWhitelisted: true,
    isBanned: false,
    coordinates: {
      x: -142.5,
      y: 71.0,
      z: 320.4,
      world: 'world',
      dimension: 'minecraft:overworld',
    },
    inventory: {
      armor: {
        helmet: {
          id: 'netherite_helmet',
          name: 'minecraft:netherite_helmet',
          displayName: 'Netherite Helmet',
          count: 1,
          slot: 39,
          durability: 395,
          maxDurability: 407,
          enchantments: [
            { name: 'Protection', level: 4 },
            { name: 'Unbreaking', level: 3 },
            { name: 'Mending', level: 1 },
          ],
        },
        chestplate: {
          id: 'netherite_chestplate',
          name: 'minecraft:netherite_chestplate',
          displayName: 'Netherite Chestplate',
          count: 1,
          slot: 38,
          durability: 570,
          maxDurability: 592,
          enchantments: [
            { name: 'Protection', level: 4 },
            { name: 'Unbreaking', level: 3 },
          ],
        },
        leggings: {
          id: 'netherite_leggings',
          name: 'minecraft:netherite_leggings',
          displayName: 'Netherite Leggings',
          count: 1,
          slot: 37,
          durability: 520,
          maxDurability: 555,
          enchantments: [{ name: 'Protection', level: 4 }],
        },
        boots: {
          id: 'netherite_boots',
          name: 'minecraft:netherite_boots',
          displayName: 'Netherite Boots',
          count: 1,
          slot: 36,
          durability: 460,
          maxDurability: 481,
          enchantments: [
            { name: 'Feather Falling', level: 4 },
            { name: 'Depth Strider', level: 3 },
          ],
        },
      },
      offhand: {
        id: 'totem_of_undying',
        name: 'minecraft:totem_of_undying',
        displayName: 'Totem of Undying',
        count: 1,
        slot: 40,
      },
      hotbar: [
        {
          id: 'netherite_sword',
          name: 'minecraft:netherite_sword',
          displayName: 'Dragon Slayer',
          count: 1,
          slot: 0,
          enchantments: [
            { name: 'Sharpness', level: 5 },
            { name: 'Looting', level: 3 },
            { name: 'Unbreaking', level: 3 },
          ],
        },
        {
          id: 'netherite_pickaxe',
          name: 'minecraft:netherite_pickaxe',
          displayName: 'Fortune Miner',
          count: 1,
          slot: 1,
          enchantments: [
            { name: 'Efficiency', level: 5 },
            { name: 'Fortune', level: 3 },
          ],
        },
        {
          id: 'golden_apple',
          name: 'minecraft:golden_apple',
          displayName: 'Golden Apple',
          count: 16,
          slot: 2,
        },
        {
          id: 'ender_pearl',
          name: 'minecraft:ender_pearl',
          displayName: 'Ender Pearl',
          count: 12,
          slot: 3,
        },
        {
          id: 'cooked_beef',
          name: 'minecraft:cooked_beef',
          displayName: 'Cooked Beef',
          count: 48,
          slot: 4,
        },
        {
          id: 'firework_rocket',
          name: 'minecraft:firework_rocket',
          displayName: 'Firework Rocket',
          count: 64,
          slot: 5,
        },
        {
          id: 'water_bucket',
          name: 'minecraft:water_bucket',
          displayName: 'Water Bucket',
          count: 1,
          slot: 6,
        },
        {
          id: 'torch',
          name: 'minecraft:torch',
          displayName: 'Torch',
          count: 38,
          slot: 7,
        },
        {
          id: 'elytra',
          name: 'minecraft:elytra',
          displayName: 'Elytra Wings',
          count: 1,
          slot: 8,
          durability: 412,
          maxDurability: 432,
        },
      ],
      main: [
        { id: 'diamond', name: 'minecraft:diamond', displayName: 'Diamond', count: 34, slot: 9 },
        { id: 'iron_ingot', name: 'minecraft:iron_ingot', displayName: 'Iron Ingot', count: 64, slot: 10 },
        { id: 'gold_ingot', name: 'minecraft:gold_ingot', displayName: 'Gold Ingot', count: 28, slot: 11 },
        { id: 'obsidian', name: 'minecraft:obsidian', displayName: 'Obsidian', count: 18, slot: 12 },
        { id: 'redstone', name: 'minecraft:redstone', displayName: 'Redstone Dust', count: 64, slot: 13 },
        { id: 'lapis_lazuli', name: 'minecraft:lapis_lazuli', displayName: 'Lapis Lazuli', count: 42, slot: 14 },
        null, null, null,
        null, null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null, null,
      ],
    },
    statistics: {
      playtimeHours: 142.5,
      playerKills: 14,
      deaths: 3,
      kdr: 4.67,
      distanceTraveledKm: 89.2,
      blocksBroken: 48210,
      itemsUsed: 31200,
      entitiesKilled: 1250,
    },
    ipAddress: '192.168.0.105',
    lastSeen: 'Active now',
  },
  {
    uuid: '853c80ef-3c37-49fd-aa49-938b674adae6',
    username: 'Jeb_',
    isOnline: true,
    pingMs: 42,
    health: 20,
    maxHealth: 20,
    foodLevel: 18,
    saturation: 12.0,
    xpLevel: 29,
    xpProgress: 0.45,
    gamemode: 'survival',
    isOp: false,
    isWhitelisted: true,
    isBanned: false,
    coordinates: {
      x: 1205.8,
      y: 64.0,
      z: -840.1,
      world: 'world_nether',
      dimension: 'minecraft:the_nether',
    },
    inventory: {
      armor: {
        helmet: {
          id: 'iron_helmet',
          name: 'minecraft:iron_helmet',
          displayName: 'Iron Helmet',
          count: 1,
          slot: 39,
        },
        chestplate: {
          id: 'diamond_chestplate',
          name: 'minecraft:diamond_chestplate',
          displayName: 'Diamond Chestplate',
          count: 1,
          slot: 38,
        },
        leggings: {
          id: 'iron_leggings',
          name: 'minecraft:iron_leggings',
          displayName: 'Iron Leggings',
          count: 1,
          slot: 37,
        },
        boots: {
          id: 'iron_boots',
          name: 'minecraft:iron_boots',
          displayName: 'Iron Boots',
          count: 1,
          slot: 36,
        },
      },
      offhand: {
        id: 'shield',
        name: 'minecraft:shield',
        displayName: 'Shield',
        count: 1,
        slot: 40,
      },
      hotbar: [
        {
          id: 'diamond_sword',
          name: 'minecraft:diamond_sword',
          displayName: 'Diamond Sword',
          count: 1,
          slot: 0,
        },
        {
          id: 'iron_pickaxe',
          name: 'minecraft:iron_pickaxe',
          displayName: 'Iron Pickaxe',
          count: 1,
          slot: 1,
        },
        {
          id: 'bread',
          name: 'minecraft:bread',
          displayName: 'Bread',
          count: 32,
          slot: 2,
        },
        {
          id: 'cobblestone',
          name: 'minecraft:cobblestone',
          displayName: 'Cobblestone',
          count: 64,
          slot: 3,
        },
        null, null, null, null, null,
      ],
      main: new Array(27).fill(null),
    },
    statistics: {
      playtimeHours: 64.2,
      playerKills: 2,
      deaths: 9,
      kdr: 0.22,
      distanceTraveledKm: 34.1,
      blocksBroken: 14200,
      itemsUsed: 8900,
      entitiesKilled: 420,
    },
    ipAddress: '192.168.0.120',
    lastSeen: 'Active now',
  },
  {
    uuid: 'e713606b-313d-4c3e-8c8c-1e0f0bf60851',
    username: 'Alex_Crafter',
    isOnline: false,
    health: 20,
    maxHealth: 20,
    foodLevel: 20,
    xpLevel: 12,
    xpProgress: 0.15,
    gamemode: 'survival',
    isOp: false,
    isWhitelisted: true,
    isBanned: false,
    coordinates: {
      x: 0.0,
      y: 65.0,
      z: 0.0,
      world: 'world',
      dimension: 'minecraft:overworld',
    },
    inventory: {
      armor: { helmet: null, chestplate: null, leggings: null, boots: null },
      offhand: null,
      hotbar: new Array(9).fill(null),
      main: new Array(27).fill(null),
    },
    statistics: {
      playtimeHours: 12.0,
      playerKills: 0,
      deaths: 4,
      kdr: 0.0,
      distanceTraveledKm: 8.5,
      blocksBroken: 2400,
      itemsUsed: 1500,
      entitiesKilled: 75,
    },
    lastSeen: 'Yesterday at 21:40',
  },
  {
    uuid: '7125ba40-b920-40e6-bc21-695cfab10b40',
    username: 'Griefer_X',
    isOnline: false,
    health: 0,
    maxHealth: 20,
    foodLevel: 0,
    xpLevel: 0,
    xpProgress: 0,
    gamemode: 'survival',
    isOp: false,
    isWhitelisted: false,
    isBanned: true,
    coordinates: {
      x: 100,
      y: 64,
      z: 100,
      world: 'world',
      dimension: 'minecraft:overworld',
    },
    inventory: {
      armor: { helmet: null, chestplate: null, leggings: null, boots: null },
      offhand: null,
      hotbar: new Array(9).fill(null),
      main: new Array(27).fill(null),
    },
    statistics: {
      playtimeHours: 0.5,
      playerKills: 0,
      deaths: 1,
      kdr: 0.0,
      distanceTraveledKm: 0.4,
      blocksBroken: 12,
      itemsUsed: 10,
      entitiesKilled: 0,
    },
    lastSeen: '3 days ago (Banned: Griefing spawn)',
  },
];

export const initialLogs: ConsoleLogEntry[] = [
  { id: '1', timestamp: '14:28:10', level: 'INFO', message: '[Server] Loading Paper version git-Paper-249 (MC: 26.3) (Implementing API version 26.3-R0.1-SNAPSHOT)' },
  { id: '2', timestamp: '14:28:12', level: 'INFO', message: '[Geyser-Spigot] Loading Geyser version 2.12.1-b1302' },
  { id: '3', timestamp: '14:28:14', level: 'INFO', message: '[Geyser-Spigot] Started Geyser Bedrock listener on 0.0.0.0:19132 (UDP)' },
  { id: '4', timestamp: '14:28:15', level: 'INFO', message: '[Server] Preparing start region for dimension minecraft:overworld' },
  { id: '5', timestamp: '14:28:18', level: 'INFO', message: '[Server] Time elapsed: 2410 ms' },
  { id: '6', timestamp: '14:28:19', level: 'INFO', message: '[Server] Running delayed init tasks' },
  { id: '7', timestamp: '14:28:20', level: 'INFO', message: '[Server] Done (11.428s)! For help, type "help"' },
  { id: '8', timestamp: '14:28:22', level: 'INFO', message: '[Server] RCON running on 127.0.0.1:25575' },
  { id: '9', timestamp: '14:29:45', level: 'INFO', message: 'UUID of player Notch is 069a79f4-44e9-4726-a5be-fca90e38aaf5' },
  { id: '10', timestamp: '14:29:45', level: 'INFO', message: 'Notch[/192.168.0.105:51240] logged in with entity id 124 at (-142.5, 71.0, 320.4)' },
  { id: '11', timestamp: '14:31:02', level: 'INFO', message: 'UUID of player Jeb_ is 853c80ef-3c37-49fd-aa49-938b674adae6' },
  { id: '12', timestamp: '14:31:03', level: 'INFO', message: 'Jeb_[/192.168.0.120:53112] logged in with entity id 210 at (1205.8, 64.0, -840.1)' },
  { id: '13', timestamp: '14:32:00', level: 'INFO', message: '<Notch> Welcome to Kryin server on ROG Phone 5s!' },
  { id: '14', timestamp: '14:32:15', level: 'INFO', message: '<Jeb_> Running smooth, 20 TPS is rock solid!' },
];

export const initialFiles: Record<string, ServerFile[]> = {
  '/': [
    { name: 'config', path: '/config', isDirectory: true, sizeBytes: 4096, modifiedAt: '2026-11-13 14:10' },
    { name: 'logs', path: '/logs', isDirectory: true, sizeBytes: 8192, modifiedAt: '2026-11-14 07:15' },
    { name: 'plugins', path: '/plugins', isDirectory: true, sizeBytes: 4096, modifiedAt: '2026-11-13 12:00' },
    { name: 'world', path: '/world', isDirectory: true, sizeBytes: 16384, modifiedAt: '2026-11-14 07:12' },
    { name: 'world_nether', path: '/world_nether', isDirectory: true, sizeBytes: 8192, modifiedAt: '2026-11-14 07:12' },
    { name: 'world_the_end', path: '/world_the_end', isDirectory: true, sizeBytes: 4096, modifiedAt: '2026-11-14 07:12' },
    { name: 'server.jar', path: '/server.jar', isDirectory: false, sizeBytes: 48512400, modifiedAt: '2026-11-12 18:30', extension: 'jar' },
    { name: 'server.properties', path: '/server.properties', isDirectory: false, sizeBytes: 1420, modifiedAt: '2026-11-13 10:15', extension: 'properties' },
    { name: 'eula.txt', path: '/eula.txt', isDirectory: false, sizeBytes: 180, modifiedAt: '2026-11-12 18:35', extension: 'txt' },
    { name: 'paper-global.yml', path: '/paper-global.yml', isDirectory: false, sizeBytes: 3120, modifiedAt: '2026-11-13 10:20', extension: 'yml' },
    { name: 'ops.json', path: '/ops.json', isDirectory: false, sizeBytes: 420, modifiedAt: '2026-11-13 14:00', extension: 'json' },
    { name: 'whitelist.json', path: '/whitelist.json', isDirectory: false, sizeBytes: 310, modifiedAt: '2026-11-13 14:00', extension: 'json' },
    { name: 'banned-players.json', path: '/banned-players.json', isDirectory: false, sizeBytes: 250, modifiedAt: '2026-11-13 16:30', extension: 'json' },
  ],
  '/plugins': [
    { name: 'Geyser-Spigot.jar', path: '/plugins/Geyser-Spigot.jar', isDirectory: false, sizeBytes: 28410000, modifiedAt: '2026-11-12 19:00', extension: 'jar' },
    { name: 'Geyser-Spigot', path: '/plugins/Geyser-Spigot', isDirectory: true, sizeBytes: 4096, modifiedAt: '2026-11-13 10:00' },
  ],
  '/logs': [
    { name: 'latest.log', path: '/logs/latest.log', isDirectory: false, sizeBytes: 142800, modifiedAt: '2026-11-14 07:15', extension: 'log' },
    { name: '2026-11-13-1.log.gz', path: '/logs/2026-11-13-1.log.gz', isDirectory: false, sizeBytes: 45200, modifiedAt: '2026-11-13 23:59', extension: 'gz' },
  ],
};

export const sampleFileContents: Record<string, string> = {
  '/server.properties': `# Minecraft server properties for KryinCraftPanel
# Running on ASUS ROG Phone 5s (Termux aarch64)
enable-jmx-monitoring=false
rcon.port=25575
level-seed=
gamemode=survival
enable-command-block=true
enable-query=false
generator-settings={}
enforce-secure-profile=false
level-name=world
motd=\\u00a7bKryin Paper Server \\u00a78[\\u00a7aROG 5s Phone\\u00a78]
query.port=25565
pvp=true
generate-structures=true
difficulty=hard
network-compression-threshold=256
max-tick-time=60000
require-resource-pack=false
use-native-transport=true
max-players=20
online-mode=true
enable-status=true
allow-flight=false
broadcast-rcon-to-ops=true
view-distance=10
server-ip=0.0.0.0
resource-pack-prompt=
allow-nether=true
server-port=25565
enable-rcon=true
rcon.password=SECRET_LOCAL_RCON_PASS_LOCAL_ONLY
sync-chunk-writes=true
op-permission-level=4
prevent-proxy-connections=false
hide-online-players=false
resource-pack=
entity-broadcast-range-percentage=100
simulation-distance=8
rcon.ip=127.0.0.1
player-idle-timeout=0
force-gamemode=false
rate-limit=0
hardcore=false
white-list=false
broadcast-console-to-ops=true
spawn-npcs=true
spawn-animals=true
function-permission-level=2
initial-enabled-packs=vanilla
level-type=minecraft\\:normal
text-filtering-config=
spawn-monsters=true
enforce-whitelist=false
spawn-protection=0
resource-pack-sha1=
max-world-size=29999984
`,
  '/eula.txt': `#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).
#Fri Nov 12 18:35:00 UTC 2026
eula=true
`,
};

export const initialMembers: RoleMember[] = [
  {
    id: 'mem-1',
    email: 'purohitarthbkn@gmail.com',
    displayName: 'Arth Official (Owner)',
    role: 'owner',
    customPermissions: ['*'],
    invitedAt: '2026-11-12T00:00:00Z',
    joinedAt: '2026-11-12T00:00:00Z',
  },
  {
    id: 'mem-2',
    email: 'admin-friend@gmail.com',
    displayName: 'Co-Admin',
    role: 'admin',
    customPermissions: ['server.*', 'console.view', 'console.execute', 'players.*', 'logs.view', 'files.view'],
    invitedAt: '2026-11-13T10:00:00Z',
    joinedAt: '2026-11-13T10:30:00Z',
  },
  {
    id: 'mem-3',
    email: 'moderator@kryin.net',
    displayName: 'Moderator',
    role: 'operator',
    customPermissions: ['server.view', 'players.view', 'players.kick', 'logs.view'],
    invitedAt: '2026-11-13T18:00:00Z',
    isPending: true,
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    userId: 'mem-1',
    userEmail: 'purohitarthbkn@gmail.com',
    action: 'SERVER_START',
    target: 'Paper 26.3',
    timestamp: '2026-11-14 06:00:12',
    status: 'success',
    details: 'Initiated Paper process PID 18492 with -Xmx4G',
  },
  {
    id: 'audit-2',
    userId: 'mem-1',
    userEmail: 'purohitarthbkn@gmail.com',
    action: 'CONSOLE_COMMAND',
    target: 'save-all',
    timestamp: '2026-11-14 06:30:00',
    status: 'success',
    details: 'Manual world flush triggered',
  },
  {
    id: 'audit-3',
    userId: 'mem-2',
    userEmail: 'admin-friend@gmail.com',
    action: 'PLAYER_BAN',
    target: 'Griefer_X',
    timestamp: '2026-11-13 16:30:15',
    status: 'success',
    details: 'Banned for spawn griefing',
  },
  {
    id: 'audit-4',
    userId: 'mem-1',
    userEmail: 'purohitarthbkn@gmail.com',
    action: 'FILE_EDIT',
    target: 'server.properties',
    timestamp: '2026-11-13 10:15:22',
    status: 'success',
    details: 'Updated simulation-distance from 6 to 8',
  },
];

export const tunnelInfo: TunnelConfig = {
  java: {
    publicHost: 'rog-kryin.playit.gg',
    publicPort: 38240,
    localIp: '192.168.0.164',
    localPort: 25565,
    protocol: 'TCP',
  },
  bedrock: {
    publicHost: 'rog-kryin.playit.gg',
    publicPort: 19132,
    localIp: '192.168.0.164',
    localPort: 19132,
    protocol: 'UDP',
  },
};
