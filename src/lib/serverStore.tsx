'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ServerInfo,
  ServerStatus,
  ServerSummary,
  ServerIpEndpoint,
  HardwareMetrics,
  MetricHistoryPoint,
  MinecraftPlayer,
  ConsoleLogEntry,
  ServerFile,
  RoleMember,
  AuditLog,
  TunnelConfig,
} from '@/types';
import {
  initialServerInfo,
  initialMetrics,
  metricHistory,
  initialPlayers,
  initialLogs,
  initialFiles,
  sampleFileContents,
  initialMembers,
  initialAuditLogs,
  tunnelInfo,
} from './mockData';
import { createClient } from '@/lib/supabase/client';
import type { ServerPermission } from './serverPermissions';
import { parseMinecraftStats } from './minecraftAssets';

interface ServerStoreContextType {
  serverInfo: ServerInfo;
  serverRole: RoleMember['role'] | null;
  permissions: ServerPermission[];
  loadError: boolean;
  serversList: ServerSummary[];
  activeServerId: string | null;
  setActiveServerId: (id: string) => void;
  refreshServers: () => Promise<void>;
  addServer: (name: string, deviceName?: string) => Promise<{ success: boolean; agentToken?: string; server?: any; error?: string }>;
  updateServerSettings: (data: { publicTunnelJava?: string; publicTunnelBedrock?: string; ip_endpoints?: ServerIpEndpoint[]; name?: string }) => Promise<{ success: boolean; error?: string }>;
  saveIpEndpoints: (endpoints: ServerIpEndpoint[]) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isRefreshing: boolean;
  isDeviceConnected: boolean;
  refreshStatus: () => Promise<void>;
  metrics: HardwareMetrics;
  history: MetricHistoryPoint[];
  players: MinecraftPlayer[];
  logs: ConsoleLogEntry[];
  files: Record<string, ServerFile[]>;
  fileContents: Record<string, string>;
  members: RoleMember[];
  auditLogs: AuditLog[];
  tunnel: TunnelConfig;
  isLiveDbConnected: boolean;
  // Actions
  startServer: () => Promise<void>;
  stopServer: () => Promise<void>;
  restartServer: () => Promise<void>;
  killServer: () => Promise<void>;
  fetchDirectory: (dir: string) => Promise<ServerFile[]>;
  fetchFileContent: (path: string) => Promise<string>;
  sendConsoleCommand: (cmd: string) => Promise<string>;
  clearLogs: () => void;
  kickPlayer: (uuid: string, reason?: string) => Promise<void>;
  banPlayer: (uuid: string, reason?: string) => Promise<void>;
  unbanPlayer: (uuid: string) => Promise<void>;
  toggleOp: (uuid: string) => Promise<void>;
  toggleWhitelist: (uuid: string) => Promise<void>;
  healPlayer: (uuid: string) => Promise<void>;
  feedPlayer: (uuid: string) => Promise<void>;
  starvePlayer: (uuid: string) => Promise<void>;
  killPlayer: (uuid: string) => Promise<void>;
  teleportPlayer: (uuid: string, coords?: string) => Promise<void>;
  setGamemode: (uuid: string, mode: MinecraftPlayer['gamemode']) => Promise<void>;
  saveFileContent: (path: string, content: string) => Promise<void>;
  deleteFile: (path: string) => Promise<void>;
  createFolder: (parentPath: string, name: string) => Promise<void>;
  createFile: (parentPath: string, name: string, content?: string) => Promise<void>;
  addWhitelistPlayer: (username: string) => Promise<void>;
  inviteMember: (email: string, role: RoleMember['role'], permissions: string[]) => Promise<void>;
  revokeMember: (id: string) => Promise<void>;
}

const ServerStoreContext = createContext<ServerStoreContextType | null>(null);

