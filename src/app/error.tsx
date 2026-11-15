'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime exception intercepted by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex items-center justify-center p-4 font-mono">
      <div className="bg-white border border-red-100 rounded-2xl shadow-xl shadow-red-500/5 p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600 shadow-inner">
          <AlertCircle className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
          Crash Guard Active
        </span>

        <h2 className="text-base font-bold text-slate-900 tracking-tight mt-3 mb-1">
          Something went wrong
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The operation encountered an unexpected error. Backend telemetry and server services are protected.
        </p>

        {error.message && (
          <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs font-mono text-slate-700 break-words max-h-28 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
