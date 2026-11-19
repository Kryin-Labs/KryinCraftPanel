import { NextResponse } from 'next/server';
import { verifyAgentToken } from '@/lib/agentAuth';

export async function GET(req: Request) {
  try {
    const authResult = await verifyAgentToken(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { server, supabase } = authResult;

    const nowIso = new Date().toISOString();
    const { data: commands, error: fetchError } = await supabase.rpc('claim_device_commands', {
      target_server: server.id,
    });

    if (fetchError) {
      return NextResponse.json({ error: 'Could not claim queued commands.' }, { status: 502 });
    }
    return NextResponse.json({
      commands: (commands || []).map((command: Record<string, unknown>) => ({ ...command, status: 'PENDING' })),
      count: commands ? commands.length : 0,
      timestamp: nowIso,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Command poll error' }, { status: 500 });
  }
}
