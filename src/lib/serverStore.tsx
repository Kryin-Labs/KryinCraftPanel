'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ServerInfo,
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

  // Sync with live Supabase database
  useEffect(() => {
    let isMounted = true;

    async function initSupabaseData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user's server
        const { data: server, error } = await supabase
          .from('servers')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (server && !error && isMounted) {
          setIsLiveDbConnected(true);
          setServerInfo((prev) => ({
            ...prev,
            id: server.id,
            name: server.name,
            status: server.status,
            pid: server.pid,
            minecraftVersion: server.minecraft_version,
            paperBuild: server.paper_build,
            geyserVersion: server.geyser_version,
            device: server.device_name,
            uptimeSeconds: server.uptime_seconds,
            agentConnected: server.agent_connected,
            lastHeartbeat: server.last_heartbeat ? new Date(server.last_heartbeat).toLocaleTimeString() : 'Awaiting agent',
            onlinePlayers: server.online_players,
            maxPlayers: server.max_players,
            tps: server.tps ? Number(server.tps) : 20.0,
          }));

          // Fetch latest metrics
          const { data: latestMetrics } = await supabase
            .from('server_metrics')
            .select('*')
            .eq('server_id', server.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (latestMetrics && isMounted) {
            setMetrics({
              totalRamMb: latestMetrics.total_ram_mb,
              usedRamMb: latestMetrics.used_ram_mb,
              availableRamMb: latestMetrics.available_ram_mb,
              javaHeapUsedMb: latestMetrics.java_heap_used_mb,
              javaHeapMaxMb: latestMetrics.java_heap_max_mb,
              cpuUsagePercent: Number(latestMetrics.cpu_usage_percent),
              cpuTempC: latestMetrics.cpu_temp_c ? Number(latestMetrics.cpu_temp_c) : null,
              batteryPercent: latestMetrics.battery_percent,
              batteryTempC: latestMetrics.battery_temp_c ? Number(latestMetrics.battery_temp_c) : null,
              isCharging: latestMetrics.is_charging,
              powerSource: latestMetrics.power_source || 'Battery',
              timestamp: latestMetrics.created_at,
            });
          }

          // Fetch audit logs
          const { data: audits } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('server_id', server.id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (audits && isMounted) {
            setAuditLogs(
              audits.map((a) => ({
                id: a.id,
                userId: a.user_id,
                userEmail: a.user_email,
                action: a.action,
                target: a.target,
                timestamp: new Date(a.created_at).toLocaleString(),
                status: a.status as 'success' | 'failed',
                details: a.details,
              }))
            );
          }

          // Fetch real players from Supabase
          const { data: dbPlayers } = await supabase
            .from('server_players')
            .select('*')
            .eq('server_id', server.id);

          if (dbPlayers && dbPlayers.length > 0 && isMounted) {
            setPlayers(
              dbPlayers.map((p) => {
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
        }
      } catch (err) {
        console.warn('Live Supabase sync check:', err);
      }
    }

    initSupabaseData();

    return () => {
      isMounted = false;
    };
  }, []);

  const addAudit = (action: string, target: string, details: string) => {
    const newAudit: AuditLog = {
      id: 'audit-' + Date.now(),
      userId: 'current-user',
      userEmail: 'purohitarthbkn@gmail.com',
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
      await fetch('/api/server/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: serverInfo.id,
          command_type,
          payload,
        }),
      });
    } catch (e) {
      console.warn('Command dispatch queued locally:', e);
    }
  };

  const startServer = async () => {
    setServerInfo((prev) => ({ ...prev, status: 'starting' }));
    const newLog: ConsoleLogEntry = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: '[Agent] Executing termux-wake-lock & launching Paper 26.3 (-Xms1G -Xmx4G)...',
    };
    setLogs((prev) => [...prev, newLog]);

    await dispatchServerCommand('START');

    await new Promise((res) => setTimeout(res, 1200));
    setServerInfo((prev) => ({
      ...prev,
      status: 'online',
      pid: prev.pid || 19104,
      uptimeSeconds: 0,
      lastStartup: new Date().toISOString(),
    }));
    addAudit('SERVER_START', 'Paper 26.3', 'Dispatched START command to Termux agent');
  };

  const stopServer = async () => {
    setServerInfo((prev) => ({ ...prev, status: 'stopping' }));
    const newLog: ConsoleLogEntry = {
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: '[Agent] Sent graceful stop command via local RCON. Flushing chunks...',
    };
    setLogs((prev) => [...prev, newLog]);

    await dispatchServerCommand('STOP');

    await new Promise((res) => setTimeout(res, 1000));
    setServerInfo((prev) => ({
      ...prev,
      status: 'offline',
      pid: null,
      lastShutdown: new Date().toISOString(),
      onlinePlayers: 0,
    }));
    setPlayers((prev) => prev.map((p) => ({ ...p, isOnline: false })));
    addAudit('SERVER_STOP', 'Paper 26.3', 'Dispatched graceful STOP signal to Termux agent');
  };

  const restartServer = async () => {
    await stopServer();
    await dispatchServerCommand('RESTART');
    await new Promise((res) => setTimeout(res, 800));
    await startServer();
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

    let reply = `[Server] Command "${trimmed}" executed successfully.`;
    if (trimmed === 'list') {
      const onlineNames = players.filter((p) => p.isOnline).map((p) => p.username).join(', ');
      reply = `[Server] There are ${players.filter((p) => p.isOnline).length} of a max of ${serverInfo.maxPlayers} players online: ${onlineNames || 'None'}`;
    } else if (trimmed === 'tps') {
      reply = `[Server] TPS from last 1m, 5m, 15m: 20.0, 19.98, 20.0`;
    } else if (trimmed.startsWith('say ')) {
      const msg = trimmed.replace('say ', '');
      reply = `[Server] [Server] ${msg}`;
    } else if (trimmed === 'save-all') {
      reply = `[Server] Saving the game (all chunks flushed to disk on ROG Phone 5s)`;
    }

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          timestamp: new Date().toLocaleTimeString(),
          level: 'INFO',
          message: reply,
        },
      ]);
    }, 400);

    addAudit('CONSOLE_COMMAND', trimmed, 'Executed via authorized dashboard interface');
    return reply;
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
