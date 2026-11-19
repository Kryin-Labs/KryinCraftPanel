'use client';

import { useEffect, useState } from 'react';
import { Archive, Download, HardDrive, Link2, Loader2 } from 'lucide-react';

interface Backup {
  id: string;
  source: 'manual' | 'startup';
  status: 'queued' | 'collecting' | 'ready' | 'failed';
  created_at: string;
  file_count: number | null;
  omitted_count: number | null;
  drive_status: 'local' | 'pending' | 'saved' | 'failed';
  driveUrl: string | null;
}

interface BackupStatus {
  devicePaired: boolean;
  deviceConnected: boolean;
  driveAvailable: boolean;
  driveConnected: boolean;
  startupEnabled: boolean;
  backups: Backup[];
}

const statusLabel = {
  queued: 'Queued',
  collecting: 'Collecting files',
  ready: 'Ready',
  failed: 'Unsuccessful',
};

const driveLabel = {
  local: '',
  pending: 'Drive upload pending',
  saved: 'Saved to Drive',
  failed: 'Drive upload failed. ZIP available.',
};

const button = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 enabled:hover:bg-slate-100 disabled:opacity-50';
const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white enabled:hover:bg-blue-800 disabled:opacity-50';

export function ConfigBackups({ serverId }: { serverId: string }) {
  const [state, setState] = useState<BackupStatus | null>(null);
  const [request, setRequest] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [showPairing, setShowPairing] = useState(false);
  const query = new URLSearchParams({ serverId }).toString();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('backupServer') !== serverId) return;
    const outcome = url.searchParams.get('backupDrive');
    if (outcome === 'connected') setNotice('Google Drive connected.');
    if (outcome === 'failed') setError('Google Drive could not be connected.');
    url.searchParams.delete('backupDrive');
    url.searchParams.delete('backupServer');
    window.history.replaceState(window.history.state, '', url);
  }, [serverId]);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let running = false;

    async function load() {
      clearTimeout(timer);
      if (running || document.visibilityState === 'hidden') return;
      running = true;
      let interval = 10_000;
      try {
        const response = await fetch('/api/server/backups?' + query, { signal: controller.signal });
        if (!response.ok) throw new Error('Backup status is unavailable.');
        const data: BackupStatus = await response.json();
        if (controller.signal.aborted) return;
        setState(data);
        setLoadError('');
        if (data.backups.some((row) => ['queued', 'collecting'].includes(row.status) || row.drive_status === 'pending') ||
          (data.devicePaired && !data.deviceConnected && !data.backups.length)) interval = 2_500;
      } catch {
        if (!controller.signal.aborted) setLoadError('Backup status is unavailable. Retrying…');
      } finally {
        running = false;
        if (!controller.signal.aborted) timer = setTimeout(load, interval);
      }
    }

    void load();
    document.addEventListener('visibilitychange', load);
    return () => {
      controller.abort();
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', load);
    };
  }, [query, refresh]);

  async function run(action: 'create' | 'pair' | 'startup' | 'disconnect', enabled?: boolean) {
    setRequest(action);
    setNotice('');
    setError('');
    try {
      const response = await fetch('/api/server/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, action, enabled }),
      });
      if (!response.ok) {
        const failure = await response.json().catch(() => ({}));
        throw new Error(failure.error || 'The backup request failed.');
      }
      if (action === 'pair') {
        const href = URL.createObjectURL(await response.blob());
        const link = document.createElement('a');
        link.href = href;
        link.download = 'backup.key';
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 5_000);
        setShowPairing(true);
        setNotice('Device key downloaded.');
      }
      if (action === 'create') setNotice('Backup queued on the device.');
      if (action === 'disconnect') setNotice('Drive disconnected. Your uploaded files stay in Drive.');
      setRefresh((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The backup request failed.');
    } finally {
      setRequest('');
    }
  }

  const busy = Boolean(request);
  const manualPending = state?.backups.some((row) => row.source === 'manual' && ['queued', 'collecting'].includes(row.status));
  const deviceLabel = state?.deviceConnected ? 'Device connected' : state?.devicePaired ? 'Waiting for the backup agent' : 'Device pairing required';

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5" aria-labelledby="config-backup-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="config-backup-title" className="flex items-center gap-2 text-base font-bold">
            <Archive aria-hidden="true" className="h-4 w-4 text-blue-700" /> Configuration backups
          </h2>
          <p className="mt-1 text-xs text-slate-600">Save server settings and selected plugin configs as a ZIP. The panel keeps up to 20 recent backups.</p>
        </div>
        <button type="button" disabled={busy || !state?.devicePaired || manualPending} className={primary} onClick={() => void run('create')}>
          {request === 'create' && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
          Back up now
        </button>
      </div>

      {loadError && <p role="alert" className="text-xs text-amber-800">{loadError}</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      {notice && <p role="status" className="text-xs text-emerald-800">{notice}</p>}
      {!state && !loadError && <p role="status" className="text-xs text-slate-600">Loading backups…</p>}

      {state && (
        <>
          <div className="grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span aria-hidden="true" className={'h-2 w-2 rounded-full ' + (state.deviceConnected ? 'bg-emerald-600' : 'bg-amber-500')} />
                {deviceLabel}
              </div>
              <button type="button" className={button} aria-expanded={showPairing} onClick={() => setShowPairing((show) => !show)}>
                {state.devicePaired ? 'Device setup' : 'Pair device'}
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold">
                <HardDrive aria-hidden="true" className="h-4 w-4 text-blue-700" />
                {state.driveConnected ? 'Google Drive connected' : 'Google Drive'}
              </div>
              {state.driveConnected ? (
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={state.startupEnabled} disabled={busy || !state.driveAvailable}
                      onChange={(event) => void run('startup', event.target.checked)} />
                    Back up on server startup
                  </label>
                  <button type="button" className="font-semibold text-blue-800 underline disabled:opacity-50" disabled={busy} onClick={() => void run('disconnect')}>
                    Disconnect
                  </button>
                </div>
              ) : state.driveAvailable ? (
                <a className={button} href={'/api/server/backups/drive?' + query}>
                  <Link2 aria-hidden="true" className="h-4 w-4" /> Connect Google Drive
                </a>
              ) : <p className="text-slate-600">Drive setup is pending. You can download backups here.</p>}
            </div>
          </div>

          {showPairing && (
            <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-slate-800">
              <p>Update the Python agent on this server’s device. Save the downloaded key to <code className="break-all">~/.config/kryin/backup.key</code> on the device, then set its permissions to <code>600</code>.</p>
              {state.devicePaired && <p>Replacing the key revokes the current device key.</p>}
              <button type="button" disabled={busy} className={button} onClick={() => void run('pair')}>
                <Download aria-hidden="true" className="h-4 w-4" /> {state.devicePaired ? 'Replace and download key' : 'Download device key'}
              </button>
            </div>
          )}

          {state.backups.length > 0 ? (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
              {state.backups.map((backup) => (
                <li className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs" key={backup.id}>
                  <div className="space-y-1">
                    <p className="font-semibold">{backup.source === 'startup' ? 'Startup backup' : 'Manual backup'} · {statusLabel[backup.status]}</p>
                    <p className="text-slate-600">
                      {new Date(backup.created_at).toLocaleString()}
                      {backup.file_count !== null && backup.status === 'ready' && ' · ' + backup.file_count + ' files'}
                      {Boolean(backup.omitted_count && backup.status === 'ready') && ' · ' + backup.omitted_count + ' skipped'}
                    </p>
                    {driveLabel[backup.drive_status] && <p className="text-slate-600">{driveLabel[backup.drive_status]}</p>}
                  </div>
                  {backup.status === 'ready' && (
                    <div className="flex flex-wrap gap-2">
                      <a className={button} href={'/api/server/backups?' + query + '&download=' + backup.id}>Download ZIP</a>
                      {backup.driveUrl && <a className={button} href={backup.driveUrl} target="_blank" rel="noreferrer">Open in Drive</a>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="text-xs text-slate-600">No backups yet.</p>}
        </>
      )}
    </section>
  );
}
