'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useServerStore } from '@/lib/serverStore';
import { serverPropertyFields, type ServerProperties, type ServerPropertyKey } from '@/lib/serverProperties';

const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';

export default function ServerSettingsPage() {
  const { activeServerId, serverInfo } = useServerStore();
  const [saved, setSaved] = useState<ServerProperties | null>(null);
  const [draft, setDraft] = useState<ServerProperties>({});
  const [version, setVersion] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const changes = Object.fromEntries(Object.entries(draft).filter(([key, value]) => value !== saved?.[key as ServerPropertyKey]));
  const dirty = Object.keys(changes).length > 0;

  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/server/properties?serverId=' + encodeURIComponent(activeServerId ?? ''), { signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (signal?.aborted) return;
      setSaved(data.properties);
      setDraft(data.properties);
      setVersion(data.version);
    } catch (error) {
      if (!signal?.aborted) setError(error instanceof Error ? error.message : 'Could not read server.properties.');
    } finally {
      if (!signal?.aborted) setBusy(false);
    }
  }, [activeServerId]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/server/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: activeServerId, properties: changes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSaved((previous) => ({ ...previous, ...data.properties }));
      setNotice('Saved to server.properties. Minecraft loads saved settings on startup.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save server.properties.');
    } finally {
      setBusy(false);
    }
  }

  function update(key: ServerPropertyKey, value: string) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setNotice('');
  }

  return (
    <section className="max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Server settings</h1>
          <p className="text-sm text-slate-600">{serverInfo.name}{version ? ' · Minecraft ' + version : ''}</p>
        </div>
        <button type="button" disabled={busy || dirty} onClick={() => void load()} className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50">Reload from server</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
      {busy && !saved && <p role="status" className="text-sm">Reading server.properties…</p>}
      {saved && (
        <form onSubmit={save}>
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
            {serverPropertyFields.map((field) => (
              <label key={field.key} className={field.kind === 'text' ? 'space-y-1 text-sm sm:col-span-2' : 'space-y-1 text-sm'}>
                <span className="block font-medium">{field.label}</span>
                {field.kind === 'select' ? (
                  <select className={input} value={draft[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)}>
                    {!draft[field.key] && <option value="" disabled>Unset</option>}
                    {field.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : field.kind === 'boolean' ? (
                  <select className={input} value={draft[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)}>
                    {!draft[field.key] && <option value="" disabled>Unset</option>}
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : (
                  <input className={input} type={field.kind} value={draft[field.key] ?? ''}
                    {...(field.kind === 'number' ? { min: field.min, max: field.max } : { maxLength: 512 })}
                    onChange={(event) => update(field.key, event.target.value)} />
                )}
              </label>
            ))}
          </fieldset>
          <button type="submit" disabled={busy || !dirty} className="mt-5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      )}
    </section>
  );
}
