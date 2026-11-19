import { createHash } from 'node:crypto';
import { after, NextResponse } from 'next/server';
import { backupPolicy, prepareBackup } from '@/lib/backups/archive';
import { deliverBackupToDrive } from '@/lib/backups/drive';
import { backupAdmin, isUuid } from '@/lib/backups/server';

export const maxDuration = 60;

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  const match = /^Bearer ([a-z\d_-]{43})$/i.exec(authorization ?? '');
  if (!match) return NextResponse.json({ error: 'Backup device key is required.' }, { status: 401 });
  try {
    const admin = backupAdmin();
    const keyHash = createHash('sha256').update(match[1]).digest('hex');
    const { data: settings, error: settingsError } = await admin.from('server_backup_settings')
      .select('server_id,drive_connection,drive_owner,servers!inner(owner_id,name)')
      .eq('backup_key_hash', keyHash).maybeSingle();
    if (settingsError) return NextResponse.json({ error: 'Backup service is unavailable.' }, { status: 502 });
    if (!settings) return NextResponse.json({ error: 'Invalid backup device key.' }, { status: 401 });
    const server = Array.isArray(settings.servers) ? settings.servers[0] : settings.servers;
    const serverId = settings.server_id;
    const driveConnection = settings.drive_owner === server?.owner_id ? settings.drive_connection : null;

    const raw = await request.text();
    if (Buffer.byteLength(raw) > 2 * 1024 * 1024) return NextResponse.json({ error: 'Backup payload is too large.' }, { status: 413 });
    const body = JSON.parse(raw);
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid backup request.' }, { status: 400 });

    const deliver = () => {
      if (driveConnection && server) after(async () => {
        await deliverBackupToDrive(serverId, server.owner_id, server.name).catch(() => {});
      });
    };

    if (body.action === 'claim') {
      const startup = typeof body.startup === 'string' && /^[a-f\d]{64}$/.test(body.startup) ? body.startup : null;
      const { data, error } = await admin.rpc('claim_server_config_backup', {
        target_server: serverId, observed_startup: startup, expected_hash: keyHash,
      });
      if (error) return NextResponse.json({ error: 'Could not claim a backup.' }, { status: 502 });
      // The device keeps checking for jobs, so a pending Drive upload can retry after an interruption.
      deliver();
      const job = data?.[0];
      return NextResponse.json(job ? { id: job.backup_id, lease: job.lease_id, policy: backupPolicy } : {});
    }

    if (body.action === 'complete' && isUuid(body.id) && isUuid(body.lease)) {
      const { data: active, error: activeError } = await admin.from('server_config_backups').select('id')
        .eq('id', body.id).eq('server_id', serverId).eq('status', 'collecting').eq('claim_id', body.lease)
        .gte('claim_until', new Date().toISOString()).maybeSingle();
      if (activeError) return NextResponse.json({ error: 'Could not verify the backup lease.' }, { status: 502 });
      if (!active) return NextResponse.json({ error: 'Backup lease expired.' }, { status: 409 });

      const prepared = prepareBackup(body.files, body.omitted);
      const { data: completed, error } = await admin.rpc('complete_server_config_backup', {
        target_server: serverId,
        target_backup: body.id,
        target_lease: body.lease,
        target_hash: keyHash,
        archive_data: prepared?.archive.toString('base64') ?? null,
        included_files: prepared?.count ?? 0,
        omitted_files: prepared?.omitted ?? 0,
      });
      if (error) return NextResponse.json({ error: 'Could not save the completed backup.' }, { status: 502 });
      if (!completed) return NextResponse.json({ error: 'Backup lease expired.' }, { status: 409 });
      deliver();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid backup request.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Backup request could not be processed.' }, { status: error instanceof SyntaxError ? 400 : 502 });
  }
}
