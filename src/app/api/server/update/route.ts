import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const supabaseUser = await createServerClient();
    try {
      const {
        data: { user: sessionUser },
        error: authErr,
      } = await supabaseUser.auth.getUser();

      if (authErr || !sessionUser) {
        return NextResponse.json(
          { error: 'Unauthorized: Authentication required to update server settings' },
          { status: 401 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Unauthorized: Unable to verify user session' },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { serverId, public_tunnel_java, public_tunnel_bedrock, ip_endpoints, name } = body;

    if (!serverId || typeof serverId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid serverId' }, { status: 400 });
    }

    const admin = getAdminClient();

    const { data: allowed } = await supabaseUser.rpc('is_server_member', {
      s_id: serverId,
      req_role: 'admin',
    });
    if (!allowed) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });

    // 4. Construct sanitized updates (strictly whitelist allowed fields)
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined && typeof name === 'string') {
      const cleanName = name.trim().slice(0, 50);
      if (cleanName.length > 0) {
        updates.name = cleanName;
      }
    }

    if (Array.isArray(ip_endpoints)) {
      // Validate each endpoint object
      const sanitizedEndpoints = ip_endpoints.slice(0, 10).map((ep: any, index: number) => ({
        id: String(ep.id || `ep-${index}-${Date.now()}`).slice(0, 50),
        type: ['java', 'bedrock', 'lan', 'other'].includes(ep.type) ? ep.type : 'java',
        label: String(ep.label || 'Endpoint').trim().slice(0, 40),
        host: String(ep.host || '').trim().slice(0, 120),
        port: Math.min(65535, Math.max(1, Number(ep.port) || 25565)),
        isPrimary: Boolean(ep.isPrimary),
      }));

      updates.public_tunnel_bedrock = JSON.stringify(sanitizedEndpoints);

      const primaryJava =
        sanitizedEndpoints.find((e) => e.isPrimary && e.type === 'java') ||
        sanitizedEndpoints.find((e) => e.type === 'java') ||
        sanitizedEndpoints[0];

      if (primaryJava) {
        updates.public_tunnel_java = primaryJava.host || null;
        if (primaryJava.port) {
          updates.java_port = primaryJava.port;
        }
      }
    } else {
      if (public_tunnel_java !== undefined) {
        updates.public_tunnel_java =
          typeof public_tunnel_java === 'string' ? public_tunnel_java.trim().slice(0, 120) : null;
      }
      if (public_tunnel_bedrock !== undefined) {
        updates.public_tunnel_bedrock =
          typeof public_tunnel_bedrock === 'string' ? public_tunnel_bedrock.trim().slice(0, 500) : null;
      }
    }

    // 5. Update database and return sanitized response (NO secrets/tokens)
    const { data: updatedServer, error } = await admin
      .from('servers')
      .update(updates)
      .eq('id', serverId)
      .select('id, name, public_tunnel_java, java_port, public_tunnel_bedrock, updated_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update server configuration' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      server: updatedServer,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error processing settings update' },
      { status: 500 }
    );
  }
}
