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

// Action Protection: Whitelist of allowed command types
const ALLOWED_COMMANDS = new Set([
  'START',
  'STOP',
  'RESTART',
  'HIBERNATE',
  'CONSOLE_CMD',
  'COMMAND',
  'KICK',
  'BAN',
  'UNBAN',
  'OP',
  'DEOP',
  'WHITELIST',
  'HEAL',
  'FEED',
  'STARVE',
  'KILL',
  'TELEPORT',
  'GAMEMODE',
  'SAVE_PROPERTIES',
  'SAVE_SETTINGS',
  'SAVE_FILE',
]);

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
          { error: 'Unauthorized: Authentication required to execute server actions' },
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

    // 2. Validate request body
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { server_id, command_type, payload = {} } = body;

    if (!command_type || typeof command_type !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid command_type' }, { status: 400 });
    }

    const normalizedCmd = command_type.trim().toUpperCase();

    // 3. Action Protection: Verify command is in allowed whitelist
    if (!ALLOWED_COMMANDS.has(normalizedCmd)) {
      return NextResponse.json(
        { error: `Forbidden: Action '${command_type}' is not recognized or permitted` },
        { status: 403 }
      );
    }

    const admin = getAdminClient();

    // 4. Resolve target server
    let targetServerId = server_id;
    if (!targetServerId || targetServerId === 'in-mumbai-01') {
      const { data: firstServer } = await admin
        .from('servers')
        .select('id, owner_id, name')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (firstServer) {
        targetServerId = firstServer.id;
      }
    }

    if (!targetServerId) {
      return NextResponse.json({ error: 'Target server ID not provided' }, { status: 400 });
    }

    // 5. Fetch target server and check ownership/permission
    const { data: targetServer, error: serverFetchError } = await admin
      .from('servers')
      .select('id, owner_id, name')
      .eq('id', targetServerId)
      .single();

    if (serverFetchError || !targetServer) {
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    // Action Protection: Verify user owns this server or bind owner_id if previously unowned
    if (targetServer.owner_id && targetServer.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to execute commands on this server' },
        { status: 403 }
      );
    }

    if (!targetServer.owner_id) {
      // Claim server for this user
      await admin.from('servers').update({ owner_id: user.id }).eq('id', targetServer.id);
    }

    // 6. Sanitize payload
    const sanitizedPayload: Record<string, any> = {};
    if (payload && typeof payload === 'object') {
      if (typeof payload.command === 'string') {
        // Limit command length to prevent buffer overruns
        sanitizedPayload.command = payload.command.slice(0, 500).trim();
      }
      if (typeof payload.player === 'string') {
        sanitizedPayload.player = payload.player.slice(0, 64).trim();
      }
      if (typeof payload.reason === 'string') {
        sanitizedPayload.reason = payload.reason.slice(0, 200).trim();
      }
      if (typeof payload.gamemode === 'string') {
        sanitizedPayload.gamemode = payload.gamemode.slice(0, 20).trim();
      }
      if (typeof payload.coords === 'string') {
        sanitizedPayload.coords = payload.coords.slice(0, 50).trim();
      }
    }

    // 7. Queue command into server_commands with 60s expiration
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    const { data: newCmd, error: insertError } = await admin
      .from('server_commands')
      .insert({
        server_id: targetServer.id,
        requested_by: user.id,
        command_type: normalizedCmd,
        payload: sanitizedPayload,
        status: 'PENDING',
        expires_at: expiresAt,
      })
      .select('id, created_at, status')
      .single();

    if (insertError || !newCmd) {
      return NextResponse.json(
        { error: 'Failed to queue command for execution' },
        { status: 500 }
      );
    }

    // 8. Log into audit_logs (fail-safe)
    try {
      await admin.from('audit_logs').insert({
        server_id: targetServer.id,
        user_id: user.id,
        user_email: user.email || 'operator',
        action: normalizedCmd,
        target: sanitizedPayload.command || sanitizedPayload.player || targetServer.name || 'Minecraft Server',
        status: 'success',
        details: `Dispatched ${normalizedCmd} command (ID: ${newCmd.id}) by ${user.email}`,
      });
    } catch (auditErr) {
      console.warn('Non-fatal audit log warning:', auditErr);
    }

    return NextResponse.json({
      success: true,
      command_id: newCmd.id,
      expires_at: expiresAt,
      status: 'QUEUED',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error processing command' },
      { status: 500 }
    );
  }
}
