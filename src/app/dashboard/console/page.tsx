'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Send,
  Trash2,
  Search,
  Download,
  Check,
  Radio
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

const QUICK_COMMANDS = [
  'tps',
  'list',
  'whitelist list',
  'time set day',
  'weather clear',
  'difficulty hard',
  'save-all',
  'version'
];

export default function DedicatedConsolePage() {
  const { logs, sendConsoleCommand, clearLogs } = useServerStore();
  const [commandInput, setCommandInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'paper' | 'world' | 'players' | 'network'>('paper');

  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || isSending) return;

    const cmd = commandInput.trim();
    setCommandInput('');
    setIsSending(true);
    await sendConsoleCommand(cmd);
    setIsSending(false);
  };

  const handleDownloadLogs = () => {
    const logText = logs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`)
      .join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kryincraft-console-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch = searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 font-mono text-[#1a1522]">
      {/* Console Top Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1a1522] flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-600" />
            Live Minecraft Terminal
          </h1>
          <p className="text-xs text-[#1a1522]/60 mt-0.5">
            Real-time interactive RCON stream for Paper 1.21.4 on Mumbai Datacenter Node 01.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1a1522]/40" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#f8f9fd] border border-[#1a1522]/15 rounded-lg text-xs text-[#1a1522] placeholder:text-[#1a1522]/40 focus:outline-none focus:border-blue-600 w-36 sm:w-44 font-mono transition-all"
            />
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center rounded-lg bg-[#f8f9fd] border border-[#1a1522]/15 p-0.5 text-[11px]">
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setLogFilter(level)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  logFilter === level
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-[#1a1522]/60 hover:text-[#1a1522]'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            className="p-2 rounded-lg bg-[#f8f9fd] hover:bg-slate-100 text-[#1a1522]/70 hover:text-[#1a1522] border border-[#1a1522]/15 text-xs transition-colors"
            title="Download full log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearLogs}
            className="p-2 rounded-lg bg-[#f8f9fd] hover:bg-red-50 text-red-600 border border-[#1a1522]/15 hover:border-red-200 text-xs transition-colors"
            title="Clear display logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Terminal Shell Card */}
      <div className="rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col overflow-hidden">
        {/* Terminal Tab Bar */}
        <div className="h-10 bg-[#fbfbfe] border-b border-[#1a1522]/10 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#1a1522]/50 font-bold">Node:</span>
            <span className="text-[#1a1522] font-semibold">in-mumbai-01</span>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#1a1522]/10">
              {(['paper', 'world', 'players', 'network'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2.5 py-0.5 rounded text-[11px] uppercase transition-colors ${
                    activeTab === tab
                      ? 'text-blue-700 font-bold bg-blue-50 border border-blue-200'
                      : 'text-[#1a1522]/60 hover:text-[#1a1522]'
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <label className="flex items-center gap-1.5 text-[#1a1522]/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-[#1a1522]/20 text-blue-600 focus:ring-0"
              />
              <span>Auto-Scroll</span>
            </label>
            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              20.0 TPS
            </span>
          </div>
        </div>

        {/* Scrollable Terminal Output Window (high contrast terminal interior) */}
        <div className="p-4 sm:p-5 bg-[#0e1117] font-mono text-xs overflow-y-auto h-[540px] space-y-1.5 leading-relaxed select-text">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              No log entries match the active filter or search query.
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isError = log.level === 'ERROR';
              const isWarn = log.level === 'WARN';
              const isCommand = log.message.startsWith('/') || log.message.includes('executed');

              return (
                <div key={log.id || idx} className="flex items-start gap-2.5 font-mono">
                  <span className="text-zinc-500 select-none flex-shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-semibold flex-shrink-0 text-[10px] px-1 py-0.2 rounded ${
                      isError
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : isWarn
                        ? 'bg-amber-950 text-amber-200 border border-amber-800'
                        : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {log.level}
                  </span>
                  <span
                    className={`break-all ${
                      isError
                        ? 'text-red-300'
                        : isWarn
                        ? 'text-amber-200'
                        : isCommand
                        ? 'text-blue-300 font-semibold'
                        : 'text-zinc-200'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
          <div ref={consoleEndRef} />
        </div>

        {/* Bottom Command Composer Form */}
        <form onSubmit={handleSubmit} className="p-3.5 bg-[#f8f9fd] border-t border-[#1a1522]/10 flex items-center gap-2">
          <span className="text-blue-600 font-bold font-mono pl-2 text-sm select-none">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type a Minecraft server command (e.g. /tps, /say Server restarting in 5m, /op Player)..."
            className="flex-1 bg-white border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] placeholder:text-[#1a1522]/40 focus:outline-none focus:border-blue-600 font-mono shadow-2xs"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !commandInput.trim()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all font-mono shadow-xs"
          >
            <span>{isSending ? 'Sending...' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Command Suggestions Strip */}
        <div className="px-4 py-2.5 bg-white border-t border-[#1a1522]/8 flex flex-wrap items-center gap-1.5 text-[11px] text-[#1a1522]/60">
          <span className="font-semibold text-[#1a1522]">Shortcuts:</span>
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => setCommandInput(cmd.startsWith('/') ? cmd : `/${cmd}`)}
              className="px-2 py-0.5 rounded-md bg-[#f8f9fd] hover:bg-blue-50 text-[#1a1522] hover:text-blue-700 border border-[#1a1522]/10 hover:border-blue-200 font-mono transition-colors"
            >
              /{cmd.replace(/^\//, '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
