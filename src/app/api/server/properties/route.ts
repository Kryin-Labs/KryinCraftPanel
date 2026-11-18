import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { encodeProperty, validateServerProperties } from '@/lib/serverProperties';

export const maxDuration = 25;

async function runPropertiesCommand(serverId: string | null, payload: Record<string, unknown>) {
  if (!serverId || !/^[0-9a-f-]{36}$/i.test(serverId)) {
    return { response: NextResponse.json({ error: 'Select a server first.' }, { status: 400 }) };
  }
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: 'Sign in required.' }, { status: 401 }) };
  const permission = await supabase.rpc('has_server_permission', { target_server: serverId, permission: 'settings' });
  if (permission.error) return { response: NextResponse.json({ error: 'Could not check server access.' }, { status: 503 }) };
  if (!permission.data) return { response: NextResponse.json({ error: 'Settings access is required.' }, { status: 403 }) };

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qekhtvzzllaufevvljxj.supabase.co';
  if (!key) return { response: NextResponse.json({ error: 'Server settings are unavailable.' }, { status: 503 }) };
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data: server } = await admin.from('servers').select('last_heartbeat, minecraft_version').eq('id', serverId).single();
  if (!server?.last_heartbeat || Date.now() - Date.parse(server.last_heartbeat) >= 45_000) {
    return { response: NextResponse.json({ error: 'The server agent is offline. Reconnect it and try again.' }, { status: 503 }) };
  }

  const { data: command, error } = await admin.from('server_commands').insert({
    server_id: serverId,
    requested_by: user.id,
    command_type: 'CONFIG_UPDATE',
    status: 'PENDING',
    expires_at: new Date(Date.now() + 15_000).toISOString(),
    payload,
  }).select('id').single();
  if (error || !command) return { response: NextResponse.json({ error: 'Could not queue the settings request.' }, { status: 502 }) };

  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const { data } = await admin.from('server_commands').select('status,result').eq('id', command.id).single();
    if (data?.status === 'EXECUTED') return { result: data.result, version: server.minecraft_version };
    if (data?.status === 'FAILED' || data?.status === 'EXPIRED') {
      return { response: NextResponse.json({ error: 'The agent could not complete the settings request.' }, { status: 502 }) };
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return { response: NextResponse.json({ error: 'The agent did not confirm the request. Reload settings to check the current values.' }, { status: 504 }) };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await runPropertiesCommand(searchParams.get('serverId'), {
    action: 'READ_FILE', path: '/server.properties', settings_read: true,
  });
  if (result.response) return result.response;
  if (!result.result?.properties || typeof result.result.properties !== 'object') {
    return NextResponse.json({ error: 'The agent did not return server.properties.' }, { status: 502 });
  }
  return NextResponse.json({ properties: result.result.properties, version: result.version });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const properties = validateServerProperties(body?.properties);
  if (typeof body?.serverId !== 'string' || !properties) {
    return NextResponse.json({ error: 'Enter valid server property values.' }, { status: 400 });
  }
  const encoded = Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, encodeProperty(value)]));
  const result = await runPropertiesCommand(body.serverId, { action: 'SAVE_PROPERTIES', properties: encoded });
  if (result.response) return result.response;
  return NextResponse.json({ properties });
}
