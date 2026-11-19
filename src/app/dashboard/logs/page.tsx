'use client';

import { useMemo, useState } from 'react';
import { Download, ScrollText, Search } from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { useConsoleLogs } from '@/lib/useConsoleLogs';

const levelClass: Record<string, string> = {
  ERROR: 'text-red-300', WARN: 'text-amber-300', INFO: 'text-sky-300', DEBUG: 'text-slate-400',
};

export default function LogsPage() {
  const { activeServerId, serverInfo } = useServerStore();
  const { logs, loaded, subscribed, error } = useConsoleLogs(activeServerId, 'logs');
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const matches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((row) => (!level || row.level === level) && row.message.toLowerCase().includes(query));
  }, [logs, level, search]);

  function download() {
    const log = matches.map((row) => '[' + row.timestamp + '] [' + row.level + '] ' + row.message).join('\n');
    const url = URL.createObjectURL(new Blob([log], { type: 'text/plain' }));
    const element = document.createElement('a');
    element.href = url;
    element.download = 'minecraft-' + new Date().toISOString().slice(0, 10) + '.log';
    element.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  return (
    <section className="space-y-4" aria-labelledby="logs-title">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div>
          <h1 id="logs-title" className="flex items-center gap-2 text-xl font-bold">
            <ScrollText aria-hidden="true" className="h-5 w-5 text-blue-700" /> Server logs
          </h1>
          <p className="mt-1 text-xs text-slate-600">{serverInfo.name}</p>
        </div>
        <button type="button" disabled={!matches.length} onClick={download}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-blue-800 hover:bg-blue-50 disabled:opacity-40">
          <Download aria-hidden="true" className="h-4 w-4" /> Download logs
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-700 bg-slate-900 p-3">
          <label className="relative min-w-36 flex-1">
            <Search aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input type="search" aria-label="Search log messages" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Search log messages"
              className="min-h-11 w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 text-sm text-white" />
          </label>
          <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Log level"
            className="min-h-11 rounded-lg border border-slate-700 bg-slate-950 px-2 text-xs text-white">
            <option value="">All levels</option>
            {Object.keys(levelClass).map((entry) => <option key={entry}>{entry}</option>)}
          </select>
          <span role="status" className="basis-full px-1 text-xs text-slate-300 sm:basis-auto">
            {error ? 'Retrying…' : !loaded ? 'Loading logs…' : subscribed ? 'Live' : 'Polling'}
          </span>
        </div>
        {error && <p role="alert" className="px-3 pt-3 text-xs text-amber-300">{error}</p>}
        {loaded && !matches.length && <p className="p-4 text-sm text-slate-300">{logs.length ? 'No matching entries.' : 'No logs received yet.'}</p>}
        <ul aria-label="Recent server logs" tabIndex={0} className="max-h-[60dvh] overflow-y-auto px-3 py-2 text-xs text-slate-200">
          {matches.slice(-500).reverse().map((row) => (
            <li key={row.id} className="border-b border-slate-800 py-2 [overflow-wrap:anywhere]">
              <span className="mr-2 text-slate-400">{row.timestamp}</span>
              <span className={'mr-2 font-semibold ' + (levelClass[row.level] ?? 'text-slate-400')}>{row.level}</span>
              <span className="whitespace-pre-wrap">{row.message}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
