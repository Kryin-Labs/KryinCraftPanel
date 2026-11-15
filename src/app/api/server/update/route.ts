import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(req: Request) {
  try {
    const supabase = getAdminClient();
    const body = await req.json();
    const { serverId, public_tunnel_java, public_tunnel_bedrock, name } = body;

    if (!serverId) {
      return NextResponse.json({ error: 'Missing serverId' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (public_tunnel_java !== undefined) {
      updates.public_tunnel_java = public_tunnel_java ? public_tunnel_java.trim() : null;
    }

    if (public_tunnel_bedrock !== undefined) {
      updates.public_tunnel_bedrock = public_tunnel_bedrock ? public_tunnel_bedrock.trim() : null;
    }

    if (name !== undefined && name.trim()) {
      updates.name = name.trim();
    }

    const { data: updatedServer, error } = await supabase
      .from('servers')
      .update(updates)
      .eq('id', serverId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      server: updatedServer,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
