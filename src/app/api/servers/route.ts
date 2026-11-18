import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createHash, randomBytes } from 'crypto';

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

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    }

    const { data: servers, error } = await supabase
      .from('servers')
      .select('id, name, status, device_name, public_tunnel_java, local_ip, last_heartbeat, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to retrieve servers' }, { status: 500 });
    }

    // Strip sensitive fields before returning
    const safeServers = (servers || []).map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
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

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    let user: any = null;
    try {
      const supabaseUser = await createServerClient();
      const {
        data: { user: sessionUser },
        error: authErr,
      } = await supabaseUser.auth.getUser();

      if (authErr || !sessionUser) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required to create a new server' },
          { status: 401 }
        );
      }
      user = sessionUser;
    } catch (e) {
      return NextResponse.json(
        { error: 'Unauthorized: Unable to verify user session' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { name, device_name, minecraft_version } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Server name is required' }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 50);
    const cleanDeviceName = (device_name || 'Indian Node').trim().slice(0, 50);

    // 2. Generate secure unique agent token & sha256 hash
    const rawToken = `kryin_node_${randomBytes(16).toString('hex')}`;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const supabase = getAdminClient();

    const { data: newServer, error: insertError } = await supabase
      .from('servers')
      .insert({
        owner_id: user.id,
        name: cleanName,
        device_name: cleanDeviceName,
        android_version: 'Termux / Linux ARM64',
        minecraft_version: minecraft_version || '1.21.4',
        paper_build: 249,
        geyser_version: '2.12.1-b1302',
        status: 'offline',
        agent_token_hash: tokenHash,
        agent_connected: false,
        local_ip: '192.168.0.164',
        java_port: 25565,
        bedrock_port: 19132,
        max_players: 20,
        online_players: 0,
        tps: 0.0,
      })
      .select('id, name, device_name, status, local_ip, java_port, bedrock_port, max_players, created_at')
      .single();

    if (insertError || !newServer) {
      return NextResponse.json({ error: 'Failed to create server record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      server: newServer,
      agentToken: rawToken, // Provided once upon creation to configure the node
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error creating server' }, { status: 500 });
  }
}
