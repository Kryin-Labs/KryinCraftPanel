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
      total_ram_mb,
      used_ram_mb,
      available_ram_mb,
      java_heap_used_mb,
      java_heap_max_mb,
      cpu_usage_percent,
      cpu_temp_c = null,
      battery_percent,
      battery_temp_c = null,
      is_charging = false,
      power_source = 'Battery',
    } = body;

    const { error: insertError } = await supabase.from('server_metrics').insert({
      server_id: server.id,
      total_ram_mb,
      used_ram_mb,
      available_ram_mb,
      java_heap_used_mb,
      java_heap_max_mb,
      cpu_usage_percent,
      cpu_temp_c,
      battery_percent,
      battery_temp_c,
      is_charging,
      power_source,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Metrics processing error' }, { status: 500 });
  }
}
