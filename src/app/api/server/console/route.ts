import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedServerId = searchParams.get('serverId');
    const since = searchParams.get('since'); // ISO timestamp string for incremental streaming
    const limit = Math.min(Number(searchParams.get('limit')) || 150, 300);

    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    // 1. Resolve active server safely (validate against live servers)
    const { data: servers } = await supabase
      .from('servers')
      .select('id, status, last_heartbeat')
      .order('created_at', { ascending: false });

    let targetServerId: string | null = null;
    const now = Date.now();

    if (requestedServerId && servers?.some((s) => s.id === requestedServerId)) {
      targetServerId = requestedServerId;
    } else if (servers && servers.length > 0) {
      // Prioritize live server with active heartbeat
      const activeServer = servers.find((s) => {
        const hb = s.last_heartbeat ? new Date(s.last_heartbeat).getTime() : 0;
        return now - hb < 45000;
      });
      targetServerId = activeServer ? activeServer.id : servers[0].id;
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
