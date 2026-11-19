'use client';

import { createContext, Fragment, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const PanelUserContext = createContext<User | null>(null);

export function usePanelUser() {
  const user = useContext(PanelUserContext);
  if (!user) throw new Error('Panel user is unavailable');
  return user;
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let revision = 0;
    let validatedUserId: string | undefined;

    function goToLogin() {
      setUser(null);
      try {
        localStorage.removeItem('kryin_cached_server');
      } catch {}
      const { pathname, search } = window.location;
      router.replace('/login?next=' + encodeURIComponent(pathname + search));
    }

    function verifyUser() {
      const currentRevision = ++revision;
      void supabase.auth.getUser().then(({ data, error }) => {
        if (!active || currentRevision !== revision) return;
        if (data.user) {
          validatedUserId = data.user.id;
          setUser(data.user);
          setFailed(false);
        } else if (error && (error.status === undefined || error.status >= 500) && error.name !== 'AuthSessionMissingError') {
          setFailed(true);
        } else {
          goToLogin();
        }
      }).catch(() => {
        if (active && currentRevision === revision) setFailed(true);
      });
    }

    let verifyTimer: ReturnType<typeof setTimeout>;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'SIGNED_OUT') {
        clearTimeout(verifyTimer);
        revision++;
        validatedUserId = undefined;
        goToLogin();
      } else if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user && validatedUserId) {
        if (session.user.id !== validatedUserId) {
          validatedUserId = undefined;
          setUser(null);
          verifyTimer = setTimeout(verifyUser, 0);
        } else if (event === 'USER_UPDATED') {
          setUser(session.user);
        }
      }
    });
    verifyUser();
    return () => {
      active = false;
      clearTimeout(verifyTimer);
      subscription.unsubscribe();
    };
  }, [attempt, router]);

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
        <section className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-900">
          {failed ? (
            <>
              <p role="alert" className="flex-1">Could not check your session.</p>
              <button type="button" className="font-semibold text-blue-700" onClick={() => { setFailed(false); setAttempt((value) => value + 1); }}>
                Retry
              </button>
            </>
          ) : (
            <p role="status" className="flex items-center gap-3">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin text-blue-600" />
              Opening your panel…
            </p>
          )}
        </section>
      </div>
    );
  }

  return <PanelUserContext.Provider value={user}><Fragment key={user.id}>{children}</Fragment></PanelUserContext.Provider>;
}
