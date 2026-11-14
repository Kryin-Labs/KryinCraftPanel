'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Shield,
  Key,
  Trash2,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  User,
  History,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { RoleMember, UserRole } from '@/types';
import { ConfirmModal } from '@/components/ConfirmModal';

const AVAILABLE_PERMISSIONS = [
  { id: 'server.view', name: 'View Server', desc: 'Can view server status & hardware metrics' },
  { id: 'server.start', name: 'Start Server', desc: 'Can start the Minecraft Paper process' },
  { id: 'server.stop', name: 'Stop Server', desc: 'Can gracefully shut down Paper' },
  { id: 'server.restart', name: 'Restart Server', desc: 'Can trigger safe restart' },
  { id: 'console.view', name: 'View Console', desc: 'Can read live Minecraft console stream' },
  { id: 'console.execute', name: 'Execute Commands', desc: 'Can send authorized Minecraft commands' },
  { id: 'logs.view', name: 'View & Download Logs', desc: 'Can view and download latest.log' },
  { id: 'players.view', name: 'View Players', desc: 'Can view player list, profiles & inventory' },
  { id: 'players.kick', name: 'Kick Players', desc: 'Can disconnect active players' },
  { id: 'players.ban', name: 'Ban Players', desc: 'Can ban & unban players from the server' },
  { id: 'players.manage', name: 'Manage Players', desc: 'Can heal, feed, teleport & alter gamemode' },
  { id: 'files.view', name: 'View Files', desc: 'Can browse server directory files' },
  { id: 'files.upload', name: 'Upload & Edit Files', desc: 'Can edit configuration and upload plugins' },
  { id: 'files.delete', name: 'Delete Files', desc: 'Can delete files from the server' },
  { id: 'access.manage', name: 'Manage Access', desc: 'Can invite members and change permissions' },
];

export default function AccessControlPage() {
  const { members, inviteMember, revokeMember, auditLogs } = useServerStore();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('operator');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'server.view',
    'players.view',
    'logs.view',
  ]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<RoleMember | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setInviteRole(role);
    if (role === 'owner') {
      setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.id));
    } else if (role === 'admin') {
      setSelectedPermissions([
        'server.view',
        'server.start',
        'server.stop',
        'server.restart',
        'console.view',
        'console.execute',
        'logs.view',
        'players.view',
        'players.kick',
        'players.ban',
        'players.manage',
        'files.view',
      ]);
    } else if (role === 'operator') {
      setSelectedPermissions([
        'server.view',
        'console.view',
        'logs.view',
        'players.view',
        'players.kick',
        'players.manage',
      ]);
    } else {
      setSelectedPermissions(['server.view', 'logs.view', 'players.view']);
    }
  };

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    await inviteMember(inviteEmail, inviteRole, selectedPermissions);
    setInviteEmail('');
    setIsInviteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            Access & Permissions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-based access control, cryptographic backend permission verification, and audit logs.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {/* Role Matrix Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#111722] border border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Owner</span>
            <Lock className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xs text-slate-300">
            Absolute root access. Cannot be revoked or modified. Manages secrets and agent tokens.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Admin</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xs text-slate-300">
            Can start/stop server, execute commands, manage players, and inspect configuration files.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Operator</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-300">
            Day-to-day moderation: kick players, moderate chat, view logs and hardware telemetry.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viewer</span>
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-300">
            Read-only visibility into server status, player counts, and hardware statistics.
          </p>
        </div>
      </div>

      {/* Authorized Server Members List */}
      <div className="bg-[#111722] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Authorized Users ({members.length})</h2>
          <span className="text-xs text-slate-400">Validated on Supabase backend</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {members.map((member) => (
            <div
              key={member.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {member.displayName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{member.displayName}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        member.role === 'owner'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                          : member.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                          : member.role === 'operator'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {member.role}
                    </span>
                    {member.isPending && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[11px] text-slate-500 hidden md:inline">
                  {member.customPermissions.includes('*')
                    ? 'All Permissions (*)'
                    : `${member.customPermissions.length} Granular Permissions`}
                </span>

                {member.role !== 'owner' && (
                  <button
                    onClick={() => setRevokeTarget(member)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                    title="Revoke access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Log */}
      <div className="bg-[#111722] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Security Audit Log</h2>
          </div>
          <span className="text-xs text-slate-400">Tamper-evident record</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto font-mono text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-800/30 transition-colors space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-blue-400 font-bold">{log.action}</span>
                <span className="text-slate-500">{log.timestamp}</span>
              </div>
              <p className="text-slate-300 font-sans">{log.details}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>By: {log.userEmail}</span>
                {log.target && <span>• Target: {log.target}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#111722] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Invite Server Member</h3>
              </div>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'operator', 'viewer'] as UserRole[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
                        inviteRole === r
                          ? 'bg-blue-600 text-white border-blue-500 shadow'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Granular Permissions ({selectedPermissions.length} selected)
                </label>
                <div className="max-h-44 overflow-y-auto space-y-1.5 p-2 bg-[#0a0d14] rounded-xl border border-slate-800">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <div className="text-[11px]">
                        <span className="font-semibold text-slate-200 block">{perm.name}</span>
                        <span className="text-slate-500 text-[10px]">{perm.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://kryin-panel.vercel.app/invite/token-` + Math.random().toString(36).substring(2)
                    );
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Direct Link'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20"
                  >
                    Dispatch Invitation
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Member Confirmation */}
      <ConfirmModal
        isOpen={revokeTarget !== null}
        title={`Revoke Access for ${revokeTarget?.displayName}?`}
        message={`This will immediately invalidate all session tokens and backend permissions for ${revokeTarget?.email}.`}
        confirmText="Revoke Access"
        isDestructive={true}
        onConfirm={async () => {
          if (revokeTarget) {
            await revokeMember(revokeTarget.id);
            setRevokeTarget(null);
          }
        }}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  );
}
