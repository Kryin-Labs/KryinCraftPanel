import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

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

    // 1. Fetch available servers
    const { data: allServers, error: listError } = await supabase
      .from('servers')
      .select('id, name, status, device_name, public_tunnel_java, local_ip, last_heartbeat, created_at, owner_id')
      .order('created_at', { ascending: true });

    if (listError) throw listError;

    // Prioritize active servers with live heartbeats
    const now = Date.now();
    let bestServerId = requestedServerId;
    if (!bestServerId && allServers && allServers.length > 0) {
      const liveServer = allServers.find((s) => {
        const hb = s.last_heartbeat ? new Date(s.last_heartbeat).getTime() : 0;
        return now - hb < 45000;
      });
      bestServerId = liveServer ? liveServer.id : allServers[0].id;
    }

    // 2. Fetch active server with SAFE columns only
    let server: any = null;
    if (bestServerId) {
      const { data: matchedServer } = await supabase
        .from('servers')
        .select(SAFE_SERVER_COLUMNS)
        .eq('id', bestServerId)
        .single();
      server = matchedServer;
    }

    if (!server && allServers && allServers.length > 0) {
      const { data: fallbackServer } = await supabase
        .from('servers')
        .select(SAFE_SERVER_COLUMNS)
        .eq('id', allServers[0].id)
        .single();
      server = fallbackServer;
    }

    // Format server list with live freshness check
    const formattedServers = (allServers || []).map((s: any) => {
      const hbTime = s.last_heartbeat ? new Date(s.last_heartbeat).getTime() : 0;
      const isFresh = Date.now() - hbTime < 45 * 1000;
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

    const { data: membership } = server.owner_id === user.id
      ? { data: null }
      : await supabase.from('server_members').select('role').eq('server_id', server.id).eq('user_id', user.id).maybeSingle();
    const role = server.owner_id === user.id ? 'owner' : membership?.role ?? null;
    const { data: permissions, error: permissionError } = await supabase.rpc('server_permissions', { target_server: server.id });
    if (permissionError) throw permissionError;

    // Check if agent heartbeat is alive (within last 45 seconds)
    const lastHeartbeatTime = server.last_heartbeat ? new Date(server.last_heartbeat).getTime() : 0;
    const isHeartbeatFresh = Date.now() - lastHeartbeatTime < 45 * 1000;
    const isOnline = isHeartbeatFresh && server.status === 'online';

    // 3. Fetch latest metrics (if server is online)
    let latestMetrics: any = null;
    if (isOnline) {
      const { data: metricsData } = await supabase
        .from('server_metrics')
        .select('total_ram_mb, used_ram_mb, available_ram_mb, java_heap_used_mb, java_heap_max_mb, cpu_usage_percent, cpu_temp_c, battery_percent, is_charging, power_source, created_at')
        .eq('server_id', server.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      latestMetrics = metricsData;
    }

    const { data: recentLogs } = await supabase
      .from('server_logs')
      .select('id, timestamp, level, message, created_at')
      .eq('server_id', server.id)
      .order('created_at', { ascending: false })
      .limit(100);
    const logs = (recentLogs || []).reverse();

    // 5. Fetch players
    const { data: dbPlayers } = await supabase
      .from('server_players')
      .select('uuid, username, is_online, ping_ms, health, max_health, food_level, xp_level, gamemode, is_op, is_whitelisted, is_banned, last_seen')
      .eq('server_id', server.id);

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
        logs,
        players: dbPlayers || [],
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
