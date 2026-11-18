import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qekhtvzzllaufevvljxj.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!key) return NextResponse.json({ error: 'The waitlist is unavailable. Please try again later.' }, { status: 503 });

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await admin.from('server_waitlist').upsert({ email }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: 'Could not join the waitlist. Please try again.' }, { status: 502 });

  return NextResponse.json({ success: true });
}
