import { NextResponse } from 'next/server';
import { verifyAgentToken } from '@/lib/agentAuth';

export async function POST(req: Request) {
  try {
    const authResult = await verifyAgentToken(req);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { server, supabase } = authResult;
    const body = await req.json();

    const playersList = Array.isArray(body.players) ? body.players : [body];
    if (playersList.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Upsert each player record
    const upserts = playersList.map((p: any) => ({
      server_id: server.id,
      uuid: (p.uuid || '').toLowerCase(),
      username: p.username || 'Unknown',
      is_online: Boolean(p.is_online),
      ping_ms: p.ping_ms || 0,
      health: p.health ?? 20.0,
      max_health: p.max_health ?? 20.0,
      food_level: p.food_level ?? 20,
      saturation: p.saturation ?? 5.0,
      xp_level: p.xp_level ?? 0,
      xp_progress: p.xp_progress ?? 0.0,
      gamemode: p.gamemode || 'survival',
      is_op: Boolean(p.is_op),
      is_whitelisted: Boolean(p.is_whitelisted),
      is_banned: Boolean(p.is_banned),
      coordinates: p.coordinates || {
        x: 0,
        y: 64,
        z: 0,
        world: 'world',
        dimension: 'minecraft:overworld',
      },
      inventory: p.inventory || {},
      statistics: p.statistics || {},
      ip_address: p.ip_address || null,
      last_seen: p.last_seen || 'Recently',
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('server_players')
      .upsert(upserts, { onConflict: 'server_id, uuid' });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      server_id: server.id,
      updated_players: upserts.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Player sync processing error' },
      { status: 500 }
    );
  }
}
