import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { playerDetails, playerUuid, toMinecraftPlayer } from '@/lib/playerRecords';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverId = searchParams.get('serverId');
  const identifier = searchParams.get('player')?.trim();
  if (!serverId || !playerUuid(serverId) || !identifier || !/^[a-z\d_.-]{1,36}$/i.test(identifier)) {
    return NextResponse.json({ error: 'Select a valid server and player.' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to view player details.' }, { status: 401 });
  const { data: allowed, error: accessError } = await supabase.rpc('has_server_permission', {
    target_server: serverId, permission: 'players',
  });
  if (accessError) return NextResponse.json({ error: 'Could not check player access.' }, { status: 503 });
  if (!allowed) return NextResponse.json({ error: 'Player access is required.' }, { status: 403 });

  const query = supabase.from('server_players')
    .select('uuid,username,is_online,ping_ms,health,max_health,food_level,saturation,xp_level,xp_progress,gamemode,is_op,is_whitelisted,is_banned,coordinates,inventory,statistics,last_seen,updated_at')
    .eq('server_id', serverId);
  const uuid = playerUuid(identifier);
  const compact = uuid?.replace(/-/g, '');
  const { data, error } = await (uuid
    ? query.or('uuid.ilike.' + uuid + ',uuid.ilike.' + compact)
    : query.ilike('username', identifier.replaceAll('_', '\\_')))
    .order('updated_at', { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: 'Could not load player details.' }, { status: 502 });
  const player = playerDetails(data ?? []);
  if (!player) return NextResponse.json({ error: 'Player not found.' }, { status: 404 });
  const detail = toMinecraftPlayer(player);
  if (!detail.inventoryAvailable && /^[a-z\d_.-]{1,64}$/i.test(player.username)) {
    const { data: namesakes } = await supabase.from('server_players')
      .select('uuid,username,inventory,is_online,last_seen,updated_at')
      .eq('server_id', serverId)
      .ilike('username', player.username.replaceAll('_', '\\_'))
      .order('updated_at', { ascending: false }).limit(25);
    const saved = playerDetails((namesakes ?? []).filter((row) =>
      playerUuid(row.uuid) !== playerUuid(player.uuid)
      && Array.isArray(row.inventory?.main) && Array.isArray(row.inventory?.hotbar)));
    if (saved) detail.savedProfile = { uuid: saved.uuid, username: saved.username };
  }
  return NextResponse.json({ player: detail }, { headers: { 'Cache-Control': 'no-store' } });
}
