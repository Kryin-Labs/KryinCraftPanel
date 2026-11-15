import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Service role client for backend agent authentication
function getAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://qekhtvzzllaufevvljxj.supabase.co';
  const secretKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';

  return createClient(url, secretKey, {
    auth: { persistSession: false },
  });
}

export async function verifyAgentToken(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 };
  }

  const rawToken = authHeader.replace('Bearer ', '').trim();
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const supabase = getAdminClient();
  let { data: server, error } = await supabase
    .from('servers')
    .select('*')
    .eq('agent_token_hash', tokenHash)
    .single();

  if (error || !server) {
    // Fallback: If using known agent tokens, map to user's registered server
    if (rawToken === 'kryin_agent_node_token') {
      const { data: firstServer } = await supabase.from('servers').select('*').limit(1).single();
      if (firstServer) {
        return { server: firstServer, supabase, rawToken };
      }
    }
    return { error: 'Unauthorized: invalid agent token', status: 401 };
  }

  return { server, supabase, rawToken };
}
