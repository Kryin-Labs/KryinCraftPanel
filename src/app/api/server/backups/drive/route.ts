import { createHash, randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { backupOwner } from '@/lib/backups/server';
import { driveConfig, driveCookie, driveScope, encodeDriveState } from '@/lib/backups/drive';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const config = driveConfig();
  if (!config || new URL(config.redirect).origin !== url.origin) {
    return NextResponse.json({ error: 'Google Drive is unavailable on this domain.' }, { status: 503 });
  }
  const access = await backupOwner(url.searchParams.get('serverId'));
  if (access.denied) return NextResponse.json({ error: 'Server owner access is required.' }, { status: access.denied });

  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(48).toString('base64url');
  const authorization = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorization.search = new URLSearchParams({
    client_id: config.id,
    redirect_uri: config.redirect,
    response_type: 'code',
    scope: driveScope,
    access_type: 'offline',
    prompt: 'consent',
    state,
    code_challenge_method: 'S256',
    code_challenge: createHash('sha256').update(verifier).digest('base64url'),
  }).toString();

  const response = NextResponse.redirect(authorization);
  response.cookies.set(driveCookie, encodeDriveState({
    serverId: access.server.id, owner: access.owner, state, verifier, expires: Date.now() + 10 * 60_000,
  }), {
    path: '/api/server/backups/drive/callback', httpOnly: true, sameSite: 'lax',
    secure: url.protocol === 'https:', maxAge: 600,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
