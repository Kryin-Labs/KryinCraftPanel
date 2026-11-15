import React from 'react';
import Link from 'next/link';
import { Compass, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fd] flex items-center justify-center p-4 font-mono">
      <div className="bg-white border border-blue-100 rounded-2xl shadow-xl shadow-blue-500/5 p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4 text-blue-600 shadow-inner">
          <Compass className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          404 - Not Found
        </span>

        <h2 className="text-base font-bold text-slate-900 tracking-tight mt-3 mb-1">
          Route Does Not Exist
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The requested path was not found or has been relocated within the KryinCraft portal.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/dashboard"
            className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
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
