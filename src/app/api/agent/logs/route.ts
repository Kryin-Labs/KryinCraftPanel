import { NextResponse } from 'next/server';
import { verifyAgentToken } from '@/lib/agentAuth';

export async function POST(req: Request) {
  try {
    const authResult = await verifyAgentToken(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { server, supabase } = authResult;
    const body = await req.json();

    const { logs = [], clear = false } = body;

    // If clear flag requested (e.g. fresh startup or stop), purge previous logs for this server
    if (clear) {
      await supabase.from('server_logs').delete().eq('server_id', server.id);
    }

    if (!Array.isArray(logs) || logs.length === 0) {
      return NextResponse.json({ success: true, count: 0, cleared: clear });
    }

    // Map logs to server_logs schema (up to 200 per batch)
    const rows = logs.slice(0, 200).map((l: any) => ({
      server_id: server.id,
      timestamp: l.timestamp || new Date().toISOString(),
      level: l.level || 'INFO',
      message: String(l.message || l).slice(0, 2000),
    }));

    const { error: insertError } = await supabase.from('server_logs').insert(rows);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Log ingestion error' }, { status: 500 });
  }
}
