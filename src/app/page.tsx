import Link from 'next/link';
import { Server, Shield, Smartphone, Terminal, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between p-6 sm:p-12 max-w-5xl mx-auto">
      <header className="flex items-center justify-between py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">KryinCraftPanel</h1>
            <p className="text-xs text-slate-400">ROG Phone 5s Termux Paper Server</p>
          </div>
        </div>
        <Link
          href="/login"
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          Sign In
        </Link>
      </header>

      <section className="py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Paper 26.3 • ROG Phone 5s Active
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Mobile-First Minecraft Management
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Ultralight, secure, remote control dashboard for your phone-hosted Paper Minecraft server. Outbound HTTPS polling, zero inbound open ports required.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm px-6 py-3 rounded-xl transition-all"
          >
            Sign In
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-8">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-sm text-slate-200">Phone Optimized</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Zero heavy runtimes on the ROG 5s. Standard Java 25 & Termux shell client.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-sm text-slate-200">Supabase Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Role-based access control, hashed agent tokens, and Row Level Security.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <Terminal className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-sm text-slate-200">Full Remote Control</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Safe process management, player inventory viewer, live console, and file manager.
          </p>
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-slate-600 border-t border-slate-800/60">
        KryinCraftPanel • ROG Phone 5s (Android 13 / Termux) • Vercel + Supabase
      </footer>
    </main>
  );
}
