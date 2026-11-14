'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Send,
  Pause,
  Play,
  Trash2,
  Search,
  ArrowDown,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

const QUICK_COMMANDS = ['list', 'tps', 'save-all', 'say Hello world!', 'whitelist list', 'help'];

export default function ConsolePage() {
  const { logs, sendConsoleCommand, clearLogs, serverInfo } = useServerStore();
  const [commandInput, setCommandInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && !isPaused) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isPaused]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isSending) return;

    const cmd = commandInput;
    setCommandInput('');
    setIsSending(true);
    await sendConsoleCommand(cmd);
    setIsSending(false);
  };

  const handleQuickCommand = (cmd: string) => {
    setCommandInput(cmd);
  };

  const filteredLogs = logs.filter((log) =>
    searchQuery ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  return (
    <div className="space-y-4">
      {/* Console Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-400" />
            Live Server Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Restricted Minecraft command stream. Direct shell commands are blocked for system security.
          </p>
        </div>

        {/* Console Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search console..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#111722] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-36 sm:w-48"
            />
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPaused
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            title={isPaused ? 'Resume stream' : 'Pause stream'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              autoScroll
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-400'
                : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Auto-scroll"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Auto-scroll</span>
          </button>

          <button
            onClick={clearLogs}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear display"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Screen */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-hidden shadow-inner flex flex-col h-[58vh]">
        {/* Terminal Title bar */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-400 font-sans font-medium">paper-server@rog-5s:~/minecraft/server</span>
          </div>
          <div className="flex items-center gap-2 font-sans">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-semibold">RCON Filter Active</span>
          </div>
        </div>

        {/* Scrollable logs area */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 select-text">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 py-8 text-center font-sans">
              No console logs match your search filter.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isCommand = log.message.startsWith('>');
              const isError = log.level === 'ERROR' || log.message.includes('Exception') || log.message.includes('Error');
              const isWarn = log.level === 'WARN' || log.message.includes('Warning');

              return (
                <div
                  key={log.id}
                  className={`leading-relaxed break-words flex gap-2 ${
                    isCommand
                      ? 'text-blue-400 font-bold bg-blue-950/20 px-1.5 py-0.5 rounded'
                      : isError
                      ? 'text-rose-400'
                      : isWarn
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                  <span>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Quick Command Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 text-[11px] flex items-center gap-1 shrink-0 font-medium">
          <Sparkles className="w-3 h-3 text-blue-400" />
          Quick:
        </span>
        {QUICK_COMMANDS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={() => handleQuickCommand(cmd)}
            className="px-2.5 py-1 rounded-lg bg-[#111722] hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px] shrink-0 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Command Input Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-500 text-sm font-bold">
            &gt;
          </span>
          <input
            type="text"
            placeholder={
              serverInfo.status === 'online'
                ? 'Type Minecraft command (e.g. "tps", "list", "say hello")...'
                : 'Server is offline. Start the server to issue commands.'
            }
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={serverInfo.status !== 'online' || isSending}
            className="w-full bg-[#111722] border border-slate-800 rounded-xl py-2.5 pl-8 pr-4 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          />
        </div>

        <button
          type="submit"
          disabled={serverInfo.status !== 'online' || !commandInput.trim() || isSending}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
