import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

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
    const { data: servers, error } = await supabase
      .from('servers')
      .select('id, name, status, device_name, public_tunnel_java, local_ip, last_heartbeat, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ servers: servers || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();
    const { name, device_name, minecraft_version } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Server name is required' }, { status: 400 });
    }

    // Generate unique agent token
    const rawToken = `kryin_node_${randomBytes(16).toString('hex')}`;
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    const defaultOwnerId = '083e0435-e2c2-4f23-b410-8fd834ab0d28';

    const { data: newServer, error: insertError } = await supabase
      .from('servers')
      .insert({
        owner_id: defaultOwnerId,
        name: name.trim(),
        device_name: (device_name || 'Secondary Node').trim(),
        android_version: 'Termux / Linux ARM64',
        minecraft_version: minecraft_version || '1.21.4',
        paper_build: 249,
        geyser_version: '2.12.1-b1302',
        status: 'offline',
        agent_token_hash: tokenHash,
        agent_connected: false,
        local_ip: '192.168.0.165',
        java_port: 25565,
        bedrock_port: 19132,
        max_players: 20,
        online_players: 0,
        tps: 0.0,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      server: newServer,
      agentToken: rawToken,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
