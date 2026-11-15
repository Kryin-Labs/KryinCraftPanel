import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qekhtvzzllaufevvljxj.supabase.co';
  const secretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}

export async function GET(req: Request) {
  try {
    const supabase = getAdminClient();
    const { searchParams } = new URL(req.url);
    const requestedServerId = searchParams.get('serverId');

    // 1. Fetch all servers so the UI can populate the server switcher
    const { data: allServers } = await supabase
      .from('servers')
      .select('id, name, status, device_name, public_tunnel_java, local_ip, last_heartbeat, created_at')
      .order('created_at', { ascending: true });

    let targetServerId = requestedServerId;
    if (!targetServerId && allServers && allServers.length > 0) {
      targetServerId = allServers[0].id;
    }

    // 2. Fetch active server
    let server: any = null;
    if (targetServerId) {
      const { data: matchedServer } = await supabase
        .from('servers')
        .select('*')
        .eq('id', targetServerId)
        .single();
      server = matchedServer;
    }

    if (!server) {
      const { data: fallbackServer } = await supabase
        .from('servers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      server = fallbackServer;
    }

    // Format server list with live freshness check
    const formattedServers = (allServers || []).map((s: any) => {
      const hbTime = s.last_heartbeat ? new Date(s.last_heartbeat).getTime() : 0;
      const isFresh = Date.now() - hbTime < 45 * 1000;
      return {
        id: s.id,
        name: s.name,
        status: isFresh && s.status === 'online' ? 'online' : (isFresh ? s.status : 'offline'),
        device: s.device_name || 'Device Node',
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

    // Check if agent heartbeat is alive (within last 45 seconds)
    const lastHeartbeatTime = server.last_heartbeat ? new Date(server.last_heartbeat).getTime() : 0;
    const isHeartbeatFresh = Date.now() - lastHeartbeatTime < 45 * 1000;
    const isOnline = isHeartbeatFresh && server.status === 'online';

    // 2. Fetch latest metrics
    const { data: latestMetrics } = await supabase
      .from('server_metrics')
      .select('*')
      .eq('server_id', server.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 3. Fetch latest logs
    const { data: recentLogs } = await supabase
      .from('server_logs')
      .select('id, timestamp, level, message, created_at')
      .eq('server_id', server.id)
      .order('created_at', { ascending: false })
      .limit(80);

    const logs = (recentLogs || []).reverse();

    // 4. Fetch players
    const { data: dbPlayers } = await supabase
      .from('server_players')
      .select('*')
      .eq('server_id', server.id);

    // Parse multi-endpoint IP list from database
    let ipEndpoints: any[] = [];
    if (server.public_tunnel_bedrock && typeof server.public_tunnel_bedrock === 'string' && server.public_tunnel_bedrock.trim().startsWith('[')) {
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

    return NextResponse.json({
      online: isOnline,
      device_connected: isHeartbeatFresh,
      status: isOnline ? 'online' : (isHeartbeatFresh ? server.status : 'offline'),
      servers: formattedServers,
      server: {
        id: server.id,
        name: server.name,
        device: server.device_name || 'Indian Node',
        device_connected: isHeartbeatFresh,
        status: isOnline ? 'online' : (isHeartbeatFresh ? server.status : 'offline'),
        pid: isOnline ? server.pid : null,
        tps: isOnline ? Number(server.tps || 20.0) : 0,
        uptime_seconds: isOnline ? (server.uptime_seconds || 0) : 0,
        online_players: isOnline ? (server.online_players || 0) : 0,
        max_players: server.max_players || 20,
        local_ip: server.local_ip || null,
        public_tunnel_java: server.public_tunnel_java || null,
        public_tunnel_bedrock: server.public_tunnel_bedrock || null,
        ip_endpoints: ipEndpoints,
        last_heartbeat: server.last_heartbeat,
      },
      metrics: (latestMetrics && isOnline) ? {
        totalRamMb: latestMetrics.total_ram_mb || 0,
        usedRamMb: latestMetrics.used_ram_mb || 0,
        javaHeapUsedMb: latestMetrics.java_heap_used_mb || 0,
        javaHeapMaxMb: latestMetrics.java_heap_max_mb || 0,
        cpuUsagePercent: Number(latestMetrics.cpu_usage_percent || 0),
        cpuTempC: latestMetrics.cpu_temp_c ? Number(latestMetrics.cpu_temp_c) : null,
        batteryPercent: latestMetrics.battery_percent ?? 0,
        isCharging: Boolean(latestMetrics.is_charging),
        powerSource: latestMetrics.power_source || 'Standby',
      } : {
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
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
