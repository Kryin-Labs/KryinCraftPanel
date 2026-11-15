'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function checkUserSession() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error || !user) {
          setIsAuthenticated(false);
          // Purge cached server data on unauthenticated state for privacy
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('kryin_cached_server');
            } catch (e) {}
          }
          const redirectPath = `/login?next=${encodeURIComponent(pathname || '/dashboard')}`;
          router.replace(redirectPath);
        } else {
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (!isMounted) return;
        setIsAuthenticated(false);
        router.replace('/login');
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    }

    checkUserSession();

    // Listen to real-time auth events (token refresh, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setIsAuthenticated(false);
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('kryin_cached_server');
          } catch (e) {}
        }
        router.replace('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // Loading state while checking authentication
  if (checkingAuth || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#f8f9fd] flex items-center justify-center p-4 font-mono">
        <div className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-500/5 p-8 max-w-sm w-full text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 text-blue-600 shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight mb-1">
            Verifying Authentication
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Confirming cryptographically signed operator session...
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-100 px-3.5 py-1.5 rounded-full">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Validating Guard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
