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
  id: 'in-mumbai-01',
  name: 'Kryin Paper Server',
  status: 'online',
  pid: 18492,
  minecraftVersion: '1.21.4',
  paperBuild: 249,
  geyserVersion: '2.12.1-b1302',
  device: 'Dedicated Bare-Metal Node (Mumbai DC-1)',
  androidVersion: 'Linux 6.8.0-generic (x86_64)',
  uptimeSeconds: 84320, // ~23.4 hours
  lastStartup: '2026-11-13T08:00:00Z',
  lastShutdown: null,
  agentConnected: true,
  lastHeartbeat: 'Just now (2s ago)',
  onlinePlayers: 3,
  maxPlayers: 20,
  tps: 20.0,
};

export const initialMetrics: HardwareMetrics = {
  totalRamMb: 6144, // 6 GB Plan
  usedRamMb: 2450,  // 2.45 GB allocated
  availableRamMb: 3694,
  javaHeapUsedMb: 2150,
  javaHeapMaxMb: 4096,
  cpuUsagePercent: 12.4,
  cpuTempC: 41.2,
  batteryPercent: 100,
  batteryTempC: null,
  isCharging: true,
  powerSource: 'Redundant High-Efficiency PSU (Grid/UPS)',
  timestamp: new Date().toISOString(),
};

export const metricHistory: MetricHistoryPoint[] = [
  { time: '14:00', cpu: 11, ramPhone: 2310, ramJava: 1980 },
  { time: '14:05', cpu: 14, ramPhone: 2380, ramJava: 2040 },
  { time: '14:10', cpu: 22, ramPhone: 2450, ramJava: 2110 },
  { time: '14:15', cpu: 13, ramPhone: 2410, ramJava: 2080 },
  { time: '14:20', cpu: 18, ramPhone: 2490, ramJava: 2180 },
  { time: '14:25', cpu: 15, ramPhone: 2460, ramJava: 2140 },
  { time: '14:30', cpu: 12, ramPhone: 2450, ramJava: 2150 },
];

