'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal as TerminalIcon,
  Send,
  Trash2,
  Search,
  Download,
  Radio,
  ChevronUp,
  ChevronDown,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { deviceStatusLabel, deviceWindowMs } from '@/lib/deviceStatus';
import { requestJson } from '@/lib/requestJson';
import { useConsoleLogs } from '@/lib/useConsoleLogs';
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
  const { serverInfo, activeServerId, permissions, sendConsoleCommand, deviceState, powerProgress } = useServerStore();
  const { logs, loaded, subscribed, error: streamError, clear } = useConsoleLogs(activeServerId);

  const canIssueCommands = permissions.includes('console');
  const [receiptId, setReceiptId] = useState('');
  const [commandStatus, setCommandStatus] = useState('');
  const [commandFailed, setCommandFailed] = useState(false);
  const [commandReply, setCommandReply] = useState('');
  const [terminalError, setTerminalError] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isSending, setIsSending] = useState(false);
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
  const prevStatusRef = useRef<string>(serverInfo.status);
  const lastRenderedLog = useRef<string | null>(null);

  useEffect(() => {
    const terminal = terminalInstanceRef.current;
    if (!isTerminalReady || !terminal || !logs.length) return;
    const lastIndex = logs.findIndex((log) => log.id === lastRenderedLog.current);
    const next = logs.slice(lastIndex + 1);
    if (!next.length) return;
    terminal.write(next.map((log) => formatMinecraftLog(log.message)).join('\r\n') + '\r\n');
    lastRenderedLog.current = next[next.length - 1].id;
  }, [logs, isTerminalReady]);

  useEffect(() => {
    if (!receiptId || !activeServerId) return;
    const controller = new AbortController();
    const params = new URLSearchParams({ serverId: activeServerId, commandId: receiptId });
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    let rechecked = false;

    async function checkReceipt() {
      const elapsed = Date.now() - started;
      if (elapsed >= deviceWindowMs * 2) {
        setCommandFailed(true);
        setCommandStatus('The device received the command. Its result was unconfirmed after two checks.');
        return;
      }
      if (elapsed >= deviceWindowMs && !rechecked) {
        rechecked = true;
        setCommandStatus('Checking for the command result again…');
      }
      let interval = elapsed < 5_000 ? 600 : 1_500;
      try {
        const { response, data } = await requestJson('/api/server/command?' + params, 2_000, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if ([401, 403, 404].includes(response.status)) {
          setCommandFailed(true);
          setCommandStatus('Command status unavailable.');
          return;
        }
        if (!response.ok) throw new Error('Command status unavailable.');
        const receipt: { status: string; message?: string } = data;
        if (controller.signal.aborted) return;
        switch (receipt.status) {
          case 'EXECUTED':
            setCommandStatus('Command executed.');
            setCommandReply(receipt.message ?? '');
            return;
          case 'FAILED':
            setCommandFailed(true);
            setCommandStatus('Device reported that the command failed.');
            setCommandReply(receipt.message ?? '');
            return;
          case 'EXPIRED':
            setCommandFailed(true);
            setCommandStatus('Command expired before the device picked it up.');
            return;
          case 'FETCHED':
            if (!rechecked) setCommandStatus('Command received by device.');
            break;
        }
      } catch {
        if (controller.signal.aborted) return;
        interval = 1_500;
      }
      timer = setTimeout(checkReceipt, interval);
    }

    timer = setTimeout(checkReceipt, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [receiptId, activeServerId]);
  // Smooth Pterodactyl-style status change events in terminal
  useEffect(() => {
    const term = terminalInstanceRef.current;
    if (!term || !isTerminalReady) return;

    const prev = prevStatusRef.current;
    const current = serverInfo.status;
    if (prev !== current) {
      prevStatusRef.current = current;

      if (current === 'starting') {
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
    let stopTouchScroll: (() => void) | undefined;

    async function initXterm() {
      if (!terminalElementRef.current || terminalInstanceRef.current) return;

      const [
        { Terminal }, { FitAddon }, { SearchAddon }, { WebLinksAddon }, { Unicode11Addon },
      ] = await Promise.all([
        import('@xterm/xterm'),
        import('@xterm/addon-fit'),
        import('@xterm/addon-search'),
        import('@xterm/addon-web-links'),
        import('@xterm/addon-unicode11'),
      ]);
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
      terminalInstanceRef.current = term;
      const screen = terminalElementRef.current;
      let lastTouch = 0;
      function startTouch(event: TouchEvent) {
        if (event.touches.length === 1) lastTouch = event.touches[0].clientY;
      }
      function moveTouch(event: TouchEvent) {
        if (event.touches.length !== 1) return;
        const y = event.touches[0].clientY;
        const lines = Math.trunc((lastTouch - y) / 12);
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation();
        if (lines) {
          term.scrollLines(lines);
          lastTouch = y;
        }
      }
      screen.addEventListener('touchstart', startTouch, { passive: true });
      screen.addEventListener('touchmove', moveTouch, { passive: false, capture: true });
      stopTouchScroll = () => {
        screen.removeEventListener('touchstart', startTouch);
        screen.removeEventListener('touchmove', moveTouch, true);
      };
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

      fitAddonRef.current = fitAddon;
      searchAddonRef.current = searchAddon;
      scrollHelperAddonRef.current = scrollHelperAddon;

      // Safe multi-stage layout fitting (guarantees non-zero dimensions after DOM render)
      const tryFit = () => {
        try {
          if (terminalElementRef.current && terminalElementRef.current.clientHeight > 0) {
            fitAddon.fit();
          }
        } catch (e) {}
      };

      tryFit();
      requestAnimationFrame(tryFit);
      setTimeout(tryFit, 50);
      setTimeout(tryFit, 200);

      // Welcome header
      term.writeln(TERMINAL_PRELUDE + "Server console");
      setIsTerminalReady(true);
    }

    void initXterm().catch(() => {
      if (isMounted) setTerminalError(true);
    });

    // Resize handler for window and element dimensions
    const handleResize = () => {
      if (fitAddonRef.current && terminalElementRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {}
      }
    };

    window.addEventListener('resize', handleResize);

    // ResizeObserver ensures terminal refits whenever flex/grid containers resize
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && terminalElementRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(terminalElementRef.current);
    }

    return () => {
      isMounted = false;
      stopTouchScroll?.();
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (scrollHelperAddonRef.current) {
        scrollHelperAddonRef.current.dispose();
      }
      if (terminalInstanceRef.current) {
        terminalInstanceRef.current.dispose();
        terminalInstanceRef.current = null;
      }
    };
  }, []);


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
    if (!canIssueCommands || !cmd || isSending) return;

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
    }

    setCommandInput('');
    setIsSending(true);
    setReceiptId('');
    setCommandReply('');
    setCommandFailed(false);
    setCommandStatus('Sending command…');
    try {
      const receipt = await sendConsoleCommand(cmd, setCommandStatus);
      if (receipt.status === 'FAILED') {
        setCommandFailed(true);
        setCommandStatus('Device reported that the command failed.');
        setCommandReply(receipt.message ?? '');
      } else if (receipt.status === 'EXECUTED') {
        setCommandStatus('Command executed.');
        setCommandReply(receipt.message ?? '');
      } else {
        setReceiptId(receipt.command_id);
        setCommandStatus('Command received by device.');
      }
    } catch (error) {
      setCommandFailed(true);
      setCommandStatus(error instanceof Error ? error.message : 'Could not send the command.');
    } finally {
      setIsSending(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(commandInput);
  };

  const handleClearLogs = () => {
    clear();
    lastRenderedLog.current = null;
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
              {serverInfo.name || 'Minecraft Server'}
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
              <span className={`w-2 h-2 rounded-full ${deviceState === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-zinc-400">Device:</span>
              <span className={deviceState === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>
                {deviceStatusLabel[deviceState]}
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
                  ? powerProgress?.phase === 'failed' ? 'Startup unconfirmed' : 'Starting…'
                  : serverInfo.status === 'stopping'
                  ? powerProgress?.phase === 'failed' ? 'Shutdown unconfirmed' : 'Stopping…'
                  : serverInfo.status === 'unknown' ? 'Unconfirmed' : 'Offline'}
              </span>
            </div>

            <span role="status" className={subscribed && loaded && !streamError ? 'text-emerald-400' : 'text-zinc-300'} title={streamError || undefined}>
              {streamError ? 'Retrying logs…' : !loaded ? 'Loading logs…' : subscribed ? 'Live logs' : 'Polling for logs'}
            </span>

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
        <div 
          className="relative w-full bg-[#0d1117] flex-1" 
          style={{ height: isMaximized ? 'calc(100dvh - 190px)' : 'clamp(300px, 60dvh, 520px)', minHeight: isMaximized ? '0' : '300px' }}
        >
          {streamError && <p role="alert" className="absolute right-2 top-2 z-10 rounded bg-red-950 px-2 py-1 text-xs text-red-100">{streamError}</p>}
          {(!isTerminalReady || terminalError) && (
            <pre aria-label="Recent console logs" className="absolute inset-0 overflow-auto whitespace-pre-wrap p-3 text-xs text-slate-200">
              {logs.length ? logs.map((log) => log.message).join('\n') : loaded ? 'No console logs received yet.' : 'Loading console history…'}
            </pre>
          )}
          <div
            ref={terminalElementRef}
            className="w-full h-full overflow-hidden p-2.5 select-text sm:p-3 [@media(pointer:coarse)]:touch-none"
            style={{ visibility: isTerminalReady ? 'visible' : 'hidden' }}
          />
        </div>

        {/* Bottom Command Composer Form */}
        {canIssueCommands && <form onSubmit={handleSubmit} className="p-3 bg-[#161b22] border-t border-white/10 flex items-center gap-2">
          <span className="text-blue-400 font-bold font-mono pl-2 text-sm select-none">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Minecraft command"
            placeholder="Minecraft command"
            className="min-w-0 flex-1 bg-[#0d1117] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 font-mono shadow-inner transition-colors"
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
        </form>}

        {commandStatus && (
          <div role={commandFailed ? 'alert' : 'status'} className={'px-4 pb-3 text-xs ' + (commandFailed ? 'text-red-300' : 'text-zinc-300')}>
            <p>{commandStatus}</p>
            {commandReply && <p className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-words text-zinc-100">{commandReply}</p>}
          </div>
        )}

        {/* Quick Command Suggestions Strip */}
        {canIssueCommands && <div className="px-4 py-2 bg-[#0d1117] border-t border-white/5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
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
        </div>}
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
