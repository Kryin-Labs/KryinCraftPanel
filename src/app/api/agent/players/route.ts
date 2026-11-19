import { NextResponse } from 'next/server';
import { verifyAgentToken } from '@/lib/agentAuth';
import { playerUuid } from '@/lib/playerRecords';

function plainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export async function POST(req: Request) {
  try {
    const authResult = await verifyAgentToken(req);
    if ('error' in authResult) return NextResponse.json({ error: authResult.error }, { status: authResult.status });

    const { server, supabase } = authResult;
    const body = await req.json();
    const list = Array.isArray(body?.players) ? body.players : [body];
    if (list.length > 1000) return NextResponse.json({ error: 'Too many player records.' }, { status: 400 });
    const now = new Date().toISOString();
    const parsed = new Map<string, Record<string, unknown>>();

    for (const payload of list) {
      if (!plainObject(payload) || typeof payload.uuid !== 'string') continue;
      const uuid = playerUuid(payload.uuid);
      if (!uuid) continue;
      const current = parsed.get(uuid);
      if (!current || (payload.is_online && !current.is_online) || (!current.inventory && payload.inventory && !current.is_online)) {
        parsed.set(uuid, payload);
      }
    }

    const unnamed = [...parsed].filter(([uuid, row]) => typeof row.username !== 'string' ||
      !row.username.trim() || row.username.trim().toLowerCase() === uuid.slice(0, 8)).map(([uuid]) => uuid);
    const previousNames = new Map<string, string>();
    if (unnamed.length) {
      const aliases = unnamed.flatMap((uuid) => [uuid, uuid.replaceAll('-', '')]);
      const { data, error } = await supabase.from('server_players').select('uuid,username')
        .eq('server_id', server.id).in('uuid', aliases);
      if (error) return NextResponse.json({ error: 'Could not check player identities.' }, { status: 502 });
      for (const row of data ?? []) {
        const uuid = playerUuid(row.uuid);
        if (uuid && row.username.toLowerCase() !== uuid.slice(0, 8)) previousNames.set(uuid, row.username);
      }
    }

    const batches = new Map<string, Record<string, unknown>[]>();
    for (const [uuid, player] of parsed) {
      const username = previousNames.get(uuid) ?? (typeof player.username === 'string' ? player.username.trim().slice(0, 64) : '');
      const isOnline = Boolean(player.is_online);
      const row: Record<string, unknown> = {
        server_id: server.id, uuid, username: username || uuid.slice(0, 8), is_online: isOnline,
        ping_ms: isOnline && typeof player.ping_ms === 'number' && Number.isInteger(player.ping_ms) &&
          player.ping_ms > 0 && player.ping_ms <= 60_000 ? player.ping_ms : null,
        is_op: Boolean(player.is_op), is_whitelisted: Boolean(player.is_whitelisted), is_banned: Boolean(player.is_banned),
        updated_at: now,
      };
      for (const field of ['health', 'max_health', 'food_level', 'saturation', 'xp_level', 'xp_progress']) {
        const value = player[field];
        if (typeof value === 'number' && Number.isFinite(value)) row[field] = value;
      }
      if (typeof player.gamemode === 'string' && ['survival', 'creative', 'adventure', 'spectator'].includes(player.gamemode)) {
        row.gamemode = player.gamemode;
      }
      if (plainObject(player.coordinates)) row.coordinates = player.coordinates;
      if (plainObject(player.statistics) && Object.keys(player.statistics).length) row.statistics = player.statistics;
      if (plainObject(player.inventory) && Array.isArray(player.inventory.main) && Array.isArray(player.inventory.hotbar)) {
        row.inventory = player.inventory;
      }
      if (isOnline) {
        row.last_seen = now;
      } else if (typeof player.last_seen === 'string' && !/ [+-]\d{4}$/.test(player.last_seen) &&
        Number.isFinite(Date.parse(player.last_seen))) {
        row.last_seen = new Date(player.last_seen).toISOString();
      }
      // PostgREST bulk upserts need uniform fields. Omit absent snapshots to preserve previous saves.
      const shape = Object.keys(row).sort().join(',');
      const batch = batches.get(shape);
      if (batch) batch.push(row);
      else batches.set(shape, [row]);
    }

    const results = await Promise.all([...batches.values()].map((batch) =>
      supabase.from('server_players').upsert(batch, { onConflict: 'server_id, uuid', defaultToNull: false })));
    if (results.some(({ error }) => error)) {
      return NextResponse.json({ error: 'Could not persist all player records.' }, { status: 502 });
    }
    return NextResponse.json({ success: true, updated_players: parsed.size, timestamp: now });
  } catch {
    return NextResponse.json({ error: 'Could not process player records.' }, { status: 500 });
  }
}
