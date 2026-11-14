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

export async function GET() {
  try {
    const supabase = getAdminClient();

    // 1. Fetch server
    const { data: server, error: serverError } = await supabase
      .from('servers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (serverError || !server) {
      return NextResponse.json({
        online: false,
        status: 'offline',
        server: null,
        metrics: null,
        logs: [],
        players: [],
      });
    }

    // Check if agent heartbeat is alive (within last 90 seconds)
    const lastHeartbeatTime = server.last_heartbeat ? new Date(server.last_heartbeat).getTime() : 0;
    const isHeartbeatFresh = Date.now() - lastHeartbeatTime < 90 * 1000;
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

    return NextResponse.json({
      online: isOnline,
      status: isOnline ? 'online' : (isHeartbeatFresh ? server.status : 'offline'),
      server: {
        id: server.id,
        name: server.name,
        device: server.device_name || 'Termux ARM64 Node',
        status: isOnline ? 'online' : (isHeartbeatFresh ? server.status : 'offline'),
        pid: isOnline ? server.pid : null,
        tps: isOnline ? Number(server.tps || 20.0) : 0,
        uptime_seconds: isOnline ? (server.uptime_seconds || 0) : 0,
        online_players: isOnline ? (server.online_players || 0) : 0,
        max_players: server.max_players || 20,
        local_ip: server.local_ip || '192.168.0.164',
        last_heartbeat: server.last_heartbeat,
      },
      metrics: latestMetrics ? {
        totalRamMb: latestMetrics.total_ram_mb || 6144,
        usedRamMb: isOnline ? (latestMetrics.used_ram_mb || 0) : 0,
        javaHeapUsedMb: isOnline ? (latestMetrics.java_heap_used_mb || 0) : 0,
        javaHeapMaxMb: latestMetrics.java_heap_max_mb || 4096,
        cpuUsagePercent: isOnline ? Number(latestMetrics.cpu_usage_percent || 0) : 0,
        cpuTempC: isOnline ? Number(latestMetrics.cpu_temp_c || 0) : null,
        batteryPercent: latestMetrics.battery_percent,
        isCharging: latestMetrics.is_charging,
        powerSource: latestMetrics.power_source,
      } : null,
      logs,
      players: dbPlayers || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
