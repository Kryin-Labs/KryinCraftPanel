'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8f9fd] text-[#1a1522] font-mono flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4 text-red-600">
            <svg
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mb-2">
            Critical System Encountered an Error
          </h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            The application intercepted an unhandled runtime error. Your session and data integrity remain protected.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => reset()}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/dashboard';
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
