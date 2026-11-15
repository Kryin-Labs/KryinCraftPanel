'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal as TerminalIcon,
  Send,
  Trash2,
  Search,
  Download,
  Radio,
  Power,
  ChevronUp,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { formatMinecraftLog } from '@/lib/xterm/formatMinecraftLog';
import { XtermScrollDownHelperAddon } from '@/lib/xterm/XtermScrollDownHelperAddon';
import { PowerButtons } from '@/components/server/PowerButtons';
import { StatGraphs } from '@/components/server/StatGraphs';

import '@xterm/xterm/css/xterm.css';

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

const PTERODACTYL_THEME = {
  background: '#0d1117',
  foreground: '#c9d1d9',
  cursor: '#58a6ff',
  cursorAccent: '#0d1117',
  black: '#000000',
  red: '#E54B4B',
  green: '#9ECE58',
  yellow: '#FAED70',
  blue: '#396FE2',
  magenta: '#BB80B3',
  cyan: '#2DDAFD',
  white: '#d0d0d0',
  brightBlack: '#6e7681',
  brightRed: '#FF5370',
  brightGreen: '#C3E88D',
  brightYellow: '#FFCB6B',
  brightBlue: '#82AAFF',
  brightMagenta: '#C792EA',
  brightCyan: '#89DDFF',
  brightWhite: '#ffffff',
  selectionBackground: '#1f6feb55',
};

const TERMINAL_PRELUDE = '\u001b[1m\u001b[33mcontainer@indian-node~ \u001b[0m';

