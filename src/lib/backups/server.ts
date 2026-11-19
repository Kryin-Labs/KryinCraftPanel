import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/lib/supabase/server';

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);

export function backupAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) throw new Error('Backup database configuration is missing.');
  return createClient(url, secret, { auth: { persistSession: false } });
}

export async function backupOwner(serverId: unknown) {
  if (!isUuid(serverId)) return { denied: 400 as const };
  const session = await createSessionClient();
  const { data: { user }, error } = await session.auth.getUser();
  if (error || !user) return { denied: 401 as const };
  const { data: row, error: serverError } = await session.from('servers')
    .select('id, name, owner_id')
    .eq('id', serverId).eq('owner_id', user.id).maybeSingle();
  if (serverError) return { denied: 503 as const };
  if (!row) return { denied: 403 as const };
  return { server: row, owner: user.id, admin: backupAdmin() };
}

export function backupName(server: string, createdAt: string) {
  const name = server.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'minecraft';
  const time = new Date(createdAt).toISOString().slice(0, 19).replace(/[:T]/g, '-');
  return name + '-config-' + time + '.zip';
}
