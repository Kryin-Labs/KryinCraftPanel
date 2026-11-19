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

    const {
      status,
      pid = null,
      tps = 20.0,
      uptime_seconds = 0,
      local_ip = '192.168.0.164',
      online_players = 0,
      max_players = 20,
    } = body;

    if (!['online', 'offline', 'starting', 'stopping'].includes(status)) {
      return NextResponse.json({ error: 'A valid Minecraft status is required.' }, { status: 400 });
    }
    const heartbeat = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('servers')
      .update({
        status,
        pid,
        tps,
        uptime_seconds,
        local_ip,
        online_players,
        max_players,
        agent_connected: true,
        last_heartbeat: heartbeat,
        updated_at: heartbeat,
      })
      .eq('id', server.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      server_id: server.id,
      server_name: server.name,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Heartbeat processing error' }, { status: 500 });
  }
}
