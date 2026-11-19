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

const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const serverId = searchParams.get('serverId');
  const commandId = searchParams.get('commandId');
  if (!serverId || !uuid.test(serverId) || !commandId || !uuid.test(commandId)) {
    return NextResponse.json({ error: 'Valid server and command IDs are required.' }, { status: 400 });
  }

  const supabaseUser = await createServerClient();
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const { data: command, error } = await getAdminClient().from('server_commands')
    .select('id,command_type,status,created_at,expires_at,message:result->>message,minecraft:servers!inner(status,pid,last_heartbeat)')
    .eq('id', commandId).eq('server_id', serverId).eq('requested_by', user.id).maybeSingle();
  if (error) return NextResponse.json({ error: 'Could not load command status.' }, { status: 502 });
  if (!command) return NextResponse.json({ error: 'Command not found.' }, { status: 404 });

  const permission = command.command_type === 'START' ? 'start'
    : command.command_type === 'STOP' || command.command_type === 'RESTART' ? 'stop_restart'
    : command.command_type === 'CONSOLE_CMD' || command.command_type === 'PLAYER_ACTION' ? 'console'
    : null;
  const { data: allowed, error: accessError } = permission
    ? await supabaseUser.rpc('has_server_permission', { target_server: serverId, permission })
    : await supabaseUser.rpc('is_server_member', { s_id: serverId, req_role: 'owner' });
  if (accessError) return NextResponse.json({ error: 'Could not check command access.' }, { status: 503 });
  if (!allowed) return NextResponse.json({ error: 'Command access is required.' }, { status: 403 });

  const now = new Date();
  const expired = command.status === 'PENDING' && Date.parse(command.expires_at) <= now.getTime();
  return NextResponse.json({
    command_id: command.id,
    status: expired ? 'EXPIRED' : command.status,
    created_at: command.created_at,
    expires_at: command.expires_at,
    server_time: now.toISOString(),
    message: command.command_type === 'CONSOLE_CMD' && typeof command.message === 'string' ? command.message.slice(0, 4_000) : undefined,
    minecraft: Array.isArray(command.minecraft) ? command.minecraft[0] : command.minecraft,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
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

    const { server_id, command_type, payload = {}, request_id, retry_window } = body;

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

    if (typeof server_id !== 'string' || !uuid.test(server_id)) {
      return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
    }

    if (request_id !== undefined && (typeof request_id !== 'string' || !uuid.test(request_id))) {
      return NextResponse.json({ error: 'Invalid command request ID.' }, { status: 400 });
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

    const command = {
      server_id: targetServer.id,
      requested_by: user.id,
      command_type: dbCommandType,
      payload: sanitizedPayload,
    };
    const queued = request_id
      ? await admin.rpc('enqueue_panel_command', {
          command_id: request_id, target_server: command.server_id, requester: command.requested_by,
          kind: command.command_type, command_payload: command.payload, retry_window: retry_window === true,
        })
      : await admin.from('server_commands').insert({
          ...command, expires_at: new Date(Date.now() + 60_000).toISOString(),
        }).select('id, created_at, status, expires_at');
    if (queued.error) {
      return NextResponse.json({ error: 'Could not queue the device command.' }, { status: 502 });
    }
    const newCmd = queued.data?.[0];
    if (!newCmd) {
      return NextResponse.json({ error: 'This command request ID is already in use.' }, { status: 409 });
    }

    if (!request_id || newCmd.inserted) {
      await admin.from('audit_logs').insert({
        server_id: targetServer.id,
        user_id: user.id,
        user_email: user.email || 'operator',
        action: normalizedCmd,
        target: sanitizedPayload.command || sanitizedPayload.player || targetServer.name || 'Minecraft Server',
        status: 'success',
        details: 'Queued command ' + newCmd.id,
      });
    }

    return NextResponse.json({
      success: true,
      command_id: newCmd.id,
      created_at: newCmd.created_at,
      expires_at: newCmd.expires_at,
      server_time: new Date().toISOString(),
      status: request_id ? newCmd.status : 'QUEUED',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Internal server error processing command' },
      { status: 500 }
    );
  }
}
