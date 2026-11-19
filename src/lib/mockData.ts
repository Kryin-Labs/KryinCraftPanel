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

// Zero mock data. All real data is hydrated from the Supabase database.
export const initialServerInfo: ServerInfo = {
  id: '',
  name: '',
  status: 'unknown',
  pid: null,
  minecraftVersion: '',
  paperBuild: 0,
  geyserVersion: '',
  device: '',
  androidVersion: '',
  uptimeSeconds: 0,
  lastStartup: null,
  lastShutdown: null,
  agentConnected: false,
  lastHeartbeat: '',
  onlinePlayers: 0,
  maxPlayers: 20,
  tps: 0.0,
  localIp: '',
  publicTunnelJava: null,
  publicTunnelBedrock: null,
};

export const initialMetrics: HardwareMetrics = {
  totalRamMb: 0,
  usedRamMb: 0,
  availableRamMb: 0,
  javaHeapUsedMb: 0,
  javaHeapMaxMb: 0,
  cpuUsagePercent: 0,
  cpuTempC: null,
  batteryPercent: 0,
  batteryTempC: null,
  isCharging: false,
  powerSource: 'Standby',
  timestamp: '',
};

export const metricHistory: MetricHistoryPoint[] = [];

export const initialPlayers: MinecraftPlayer[] = [];

export const initialLogs: ConsoleLogEntry[] = [];

export const initialFiles: Record<string, ServerFile[]> = {};

export const sampleFileContents: Record<string, string> = {};

export const initialMembers: RoleMember[] = [];

export const initialAuditLogs: AuditLog[] = [];

export const tunnelInfo: TunnelConfig = {
  java: {
    publicHost: '',
    publicPort: 25565,
    localIp: '',
    localPort: 25565,
    protocol: 'TCP',
  },
  bedrock: {
    publicHost: '',
    publicPort: 19132,
    localIp: '',
    localPort: 19132,
    protocol: 'UDP',
  },
};
