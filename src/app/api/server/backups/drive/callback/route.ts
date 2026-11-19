import { NextResponse, type NextRequest } from 'next/server';
import { backupOwner } from '@/lib/backups/server';
import { connectDrive, decodeDriveState, driveConfig, driveCookie } from '@/lib/backups/drive';

export async function GET(request: NextRequest) {
  const config = driveConfig();
  if (!config || new URL(config.redirect).origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: 'Google Drive is unavailable on this domain.' }, { status: 503 });
  }
  const cookie = request.cookies.get(driveCookie)?.value;
  const state = cookie ? decodeDriveState(cookie) : null;
  const code = request.nextUrl.searchParams.get('code');
  let result = 'failed';
  if (state && code && state.state === request.nextUrl.searchParams.get('state')) {
    try {
      const access = await backupOwner(state.serverId);
      if (!access.denied && access.owner === state.owner &&
        await connectDrive(code, state.verifier, state.owner, state.serverId)) result = 'connected';
    } catch {
      // The panel shows a generic error and excludes credentials from its response.
    }
  }

  const target = new URL('/dashboard/files', config.redirect);
  target.searchParams.set('backupDrive', result);
  if (state) target.searchParams.set('backupServer', state.serverId);
  const response = NextResponse.redirect(target);
  response.cookies.set(driveCookie, '', {
    path: '/api/server/backups/drive/callback', httpOnly: true, sameSite: 'lax',
    secure: request.nextUrl.protocol === 'https:', maxAge: 0,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
