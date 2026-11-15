import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
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
    const admin = getAdminClient();
    const body = await req.json();
    const { server_id, command_type, payload = {} } = body;

    if (!command_type) {
      return NextResponse.json({ error: 'Missing command_type' }, { status: 400 });
    }

    // Determine target server ID
    let targetServerId = server_id;
    if (!targetServerId || targetServerId === 'in-mumbai-01') {
      const { data: firstServer } = await admin
        .from('servers')
        .select('id, owner_id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (firstServer) {
        targetServerId = firstServer.id;
      }
    }

    // Fetch target server to ensure it exists and get default owner ID if needed
    const { data: targetServer } = await admin
      .from('servers')
      .select('id, owner_id')
      .eq('id', targetServerId)
      .single();

    if (!targetServer) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // Determine user auth dynamically from session
    let userId = targetServer.owner_id || null;
    let userEmail = 'operator';
    try {
      const supabaseUser = await createServerClient();
      const { data: { user } } = await supabaseUser.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || userEmail;
      }
    } catch (ignored) {}

    // Queue command into server_commands with 60s expiration
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    const { data: newCmd, error: insertError } = await admin
      .from('server_commands')
      .insert({
        server_id: targetServerId,
        requested_by: userId,
        command_type,
        payload,
        status: 'PENDING',
        expires_at: expiresAt,
      })
      .select('id, created_at, status')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Record in audit logs
    try {
      await admin.from('audit_logs').insert({
        server_id: targetServerId,
        user_id: userId,
        user_email: userEmail,
        action: command_type,
        target: payload.command || payload.player || 'Paper Server',
        status: 'success',
        details: `Dispatched ${command_type} command (ID: ${newCmd.id})`,
      });
    } catch (ignored) {}

    return NextResponse.json({
      success: true,
      command_id: newCmd.id,
      expires_at: expiresAt,
      status: 'QUEUED',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
