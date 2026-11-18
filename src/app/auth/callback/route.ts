import { NextRequest, NextResponse } from 'next/server';
import { authDestination } from '@/lib/authDestination';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = authDestination(searchParams.get('next'));
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  const login = new URL('/login', origin);
  login.searchParams.set('next', next);
  login.searchParams.set('error', 'callback');
  return NextResponse.redirect(login);
}
