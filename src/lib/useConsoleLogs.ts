'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ConsoleLog {
  id: string;
  timestamp: string;
  level: string;
  message: string;
}

interface LogPage {
  logs: ConsoleLog[];
  latestTimestamp: string | null;
  latestId: string | null;
  error?: string;
}

const pageSize = 200;
const scrollback = 3000;

export function useConsoleLogs(serverId: string | null) {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!serverId) return;
    const supabase = createClient();
    const controller = new AbortController();
    const seen = new Set<string>();
    const server = serverId;
    let cursor: { timestamp: string; id: string } | undefined;
    let nextPoll: ReturnType<typeof setTimeout>;
    let loading = false;
    let loadedHistory = false;
    let connected = false;
    let recheck = false;
    let pendingRealtime: ConsoleLog[] = [];

    function append(rows: ConsoleLog[]) {
      const fresh = rows.filter((row) => {
        if (seen.has(row.id)) return false;
        seen.add(row.id);
        return true;
      });
      for (const id of seen) {
        if (seen.size <= scrollback * 2) break;
        seen.delete(id);
      }
      if (fresh.length) setLogs((previous) => [...previous, ...fresh].slice(-scrollback));
    }

    async function fetchLogs() {
      clearTimeout(nextPoll);
      if (loading) {
        recheck = true;
        return;
      }
      if (controller.signal.aborted || document.visibilityState === 'hidden') return;
      loading = true;
      let delay = 1_000;
      try {
        const params = new URLSearchParams({ serverId: server, limit: String(pageSize) });
        if (cursor) {
          params.set('since', cursor.timestamp);
          params.set('afterId', cursor.id);
        }
        const response = await fetch('/api/server/console?' + params, { signal: controller.signal });
        const page: LogPage = await response.json();
        if (controller.signal.aborted) return;
        if (!response.ok) throw new Error(page.error || 'Could not load console logs.');
        append(page.logs);
        if (page.latestTimestamp && page.latestId) {
          cursor = { timestamp: page.latestTimestamp, id: page.latestId };
        }
        if (!loadedHistory) {
          loadedHistory = true;
          append(pendingRealtime);
          pendingRealtime = [];
          setLoaded(true);
        }
        setError('');
        delay = params.has('since') && page.logs.length === pageSize ? 0 : connected ? 10_000 : 1_000;
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load console logs.');
      } finally {
        loading = false;
        if (!controller.signal.aborted && document.visibilityState === 'visible') {
          nextPoll = setTimeout(fetchLogs, recheck ? 0 : delay);
        }
        recheck = false;
      }
    }

    const channel = supabase.channel('console:' + server).on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'server_logs', filter: 'server_id=eq.' + server },
      ({ new: row }) => {
        if (controller.signal.aborted || row.server_id !== server || typeof row.id !== 'string' || typeof row.message !== 'string') return;
        const log = { id: row.id, message: row.message, level: String(row.level), timestamp: String(row.timestamp) };
        if (loadedHistory) append([log]);
        else {
          pendingRealtime.push(log);
          if (pendingRealtime.length > scrollback) pendingRealtime.shift();
        }
      },
    ).subscribe((status) => {
      if (controller.signal.aborted) return;
      connected = status === 'SUBSCRIBED';
      setSubscribed(connected);
      void fetchLogs();
    });

    function resume() {
      if (document.visibilityState === 'visible') void fetchLogs();
      else clearTimeout(nextPoll);
    }

    void fetchLogs();
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('online', resume);
    return () => {
      controller.abort();
      clearTimeout(nextPoll);
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('online', resume);
      void supabase.removeChannel(channel);
    };
  }, [serverId]);

  return { logs, loaded, subscribed, error, clear: () => setLogs([]) };
}