export function ServerStoreProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [serversList, setServersList] = useState<ServerSummary[]>([]);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [access, setAccess] = useState<{ serverId: string; role: RoleMember['role']; permissions: ServerPermission[] } | null>(null);
  const selectedAccess = access?.serverId === activeServerId ? access : null;
  const serverRole = selectedAccess?.role ?? null;
  const permissions = selectedAccess?.permissions ?? [];
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState<boolean>(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('operator');

  const [serverInfo, setServerInfo] = useState<ServerInfo>(initialServerInfo);
  const [metrics, setMetrics] = useState<HardwareMetrics>(initialMetrics);
  const [history, setHistory] = useState<MetricHistoryPoint[]>(metricHistory);
  const [players, setPlayers] = useState<MinecraftPlayer[]>(initialPlayers);
  const [logs, setLogs] = useState<ConsoleLogEntry[]>(initialLogs);
  const [files, setFiles] = useState<Record<string, ServerFile[]>>(initialFiles);
  const [fileContents, setFileContents] = useState<Record<string, string>>(sampleFileContents);
  const [members, setMembers] = useState<RoleMember[]>(initialMembers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [tunnel] = useState<TunnelConfig>(tunnelInfo);
  const [isLiveDbConnected, setIsLiveDbConnected] = useState<boolean>(false);
  const pendingTransitionRef = useRef<{
    type: 'starting' | 'stopping' | 'restarting';
    startedAt: number;
  } | null>(null);

  const computeServerStatus = (
    rawStatus: string | undefined,
    isFresh: boolean,
    pending: { type: 'starting' | 'stopping' | 'restarting'; startedAt: number } | null
  ): { status: ServerStatus; clearPending: boolean } => {
    const norm = (rawStatus || 'offline').toLowerCase();
    let current: ServerStatus =
      norm === 'online' && isFresh
        ? 'online'
        : norm === 'starting' || norm === 'stopping' || norm === 'crashed' || norm === 'hibernating'
        ? (norm as ServerStatus)
        : 'offline';

    if (!pending) {
      return { status: current, clearPending: false };
    }

    const elapsed = Date.now() - pending.startedAt;

    if (pending.type === 'restarting') {
      // For the first 5 seconds, ignore previous 'online' status to prevent flickering
      if (elapsed > 5000) {
        if (current === 'online') {
          return { status: 'online', clearPending: true };
        }
        if (current === 'starting') {
          return { status: 'starting', clearPending: false };
        }
      }
      if (current === 'stopping' || current === 'starting') {
        return { status: current, clearPending: false };
      }
      return { status: 'stopping', clearPending: false };
    }

    if (pending.type === 'starting') {
      if (current === 'online') {
        return { status: 'online', clearPending: true };
      }
      if (elapsed < 90000) {
        return { status: 'starting', clearPending: false };
      }
      return { status: current, clearPending: true };
    }

    if (pending.type === 'stopping') {
      if (current === 'offline') {
        return { status: 'offline', clearPending: true };
      }
      if (elapsed < 60000) {
        return { status: 'stopping', clearPending: false };
      }
      return { status: current, clearPending: true };
    }

    return { status: current, clearPending: false };
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setCurrentUserEmail(user.email);
      }
    });
  }, [supabase]);

  // Sync with live server API and database
  useEffect(() => {
    let isMounted = true;

    async function syncLiveServerData() {
      try {
        const queryParam = activeServerId ? `?serverId=${encodeURIComponent(activeServerId)}` : '';
        const res = await fetch(`/api/server/live${queryParam}`);
        if (!res.ok) throw new Error('Could not load servers');
        const data = await res.json();
        if (!data || !isMounted) return;
        setLoadError(false);

        if (Array.isArray(data.servers)) {
          setServersList(data.servers);
          // If activeServerId points to a deleted or unknown server, auto-heal to data.server.id
          if (data.server?.id && (!activeServerId || !data.servers.some((s: any) => s.id === activeServerId))) {
            setActiveServerId(data.server.id);
          }
        } else if (data.server?.id && !activeServerId) {
          setActiveServerId(data.server.id);
        }

        if (!data.server) {
          setAccess(null);
          setServerInfo(initialServerInfo);
          setIsDeviceConnected(false);
          setIsLiveDbConnected(false);
          setMetrics(initialMetrics);
          setLogs([]);
          setPlayers([]);
          return;
        }

        {
          setAccess(data.role ? { serverId: data.server.id, role: data.role, permissions: data.permissions ?? [] } : null);
          setIsLiveDbConnected(true);
          const devConn = Boolean(data.device_connected ?? data.server.device_connected);
          setIsDeviceConnected(devConn);
          if (!activeServerId) {
            setActiveServerId(data.server.id);
          }

          const isFresh = Boolean(data.device_connected ?? devConn);
          const { status: resolvedStatus, clearPending } = computeServerStatus(
            data.server.status,
            isFresh,
            pendingTransitionRef.current
          );
          if (clearPending) {
            pendingTransitionRef.current = null;
          }

          setServerInfo((prev) => {
            const updatedServerInfo: ServerInfo = {
              ...prev,
              id: data.server.id,
              name: data.server.name || prev.name,
              status: resolvedStatus,
              pid: data.server.pid,
              device: data.server.device || prev.device || 'Indian Node',
              deviceConnected: devConn || resolvedStatus === 'online' || resolvedStatus === 'starting' || resolvedStatus === 'stopping',
              uptimeSeconds: data.server.uptime_seconds ?? prev.uptimeSeconds,
              agentConnected: devConn,
              lastHeartbeat: data.server.last_heartbeat ? new Date(data.server.last_heartbeat).toLocaleTimeString() : prev.lastHeartbeat,
              onlinePlayers: data.server.online_players ?? prev.onlinePlayers,
              maxPlayers: data.server.max_players ?? prev.maxPlayers,
              tps: Number(data.server.tps ?? prev.tps),
              localIp: data.server.local_ip ?? prev.localIp,
              publicTunnelJava: data.server.public_tunnel_java !== undefined ? data.server.public_tunnel_java : prev.publicTunnelJava,
              publicTunnelBedrock: data.server.public_tunnel_bedrock !== undefined ? data.server.public_tunnel_bedrock : prev.publicTunnelBedrock,
              ipEndpoints: data.server.ip_endpoints || prev.ipEndpoints,
            };

            return updatedServerInfo;
          });
        }

        if (data.metrics) {
          setMetrics((prev) => ({
            ...prev,
            totalRamMb: data.metrics.totalRamMb,
            usedRamMb: data.metrics.usedRamMb,
            availableRamMb: data.metrics.totalRamMb - data.metrics.usedRamMb,
            javaHeapUsedMb: data.metrics.javaHeapUsedMb,
            javaHeapMaxMb: data.metrics.javaHeapMaxMb,
            cpuUsagePercent: data.metrics.cpuUsagePercent,
            cpuTempC: data.metrics.cpuTempC,
            batteryPercent: data.metrics.batteryPercent,
            isCharging: data.metrics.isCharging,
            powerSource: data.metrics.powerSource || 'Battery',
          }));
        }

        if (Array.isArray(data.logs)) {
          setLogs(data.logs.map((l: any) => ({
            id: l.id,
            timestamp: l.timestamp ? (l.timestamp.includes('T') ? new Date(l.timestamp).toLocaleTimeString() : l.timestamp) : new Date().toLocaleTimeString(),
            level: l.level || 'INFO',
            message: l.message,
          })));
        }

        if (Array.isArray(data.players)) {
          setPlayers(
            data.players.map((p: any) => {
              const inv = p.inventory || {};
              const parsed = parseMinecraftStats(p.statistics);

              return {
                uuid: p.uuid,
                username: p.username,
                isOnline: Boolean(p.is_online),
                pingMs: p.ping_ms || 0,
                health: Number(p.health ?? 20),
                maxHealth: Number(p.max_health ?? 20),
                foodLevel: Number(p.food_level ?? 20),
                saturation: Number(p.saturation ?? 5),
                xpLevel: Number(p.xp_level ?? 0),
                xpProgress: Number(p.xp_progress ?? 0),
                gamemode: p.gamemode || 'survival',
                isOp: Boolean(p.is_op),
                isWhitelisted: Boolean(p.is_whitelisted),
                isBanned: Boolean(p.is_banned),
                coordinates: p.coordinates || {
                  x: 0,
                  y: 64,
                  z: 0,
                  world: 'world',
                  dimension: 'minecraft:overworld',
                },
                respawnCoordinates: p.coordinates?.respawn || null,
                deathCoordinates: p.coordinates?.death || null,
                inventory: {
                  armor: inv.armor || { helmet: null, chestplate: null, leggings: null, boots: null },
                  offhand: inv.offhand || null,
                  main: Array.isArray(inv.main) ? inv.main : new Array(27).fill(null),
                  hotbar: Array.isArray(inv.hotbar) ? inv.hotbar : new Array(9).fill(null),
                },
                statistics: {
                  playtimeHours: Math.round((parsed.playtimeTicks / (20 * 3600)) * 10) / 10,
                  playerKills: parsed.playerKills,
                  deaths: parsed.deaths,
                  kdr: Number(parsed.kdr) || 0,
                  distanceTraveledKm: Math.round((parsed.distanceTotal / 1000) * 10) / 10,
                  blocksBroken: parsed.blocksBrokenTotal,
                  itemsUsed: parsed.itemsUsedTotal,
                  entitiesKilled: parsed.entitiesKilledTotal,
                  rawStats: p.statistics || {},
                },
                ipAddress: p.ip_address || '',
                lastSeen: p.last_seen || (p.is_online ? 'Online now' : 'Offline'),
              };
            })
          );
        }
      } catch (err) {
        if (isMounted) setLoadError(true);
        console.warn('Live server sync warning:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    syncLiveServerData();
    const interval = setInterval(syncLiveServerData, 1000); // 1-second ultra-responsive polling (Pterodactyl parity)

    // Refresh instantly when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncLiveServerData();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', syncLiveServerData);

    // Supabase Realtime channel for millisecond log streaming and instant server status updates
    const currentServerId = activeServerId || serverInfo.id;
    const realtimeChannel = supabase
      .channel(`kryin-realtime-${currentServerId || 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'server_logs',
        },
        (payload: any) => {
          const newRow = payload?.new;
          if (newRow && (!currentServerId || newRow.server_id === currentServerId)) {
            setLogs((prev) => {
              if (prev.some((l) => l.id === newRow.id)) return prev;
              const formattedTs = newRow.timestamp
                ? newRow.timestamp.includes('T')
                  ? new Date(newRow.timestamp).toLocaleTimeString()
                  : newRow.timestamp
                : new Date().toLocaleTimeString();
              return [
                ...prev,
                {
                  id: newRow.id,
                  timestamp: formattedTs,
                  level: newRow.level || 'INFO',
                  message: newRow.message,
                },
              ];
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'servers',
        },
        (payload: any) => {
          const updated = payload?.new;
          if (updated && (!currentServerId || updated.id === currentServerId)) {
            const hbTime = updated.last_heartbeat ? new Date(updated.last_heartbeat).getTime() : 0;
            const isFresh = Date.now() - hbTime < 45 * 1000;
            const { status: resolvedStatus, clearPending } = computeServerStatus(
              updated.status,
              isFresh,
              pendingTransitionRef.current
            );
            if (clearPending) {
              pendingTransitionRef.current = null;
            }
            setServerInfo((prev) => ({
              ...prev,
              status: resolvedStatus,
              tps: Number(updated.tps || prev.tps),
              onlinePlayers: updated.online_players ?? prev.onlinePlayers,
              maxPlayers: updated.max_players ?? prev.maxPlayers,
              uptimeSeconds: updated.uptime_seconds ?? prev.uptimeSeconds,
              deviceConnected: isFresh || resolvedStatus === 'starting' || resolvedStatus === 'stopping' || resolvedStatus === 'online',
            }));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', syncLiveServerData);
      supabase.removeChannel(realtimeChannel);
    };
  }, [activeServerId]);

  const addServer = async (name: string, deviceName?: string) => {
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, device_name: deviceName }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
          window.location.href = '/login?next=/dashboard';
        }
        return { success: false, error: data.error || 'Failed to create server' };
      }
      if (data.server?.id) {
        setActiveServerId(data.server.id);
        setServersList((prev) => [
          ...prev,
          {
            id: data.server.id,
            name: data.server.name,
            status: 'offline',
            device: data.server.device_name,
            localIp: data.server.local_ip,
            publicTunnelJava: data.server.public_tunnel_java,
          },
        ]);
      }
      return { success: true, server: data.server, agentToken: data.agentToken };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const refreshServers = async () => {
    try {
      const res = await fetch('/api/servers');
      const data = await res.json();
      if (res.ok && Array.isArray(data.servers)) {
        setServersList(data.servers);
      }
    } catch (e) {
      console.warn('Failed to refresh servers:', e);
    }
  };

  const updateServerSettings = async (data: { publicTunnelJava?: string; publicTunnelBedrock?: string; ip_endpoints?: ServerIpEndpoint[]; name?: string }) => {
    try {
      const targetId = activeServerId || serverInfo.id;
      if (!targetId) return { success: false, error: 'No active server selected' };

      const res = await fetch('/api/server/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverId: targetId,
          ...data,
        }),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 && typeof window !== 'undefined') {
          window.location.href = '/login?next=/dashboard';
        }
        return { success: false, error: resData.error || 'Failed to update server' };
      }
      if (resData.server) {
        setServerInfo((prev) => {
          const updated = {
            ...prev,
            name: resData.server.name ?? prev.name,
            publicTunnelJava: resData.server.public_tunnel_java !== undefined ? resData.server.public_tunnel_java : prev.publicTunnelJava,
            publicTunnelBedrock: resData.server.public_tunnel_bedrock !== undefined ? resData.server.public_tunnel_bedrock : prev.publicTunnelBedrock,
            ipEndpoints: data.ip_endpoints !== undefined ? data.ip_endpoints : (resData.server.ip_endpoints || prev.ipEndpoints),
          };
          return updated;
        });

        setServersList((prev) =>
          prev.map((s) =>
            s.id === targetId
              ? {
                  ...s,
                  name: resData.server.name ?? s.name,
                  publicTunnelJava: resData.server.public_tunnel_java !== undefined ? resData.server.public_tunnel_java : s.publicTunnelJava,
                }
              : s
          )
        );
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveIpEndpoints = async (endpoints: ServerIpEndpoint[]) => {
    return updateServerSettings({ ip_endpoints: endpoints });
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const queryParam = activeServerId ? `?serverId=${encodeURIComponent(activeServerId)}` : '';
      const res = await fetch(`/api/server/live${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.server) {
          const devConn = Boolean(data.device_connected ?? data.server.device_connected);
          setIsDeviceConnected(devConn);
          setServerInfo((prev) => ({
            ...prev,
            ...data.server,
            deviceConnected: devConn,
          }));
        }
      }
    } catch (e) {
      console.warn('Status refresh warning:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const addAudit = (action: string, target: string, details: string) => {
    const newAudit: AuditLog = {
      id: 'audit-' + Date.now(),
      userId: 'current-user',
      userEmail: currentUserEmail,
      action,
      target,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success',
      details,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  const dispatchServerCommand = async (commandType: string, payload: object = {}) => {
    const response = await fetch('/api/server/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        server_id: activeServerId || serverInfo.id,
        command_type: commandType,
        payload,
      }),
    });
    if (response.status === 401) {
      window.location.assign('/login?next=/dashboard');
      return;
    }
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || 'Could not send the command.');
    }
  };

  const startServer = async () => {
    pendingTransitionRef.current = { type: 'starting', startedAt: Date.now() };
    setServerInfo((prev) => ({ ...prev, status: 'starting' }));
    setLogs([]); // Immediately clear console for fresh running Minecraft instance
    await dispatchServerCommand('START');
    addAudit('SERVER_START', serverInfo.name || 'Paper Server', 'Dispatched START signal to node agent');
  };

  const stopServer = async () => {
    pendingTransitionRef.current = { type: 'stopping', startedAt: Date.now() };
    setServerInfo((prev) => ({ ...prev, status: 'stopping' }));
    await dispatchServerCommand('STOP');
    addAudit('SERVER_STOP', serverInfo.name || 'Paper Server', 'Dispatched STOP signal to node agent');
  };

  const restartServer = async () => {
    pendingTransitionRef.current = { type: 'restarting', startedAt: Date.now() };
    setServerInfo((prev) => ({ ...prev, status: 'stopping' }));
    setLogs([]); // Immediately clear console for fresh running Minecraft instance
    await dispatchServerCommand('RESTART');
    addAudit('SERVER_RESTART', serverInfo.name || 'Paper Server', 'Dispatched RESTART signal to node agent');
  };

  const killServer = async () => {
    pendingTransitionRef.current = null;
    setServerInfo((prev) => ({ ...prev, status: 'offline', pid: null, tps: 0 }));
    await dispatchServerCommand('KILL');
    addAudit('SERVER_KILL', serverInfo.name || 'Paper Server', 'Forcibly sent SIGKILL to node agent');
  };

  const fetchDirectory = async (dir: string): Promise<ServerFile[]> => {
    try {
      const serverParam = activeServerId ? `&serverId=${encodeURIComponent(activeServerId)}` : '';
      const res = await fetch(`/api/server/files?action=list&dir=${encodeURIComponent(dir)}${serverParam}`);
      if (!res.ok) {
        setFiles((prev) => ({ ...prev, [dir]: [] }));
        return [];
      }
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.files)) {
        const fetchedFiles: ServerFile[] = json.data.files;
        setFiles((prev) => ({ ...prev, [dir]: fetchedFiles }));
        return fetchedFiles;
      }
    } catch (e) {
      console.warn('Directory fetch warning:', e);
    }
    return files[dir] || [];
  };

  const fetchFileContent = async (path: string): Promise<string> => {
    try {
      const serverParam = activeServerId ? `&serverId=${encodeURIComponent(activeServerId)}` : '';
      const res = await fetch(`/api/server/files?action=read&path=${encodeURIComponent(path)}${serverParam}`);
      if (!res.ok) return '';
      const json = await res.json();
      if (json.success && json.data?.content !== undefined) {
        const content = json.data.content;
        return content;
      }
    } catch (e) {
      console.warn('File read warning:', e);
    }
    return '';
  };

  const sendConsoleCommand = async (cmd: string): Promise<string> => {
    const trimmed = cmd.trim();
    if (!trimmed) return '';

    await dispatchServerCommand('CONSOLE_CMD', { command: trimmed });
    addAudit('CONSOLE_COMMAND', trimmed, 'Executed via operator terminal');
    return '';
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const kickPlayer = async (uuid: string, reason = 'Kicked by administrator') => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, isOnline: false, lastSeen: 'Just now' } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`kick ${target} ${reason}`);
    addAudit('PLAYER_KICK', target, reason);
  };

  const banPlayer = async (uuid: string, reason = 'Banned by operator') => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, isOnline: false, isBanned: true } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`ban ${target} ${reason}`);
    addAudit('PLAYER_BAN', target, reason);
  };

  const unbanPlayer = async (uuid: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, isBanned: false } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`pardon ${target}`);
    addAudit('PLAYER_UNBAN', target, 'Pardoned from ban list');
  };

  const toggleOp = async (uuid: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.uuid === uuid) {
          const nextOp = !p.isOp;
          sendConsoleCommand(nextOp ? `op ${p.username}` : `deop ${p.username}`);
          addAudit('PLAYER_OP_CHANGE', p.username, nextOp ? 'Granted OP' : 'Revoked OP');
          return { ...p, isOp: nextOp };
        }
        return p;
      })
    );
  };

  const toggleWhitelist = async (uuid: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.uuid === uuid) {
          const nextWl = !p.isWhitelisted;
          sendConsoleCommand(nextWl ? `whitelist add ${p.username}` : `whitelist remove ${p.username}`);
          addAudit('PLAYER_WHITELIST', p.username, nextWl ? 'Added to whitelist' : 'Removed from whitelist');
          return { ...p, isWhitelisted: nextWl };
        }
        return p;
      })
    );
  };

  const healPlayer = async (uuid: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, health: p.maxHealth } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`effect give ${target} minecraft:instant_health 1 255 true`);
    supabase.from('server_players').update({ health: 20.0 }).eq('uuid', uuid);
    addAudit('PLAYER_HEAL', target, 'Restored full health');
  };

  const feedPlayer = async (uuid: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, foodLevel: 20, saturation: 20 } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`effect give ${target} minecraft:saturation 1 255 true`);
    supabase.from('server_players').update({ food_level: 20, saturation: 20 }).eq('uuid', uuid);
    addAudit('PLAYER_FEED', target, 'Restored full food level');
  };

  const starvePlayer = async (uuid: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, foodLevel: 0, saturation: 0 } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`effect give ${target} minecraft:hunger 10 255 true`);
    supabase.from('server_players').update({ food_level: 0, saturation: 0 }).eq('uuid', uuid);
    addAudit('PLAYER_STARVE', target, 'Starved player');
  };

  const killPlayer = async (uuid: string) => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, health: 0 } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`kill ${target}`);
    supabase.from('server_players').update({ health: 0.0 }).eq('uuid', uuid);
    addAudit('PLAYER_KILL', target, 'Executed player kill');
  };

  const teleportPlayer = async (uuid: string, coords = '0 70 0') => {
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`tp ${target} ${coords}`);
    addAudit('PLAYER_TELEPORT', target, `Teleported player to ${coords}`);
  };

  const setGamemode = async (uuid: string, mode: MinecraftPlayer['gamemode']) => {
    setPlayers((prev) =>
      prev.map((p) => (p.uuid === uuid ? { ...p, gamemode: mode } : p))
    );
    const target = players.find((p) => p.uuid === uuid)?.username || uuid;
    sendConsoleCommand(`gamemode ${mode} ${target}`);
    supabase.from('server_players').update({ gamemode: mode }).eq('uuid', uuid);
    addAudit('PLAYER_GAMEMODE', target, `Changed gamemode to ${mode}`);
  };

  const saveFileContent = async (path: string, content: string) => {
    setFileContents((prev) => ({ ...prev, [path]: content }));
    await fetch('/api/server/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        serverId: activeServerId || serverInfo.id,
        path,
        content,
      }),
    });
    addAudit('FILE_SAVE', path, `Saved file (${content.length} characters)`);
  };

  const deleteFile = async (path: string) => {
    const parentDir = path.substring(0, path.lastIndexOf('/')) || '/';
    setFiles((prev) => {
      const existing = prev[parentDir] || [];
      return {
        ...prev,
        [parentDir]: existing.filter((f) => f.path !== path),
      };
    });
    await fetch('/api/server/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        serverId: activeServerId || serverInfo.id,
        path,
      }),
    });
    addAudit('FILE_DELETE', path, 'Deleted file from server');
  };

  const createFolder = async (parentPath: string, name: string) => {
    const cleanParent = parentPath === '/' ? '' : parentPath;
    const fullPath = `${cleanParent}/${name}`;
    const newDir: ServerFile = {
      name,
      path: fullPath,
      isDirectory: true,
      sizeBytes: 4096,
      modifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setFiles((prev) => ({
      ...prev,
      [parentPath]: [...(prev[parentPath] || []), newDir],
      [fullPath]: [],
    }));
    await fetch('/api/server/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_folder',
        serverId: activeServerId || serverInfo.id,
        directory: parentPath,
        name,
      }),
    });
    addAudit('CREATE_FOLDER', fullPath, 'Created directory');
  };

  const createFile = async (parentPath: string, name: string, content = '') => {
    const cleanParent = parentPath === '/' ? '' : parentPath;
    const fullPath = `${cleanParent}/${name}`;
    const newF: ServerFile = {
      name,
      path: fullPath,
      isDirectory: false,
      sizeBytes: content.length,
      modifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      extension: name.split('.').pop() || '',
    };
    setFiles((prev) => ({
      ...prev,
      [parentPath]: [...(prev[parentPath] || []), newF],
    }));
    setFileContents((prev) => ({ ...prev, [fullPath]: content }));
    await fetch('/api/server/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_file',
        serverId: activeServerId || serverInfo.id,
        directory: parentPath,
        name,
        content,
      }),
    });
    addAudit('CREATE_FILE', fullPath, 'Created file');
  };

  const addWhitelistPlayer = async (username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;
    await sendConsoleCommand(`whitelist add ${trimmed}`);
    addAudit('PLAYER_WHITELIST_ADD', trimmed, 'Added to whitelist');
  };

  const inviteMember = async (email: string, role: RoleMember['role'], permissions: string[]) => {
    const newMember: RoleMember = {
      id: 'mem-' + Date.now(),
      email,
      displayName: email.split('@')[0],
      role,
      customPermissions: permissions,
      invitedAt: new Date().toISOString(),
      isPending: true,
    };
    setMembers((prev) => [...prev, newMember]);
    addAudit('MEMBER_INVITE', email, `Invited with role: ${role}`);
  };

  const revokeMember = async (id: string) => {
    const member = members.find((m) => m.id === id);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    if (member) {
      addAudit('MEMBER_REVOKE', member.email, 'Access revoked');
    }
  };

  return (
    <ServerStoreContext.Provider
      value={{
        serverInfo,
        serverRole,
        permissions,
        loadError,
        serversList,
        activeServerId,
        setActiveServerId,
        addServer,
        refreshServers,
        updateServerSettings,
        saveIpEndpoints,
        isLoading,
        isRefreshing,
        isDeviceConnected,
        refreshStatus,
        metrics,
        history,
        players,
        logs,
        files,
        fileContents,
        members,
        auditLogs,
        tunnel,
        isLiveDbConnected,
        startServer,
        stopServer,
        restartServer,
        killServer,
        fetchDirectory,
        fetchFileContent,
        sendConsoleCommand,
        clearLogs,
        kickPlayer,
        banPlayer,
        unbanPlayer,
        toggleOp,
        toggleWhitelist,
        healPlayer,
        feedPlayer,
        starvePlayer,
        killPlayer,
        teleportPlayer,
        setGamemode,
        saveFileContent,
        deleteFile,
        createFolder,
        createFile,
        addWhitelistPlayer,
        inviteMember,
        revokeMember,
      }}
    >
      {children}
    </ServerStoreContext.Provider>
  );
}

export function useServerStore() {
  const context = useContext(ServerStoreContext);
  if (!context) {
    throw new Error('useServerStore must be used within a ServerStoreProvider');
  }
  return context;
}
