import { authDestination } from '@/lib/authDestination';
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
    '';

  const pathname = request.nextUrl.pathname;

  // Dedicated routes
  const isLoginPage = pathname === '/login';
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isProtectedApi =
    pathname.startsWith('/api/server/live') ||
    pathname.startsWith('/api/server/console') ||
    pathname.startsWith('/api/server/files') ||
    pathname.startsWith('/api/server/properties') ||
    pathname.startsWith('/api/server/command') ||
    pathname.startsWith('/api/server/update') ||
    pathname.startsWith('/api/servers');

  try {
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
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh user session token
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Guard 1: Authenticated user trying to access /login -> redirect to /dashboard
    if (user && isLoginPage) {
      const destination = authDestination(request.nextUrl.searchParams.get('next'));
      const response = NextResponse.redirect(new URL(destination, request.url));
      supabaseResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
      return response;
    }

    // Guard 2: Unauthenticated user trying to access /dashboard -> redirect to /login
    if (!user && isDashboardPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.search = '';
      redirectUrl.searchParams.set('next', pathname + request.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }

    // Guard 3: Unauthenticated user calling protected backend APIs -> return 401 Unauthorized
    if (!user && isProtectedApi && request.method !== 'OPTIONS') {
      return NextResponse.json(
        {
          error: 'Unauthorized: Valid user session required to access this endpoint',
          status: 401,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    // If Supabase check fails on protected routes, fail-closed for security
    if (isProtectedApi) {
      return NextResponse.json(
        { error: 'Authentication service unavailable', status: 503 },
        { status: 503 }
      );
    }
    if (isDashboardPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
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
     * - sw.js (service worker file)
     * - api/agent (Termux node agent polling endpoints with Bearer auth)
     * - static file extensions (svg, png, jpg, jpeg, gif, webp, ico, woff, woff2, js, css, map)
     */
    '/((?!_next/static|_next/image|favicon.ico|sw\\.js|api/agent|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|js|css|map)$).*)',
  ],
};
