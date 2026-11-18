'use client';

import { createContext, useContext, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUpRight, Mail, Server, X } from 'lucide-react';

const ServerCapacityContext = createContext<(() => void) | null>(null);

export function ServerCapacityProvider({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  function open() {
    setError('');
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await fetch('/api/server-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await result.json();
      if (!result.ok) throw new Error(data.error);
      setJoined(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not join the waitlist. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ServerCapacityContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="server-capacity-title"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[42rem] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="relative">
          <form method="dialog" className="absolute right-3 top-3">
            <button aria-label="Close dialog" className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">
              <X size={18} aria-hidden />
            </button>
          </form>
          <div className="px-5 pb-4 pt-6 sm:px-7">
            <div className="mb-3 grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-800">
              <Server size={20} aria-hidden />
            </div>
            <h2 id="server-capacity-title" className="text-2xl font-bold tracking-tight">Server Full</h2>
            <p className="mt-1 text-sm text-slate-600">All server slots are currently taken.</p>
          </div>

          <div className="grid sm:grid-cols-2">
            <section className="border-t border-slate-200 px-5 py-5 sm:px-7">
              <h3 className="font-semibold">Get notified</h3>
              {joined ? (
                <p role="status" className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">You’re on the waitlist.</p>
              ) : (
                <form onSubmit={join} className="mt-2 space-y-3">
                  <label className="block space-y-2 text-sm text-slate-600">
                    <span>Enter your email to be notified when a server slot opens.</span>
                    <input type="email" autoComplete="email" required maxLength={254} value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-700"
                      placeholder="you@example.com" />
                  </label>
                  {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                  <button disabled={busy} className="w-full rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60">
                    {busy ? 'Joining…' : 'Notify me'}
                  </button>
                </form>
              )}
            </section>
            <section className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:border-l sm:px-7">
              <h3 className="font-semibold">Custom quick access</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Email us your server specs and requirements, including your Minecraft version, RAM, and expected player count.</p>
              <a href="mailto:official.kryin@gmail.com?subject=Custom%20Minecraft%20server%20access"
                className="mt-4 inline-flex max-w-full items-center gap-2 text-sm font-semibold text-blue-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-blue-700">
                <Mail size={16} aria-hidden className="shrink-0" />
                <span className="break-all">official.kryin@gmail.com</span>
                <ArrowUpRight size={14} aria-hidden className="shrink-0" />
              </a>
            </section>
          </div>
        </div>
      </dialog>
    </ServerCapacityContext.Provider>
  );
}

export function ServerCapacityButton({ children, className, onOpen }: {
  children: ReactNode;
  className?: string;
  onOpen?: () => void;
}) {
  const open = useContext(ServerCapacityContext);
  return (
    <button type="button" className={`cursor-pointer ${className ?? ''}`} onClick={() => {
      open?.();
      onOpen?.();
    }}>
      {children}
    </button>
  );
}
