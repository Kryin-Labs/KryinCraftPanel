import 'server-only';
import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { backupAdmin, backupName } from './server';

export const driveScope = 'https://www.googleapis.com/auth/drive.file';
export const driveCookie = 'kryin_drive_oauth';
const tokenUrl = 'https://oauth2.googleapis.com/token';
const driveApi = 'https://www.googleapis.com/drive/v3';

export function driveConfig() {
  const id = process.env.BACKUP_GOOGLE_CLIENT_ID;
  const secret = process.env.BACKUP_GOOGLE_CLIENT_SECRET;
  const redirect = process.env.BACKUP_GOOGLE_REDIRECT_URI;
  const key = process.env.BACKUP_ENCRYPTION_KEY;
  if (!id || !secret || !redirect || !key || !/^[a-f\d]{64}$/i.test(key)) return null;
  try {
    const url = new URL(redirect);
    if (url.pathname !== '/api/server/backups/drive/callback' || url.search || url.hash ||
      (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost'))) return null;
  } catch {
    return null;
  }
  return { id, secret, redirect, key: Buffer.from(key, 'hex') };
}

function seal(value: string, purpose: string) {
  const config = driveConfig();
  if (!config) throw new Error('Drive is not configured.');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', config.key, iv);
  cipher.setAAD(Buffer.from(purpose));
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url');
}

function open(value: string, purpose: string) {
  const config = driveConfig();
  if (!config) throw new Error('Drive is not configured.');
  const data = Buffer.from(value, 'base64url');
  const decipher = createDecipheriv('aes-256-gcm', config.key, data.subarray(0, 12));
  decipher.setAAD(Buffer.from(purpose));
  decipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString('utf8');
}

interface DriveState {
  serverId: string;
  owner: string;
  state: string;
  verifier: string;
  expires: number;
}

export function encodeDriveState(state: DriveState) {
  return seal(JSON.stringify(state), 'drive-oauth-state');
}

export function decodeDriveState(value: string): DriveState | null {
  try {
    const state = JSON.parse(open(value, 'drive-oauth-state')) as DriveState;
    return state.expires > Date.now() ? state : null;
  } catch {
    return null;
  }
}

class DriveError extends Error {
  constructor(readonly permanent: boolean) {
    super('Google Drive request failed.');
  }
}

async function requestTokens(fields: Record<string, string>) {
  const config = driveConfig();
  if (!config) throw new DriveError(true);
  const response = await fetch(tokenUrl, {
    method: 'POST',
    body: new URLSearchParams({ client_id: config.id, client_secret: config.secret, ...fields }),
    signal: AbortSignal.timeout(7_000),
  });
  if (!response.ok) throw new DriveError(response.status === 400 || response.status === 401);
  return await response.json() as { access_token?: string; refresh_token?: string; scope?: string };
}

export async function connectDrive(code: string, verifier: string, owner: string, serverId: string) {
  const config = driveConfig();
  if (!config) return false;
  const tokens = await requestTokens({
    code, code_verifier: verifier, redirect_uri: config.redirect, grant_type: 'authorization_code',
  });
  if (!tokens.refresh_token || (tokens.scope && !tokens.scope.split(' ').includes(driveScope))) return false;
  const { error } = await backupAdmin().from('server_backup_settings').upsert({
    server_id: serverId,
    drive_owner: owner,
    drive_connection: randomUUID(),
    drive_refresh: seal(tokens.refresh_token, 'drive-refresh:' + serverId + ':' + owner),
  }, { onConflict: 'server_id' });
  return !error;
}

function fileUrl(id: string) {
  return /^[\w-]{1,160}$/.test(id) ? id : null;
}

export function driveLink(id: string | null) {
  return id && fileUrl(id) ? 'https://drive.google.com/open?id=' + id : null;
}

async function uploadFile(token: string, id: string, name: string, archive: string) {
  const boundary = 'backup_' + randomBytes(18).toString('hex');
  const body = Buffer.concat([
    Buffer.from('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify({ id, name, mimeType: 'application/zip' }) +
      '\r\n--' + boundary + '\r\nContent-Type: application/zip\r\n\r\n'),
    Buffer.from(archive, 'base64'),
    Buffer.from('\r\n--' + boundary + '--\r\n'),
  ]);
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/related; boundary=' + boundary },
    body: new Uint8Array(body),
    signal: AbortSignal.timeout(8_000),
  });
  // Drive returns 409 when a previous attempt already created this pre-generated ID.
  if (response.ok || response.status === 409) return;
  throw new DriveError(response.status === 401 || (response.status >= 400 && response.status < 500 &&
    response.status !== 403 && response.status !== 429));
}

