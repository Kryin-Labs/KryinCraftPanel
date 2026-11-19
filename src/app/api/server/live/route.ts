import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

import { visiblePlayers } from '@/lib/playerRecords';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Strictly select only non-secret columns (NEVER select agent_token_hash)
const SAFE_SERVER_COLUMNS =
  'id, name, status, device_name, public_tunnel_java, public_tunnel_bedrock, local_ip, java_port, bedrock_port, max_players, online_players, tps, uptime_seconds, pid, last_heartbeat, created_at, owner_id';

export async function GET(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const requestedServerId = searchParams.get('serverId');

    const includeLogs = searchParams.get('logs') !== '0';
    const includePlayers = searchParams.get('players') !== '0';
    const { data: allServers, error: listError } = await supabase
      .from('servers')
      .select(SAFE_SERVER_COLUMNS)
      .order('created_at', { ascending: true });

    if (listError) throw listError;

    const now = Date.now();
    const server = allServers.find((row) => row.id === requestedServerId)
      ?? (!requestedServerId ? allServers.find((row) => now - Date.parse(row.last_heartbeat ?? '') < 45_000) : undefined)
      ?? allServers[0];
    // Format server list with live freshness check
    const formattedServers = allServers.map((s) => {
      const hbTime = s.last_heartbeat ? new Date(s.last_heartbeat).getTime() : 0;
      const isFresh = now - hbTime < 45_000;
      return {
        id: s.id,
        shared: s.owner_id !== user.id,
        name: s.name,
        status: isFresh && s.status === 'online' ? 'online' : (isFresh ? s.status : 'offline'),
        device: s.device_name || 'Indian Node',
        deviceConnected: isFresh,
        localIp: s.local_ip,
        publicTunnelJava: s.public_tunnel_java,
        lastHeartbeat: s.last_heartbeat,
      };
    });

    if (!server) {
      return NextResponse.json({
        online: false,
        device_connected: false,
        status: 'offline',
        servers: formattedServers,
        server: null,
        metrics: null,
        logs: [],
        players: [],
      });
    }

    const isOwner = server.owner_id === user.id;
    const isHeartbeatFresh = now - Date.parse(server.last_heartbeat ?? '') < 45_000;
    const isOnline = isHeartbeatFresh && server.status === 'online';
    const [
      { data: membership, error: membershipError },
      { data: permissions, error: permissionError },
      { data: latestMetrics },
      { data: recentLogs },
      { data: dbPlayers },
    ] = await Promise.all([
      isOwner ? { data: null, error: null } : supabase
        .from('server_members').select('role').eq('server_id', server.id).eq('user_id', user.id).maybeSingle(),
      supabase.rpc('server_permissions', { target_server: server.id }),
      isOnline ? supabase.from('server_metrics')
        .select('total_ram_mb, used_ram_mb, available_ram_mb, java_heap_used_mb, java_heap_max_mb, cpu_usage_percent, cpu_temp_c, battery_percent, is_charging, power_source, created_at')
        .eq('server_id', server.id).order('created_at', { ascending: false }).limit(1).maybeSingle() : { data: null },
      includeLogs ? supabase.from('server_logs').select('id, timestamp, level, message, created_at')
        .eq('server_id', server.id).order('created_at', { ascending: false }).limit(100) : { data: null },
      includePlayers ? supabase.from('server_players')
        .select('uuid, username, is_online, ping_ms, health, max_health, food_level, xp_level, gamemode, is_op, is_whitelisted, is_banned, coordinates, last_seen, updated_at, inventory_saved_at:inventory->>savedAt')
        .eq('server_id', server.id) : { data: null },
    ]);
    if (membershipError || permissionError) throw membershipError || permissionError;
    const role = isOwner ? 'owner' : membership?.role ?? null;
    // Parse multi-endpoint IP list from database
    let ipEndpoints: any[] = [];
    if (
      server.public_tunnel_bedrock &&
      typeof server.public_tunnel_bedrock === 'string' &&
      server.public_tunnel_bedrock.trim().startsWith('[')
    ) {
      try {
        ipEndpoints = JSON.parse(server.public_tunnel_bedrock);
      } catch (e) {}
    }

    if (!Array.isArray(ipEndpoints) || ipEndpoints.length === 0) {
      if (server.public_tunnel_java) {
        ipEndpoints.push({
          id: 'ep-java-default',
          type: 'java',
          label: 'Playit.gg Java',
          host: server.public_tunnel_java,
          port: server.java_port || 25565,
          isPrimary: true,
        });
      }
      if (server.local_ip) {
        ipEndpoints.push({
          id: 'ep-lan-default',
          type: 'lan',
          label: 'LAN Direct',
          host: server.local_ip,
          port: server.java_port || 25565,
          isPrimary: false,
        });
      }
    }

    return NextResponse.json(
      {
        online: isOnline,
        device_connected: isHeartbeatFresh,
        status: isOnline ? 'online' : isHeartbeatFresh ? server.status : 'offline',
        servers: formattedServers,
        role,
        permissions,
        server: {
          id: server.id,
          name: server.name,
          device: server.device_name || 'Indian Node',
          device_connected: isHeartbeatFresh,
          status: isOnline ? 'online' : isHeartbeatFresh ? server.status : 'offline',
          pid: isOnline ? server.pid : null,
          tps: isOnline ? Number(server.tps || 20.0) : 0,
          uptime_seconds: isOnline ? server.uptime_seconds || 0 : 0,
          online_players: isOnline ? server.online_players || 0 : 0,
          max_players: server.max_players || 20,
          local_ip: server.local_ip || null,
          public_tunnel_java: server.public_tunnel_java || null,
          public_tunnel_bedrock: server.public_tunnel_bedrock || null,
          ip_endpoints: ipEndpoints,
          last_heartbeat: server.last_heartbeat,
        },
        metrics:
          latestMetrics && isOnline
            ? {
                totalRamMb: latestMetrics.total_ram_mb || 0,
                usedRamMb: latestMetrics.used_ram_mb || 0,
                javaHeapUsedMb: latestMetrics.java_heap_used_mb || 0,
                javaHeapMaxMb: latestMetrics.java_heap_max_mb || 0,
                cpuUsagePercent: Number(latestMetrics.cpu_usage_percent || 0),
                cpuTempC: latestMetrics.cpu_temp_c ? Number(latestMetrics.cpu_temp_c) : null,
                batteryPercent: latestMetrics.battery_percent ?? 0,
                isCharging: Boolean(latestMetrics.is_charging),
                powerSource: latestMetrics.power_source || 'Standby',
              }
            : {
                totalRamMb: 0,
                usedRamMb: 0,
                javaHeapUsedMb: 0,
                javaHeapMaxMb: 0,
                cpuUsagePercent: 0,
                cpuTempC: null,
                batteryPercent: 0,
                isCharging: false,
                powerSource: 'Offline',
              },
        logs: includeLogs ? recentLogs?.reverse() ?? [] : undefined,
        players: includePlayers ? visiblePlayers(dbPlayers ?? [], now) : undefined,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error retrieving live telemetry' },
      { status: 500 }
    );
  }
}
