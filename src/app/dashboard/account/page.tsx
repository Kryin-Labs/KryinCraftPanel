'use client';

import { useState } from 'react';
import { Check, Copy, Mail, UserRound } from 'lucide-react';
import { usePanelUser } from '@/components/AuthGuard';
import { usePanelUsername } from '@/components/UsernameGate';

export default function AccountPage() {
  const user = usePanelUser();
  const username = usePanelUsername();
  const [feedback, setFeedback] = useState('');
  const provider = user.app_metadata.provider === 'github' ? 'GitHub' : 'Email';

  async function copyUsername() {
    if (!username) return;
    try {
      await navigator.clipboard.writeText(username);
      setFeedback('Username copied.');
    } catch {
      setFeedback('Select the username to copy it.');
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4" aria-labelledby="account-title">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-800">
          <UserRound aria-hidden="true" className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h1 id="account-title" className="text-xl font-bold text-slate-950">My account</h1>
        </div>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <dl className="divide-y divide-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-slate-600">Shareable username</dt>
              <dd className="mt-1 break-all text-sm font-bold text-slate-950">{username}</dd>
            </div>
            <button type="button" onClick={() => void copyUsername()} disabled={!username}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-700">
              {feedback === 'Username copied.' ? <Check aria-hidden="true" className="h-4 w-4" /> : <Copy aria-hidden="true" className="h-4 w-4" />}
              Copy username
            </button>
            <p className="basis-full text-xs text-slate-600">Give this username to a server owner. They can add you from their Access page.</p>
          </div>
          <div className="py-4">
            <dt className="text-xs font-semibold text-slate-600">Sign-in email</dt>
            <dd className="mt-1 flex items-start gap-2 break-all text-sm text-slate-950">
              <Mail aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              {user.email || 'Email unavailable'}
            </dd>
          </div>
          <div className="pt-4">
            <dt className="text-xs font-semibold text-slate-600">Sign-in method</dt>
            <dd className="mt-1 text-sm font-medium text-slate-950">{provider}</dd>
          </div>
        </dl>
        {feedback && <p role="status" className="text-xs text-slate-600">{feedback}</p>}
      </div>
    </section>
  );
}
