import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://qekhtvzzllaufevvljxj.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_cE7Y4PbKxeYfQ5sj_-vQuA_P-417JY1';

  return createBrowserClient(url, anonKey, {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 365, // 365 days - persists until cookies are cleared or manual logout
      sameSite: 'lax',
      path: '/',
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
