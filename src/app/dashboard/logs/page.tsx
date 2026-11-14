'use client';

import React, { useState } from 'react';
import {
  ScrollText,
  Search,
  Download,
  Filter,
  RefreshCw,
  Clock,
  AlertTriangle,
  Info,
  Bug,
  AlertCircle,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

type LogLevel = 'ALL' | 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export default function LogsPage() {
  const { logs } = useServerStore();
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
    const matchesQuery = searchQuery
      ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.timestamp.includes(searchQuery)
      : true;
    return matchesLevel && matchesQuery;
  });

  const handleDownload = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latest-${new Date().toISOString().substring(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'ERROR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            ERROR
          </span>
        );
      case 'WARN':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            WARN
          </span>
        );
      case 'DEBUG':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            DEBUG
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-blue-400" />
            Server Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Bounded log viewer for <code className="text-slate-300 font-mono text-[11px]">~/minecraft/server/logs/latest.log</code>.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          Download latest.log
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-[#111722] border border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'] as LogLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter log messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-9 pr-3 py-1.5 bg-[#0b0f17] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-[#111722] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Displaying {filteredLogs.length} entries</span>
          <span className="text-[11px] text-slate-500">Incremental streaming active</span>
        </div>

        <div className="divide-y divide-slate-800/60 max-h-[60vh] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No log entries match your filter criteria.
            </div>
          ) : (
            filteredLogs.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-start gap-2.5 sm:gap-4 font-mono text-xs"
              >
                <div className="flex items-center gap-2 sm:shrink-0">
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {entry.timestamp}
                  </span>
                  {getLevelBadge(entry.level)}
                </div>

                <div className="flex-1 break-words text-slate-300 font-sans leading-relaxed">
                  {entry.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
