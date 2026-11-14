import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in' }, { status: 401 });
    }

    const body = await req.json();
    const { server_id, command_type, payload = {} } = body;

    if (!server_id || !command_type) {
      return NextResponse.json({ error: 'Missing server_id or command_type' }, { status: 400 });
    }

    // 2. Verify Member Permission
    const { data: member, error: memberError } = await supabase
      .from('server_members')
      .select('role, custom_permissions')
      .eq('server_id', server_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'Forbidden: You are not a member of this server' }, { status: 403 });
    }

    if (member.role === 'viewer') {
      return NextResponse.json({ error: 'Forbidden: Viewer role cannot issue server commands' }, { status: 403 });
    }

    // 3. Queue Command with 60-second Expiration (Strict Duplicate & Stale Guard)
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    const { data: newCmd, error: insertError } = await supabase
      .from('server_commands')
      .insert({
        server_id,
        requested_by: user.id,
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

    // 4. Record in Audit Logs
    await supabase.from('audit_logs').insert({
      server_id,
      user_id: user.id,
      user_email: user.email || 'unknown',
      action: command_type,
      target: payload.command || payload.player || 'Paper Server',
      status: 'success',
      details: `Queued ${command_type} command (ID: ${newCmd.id})`,
    });

    return NextResponse.json({
      success: true,
      command_id: newCmd.id,
      expires_at: expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
