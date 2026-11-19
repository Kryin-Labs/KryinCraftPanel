'use client';

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePanelUser } from './AuthGuard';

const UsernameContext = createContext<string | null>(null);

export function usePanelUsername() {
  return useContext(UsernameContext);
}

export function UsernameGate({ children }: { children: ReactNode }) {
  const { id: userId, user_metadata } = usePanelUser();
  const preferredUsername = user_metadata.preferred_username;
  const githubUsername = user_metadata.user_name;
  const [attempt, setAttempt] = useState(0);
  const [username, setUsername] = useState<string | null>(null);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [candidate, setCandidate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    async function loadProfile() {
      const { data, error } = await supabase.from('profiles').select('username').eq('id', userId).single();
      if (cancelled) return;
      if (error) throw error;
      if (data.username) {
        setUsername(data.username);
        return;
      }
      const preferred = preferredUsername ?? githubUsername ?? '';
      if (typeof preferred === 'string' && /^[a-z0-9][a-z0-9_-]{2,29}$/i.test(preferred)) {
        if (preferredUsername) {
          const result = await supabase.rpc('claim_panel_username', { candidate: preferred });
          if (cancelled) return;
          if (!result.error) {
            setUsername(result.data);
            return;
          }
          setError(result.error.message);
        }
        setCandidate(preferred.toLowerCase());
      }
      setNeedsUsername(true);
    }
    void loadProfile().catch(() => {
      if (!cancelled) setError('Could not load your profile.');
    });
    return () => { cancelled = true; };
  }, [userId, preferredUsername, githubUsername, attempt]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data, error } = await createClient().rpc('claim_panel_username', { candidate });
      if (error) {
        setError(error.message);
        return;
      }
      setUsername(data);
    } catch {
      setError('Could not save your username. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (username) return <UsernameContext.Provider value={username}>{children}</UsernameContext.Provider>;

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <section className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900">
        <h1 className="text-xl font-bold" aria-live="polite">{needsUsername ? 'Choose a username' : 'Loading your profile'}</h1>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {error && !needsUsername && <button type="button" className="text-sm font-semibold text-blue-700" onClick={() => { setError(''); setAttempt((value) => value + 1); }}>Retry</button>}
        {needsUsername && (
          <form onSubmit={save} className="space-y-4">
            <label className="block space-y-1 text-sm font-medium">
              Username
              <input required minLength={3} maxLength={30} autoComplete="username" value={candidate}
                onChange={(event) => setCandidate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <p className="text-sm text-slate-600">Server owners can find you by this name. Use 3–30 letters, numbers, hyphens or underscores.</p>
            <button disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? 'Saving…' : 'Continue to panel'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
