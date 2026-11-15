import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://qekhtvzzllaufevvljxj.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_cE7Y4PbKxeYfQ5sj_-vQuA_P-417JY1';

  return createServerClient(url, anonKey, {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              maxAge: 60 * 60 * 24 * 365,
              sameSite: 'lax',
              path: '/',
            })
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
