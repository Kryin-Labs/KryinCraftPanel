'use client';

import { useState, type FormEvent } from 'react';
import { allServerPermissions, permissionGroups, type ServerPermission } from '@/lib/serverPermissions';
import { createClient } from '@/lib/supabase/client';

type ShareUser = { username: string; display_name: string | null; permissions: ServerPermission[] };
const button = 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50';

export function UsernameSharing({
  serverId, members, onSaved,
}: {
  serverId: string;
  members: ShareUser[];
  onSaved: () => Promise<void>;
}) {
  const [candidate, setCandidate] = useState('');
  const [recipient, setRecipient] = useState<ShareUser | null>(null);
  const [permissions, setPermissions] = useState<ServerPermission[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  function edit(user: ShareUser) {
    setRecipient(user);
    setPermissions(user.permissions);
    setError('');
    setNotice('');
  }

  async function find(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    setRecipient(null);
    try {
      const { data, error } = await createClient().rpc('find_server_share_user', {
        target_server: serverId, candidate: candidate.trim().replace(/^@/, ''),
      });
      if (error) throw error;
      const user = data?.[0];
      if (!user) {
        setError('No matching username found.');
        return;
      }
      edit({ ...user, permissions: members.find((member) => member.username === user.username)?.permissions ?? [] });
    } catch {
      setError('Could not look up that username.');
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recipient) return;
    setBusy(true);
    setError('');
    try {
      const { error } = await createClient().rpc('share_server_with_user', {
        target_server: serverId, candidate: recipient.username, permissions,
      });
      if (error) {
        setError(error.message);
        return;
      }
      setNotice('Access saved for @' + recipient.username + '.');
      setRecipient(null);
      setCandidate('');
      await onSaved();
    } catch {
      setError('Could not refresh access. Reload to check the saved permissions.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="font-semibold">Share by username</h2>
      <form onSubmit={find} className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-40 flex-1 flex-col gap-1 text-sm">
          Portal username
          <input value={candidate} onChange={(event) => setCandidate(event.target.value)} required maxLength={31}
            placeholder="@username" className="rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <button className={button} disabled={busy}>Find user</button>
      </form>
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {members.map((user) => (
            <button key={user.username} type="button" className={button} onClick={() => edit(user)} disabled={busy}>
              Edit @{user.username}
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="text-sm text-emerald-800">{notice}</p>}
      {recipient && (
        <form onSubmit={save} className="space-y-4 border-t border-slate-200 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="break-all font-semibold">@{recipient.username}</h3>
            <span className="text-sm text-slate-600">{permissions.length} of {allServerPermissions.length} permissions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={button} disabled={busy} onClick={() => setPermissions(allServerPermissions)}>Allow all</button>
            <button type="button" className={button} disabled={busy} onClick={() => setPermissions([])}>Deny all</button>
          </div>
          <p className="text-sm text-slate-600">Shared members can see the overview. The server owner manages sharing and server addresses.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {permissionGroups.map((group) => (
              <fieldset key={group.title} disabled={busy} className="space-y-2 rounded-lg border border-slate-200 px-3 pb-3">
                <legend className="px-1 text-sm font-semibold">{group.title}</legend>
                {group.options.map(([permission, label]) => (
                  <label key={permission} className="flex items-center justify-between gap-2 rounded-md bg-slate-50 p-2 text-sm">
                    {label}
                    <input type="checkbox" checked={permissions.includes(permission)} className="size-4 shrink-0 accent-blue-700"
                      onChange={(event) => {
                        const checked = event.target.checked;
                        setPermissions((current) => checked ? [...current, permission] : current.filter((entry) => entry !== permission));
                      }} />
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" className={button} disabled={busy} onClick={() => setRecipient(null)}>Cancel</button>
            <button disabled={busy} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Save access</button>
          </div>
        </form>
      )}
    </section>
  );
}
