import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { minecraftStateAt } from '@/lib/deviceStatus';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { data: servers, error } = await supabase
      .from('servers')
      .select('id, name, status, device_name, public_tunnel_java, local_ip, last_heartbeat, created_at, owner_id')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to retrieve servers' }, { status: 500 });
    }

    // Strip sensitive fields before returning
    const safeServers = (servers || []).map((s) => ({
      id: s.id,
      shared: s.owner_id !== user.id,
      name: s.name,
      status: minecraftStateAt(s.status, s.last_heartbeat),
      device_name: s.device_name,
      public_tunnel_java: s.public_tunnel_java,
      local_ip: s.local_ip,
      last_heartbeat: s.last_heartbeat,
      created_at: s.created_at,
    }));

    return NextResponse.json({ servers: safeServers });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Server Full', waitlist: '/api/server-waitlist' }, { status: 409 });
}
