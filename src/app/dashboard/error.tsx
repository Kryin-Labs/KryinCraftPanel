'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard component failure intercepted:', error);
  }, [error]);

  const handleResetCache = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kryin_cached_server');
        sessionStorage.clear();
      } catch (e) {}
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 font-mono">
      <div className="bg-white border border-red-200/80 rounded-2xl shadow-xl shadow-red-500/5 p-8 max-w-lg w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600 shadow-inner">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200 uppercase tracking-wider mb-2">
          <span>Crash Interceptor</span>
        </div>

        <h2 className="text-base font-bold text-slate-900 tracking-tight mb-2">
          Dashboard View Interrupted
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          An unexpected error occurred while rendering the dashboard view. Your server and node agent are unaffected and still running.
        </p>

        {error.message && (
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs font-mono text-slate-700 break-words max-h-32 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry View
          </button>
          <button
            onClick={handleResetCache}
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-slate-500" />
            Reset Cache & Reload
          </button>
        </div>
      </div>
    </div>
  );
}
