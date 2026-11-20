import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { maxTextFileBytes, maxUploadBytes, uploadChunkBytes, validFileName, validFilePath } from '@/lib/fileManagerLimits';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qekhtvzzllaufevvljxj.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '',
    { auth: { persistSession: false } },
  );
}

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

async function checkFileAccess(serverId: unknown) {
  if (typeof serverId !== 'string' || !serverId) return fail('Server ID required.', 400);
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return fail('Sign in required.', 401);
  const { data: allowed } = await supabase.rpc('has_server_permission', {
    target_server: serverId,
    permission: 'files',
  });
  if (!allowed) return fail('File access is required.', 403);
  return user.id;
}

async function enqueue(admin: ReturnType<typeof getAdminClient>, serverId: string, userId: string, payload: object) {
  const { data: server } = await admin.from('servers').select('last_heartbeat').eq('id', serverId).single();
  if (!server?.last_heartbeat || Date.now() - Date.parse(server.last_heartbeat) >= 45_000) {
    return fail('The Minecraft device is offline. Try again when it reconnects.', 503);
  }
  const { data, error } = await admin.from('server_commands').insert({
    server_id: serverId,
    requested_by: userId,
    command_type: 'CONFIG_UPDATE',
    payload: { ...payload, file_manager: true },
    status: 'PENDING',
    expires_at: new Date(Date.now() + 25_000).toISOString(),
  }).select('id').single();

  if (error || !data) return fail('Failed to queue the file operation.', 502);
  return NextResponse.json({ command_id: data.id }, { status: 202 });
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const serverId = params.get('serverId') ?? '';
  try {
    const userId = await checkFileAccess(serverId);
    if (typeof userId !== 'string') return userId;

    const admin = getAdminClient();
    const action = params.get('action') || 'list';
    if (action === 'status') {
      const commandId = params.get('commandId') || '';
      if (!/^[0-9a-f-]{36}$/i.test(commandId)) return fail('Invalid file operation ID.', 400);
      const { data, error } = await admin.from('server_commands')
        .select('status,result,expires_at')
        .eq('server_id', serverId)
        .eq('requested_by', userId)
        .eq('command_type', 'CONFIG_UPDATE')
        .eq('payload->>file_manager', 'true')
        .eq('id', commandId)
        .maybeSingle();
      if (error) return fail('Could not check the file operation.', 502);
      if (!data) return fail('File operation not found.', 404);
      if (data.status === 'FAILED') return fail(data.result?.output || 'The device could not complete the operation.', 409);
      if (data.status === 'EXECUTED' || data.status === 'COMPLETED') {
        return NextResponse.json({ success: true, data: data.result });
      }
      if (data.status === 'EXPIRED' || (data.status === 'PENDING' && Date.parse(data.expires_at) <= Date.now())) {
        return fail('The device did not receive the operation in time.', 504);
      }
      return NextResponse.json({ pending: true }, { status: 202 });
    }

    if (action === 'list') {
      const directory = params.get('dir') || '/';
      if (!validFilePath(directory)) return fail('Invalid directory.', 400);
      return await enqueue(admin, serverId, userId, { action: 'LIST_FILES', directory });
    }
    if (action === 'read') {
      const path = params.get('path');
      if (!validFilePath(path) || path === '/') return fail('Invalid file path.', 400);
      return await enqueue(admin, serverId, userId, { action: 'READ_FILE', path });
    }
    return fail('Unknown file action.', 400);
  } catch {
    return fail('Could not request the file operation.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail('Invalid file request.', 400);
    const { action, serverId, path, content = '', name, directory = '/', uploadId, offset, size, chunk } = body;
    const userId = await checkFileAccess(serverId);
    if (typeof userId !== 'string') return userId;

    let payload: object;
    switch (action) {
      case 'save':
      case 'delete':
        if (!validFilePath(path) || path === '/') return fail('Invalid file path.', 400);
        payload = action === 'save' ? { action: 'SAVE_FILE', path, content } : { action: 'DELETE_FILE', path };
        break;
      case 'create_folder':
      case 'create_file':
        if (!validFilePath(directory) || !validFileName(name)) return fail('Invalid directory or name.', 400);
        payload = action === 'create_folder' ? { action: 'CREATE_FOLDER', directory, name } :
          { action: 'CREATE_FILE', directory, name, content };
        break;
      case 'upload_chunk': {
        if (!validFilePath(directory) || !validFileName(name)) return fail('Invalid upload destination.', 400);
        if (!Number.isSafeInteger(size) || size < 0 || size > maxUploadBytes ||
            !Number.isSafeInteger(offset) || offset < 0 || offset > size ||
            (size > 0 && offset === size) || offset % uploadChunkBytes !== 0 ||
            typeof uploadId !== 'string' || !/^[a-f0-9-]{36}$/.test(uploadId) ||
            typeof chunk !== 'string' || chunk.length > Math.ceil(uploadChunkBytes / 3) * 4) {
          return fail('Invalid upload chunk.', 400);
        }
        const length = Math.min(uploadChunkBytes, size - offset);
        const padding = (3 - length % 3) % 3;
        if (chunk.length !== Math.ceil(length / 3) * 4 ||
            !/^[A-Za-z0-9+/]*={0,2}$/.test(chunk) ||
            (chunk.match(/=+$/)?.[0].length || 0) !== padding) {
          return fail('Invalid upload chunk data.', 400);
        }
        payload = { action: 'UPLOAD_FILE_CHUNK', directory, name, upload_id: uploadId, offset, size, chunk };
        break;
      }
      default:
        return fail('Unknown file action.', 400);
    }

    if ((action === 'save' || action === 'create_file') &&
        (typeof content !== 'string' || Buffer.byteLength(content) > maxTextFileBytes)) {
      return fail('The editor supports text files up to 1 MB.', 400);
    }
    return await enqueue(getAdminClient(), serverId, userId, payload);
  } catch {
    return fail('Could not submit the file operation.', 500);
  }
}
