// Core types for KryinCraftPanel

export type ServerStatus = 'online' | 'offline' | 'starting' | 'stopping' | 'hibernating' | 'crashed' | 'unknown';

export type UserRole = 'owner' | 'admin' | 'operator' | 'viewer';

export interface HardwareMetrics {
  totalRamMb: number;
  usedRamMb: number;
  availableRamMb: number;
  javaHeapUsedMb: number;
  javaHeapMaxMb: number;
  cpuUsagePercent: number;
  cpuTempC: number | null; // null if unreadable in Android 13
  batteryPercent: number;
  batteryTempC: number | null;
  isCharging: boolean;
  powerSource: string; // e.g. "USB-PD", "AC", "Battery"
  timestamp: string;
}

export interface MetricHistoryPoint {
  time: string;
  cpu: number;
  ramPhone: number;
  ramJava: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  displayName: string;
  count: number;
  slot: number; // 0-8 hotbar, 9-35 main inventory, 36-39 armor, 40 offhand
  durability?: number;
  maxDurability?: number;
  lore?: string[];
  enchantments?: { name: string; level: number }[];
  enchantmentGlint?: boolean;
  iconUrl?: string;
  container?: InventoryItem[];
  containerPartial?: boolean;
}

export interface PlayerInventory {
  armor: {
    helmet: InventoryItem | null;
    chestplate: InventoryItem | null;
    leggings: InventoryItem | null;
    boots: InventoryItem | null;
  };
  offhand: InventoryItem | null;
  main: (InventoryItem | null)[]; // 27 slots (3 rows of 9)
  hotbar: (InventoryItem | null)[]; // 9 slots
  enderChest?: (InventoryItem | null)[];
}

export interface PlayerStatistics {
  playtimeHours: number;
  playerKills: number;
  deaths: number;
  kdr: number;
  distanceTraveledKm: number;
  blocksBroken: number;
  itemsUsed: number;
  entitiesKilled: number;
  rawStats?: any;
}

export interface MinecraftPlayer {
  uuid: string;
  username: string;
  isOnline: boolean;
  pingMs?: number;
  health: number; // 0 to 20
  maxHealth: number;
  foodLevel: number; // 0 to 20
  saturation?: number;
  xpLevel: number;
  xpProgress: number; // 0 to 1
  gamemode: 'survival' | 'creative' | 'adventure' | 'spectator';
  isOp: boolean;
  isWhitelisted: boolean;
  isBanned: boolean;
  coordinates: {
    x: number;
    y: number;
    z: number;
    world: string;
    dimension: 'minecraft:overworld' | 'minecraft:the_nether' | 'minecraft:the_end' | string;
  };
  respawnCoordinates?: {
    x: number;
    y: number;
    z: number;
    dimension?: string;
  };
  deathCoordinates?: {
    x: number;
    y: number;
    z: number;
    dimension?: string;
  };
  inventory: PlayerInventory;
  inventoryAvailable?: boolean;
  inventorySavedAt?: string;
  savedProfile?: { uuid: string; username: string };
  statistics: PlayerStatistics;
  lastSeen?: string;
  ipAddress?: string;
}

export interface ConsoleLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string;
}

export interface ServerFile {
  name: string;
  path: string;
  isDirectory: boolean;
  sizeBytes: number;
  modifiedAt: string;
  extension?: string;
}

export interface RoleMember {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  customPermissions: string[];
  invitedAt: string;
  joinedAt?: string;
  isPending?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  target?: string;
  timestamp: string;
  status: 'success' | 'failed';
  details?: string;
}

export interface TunnelConfig {
  java: {
    publicHost: string;
    publicPort: number;
    localIp: string;
    localPort: number;
    protocol: 'TCP';
  };
  bedrock: {
    publicHost: string;
    publicPort: number;
    localIp: string;
    localPort: number;
    protocol: 'UDP';
  };
}

export interface ServerIpEndpoint {
  id: string;
  type: 'java' | 'bedrock' | 'lan' | 'other';
  label: string;
  host: string;
  port: number | string;
  isPrimary?: boolean;
}

export interface ServerSummary {
  shared?: boolean;
  id: string;
  name: string;
  status: ServerStatus;
  device?: string;
  deviceConnected?: boolean;
  localIp?: string;
  publicTunnelJava?: string | null;
  lastHeartbeat?: string | null;
  ipEndpoints?: ServerIpEndpoint[];
}

export interface ServerInfo {
  id: string;
  name: string;
  status: ServerStatus;
  pid: number | null;
  minecraftVersion: string;
  paperBuild: number;
  geyserVersion: string;
  device: string;
  deviceConnected?: boolean;
  androidVersion: string;
  uptimeSeconds: number;
  lastStartup: string | null;
  lastShutdown: string | null;
  agentConnected: boolean;
  lastHeartbeat: string;
  onlinePlayers: number;
  maxPlayers: number;
  tps: number;
  publicTunnelJava?: string | null;
  publicTunnelBedrock?: string | null;
  ipEndpoints?: ServerIpEndpoint[];
  localIp?: string;
}
