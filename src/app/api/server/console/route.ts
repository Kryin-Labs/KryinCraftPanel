import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
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
    const { searchParams } = new URL(req.url);
    const requestedServerId = searchParams.get('serverId');
    const since = searchParams.get('since'); // ISO timestamp string for incremental streaming
    const limit = Math.min(Number(searchParams.get('limit')) || 150, 300);

    const supabase = getAdminClient();

    // 1. Resolve active server
    let targetServerId = requestedServerId;
    if (!targetServerId) {
      const { data: servers } = await supabase
        .from('servers')
        .select('id, status, last_heartbeat')
        .order('created_at', { ascending: false });

      if (servers && servers.length > 0) {
        // Prioritize server with freshest heartbeat
        const now = Date.now();
        const activeServer = servers.find((s) => {
          const hb = s.last_heartbeat ? new Date(s.last_heartbeat).getTime() : 0;
          return now - hb < 45000;
        });
        targetServerId = activeServer ? activeServer.id : servers[0].id;
      }
    }

    if (!targetServerId) {
      return NextResponse.json({ logs: [], latestTimestamp: null });
    }

    // 2. Fetch logs (incremental if 'since' provided, else initial batch)
    if (since) {
      const { data: newLogs, error } = await supabase
        .from('server_logs')
        .select('id, timestamp, level, message, created_at')
        .eq('server_id', targetServerId)
        .gt('created_at', since)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const latestTimestamp =
        newLogs && newLogs.length > 0
          ? newLogs[newLogs.length - 1].created_at
          : since;

      return NextResponse.json({
        logs: newLogs || [],
        latestTimestamp,
      });
    } else {
      // Initial load: fetch most recent lines and return chronologically
      const { data: recentLogs, error } = await supabase
        .from('server_logs')
        .select('id, timestamp, level, message, created_at')
        .eq('server_id', targetServerId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const ordered = (recentLogs || []).reverse();
      const latestTimestamp =
        ordered.length > 0 ? ordered[ordered.length - 1].created_at : null;

      return NextResponse.json({
        logs: ordered,
        latestTimestamp,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Console stream error' }, { status: 500 });
  }
}