export async function deliverBackupToDrive(serverId: string, owner: string, serverName: string) {
  const admin = backupAdmin();
  const { data: settings } = await admin.from('server_backup_settings')
    .select('drive_owner,drive_connection,drive_refresh').eq('server_id', serverId).maybeSingle();
  if (!settings?.drive_refresh || !settings.drive_connection || settings.drive_owner !== owner) return;

  // An owner can reconnect before a queued upload runs. Never upload old jobs into the new account.
  await admin.from('server_config_backups').update({ drive_status: 'failed' })
    .eq('server_id', serverId).eq('drive_status', 'pending').neq('drive_connection', settings.drive_connection);

  const now = new Date().toISOString();
  const { data: candidate } = await admin.from('server_config_backups')
    .select('id,drive_next_attempt').eq('server_id', serverId)
    .eq('drive_status', 'pending').eq('drive_connection', settings.drive_connection)
    .lte('drive_next_attempt', now).order('created_at').limit(1).maybeSingle();
  if (!candidate) return;
  const lease = new Date(Date.now() + 45_000).toISOString();
  const { data: backup } = await admin.from('server_config_backups').update({ drive_next_attempt: lease })
    .eq('id', candidate.id).eq('drive_status', 'pending').eq('drive_next_attempt', candidate.drive_next_attempt)
    .select('id, archive, drive_attempts, drive_file_id, created_at').maybeSingle();
  if (!backup) return;

  try {
    const refresh = open(settings.drive_refresh, 'drive-refresh:' + serverId + ':' + owner);
    const tokens = await requestTokens({ grant_type: 'refresh_token', refresh_token: refresh });
    const token = tokens.access_token;
    if (!token || !backup.archive) throw new DriveError(true);
    let id = backup.drive_file_id;
    if (!id) {
      const response = await fetch(driveApi + '/files/generateIds?count=1&space=drive&type=files', {
        headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(7_000),
      });
      if (!response.ok) throw new DriveError(response.status === 401 || response.status === 400);
      const { ids } = await response.json() as { ids?: string[] };
      id = typeof ids?.[0] === 'string' ? fileUrl(ids[0]) : null;
      if (!id) throw new DriveError(false);
      const result = await admin.from('server_config_backups').update({ drive_file_id: id })
        .eq('id', backup.id).eq('drive_next_attempt', lease).eq('drive_status', 'pending').select('id').maybeSingle();
      if (!result.data) return;
    }
    await uploadFile(token, id, backupName(serverName, backup.created_at), backup.archive);
    await admin.from('server_config_backups').update({ drive_status: 'saved' })
      .eq('id', backup.id).eq('drive_next_attempt', lease).eq('drive_status', 'pending');
  } catch (error) {
    const attempts = backup.drive_attempts + 1;
    await admin.from('server_config_backups').update({
      drive_status: (error instanceof DriveError && error.permanent) || attempts >= 4 ? 'failed' : 'pending',
      drive_attempts: attempts,
      drive_next_attempt: new Date(Date.now() + attempts * 60_000).toISOString(),
    }).eq('id', backup.id).eq('drive_next_attempt', lease).eq('drive_status', 'pending');
  }
}