export default function DedicatedConsolePage() {
  const { logs, serverInfo, sendConsoleCommand, clearLogs } = useServerStore();

  const [commandInput, setCommandInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'paper' | 'world' | 'players' | 'network'>('paper');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isTerminalReady, setIsTerminalReady] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Command History
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // DOM Refs & Addons
  const terminalElementRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const terminalInstanceRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const searchAddonRef = useRef<any>(null);
  const scrollHelperAddonRef = useRef<XtermScrollDownHelperAddon | null>(null);
  const writtenLogIdsRef = useRef<Set<string>>(new Set());
  const prevStatusRef = useRef<string>(serverInfo.status);
  const lastTimestampRef = useRef<string | null>(null);

  // Dedicated High-Speed (400ms) Console Streamer (Pterodactyl parity)
  useEffect(() => {
    if (!isTerminalReady) return;
    let isMounted = true;
    let isFetching = false;

    async function streamFastLogs() {
      if (isFetching || !isMounted) return;
      isFetching = true;
      try {
        const term = terminalInstanceRef.current;
        if (!term) return;

        const serverParam = serverInfo.id ? `&serverId=${encodeURIComponent(serverInfo.id)}` : '';
        const sinceParam = lastTimestampRef.current ? `&since=${encodeURIComponent(lastTimestampRef.current)}` : '';
        const res = await fetch(`/api/server/console?limit=150${serverParam}${sinceParam}`);
        if (!res.ok) return;

        const data = await res.json();
        if (!data || !isMounted) return;

        if (Array.isArray(data.logs) && data.logs.length > 0) {
          let wroteAny = false;
          for (const log of data.logs) {
            const logKey = log.id || `${log.timestamp}-${log.message}`;
            if (!writtenLogIdsRef.current.has(logKey)) {
              writtenLogIdsRef.current.add(logKey);
              term.writeln(formatMinecraftLog(log.message));
              wroteAny = true;
            }
          }
          if (wroteAny) {
            term.scrollToBottom();
          }
        }

        if (data.latestTimestamp) {
          lastTimestampRef.current = data.latestTimestamp;
        }
      } catch (err) {
        // silent fail on transient network errors
      } finally {
        isFetching = false;
      }
    }

    // Initial instant fetch
    streamFastLogs();

    // 400ms continuous streaming interval (Pterodactyl speed)
    const streamInterval = setInterval(streamFastLogs, 400);

    return () => {
      isMounted = false;
      clearInterval(streamInterval);
    };
  }, [isTerminalReady, serverInfo.id]);

  // Smooth Pterodactyl-style status change events in terminal
  useEffect(() => {
    const term = terminalInstanceRef.current;
    if (!term || !isTerminalReady) return;

    const prev = prevStatusRef.current;
    const current = serverInfo.status;
    if (prev !== current) {
      prevStatusRef.current = current;

      if (current === 'starting') {
        term.clear();
        writtenLogIdsRef.current.clear();
        term.writeln(`${TERMINAL_PRELUDE}\u001b[1m\u001b[33mServer marked as starting...\u001b[0m`);
      } else if (current === 'online') {
        term.writeln(`${TERMINAL_PRELUDE}\u001b[1m\u001b[32mServer marked as running...\u001b[0m`);
      } else if (current === 'stopping') {
        term.writeln(`${TERMINAL_PRELUDE}\u001b[1m\u001b[33mServer marked as stopping...\u001b[0m`);
      } else if (current === 'offline') {
        term.writeln(`${TERMINAL_PRELUDE}\u001b[1m\u001b[31mServer marked as offline.\u001b[0m`);
      }
    }
  }, [serverInfo.status, isTerminalReady]);

  // Load command history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kryin:command_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 50));
        }
      }
    } catch (e) {}
  }, []);

  // Initialize xterm.js instance
  useEffect(() => {
    let isMounted = true;

    async function initXterm() {
      if (!terminalElementRef.current || terminalInstanceRef.current) return;

      const { Terminal } = await import('@xterm/xterm');
      const { FitAddon } = await import('@xterm/addon-fit');
      const { SearchAddon } = await import('@xterm/addon-search');
      const { WebLinksAddon } = await import('@xterm/addon-web-links');
      const { Unicode11Addon } = await import('@xterm/addon-unicode11');

      if (!isMounted || !terminalElementRef.current) return;

      const term = new Terminal({
        cursorStyle: 'bar',
        cursorBlink: true,
        disableStdin: true,
        allowTransparency: true,
        fontSize: 12.5,
        lineHeight: 1.35,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        theme: PTERODACTYL_THEME,
        scrollback: 3000,
        convertEol: true,
      });

      const fitAddon = new FitAddon();
      const searchAddon = new SearchAddon();
      const webLinksAddon = new WebLinksAddon();
      const unicode11Addon = new Unicode11Addon();
      const scrollHelperAddon = new XtermScrollDownHelperAddon();

      term.loadAddon(fitAddon);
      term.loadAddon(searchAddon);
      term.loadAddon(webLinksAddon);
      term.loadAddon(unicode11Addon);
      term.loadAddon(scrollHelperAddon);

      term.open(terminalElementRef.current);
      term.unicode.activeVersion = '11';

      // Clipboard copy on Ctrl+C / Cmd+C when text is selected
      term.attachCustomKeyEventHandler((e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
          const selection = term.getSelection();
          if (selection) {
            navigator.clipboard.writeText(selection);
            return false;
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          setIsSearchOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 50);
          return false;
        } else if (e.key === 'Escape') {
          setIsSearchOpen(false);
          term.focus();
        }
        return true;
      });

      try {
        fitAddon.fit();
      } catch (e) {}

      terminalInstanceRef.current = term;
      fitAddonRef.current = fitAddon;
      searchAddonRef.current = searchAddon;
      scrollHelperAddonRef.current = scrollHelperAddon;

      // Welcome header
      term.writeln(`${TERMINAL_PRELUDE}\u001b[92mConnected to Indian Node (Paper 1.21.4)\u001b[0m`);
      term.writeln(`${TERMINAL_PRELUDE}\u001b[90mSession established. Type /help or shortcuts below for commands.\u001b[0m\r\n`);
      setIsTerminalReady(true);
    }

    initXterm();

    // Resize handler with debounce
    const handleResize = () => {
      if (fitAddonRef.current && terminalElementRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {}
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (scrollHelperAddonRef.current) {
        scrollHelperAddonRef.current.dispose();
      }
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
    };
  }, []);

  // Stream new logs to xterm without clearing history
  useEffect(() => {
    const term = terminalInstanceRef.current;
    if (!term || !isTerminalReady) return;

    if (!logs || logs.length === 0) {
      if (serverInfo.status === 'offline') {
        term.clear();
        writtenLogIdsRef.current.clear();
        term.writeln(`${TERMINAL_PRELUDE}\u001b[90mServer marked as offline. Console ready for fresh startup.\u001b[0m\r\n`);
      }
      return;
    }

    let wroteAny = false;
    for (const log of logs) {
      const logKey = log.id || `${log.timestamp}-${log.message}`;
      if (!writtenLogIdsRef.current.has(logKey)) {
        writtenLogIdsRef.current.add(logKey);
        term.writeln(formatMinecraftLog(log.message));
        wroteAny = true;
      }
    }

    if (wroteAny) {
      term.scrollToBottom();
    }
  }, [logs, isTerminalReady, serverInfo.status]);

  // Fit terminal when container layout changes or toggles fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {}
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isMaximized]);

  // Search logic
  const handleSearchNext = useCallback(() => {
    if (searchAddonRef.current && searchQuery.trim()) {
      searchAddonRef.current.findNext(searchQuery.trim(), {
        decorations: {
          matchOverviewRuler: '#3b82f6',
          activeMatchColorOverviewRuler: '#ef4444',
        },
      });
    }
  }, [searchQuery]);

  const handleSearchPrev = useCallback(() => {
    if (searchAddonRef.current && searchQuery.trim()) {
      searchAddonRef.current.findPrevious(searchQuery.trim());
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() && searchAddonRef.current) {
      searchAddonRef.current.findNext(searchQuery.trim());
    }
  }, [searchQuery]);

  // Key navigation for Command History
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(nextIndex);
      setCommandInput(history[nextIndex] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setCommandInput(history[nextIndex] || '');
      }
    }
  };

  // Execute Console Command
  const executeCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd || isSending) return;

    // Update command history (latest first, limit 50)
    const newHistory = [cmd, ...history.filter((c) => c !== cmd)].slice(0, 50);
    setHistory(newHistory);
    setHistoryIndex(-1);
    try {
      localStorage.setItem('kryin:command_history', JSON.stringify(newHistory));
    } catch (err) {}

    // Echo command in local terminal immediately
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.writeln(
        `${TERMINAL_PRELUDE}\u001b[36;1m${cmd.startsWith('/') ? cmd : `/${cmd}`}\u001b[0m`
      );
      terminalInstanceRef.current.scrollToBottom();
    }

    setCommandInput('');
    setIsSending(true);
    try {
      await sendConsoleCommand(cmd);

      // Fast-poll output after 200ms and 500ms for instantaneous Pterodactyl response
      setTimeout(async () => {
        try {
          const serverParam = serverInfo.id ? `&serverId=${encodeURIComponent(serverInfo.id)}` : '';
          const sinceParam = lastTimestampRef.current ? `&since=${encodeURIComponent(lastTimestampRef.current)}` : '';
          const res = await fetch(`/api/server/console?limit=50${serverParam}${sinceParam}`);
          if (!res.ok) return;
          const data = await res.json();
          if (Array.isArray(data.logs) && data.logs.length > 0 && terminalInstanceRef.current) {
            for (const log of data.logs) {
              const logKey = log.id || `${log.timestamp}-${log.message}`;
              if (!writtenLogIdsRef.current.has(logKey)) {
                writtenLogIdsRef.current.add(logKey);
                terminalInstanceRef.current.writeln(formatMinecraftLog(log.message));
              }
            }
            terminalInstanceRef.current.scrollToBottom();
            if (data.latestTimestamp) lastTimestampRef.current = data.latestTimestamp;
          }
        } catch (e) {}
      }, 250);
    } catch (err: any) {
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.writeln(
          `\u001b[91m[Command Error: ${err?.message || err}]\u001b[0m`
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(commandInput);
  };

  const handleClearLogs = () => {
    clearLogs();
    writtenLogIdsRef.current.clear();
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.clear();
      terminalInstanceRef.current.writeln(
        `${TERMINAL_PRELUDE}\u001b[90mConsole buffer cleared by operator.\u001b[0m\r\n`
      );
    }
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

  return (
    <div className={`space-y-4 font-mono text-[#1a1522] ${isMaximized ? 'fixed inset-4 z-50 bg-[#0d1117] flex flex-col p-4 rounded-2xl shadow-2xl border border-white/10' : ''}`}>
      {/* Console Top Header Bar */}
      {!isMaximized && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1522] flex items-center gap-2">
              <TerminalIcon className="w-5 h-5 text-blue-600" />
              Live Minecraft Terminal
            </h1>
            <p className="text-xs text-[#1a1522]/60 mt-0.5">
              Interactive low-latency xterm.js console for {serverInfo.name || 'Minecraft Server'} on Indian Node.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Pterodactyl Power Buttons */}
            <PowerButtons compact />

            <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

            {/* Search Toggle */}
            <button
              onClick={() => {
                setIsSearchOpen((prev) => !prev);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                isSearchOpen
                  ? 'bg-blue-600 text-white border-blue-600 font-bold'
                  : 'bg-[#f8f9fd] hover:bg-slate-100 text-[#1a1522]/70 border-[#1a1522]/15'
              }`}
              title="Search logs (Ctrl+F)"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            {/* Download Logs */}
            <button
              onClick={handleDownloadLogs}
              className="p-2 rounded-lg bg-[#f8f9fd] hover:bg-slate-100 text-[#1a1522]/70 hover:text-[#1a1522] border border-[#1a1522]/15 text-xs transition-colors"
              title="Download raw log text file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Clear Logs */}
            <button
              onClick={handleClearLogs}
              className="p-2 rounded-lg bg-[#f8f9fd] hover:bg-red-50 text-red-600 border border-[#1a1522]/15 hover:border-red-200 text-xs transition-colors"
              title="Clear terminal buffer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsMaximized((prev) => !prev)}
              className="p-2 rounded-lg bg-[#f8f9fd] hover:bg-slate-100 text-[#1a1522]/70 hover:text-[#1a1522] border border-[#1a1522]/15 text-xs transition-colors"
              title={isMaximized ? 'Exit Fullscreen' : 'Expand Terminal'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Main Terminal Shell Card */}
      <div className={`rounded-2xl bg-[#0d1117] border border-[#1a1522]/10 shadow-xs flex flex-col overflow-hidden ${isMaximized ? 'flex-1 border-white/10' : ''}`}>
        {/* Terminal Header Bar */}
        <div className="min-h-11 py-1.5 bg-[#161b22] border-b border-white/10 px-3 sm:px-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Device Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px] font-bold">
              <span className={`w-2 h-2 rounded-full ${serverInfo.deviceConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-zinc-400">Device:</span>
              <span className={serverInfo.deviceConnected ? 'text-emerald-400' : 'text-amber-400'}>
                {serverInfo.deviceConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>

            {/* Minecraft Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px] font-bold">
              <span className="text-zinc-400">Minecraft:</span>
              <span className={
                serverInfo.status === 'online'
                  ? 'text-emerald-400'
                  : serverInfo.status === 'starting'
                  ? 'text-blue-400'
                  : serverInfo.status === 'stopping'
                  ? 'text-amber-400'
                  : 'text-zinc-400'
              }>
                {serverInfo.status === 'online'
                  ? `Online ${serverInfo.onlinePlayers} / ${serverInfo.maxPlayers}`
                  : serverInfo.status === 'starting'
                  ? `Starting... (0 / ${serverInfo.maxPlayers})`
                  : serverInfo.status === 'stopping'
                  ? `Stopping... (0 / ${serverInfo.maxPlayers})`
                  : `Offline (0 / ${serverInfo.maxPlayers})`}
              </span>
            </div>

            {/* TPS */}
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-zinc-900 border border-white/10 text-[11px] font-bold text-zinc-300">
              <Radio className={`w-3 h-3 ${serverInfo.status === 'online' ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
              <span>{serverInfo.status === 'online' ? `${(serverInfo.tps || 20.0).toFixed(1)} TPS` : '0.0 TPS'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            {/* Search floating box */}
            {isSearchOpen && (
              <div className="flex items-center gap-1.5 bg-[#0d1117] border border-blue-500/40 rounded-lg px-2 py-0.5 shadow-sm">
                <Search className="w-3 h-3 text-blue-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Find in logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.shiftKey ? handleSearchPrev() : handleSearchNext();
                    } else if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                    }
                  }}
                  className="bg-transparent text-white placeholder-zinc-500 text-xs w-28 sm:w-40 focus:outline-none font-mono"
                />
                <button
                  onClick={handleSearchPrev}
                  className="p-1 hover:text-blue-400 text-zinc-400"
                  title="Previous match (Shift+Enter)"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={handleSearchNext}
                  className="p-1 hover:text-blue-400 text-zinc-400"
                  title="Next match (Enter)"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 hover:text-red-400 text-zinc-400"
                  title="Close search"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {isMaximized && (
              <button
                onClick={() => setIsMaximized(false)}
                className="p-1 hover:text-white text-zinc-400 transition-colors"
                title="Exit Fullscreen"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* XTerm.js Terminal Screen Container - Always visible like Pterodactyl */}
        <div className="relative flex-1 bg-[#0d1117] min-h-[500px]">
          <div
            ref={terminalElementRef}
            className="w-full h-full min-h-[500px] p-2.5 sm:p-3 overflow-hidden select-text"
          />
        </div>

        {/* Bottom Command Composer Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-[#161b22] border-t border-white/10 flex items-center gap-2">
          <span className="text-blue-400 font-bold font-mono pl-2 text-sm select-none">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a Minecraft server command... (Press Up/Down for history)"
            className="flex-1 bg-[#0d1117] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 font-mono shadow-inner transition-colors"
            disabled={isSending}
            autoCorrect="off"
            autoCapitalize="none"
          />
          <button
            type="submit"
            disabled={isSending || !commandInput.trim()}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all font-mono shadow-sm"
          >
            <span>{isSending ? 'Sending...' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Command Suggestions Strip */}
        <div className="px-4 py-2 bg-[#0d1117] border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
          <span className="font-semibold text-zinc-300">Shortcuts:</span>
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd}
              type="button"
              onClick={() => executeCommand(cmd)}
              className="px-2 py-0.5 rounded-md bg-[#161b22] hover:bg-blue-900/40 text-zinc-300 hover:text-blue-300 border border-white/10 hover:border-blue-500/40 font-mono transition-colors text-[10px] cursor-pointer"
            >
              /{cmd.replace(/^\//, '')}
            </button>
          ))}
        </div>
      </div>

      {/* Pterodactyl-Style Rolling 60s Hardware Stat Graphs */}
      {!isMaximized && (
        <div className="pt-2">
          <StatGraphs />
        </div>
      )}
    </div>
  );
}
