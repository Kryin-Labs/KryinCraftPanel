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
  'KILL_SERVER',
  'FORCE_STOP',
  'TELEPORT',
  'GAMEMODE',
  'SAVE_PROPERTIES',
  'SAVE_SETTINGS',
  'SAVE_FILE',
  'LIST_FILES',
  'READ_FILE',
  'DELETE_FILE',
  'CREATE_FOLDER',
  'CREATE_FILE',
  'RENAME_FILE',
]);

export async function POST(req: Request) {
  try {
    // 1. Authenticate user session
    const supabaseUser = await createServerClient();
    let user: any = null;
    try {
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

    if (typeof server_id !== 'string' || !server_id) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
    }

    const permission = normalizedCmd === 'START' ? 'start'
      : ['STOP', 'RESTART', 'HIBERNATE', 'KILL', 'KILL_SERVER', 'FORCE_STOP'].includes(normalizedCmd) ? 'stop_restart'
      : ['CONSOLE_CMD', 'COMMAND', 'KICK', 'BAN', 'UNBAN', 'OP', 'DEOP', 'WHITELIST', 'HEAL', 'FEED', 'STARVE', 'TELEPORT', 'GAMEMODE'].includes(normalizedCmd) ? 'console' : null;
    const { data: allowed } = permission
      ? await supabaseUser.rpc('has_server_permission', { target_server: server_id, permission })
      : await supabaseUser.rpc('is_server_member', { s_id: server_id, req_role: 'owner' });
    if (!allowed) return NextResponse.json({ error: 'Insufficient server permissions' }, { status: 403 });

    const { data: targetServer } = await admin.from('servers').select('id, name').eq('id', server_id).single();
    if (!targetServer) return NextResponse.json({ error: 'Server not found' }, { status: 404 });

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
      if (typeof payload.directory === 'string') {
        sanitizedPayload.directory = payload.directory.slice(0, 500).trim();
      }
      if (typeof payload.path === 'string') {
        sanitizedPayload.path = payload.path.slice(0, 500).trim();
      }
      if (typeof payload.content === 'string') {
        sanitizedPayload.content = payload.content.slice(0, 5 * 1024 * 1024); // max 5MB
      }
      if (payload.properties && typeof payload.properties === 'object') {
        sanitizedPayload.properties = payload.properties;
      }
      if (typeof payload.name === 'string') {
        sanitizedPayload.name = payload.name.slice(0, 200).trim();
      }
      if (typeof payload.newName === 'string') {
        sanitizedPayload.newName = payload.newName.slice(0, 200).trim();
      }
      if (typeof payload.oldPath === 'string') {
        sanitizedPayload.oldPath = payload.oldPath.slice(0, 500).trim();
      }
      if (typeof payload.newPath === 'string') {
        sanitizedPayload.newPath = payload.newPath.slice(0, 500).trim();
      }
    }

    // Map to valid PostgreSQL check constraint enum:
    // check (command_type in ('START', 'STOP', 'RESTART', 'CONSOLE_CMD', 'PLAYER_ACTION', 'CONFIG_UPDATE'))
    let dbCommandType = 'CONFIG_UPDATE';
    sanitizedPayload.action = normalizedCmd;

    if (['START'].includes(normalizedCmd)) {
      dbCommandType = 'START';
    } else if (['STOP', 'HIBERNATE'].includes(normalizedCmd)) {
      dbCommandType = 'STOP';
    } else if (['KILL', 'KILL_SERVER', 'FORCE_STOP'].includes(normalizedCmd)) {
      dbCommandType = 'STOP';
      sanitizedPayload.action = 'KILL';
    } else if (['RESTART'].includes(normalizedCmd)) {
      dbCommandType = 'RESTART';
    } else if (['CONSOLE_CMD', 'COMMAND'].includes(normalizedCmd)) {
      dbCommandType = 'CONSOLE_CMD';
    } else if (['KICK', 'BAN', 'UNBAN', 'OP', 'DEOP', 'WHITELIST', 'HEAL', 'FEED', 'STARVE', 'TELEPORT', 'GAMEMODE'].includes(normalizedCmd)) {
      dbCommandType = 'PLAYER_ACTION';
    } else {
      dbCommandType = 'CONFIG_UPDATE';
    }

    // 7. Queue command into server_commands with 60s expiration
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();
    const { data: newCmd, error: insertError } = await admin
      .from('server_commands')
      .insert({
        server_id: targetServer.id,
        requested_by: user.id,
        command_type: dbCommandType,
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

    // Instant state synchronization: update server status in DB so live polling and Realtime never flash stale state
    const nowIso = new Date().toISOString();
    if (normalizedCmd === 'START') {
      await admin.from('servers').update({
        status: 'starting',
        last_heartbeat: nowIso,
        agent_connected: true,
      }).eq('id', targetServer.id);
    } else if (normalizedCmd === 'STOP' || normalizedCmd === 'RESTART' || normalizedCmd === 'HIBERNATE') {
      await admin.from('servers').update({
        status: 'stopping',
        last_heartbeat: nowIso,
      }).eq('id', targetServer.id);
    } else if (normalizedCmd === 'KILL' || normalizedCmd === 'KILL_SERVER' || normalizedCmd === 'FORCE_STOP') {
      await admin.from('servers').update({
        status: 'offline',
        pid: null,
        tps: 0.0,
        last_heartbeat: nowIso,
      }).eq('id', targetServer.id);
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
