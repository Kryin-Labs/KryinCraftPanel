import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function checkFileAccess(serverId: unknown) {
  if (typeof serverId !== 'string' || !serverId) {
    return NextResponse.json({ error: 'Server ID required' }, { status: 400 });
  }
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const { data: allowed } = await supabase.rpc('is_server_member', {
    s_id: serverId,
    req_role: 'admin',
  });
  if (!allowed) return NextResponse.json({ error: 'Administrator access required' }, { status: 403 });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list'; // 'list' | 'read'
    const dir = searchParams.get('dir') || '/';
    const filePath = searchParams.get('path') || '';
    const serverId = searchParams.get('serverId');

    const admin = getAdminClient();

    const targetServerId = serverId;
    const denied = await checkFileAccess(targetServerId);
    if (denied) return denied;

    // Check if device agent is online
    const { data: srv } = await admin
      .from('servers')
      .select('id, last_heartbeat, status')
      .eq('id', targetServerId)
      .single();

    const isFresh = srv?.last_heartbeat
      ? Date.now() - new Date(srv.last_heartbeat).getTime() < 45 * 1000
      : false;

    // 2. Dispatch command to Indian Node agent if alive
    const cmdType = action === 'read' ? 'READ_FILE' : 'LIST_FILES';
    const payload = action === 'read' ? { action: 'READ_FILE', path: filePath } : { action: 'LIST_FILES', directory: dir };

    if (isFresh) {
      const expiresAt = new Date(Date.now() + 25 * 1000).toISOString();
      const { data: newCmd } = await admin
        .from('server_commands')
        .insert({
          server_id: targetServerId,
          command_type: 'CONFIG_UPDATE',
          payload,
          status: 'PENDING',
          expires_at: expiresAt,
        })
        .select('id')
        .single();

      if (newCmd?.id) {
        // Poll for agent result up to 3.6 seconds (18 x 200ms)
        for (let i = 0; i < 18; i++) {
          await new Promise((r) => setTimeout(r, 200));
          const { data: updatedCmd } = await admin
            .from('server_commands')
            .select('status, result')
            .eq('id', newCmd.id)
            .single();

          if (updatedCmd && (updatedCmd.status === 'COMPLETED' || updatedCmd.status === 'EXECUTED')) {
            const resData = updatedCmd.result;
            return NextResponse.json({
              success: true,
              source: 'agent',
              data: resData,
            });
          }
        }
      }
    }

    // 3. Fallback response if agent is offline or timed out
    if (action === 'read') {
      return NextResponse.json({
        success: true,
        source: 'cached',
        data: {
          path: filePath,
          name: filePath.split('/').pop() || 'file',
          content: `# Server file: ${filePath}\n# Node is currently offline or synchronizing.\n`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      source: 'fallback',
      data: {
        directory: dir,
        files: [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Files error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = getAdminClient();
    const body = await req.json().catch(() => ({}));
    const { action, serverId, path, content, name, directory } = body;

    const targetServerId = serverId;
    const denied = await checkFileAccess(targetServerId);
    if (denied) return denied;

    let cmdAction = 'SAVE_FILE';
    let payload: any = {};

    if (action === 'save') {
      cmdAction = 'SAVE_FILE';
      payload = { action: 'SAVE_FILE', path, content: content || '' };
    } else if (action === 'delete') {
      cmdAction = 'DELETE_FILE';
      payload = { action: 'DELETE_FILE', path };
    } else if (action === 'create_folder') {
      cmdAction = 'CREATE_FOLDER';
      payload = { action: 'CREATE_FOLDER', directory: directory || '/', name };
    } else if (action === 'create_file') {
      cmdAction = 'CREATE_FILE';
      payload = { action: 'CREATE_FILE', directory: directory || '/', name, content: content || '' };
    } else {
      return NextResponse.json({ error: 'Unknown file action' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 25 * 1000).toISOString();
    const { data: newCmd, error: insErr } = await admin
      .from('server_commands')
      .insert({
        server_id: targetServerId,
        command_type: 'CONFIG_UPDATE',
        payload,
        status: 'PENDING',
        expires_at: expiresAt,
      })
      .select('id')
      .single();

    if (insErr || !newCmd) {
      return NextResponse.json({ error: 'Failed to queue file command' }, { status: 500 });
    }

    // Wait up to 3.2 seconds for agent execution
    for (let i = 0; i < 16; i++) {
      await new Promise((r) => setTimeout(r, 200));
      const { data: updatedCmd } = await admin
        .from('server_commands')
        .select('status, result')
        .eq('id', newCmd.id)
        .single();

      if (updatedCmd && (updatedCmd.status === 'COMPLETED' || updatedCmd.status === 'EXECUTED')) {
        return NextResponse.json({ success: true, result: updatedCmd.result });
      }
    }

    return NextResponse.json({ success: true, queued: true, command_id: newCmd.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'File action error' }, { status: 500 });
  }
}
