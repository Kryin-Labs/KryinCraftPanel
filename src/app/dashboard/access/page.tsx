'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useServerStore } from '@/lib/serverStore';
import { createClient } from '@/lib/supabase/client';

const roles = ['viewer', 'operator', 'admin'] as const;
type Role = (typeof roles)[number];
type Member = {
  id: string;
  role: Role | 'owner';
  profile: { email: string; display_name: string | null } | null;
};
type Invitation = {
  id: string;
  invited_email: string;
  role: Role;
  token: string;
  expires_at: string;
};

const button = 'rounded-md border border-current/25 px-3 py-2 text-sm hover:bg-current/5 disabled:opacity-50';
const field = 'min-w-0 rounded-md border border-current/25 bg-transparent px-3 py-2 text-sm';

export default function AccessPage() {
  const supabase = useMemo(() => createClient(), []);
  const { activeServerId, setActiveServerId, serverInfo, serverRole } = useServerStore();
  const serverId = activeServerId || serverInfo.id;
  const [invite, setInvite] = useState<string | null>(null);
  const [ownerServer, setOwnerServer] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const canManage = Boolean(serverId && ownerServer === serverId);

  useEffect(() => {
    setInvite(new URLSearchParams(window.location.search).get('invite'));
  }, []);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!serverId) return;
    const { data: owner, error: ownerError } = await supabase.rpc('is_server_member', {
      s_id: serverId,
      req_role: 'owner',
    });
    if (signal?.aborted) return;
    if (ownerError) throw ownerError;
    if (!owner) {
      setOwnerServer(null);
      return;
    }
    const [team, links] = await Promise.all([
      supabase.from('server_members').select('id, role, profile:profiles(email, display_name)').eq('server_id', serverId),
      supabase.from('invitations').select('id, invited_email, role, token, expires_at').eq('server_id', serverId)
        .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
    ]);
    if (signal?.aborted) return;
    if (team.error) throw team.error;
    if (links.error) throw links.error;
    setMembers(team.data as unknown as Member[]);
    setInvitations(links.data);
    setOwnerServer(serverId);
  }, [serverId, supabase]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    load(controller.signal)
      .catch(() => {
        if (!controller.signal.aborted) setError('Could not load server access.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [load]);

  async function manage(operation: 'invite' | 'cancel' | 'role' | 'remove', targetId?: string, accessRole?: Role) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error } = await supabase.rpc('manage_server_access', {
        target_server: serverId,
        operation,
        target_id: targetId,
        invite_email: operation === 'invite' ? email : undefined,
        access_role: accessRole,
      });
      if (error) {
        setError(error.message);
        return;
      }
      await load();
      if (operation === 'invite') setEmail('');
    } catch {
      setError('Could not refresh server access. Reload before retrying.');
    } finally {
      setBusy(false);
    }
  }

  function createInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void manage('invite', undefined, role);
  }

  async function acceptInvitation() {
    setBusy(true);
    setError('');
    try {
      const { data, error } = await supabase.rpc('accept_server_invitation', { invite_token: invite });
      if (error) {
        setError(error.message);
        return;
      }
      setActiveServerId(data);
      setInvite(null);
      window.history.replaceState(null, '', '/dashboard/access');
      setNotice('Invitation accepted. The shared server is selected.');
    } catch {
      setError('Could not check this invitation. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copyLink(token: string) {
    const url = new URL('/dashboard/access', window.location.origin);
    url.searchParams.set('invite', token);
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice('Invitation link copied.');
      setError('');
    } catch {
      setError('Clipboard unavailable. Copy the invitation link from the link field.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <header>
        <h1 className="text-2xl font-semibold">Server access</h1>
        {serverRole && <p className="mt-1 text-sm opacity-70">{serverInfo.name} · <span className="capitalize">{serverRole}</span></p>}
      </header>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}

      {invite && (
        <section className="space-y-3 rounded-xl border border-current/20 p-4">
          <h2 className="font-semibold">Server invitation</h2>
          <p className="text-sm opacity-70">Accept using the account with the email address that received the invitation.</p>
          <button type="button" className={button} disabled={busy} onClick={acceptInvitation}>Accept invitation</button>
        </section>
      )}

      {loading && <p role="status" className="text-sm opacity-70">Loading access…</p>}
      {!loading && !invite && !canManage && !error && (
        <p className="text-sm opacity-70">{serverId ? 'Only the server owner can manage sharing.' : 'Select a server to manage access.'}</p>
      )}

      {canManage && !loading && (
        <>
          <section className="space-y-4 rounded-xl border border-current/20 p-4">
            <h2 className="font-semibold">Invite someone</h2>
            <form onSubmit={createInvitation} className="flex flex-wrap items-end gap-3">
              <label className="flex min-w-48 flex-1 flex-col gap-1 text-sm">
                Email address
                <input className={field} type="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Role
                <select className={field} value={role} onChange={(event) => setRole(event.target.value as Role)}>
                  <RoleOptions />
                </select>
              </label>
              <button className={button} disabled={busy}>Create invite link</button>
            </form>
            <dl className="space-y-1 text-sm opacity-70">
              <div><dt className="inline font-medium">Viewer</dt> <dd className="inline">can view the dashboard and logs.</dd></div>
              <div><dt className="inline font-medium">Operator</dt> <dd className="inline">can also start, stop, and restart the server.</dd></div>
              <div><dt className="inline font-medium">Admin</dt> <dd className="inline">can also run console commands and manage files and server settings.</dd></div>
            </dl>
          </section>

          <section className="space-y-3 rounded-xl border border-current/20 p-4">
            <h2 className="font-semibold">Members</h2>
            <p className="text-sm">You <span className="opacity-70">· Owner</span></p>
            {members.filter((member) => member.role !== 'owner').map((member) => (
              <div key={member.id} className="flex flex-wrap items-center gap-2 border-t border-current/15 pt-3">
                <div className="min-w-40 flex-1 break-all text-sm">{member.profile?.email || member.profile?.display_name || 'Member'}</div>
                <select aria-label={'Role for ' + (member.profile?.email || 'member')} className={field} value={member.role} disabled={busy}
                  onChange={(event) => manage('role', member.id, event.target.value as Role)}>
                  <RoleOptions />
                </select>
                <button type="button" className={button} disabled={busy} onClick={() => manage('remove', member.id)}>Remove</button>
              </div>
            ))}
          </section>

          <section className="space-y-3 rounded-xl border border-current/20 p-4">
            <h2 className="font-semibold">Pending invitations</h2>
            {!invitations.length && <p className="text-sm opacity-70">No pending invitations.</p>}
            {invitations.map((item) => (
              <div key={item.id} className="space-y-2 border-t border-current/15 pt-3 text-sm">
                <p className="break-all">{item.invited_email} · <span className="capitalize">{item.role}</span> · Expires {new Date(item.expires_at).toLocaleDateString()}</p>
                <div className="flex flex-wrap gap-2">
                  <input aria-label={'Invitation link for ' + item.invited_email} className={field + ' flex-1'} readOnly
                    value={window.location.origin + '/dashboard/access?invite=' + encodeURIComponent(item.token)}
                    onFocus={(event) => event.target.select()} />
                  <button type="button" className={button} onClick={() => copyLink(item.token)}>Copy link</button>
                  <button type="button" className={button} disabled={busy} onClick={() => manage('cancel', item.id)}>Revoke</button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

function RoleOptions() {
  return roles.map((role) => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>);
}
