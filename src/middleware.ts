import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://qekhtvzzllaufevvljxj.supabase.co';
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_cE7Y4PbKxeYfQ5sj_-vQuA_P-417JY1';

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 365, // 1 year persistence
      sameSite: 'lax',
      path: '/',
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            maxAge: 60 * 60 * 24 * 365,
            sameSite: 'lax',
            path: '/',
          })
        );
      },
    },
  });

  // IMPORTANT: Refresh user session token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === '/login';
  const isDashboardPage = pathname.startsWith('/dashboard');

  // If user is already logged in and navigates to /login, redirect directly to /dashboard
  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // If user is NOT logged in and tries to access /dashboard, redirect to /login
  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/agent (Termux node agent polling endpoints with Bearer auth)
     * - api/server/live (live stats for external displays)
     * - image/font static file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|api/agent|api/server/live|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
};