export const initialPlayers: MinecraftPlayer[] = [
  {
    uuid: '7c19cd5f-5e95-3cb4-a898-81c67755680e',
    username: 'NarcoGam3X',
    isOnline: true,
    pingMs: 18,
    health: 20,
    maxHealth: 20,
    foodLevel: 20,
    xpLevel: 42,
    xpProgress: 0.65,
    gamemode: 'survival',
    isOp: true,
    isWhitelisted: true,
    isBanned: false,
    coordinates: { x: -1908.5, y: 63.0, z: 1179.4, world: 'world', dimension: 'minecraft:overworld' },
    inventory: {
      armor: {
        helmet: { id: 'netherite_helmet', name: 'Netherite Helmet', displayName: 'Netherite Helmet', count: 1, slot: 39 },
        chestplate: { id: 'netherite_chestplate', name: 'Netherite Chestplate', displayName: 'Netherite Chestplate', count: 1, slot: 38 },
        leggings: { id: 'netherite_leggings', name: 'Netherite Leggings', displayName: 'Netherite Leggings', count: 1, slot: 37 },
        boots: { id: 'netherite_boots', name: 'Netherite Boots', displayName: 'Netherite Boots', count: 1, slot: 36 },
      },
      offhand: { id: 'totem_of_undying', name: 'Totem of Undying', displayName: 'Totem of Undying', count: 1, slot: 40 },
      main: [],
      hotbar: [
        { id: 'netherite_sword', name: 'Netherite Sword', displayName: 'Blade of Mumbai', count: 1, slot: 0 },
        { id: 'netherite_pickaxe', name: 'Netherite Pickaxe', displayName: 'Deepslate Breaker', count: 1, slot: 1 },
        { id: 'golden_apple', name: 'Golden Apple', displayName: 'Golden Apple', count: 64, slot: 2 },
      ]
    },
    statistics: {
      playtimeHours: 54.2,
      playerKills: 8,
      deaths: 2,
      kdr: 4.0,
      distanceTraveledKm: 142.8,
      blocksBroken: 24500,
      itemsUsed: 31200,
      entitiesKilled: 420
    },
    ipAddress: '192.168.1.105'
  },
  {
    uuid: '8667ba71-b85a-4004-af54-457a9734eed7',
    username: 'Steve',
    isOnline: true,
    pingMs: 24,
    health: 18,
    maxHealth: 20,
    foodLevel: 16,
    xpLevel: 19,
    xpProgress: 0.3,
    gamemode: 'survival',
    isOp: false,
    isWhitelisted: true,
    isBanned: false,
    coordinates: { x: 142.4, y: 70.0, z: -312.8, world: 'world', dimension: 'minecraft:overworld' },
    inventory: {
      armor: { helmet: null, chestplate: null, leggings: null, boots: null },
      offhand: null,
      main: [],
      hotbar: [
        { id: 'iron_pickaxe', name: 'Iron Pickaxe', displayName: 'Iron Pickaxe', count: 1, slot: 0 },
        { id: 'bread', name: 'Bread', displayName: 'Bread', count: 16, slot: 1 }
      ]
    },
    statistics: {
      playtimeHours: 12.5,
      playerKills: 1,
      deaths: 5,
      kdr: 0.2,
      distanceTraveledKm: 42.1,
      blocksBroken: 4500,
      itemsUsed: 6200,
      entitiesKilled: 64
    },
    ipAddress: '192.168.1.110'
  },
  {
    uuid: 'ec561538-f3fd-461d-aff5-086e22154bce',
    username: 'Alex',
    isOnline: true,
    pingMs: 31,
    health: 20,
    maxHealth: 20,
    foodLevel: 20,
    xpLevel: 30,
    xpProgress: 0.0,
    gamemode: 'creative',
    isOp: false,
    isWhitelisted: true,
    isBanned: false,
    coordinates: { x: 88.0, y: 65.0, z: 12.5, world: 'world', dimension: 'minecraft:overworld' },
    inventory: {
      armor: { helmet: null, chestplate: null, leggings: null, boots: null },
      offhand: null,
      main: [],
      hotbar: []
    },
    statistics: {
      playtimeHours: 28.1,
      playerKills: 0,
      deaths: 0,
      kdr: 0,
      distanceTraveledKm: 88.4,
      blocksBroken: 12000,
      itemsUsed: 19800,
      entitiesKilled: 12
    },
    ipAddress: '192.168.1.115'
  },
  {
    uuid: '069a79f4-44e9-4726-a5be-fca90e38aaf5',
    username: 'Griefer_01',
    isOnline: false,
    pingMs: 0,
    health: 0,
    maxHealth: 20,
    foodLevel: 0,
    xpLevel: 0,
    xpProgress: 0,
    gamemode: 'survival',
    isOp: false,
    isWhitelisted: false,
    isBanned: true,
    coordinates: { x: 0, y: 60.0, z: 0, world: 'world', dimension: 'minecraft:overworld' },
    inventory: {
      armor: { helmet: null, chestplate: null, leggings: null, boots: null },
      offhand: null,
      main: [],
      hotbar: []
    },
    statistics: {
      playtimeHours: 0.4,
      playerKills: 0,
      deaths: 1,
      kdr: 0,
      distanceTraveledKm: 1.2,
      blocksBroken: 50,
      itemsUsed: 30,
      entitiesKilled: 0
    },
    ipAddress: '10.0.0.88'
  }
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
  { id: '13', timestamp: '14:32:00', level: 'INFO', message: '<Notch> Welcome to Kryin India Server!' },
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
# Running on Indian High-Frequency Dedicated Node
enable-jmx-monitoring=false
rcon.port=25575
level-seed=
gamemode=survival
enable-command-block=true
enable-query=false
generator-settings={}
enforce-secure-profile=false
level-name=world
motd=\\u00a7bKryin Paper Server \\u00a78[\\u00a7aIndia Node\\u00a78]
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
    publicHost: 'in.kryin.host',
    publicPort: 25565,
    localIp: '127.0.0.1',
    localPort: 25565,
    protocol: 'TCP',
  },
  bedrock: {
    publicHost: 'in.kryin.host',
    publicPort: 19132,
    localIp: '127.0.0.1',
    localPort: 19132,
    protocol: 'UDP',
  },
};
