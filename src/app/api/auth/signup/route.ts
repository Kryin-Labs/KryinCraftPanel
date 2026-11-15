import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password);
    const cleanName = fullName ? String(fullName).trim() : cleanEmail.split('@')[0];

    if (cleanPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qekhtvzzllaufevvljxj.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!serviceKey) {
      return NextResponse.json({ error: 'Server configuration error: missing service key' }, { status: 500 });
    }

    const admin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create user with email pre-confirmed so they can immediately sign in with zero email delay
    const { data, error } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes('already registered') ||
        msg.includes('already exists') ||
        msg.includes('duplicate') ||
        msg.includes('user already exists')
      ) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: cleanName,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
