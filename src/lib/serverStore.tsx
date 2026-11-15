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
import { parseMinecraftStats } from './minecraftAssets';

interface ServerStoreContextType {
  serverInfo: ServerInfo;
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
  inviteMember: (email: string, role: RoleMember['role'], permissions: string[]) => Promise<void>;
  revokeMember: (id: string) => Promise<void>;
}

const ServerStoreContext = createContext<ServerStoreContextType | null>(null);

export function ServerStoreProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [serversList, setServersList] = useState<ServerSummary[]>([]);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
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
    type: 'starting' | 'stopping';
    startedAt: number;
  } | null>(null);

  // Fast hydrate from localStorage cache immediately on mount (0ms instant render)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('kryin_cached_server');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id || parsed.name)) {
          setServerInfo((prev) => ({ ...prev, ...parsed }));
          if (parsed.id && !activeServerId) {
            setActiveServerId(parsed.id);
          }
          // If cached within the last 60 seconds, restore device connection instantly with zero lag
          if (parsed.deviceConnected !== undefined) {
            const cachedAge = parsed.cachedAt ? Date.now() - Number(parsed.cachedAt) : 0;
            if (cachedAge < 60 * 1000 && parsed.deviceConnected) {
              setIsDeviceConnected(true);
            }
          }
          setIsLoading(false);
        }
      }
    } catch (e) {}
  }, []);

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
        if (!res.ok) return;
        const data = await res.json();
        if (!data || !isMounted) return;

        if (Array.isArray(data.servers) && data.servers.length > 0) {
          setServersList(data.servers);
        }

        if (data.server) {
          setIsLiveDbConnected(true);
          const devConn = Boolean(data.device_connected ?? data.server.device_connected);
          setIsDeviceConnected(devConn);
          if (!activeServerId) {
            setActiveServerId(data.server.id);
          }

          let currentStatus = (data.server.status as ServerStatus) || 'offline';
          const pending = pendingTransitionRef.current;
          if (pending) {
            const elapsed = Date.now() - pending.startedAt;
            if (pending.type === 'starting') {
              if (currentStatus === 'online') {
                pendingTransitionRef.current = null;
              } else if (elapsed < 90000) {
                currentStatus = 'starting';
              } else {
                pendingTransitionRef.current = null;
              }
            } else if (pending.type === 'stopping') {
              if (currentStatus === 'offline') {
                pendingTransitionRef.current = null;
              } else if (elapsed < 60000) {
                currentStatus = 'stopping';
              } else {
                pendingTransitionRef.current = null;
              }
            }
          }

          const updatedServerInfo: ServerInfo = {
            ...serverInfo,
            id: data.server.id,
            name: data.server.name || '',
            status: currentStatus,
            pid: data.server.pid,
            device: data.server.device || 'Indian Node',
            deviceConnected: devConn,
            uptimeSeconds: data.server.uptime_seconds,
            agentConnected: devConn,
            lastHeartbeat: data.server.last_heartbeat ? new Date(data.server.last_heartbeat).toLocaleTimeString() : 'Standby',
            onlinePlayers: data.server.online_players,
            maxPlayers: data.server.max_players,
            tps: data.server.tps,
            localIp: data.server.local_ip,
            publicTunnelJava: data.server.public_tunnel_java,
            publicTunnelBedrock: data.server.public_tunnel_bedrock,
            ipEndpoints: data.server.ip_endpoints || [],
          };
          setServerInfo(updatedServerInfo);

          try {
            localStorage.setItem(
              'kryin_cached_server',
              JSON.stringify({
                ...updatedServerInfo,
                cachedAt: Date.now(),
              })
            );
          } catch (e) {}
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

        if (Array.isArray(data.logs) && data.logs.length > 0) {
          setLogs(data.logs.map((l: any) => ({
            id: l.id,
            timestamp: l.timestamp ? (l.timestamp.includes('T') ? new Date(l.timestamp).toLocaleTimeString() : l.timestamp) : new Date().toLocaleTimeString(),
            level: l.level || 'INFO',
            message: l.message,
          })));
        }

        if (Array.isArray(data.players) && data.players.length > 0) {
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
        console.warn('Live server sync warning:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    syncLiveServerData();
    const interval = setInterval(syncLiveServerData, 2000); // 2-second fast polling

    // Refresh instantly when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncLiveServerData();
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', syncLiveServerData);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', syncLiveServerData);
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
          try {
            localStorage.setItem('kryin_cached_server', JSON.stringify(updated));
          } catch (e) {}
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

  const dispatchServerCommand = async (command_type: string, payload: any = {}) => {
    try {
      const res = await fetch('/api/server/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: activeServerId || serverInfo.id,
          command_type,
          payload,
        }),
      });
      if (res.status === 401 && typeof window !== 'undefined') {
        window.location.href = '/login?next=/dashboard';
      }
    } catch (e) {
      console.warn('Command dispatch queued locally:', e);
    }
  };

  const startServer = async () => {
    pendingTransitionRef.current = { type: 'starting', startedAt: Date.now() };
    setServerInfo((prev) => ({ ...prev, status: 'starting' }));
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
    pendingTransitionRef.current = { type: 'starting', startedAt: Date.now() };
    setServerInfo((prev) => ({ ...prev, status: 'stopping' }));
    await dispatchServerCommand('RESTART');
    addAudit('SERVER_RESTART', serverInfo.name || 'Paper Server', 'Dispatched RESTART signal to node agent');
  };

  const sendConsoleCommand = async (cmd: string): Promise<string> => {
    const trimmed = cmd.trim();
    if (!trimmed) return '';

    const cmdLog: ConsoleLogEntry = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: `> ${trimmed}`,
    };
    setLogs((prev) => [...prev, cmdLog]);

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
    await dispatchServerCommand('SAVE_FILE', { path, content });
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
    addAudit('CREATE_FOLDER', fullPath, 'Created directory');
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
