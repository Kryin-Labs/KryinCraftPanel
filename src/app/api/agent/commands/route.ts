import { NextResponse } from 'next/server';
import { verifyAgentToken } from '@/lib/agentAuth';

export async function GET(req: Request) {
  try {
    const authResult = await verifyAgentToken(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { server, supabase } = authResult;

    // Fetch pending, unexpired commands for this server
    const nowIso = new Date().toISOString();
    const { data: commands, error: fetchError } = await supabase
      .from('server_commands')
      .select('*')
      .eq('server_id', server.id)
      .eq('status', 'PENDING')
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Mark fetched commands as FETCHED to avoid duplicate runs
    if (commands && commands.length > 0) {
      const ids = commands.map((c) => c.id);
      await supabase
        .from('server_commands')
        .update({ status: 'FETCHED' })
        .in('id', ids);
    }

    return NextResponse.json({
      commands: commands || [],
      count: commands ? commands.length : 0,
      timestamp: nowIso,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Command poll error' }, { status: 500 });
  }
}
