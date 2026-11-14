'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal,
  Send,
  Trash2,
  Search,
  Download,
  Filter,
  Check,
  Zap,
  Radio,
  SlidersHorizontal,
  ChevronDown
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
  const { logs, sendConsoleCommand, clearLogs, serverInfo } = useServerStore();
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
    <div className="space-y-4 font-mono">
      {/* Console Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            Live Minecraft Terminal
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time interactive RCON stream for Paper 1.21.4 on Mumbai Node 01.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#14121c] border border-[#2b273b] rounded-lg text-xs text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 w-36 sm:w-44 font-mono"
            />
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center rounded-lg bg-[#14121c] border border-[#2b273b] p-0.5 text-[11px]">
            {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setLogFilter(level)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  logFilter === level
                    ? 'bg-[#221f2f] text-emerald-400 font-bold border border-[#38334c]'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          {/* Download Logs */}
          <button
            onClick={handleDownloadLogs}
            className="p-2 rounded-lg bg-[#14121c] hover:bg-[#1e1b29] text-zinc-300 hover:text-white border border-[#2b273b] text-xs transition-colors"
            title="Download full log file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearLogs}
            className="p-2 rounded-lg bg-[#14121c] hover:bg-[#1e1b29] text-zinc-300 hover:text-white border border-[#2b273b] text-xs transition-colors"
            title="Clear display logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Terminal Shell Card */}
      <div className="rounded-xl bg-[#0e0d13] border border-[#242131] flex flex-col overflow-hidden shadow-2xl">
        {/* Terminal Tab Bar */}
        <div className="h-10 bg-[#14121c] border-b border-[#242131] px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 font-bold">Node:</span>
            <span className="text-zinc-200 font-semibold">in-mumbai-01</span>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#242131]">
              {(['paper', 'world', 'players', 'network'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-0.5 rounded text-[11px] uppercase transition-colors ${
                    activeTab === tab
                      ? 'text-emerald-400 font-bold bg-[#1e1b29]'
                      : 'text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <label className="flex items-center gap-1.5 text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded bg-[#1a1724] border-[#2f2b3e] text-emerald-500 focus:ring-0"
              />
              <span>Auto-Scroll</span>
            </label>
            <span className="text-emerald-400 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" />
              20.0 TPS
            </span>
          </div>
        </div>

        {/* Scrollable Terminal Output Window */}
        <div className="p-4 bg-[#08070b] font-mono text-xs overflow-y-auto h-[520px] space-y-1.5 leading-relaxed select-text">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
              No log entries match the active filter or search query.
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isError = log.level === 'ERROR';
              const isWarn = log.level === 'WARN';
              const isCommand = log.message.startsWith('/') || log.message.includes('executed');

              return (
                <div key={log.id || idx} className="flex items-start gap-2.5 font-mono">
                  <span className="text-zinc-400 select-none flex-shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`font-semibold flex-shrink-0 text-[10px] px-1 py-0.2 rounded ${
                      isError
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : isWarn
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-zinc-800/80 text-zinc-400'
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
                        ? 'text-emerald-300 font-semibold'
                        : 'text-zinc-300'
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
        <form onSubmit={handleSubmit} className="p-3 bg-[#121019] border-t border-[#242131] flex items-center gap-2">
          <span className="text-emerald-400 font-bold font-mono pl-2 text-sm select-none">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type a Minecraft server command (e.g. /tps, /say Server restarting in 5m, /op Player)..."
            className="flex-1 bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 font-mono"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !commandInput.trim()}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors font-mono"
          >
            <span>{isSending ? 'Sending...' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Command Suggestions Strip */}
        <div className="px-4 py-2 bg-[#0e0d13] border-t border-[#1e1b29] flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="text-zinc-400 font-semibold">Shortcuts:</span>
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => setCommandInput(cmd.startsWith('/') ? cmd : `/${cmd}`)}
              className="px-2 py-0.5 rounded bg-[#181622] hover:bg-[#221f30] text-zinc-300 hover:text-white border border-[#2b273b] font-mono transition-colors"
            >
              /{cmd.replace(/^\//, '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
