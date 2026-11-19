import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { backupName, backupOwner, isUuid } from '@/lib/backups/server';
import { driveConfig, driveLink } from '@/lib/backups/drive';

const noStore = { 'Cache-Control': 'no-store' };
const denied = (status: number) => NextResponse.json({
  error: status === 400 ? 'Select a server.' : status === 401 ? 'Sign in to manage backups.' :
    status === 403 ? 'Only the server owner can manage backups.' : 'Could not verify server ownership.',
}, { status, headers: noStore });
const failed = () => NextResponse.json({ error: 'Could not complete the backup request.' }, { status: 502, headers: noStore });

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const access = await backupOwner(url.searchParams.get('serverId'));
    if (access.denied) return denied(access.denied);
    const { admin, owner, server } = access;
    const id = url.searchParams.get('download');
    if (id) {
      if (!isUuid(id)) return NextResponse.json({ error: 'Invalid backup.' }, { status: 400, headers: noStore });
      const { data: job, error } = await admin.from('server_config_backups')
        .select('archive,created_at').eq('server_id', server.id).eq('id', id).eq('status', 'ready').maybeSingle();
      if (error) return failed();
      if (!job?.archive) return NextResponse.json({ error: 'Backup not found.' }, { status: 404, headers: noStore });
      return new Response(new Uint8Array(Buffer.from(job.archive, 'base64')), {
        headers: {
          ...noStore,
          'Content-Type': 'application/zip',
          'X-Content-Type-Options': 'nosniff',
          'Content-Disposition': 'attachment; filename="' + backupName(server.name, job.created_at) + '"',
        },
      });
    }

    const [{ data: connection, error: settingsError }, { data: history, error: listError }] =
      await Promise.all([
        admin.from('server_backup_settings')
          .select('backup_key_hash,last_agent_seen,startup_enabled,drive_owner,drive_connection,drive_refresh')
          .eq('server_id', server.id).maybeSingle(),
        admin.from('server_config_backups')
          .select('id,source,status,created_at,completed_at,file_count,omitted_count,drive_status,drive_connection,drive_file_id')
          .eq('server_id', server.id).order('created_at', { ascending: false }).limit(20),
      ]);
    if (settingsError || listError) return failed();
    const drive = driveConfig();
    const linked = Boolean(connection?.drive_refresh && connection.drive_owner === owner);
    return NextResponse.json({
      devicePaired: Boolean(connection?.backup_key_hash),
      deviceConnected: Boolean(connection?.last_agent_seen && Date.now() - Date.parse(connection.last_agent_seen) < 45_000),
      driveAvailable: Boolean(drive && new URL(drive.redirect).origin === url.origin),
      driveConnected: linked,
      startupEnabled: linked && Boolean(connection?.startup_enabled),
      backups: (history ?? []).map(({ drive_file_id, drive_connection, ...backup }) => ({
        ...backup,
        status: (backup.status === 'queued' || backup.status === 'collecting') &&
          Date.now() - Date.parse(backup.created_at) > 5 * 60_000 ? 'failed' : backup.status,
        driveUrl: backup.drive_status === 'saved' && linked && drive_connection === connection?.drive_connection ? driveLink(drive_file_id) : null,
      })),
    }, { headers: noStore });
  } catch {
    return failed();
  }
}

export async function POST(request: Request) {
  try {
    if (request.headers.get('origin') !== new URL(request.url).origin) return denied(403);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return denied(400);
    const access = await backupOwner(body.serverId);
    if (access.denied) return denied(access.denied);
    const { admin, owner, server } = access;

    if (body.action === 'pair') {
      const token = randomBytes(32).toString('base64url');
      const { error } = await admin.from('server_backup_settings').upsert({
        server_id: server.id,
        backup_key_hash: createHash('sha256').update(token).digest('hex'),
        last_agent_seen: null,
      }, { onConflict: 'server_id' });
      if (error) return failed();
      return new Response(token + '\n', {
        headers: {
          ...noStore,
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="backup.key"',
        },
      });
    }

    if (body.action === 'startup' && typeof body.enabled === 'boolean') {
      const { data, error } = await admin.from('server_backup_settings').update({ startup_enabled: body.enabled })
        .eq('server_id', server.id).eq('drive_owner', owner).not('drive_refresh', 'is', null)
        .select('server_id').maybeSingle();
      if (error) return failed();
      if (!data) return NextResponse.json({ error: 'Connect Google Drive first.' }, { status: 409, headers: noStore });
      return NextResponse.json({ success: true }, { headers: noStore });
    }

    if (body.action === 'disconnect') {
      const { error } = await admin.rpc('disconnect_server_backup_drive', {
        target_server: server.id, target_owner: owner,
      });
      if (error) return failed();
      return NextResponse.json({ success: true }, { headers: noStore });
    }

    if (body.action === 'create') {
      const { data: settings, error: settingsError } = await admin.from('server_backup_settings')
        .select('backup_key_hash').eq('server_id', server.id).maybeSingle();
      if (settingsError) return failed();
      if (!settings?.backup_key_hash) return NextResponse.json({
        error: 'Pair the device before creating a backup.',
      }, { status: 409, headers: noStore });

      const expired = await admin.from('server_config_backups').update({ status: 'failed', completed_at: new Date().toISOString() })
        .eq('server_id', server.id).eq('source', 'manual').in('status', ['queued', 'collecting'])
        .lt('created_at', new Date(Date.now() - 5 * 60_000).toISOString());
      if (expired.error) return failed();
      const { data, error } = await admin.from('server_config_backups')
        .insert({ server_id: server.id, source: 'manual' }).select('id').single();
      if (error?.code === '23505') return NextResponse.json({
        error: 'A manual backup is already queued or running.',
      }, { status: 409, headers: noStore });
      if (error || !data) return failed();
      return NextResponse.json({ id: data.id }, { status: 202, headers: noStore });
    }

    return NextResponse.json({ error: 'Unknown backup action.' }, { status: 400, headers: noStore });
  } catch {
    return failed();
  }
}
