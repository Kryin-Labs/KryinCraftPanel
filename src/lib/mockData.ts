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

export const initialPlayers: MinecraftPlayer[] = [];

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
