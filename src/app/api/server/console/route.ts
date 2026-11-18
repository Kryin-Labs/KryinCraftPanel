import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const uuid = /^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i;
const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/i;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get('serverId');
  const since = searchParams.get('since');
  const afterId = searchParams.get('afterId');
  const limit = Math.max(1, Math.min(Number.parseInt(searchParams.get('limit') ?? '', 10) || 150, 300));
  if (!serverId || !uuid.test(serverId)) {
    return NextResponse.json({ error: 'Select a server to view its console.' }, { status: 400 });
  }
  if ((since && (!timestamp.test(since) || !Number.isFinite(Date.parse(since)))) || (afterId && (!since || !uuid.test(afterId)))) {
    return NextResponse.json({ error: 'Invalid log cursor.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const { data: permissions, error: accessError } = await supabase.rpc('server_permissions', { target_server: serverId });
  if (accessError) return NextResponse.json({ error: 'Could not check console access.' }, { status: 503 });
  if (!permissions?.includes('logs') && !permissions?.includes('console')) {
    return NextResponse.json({ error: 'Console or log access is required.' }, { status: 403 });
  }

  let query = supabase.from('server_logs').select('id, timestamp, level, message, created_at').eq('server_id', serverId);
  if (since) {
    query = afterId
      ? query.or(`created_at.gt.${since},and(created_at.eq.${since},id.gt.${afterId})`)
      : query.gt('created_at', since);
  }
  const ascending = Boolean(since);
  const { data, error } = await query.order('created_at', { ascending }).order('id', { ascending }).limit(limit);
  if (error) return NextResponse.json({ error: 'Could not load console logs.' }, { status: 502 });
  const logs = since ? data : data.toReversed();
  const last = logs.at(-1);
  return NextResponse.json({ logs, latestTimestamp: last?.created_at ?? since, latestId: last?.id ?? afterId }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
