'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Server, Activity, AlertTriangle } from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';

interface StatPoint {
  cpu: number;
  memoryMb: number;
  timestamp: number;
}

export function StatGraphs({ className = '' }: { className?: string }) {
  const { metrics, serverInfo } = useServerStore();
  const isOnline = serverInfo.status === 'online';

  const [points, setPoints] = useState<StatPoint[]>(() => {
    const now = Date.now();
    return Array.from({ length: 30 }, (_, i) => ({
      cpu: 0,
      memoryMb: 0,
      timestamp: now - (30 - i) * 2000,
    }));
  });

  const totalRam = metrics?.totalRamMb || 6144;
  const currentUsedRam = isOnline ? (metrics?.usedRamMb || 0) : 0;
  const currentCpu = isOnline ? Math.max(0, Math.min(100, metrics?.cpuUsagePercent || 0)) : 0;

  // Append data point on a 2-second interval, keeping 30 points (60-second rolling window)
  useEffect(() => {
    const timer = setInterval(() => {
      setPoints((prev) => {
        const nextPoint: StatPoint = {
          cpu: isOnline ? currentCpu : 0,
          memoryMb: isOnline ? currentUsedRam : 0,
          timestamp: Date.now(),
        };
        const next = [...prev.slice(1), nextPoint];
        return next;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isOnline, currentCpu, currentUsedRam]);

  // Calculations
  const ramPercent = totalRam > 0 ? (currentUsedRam / totalRam) * 100 : 0;
  const maxCpuInWindow = Math.max(...points.map((p) => p.cpu), currentCpu);
  const maxRamInWindow = Math.max(...points.map((p) => p.memoryMb), currentUsedRam);

  // Warning thresholds
  const isCpuWarn = currentCpu >= 80 && currentCpu < 90;
  const isCpuCrit = currentCpu >= 90;
  const isRamWarn = ramPercent >= 80 && ramPercent < 90;
  const isRamCrit = ramPercent >= 90;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* CPU Load Graph Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col justify-between space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              isCpuCrit
                ? 'bg-red-100 text-red-600'
                : isCpuWarn
                ? 'bg-amber-100 text-amber-600'
                : 'bg-blue-50 text-blue-600'
            }`}>
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1a1522]">CPU Load</div>
              <div className="text-[11px] text-[#1a1522]/50">60s rolling average</div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-base font-bold ${
              isCpuCrit
                ? 'text-red-600'
                : isCpuWarn
                ? 'text-amber-600'
                : 'text-[#1a1522]'
            }`}>
              {currentCpu.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#1a1522]/50">
              Peak: {maxCpuInWindow.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* SVG Sparkline */}
        <div className="h-20 w-full relative">
          <Sparkline
            data={points.map((p) => p.cpu)}
            max={100}
            color={isCpuCrit ? '#ef4444' : isCpuWarn ? '#f59e0b' : '#3b82f6'}
            gradientId="cpuGradient"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1a1522]/5">
          <span className="text-[#1a1522]/50">Limit: 100%</span>
          {isCpuCrit && (
            <span className="flex items-center gap-1 text-red-600 font-bold text-[10px]">
              <AlertTriangle className="w-3 h-3" /> Critical (&gt;90%)
            </span>
          )}
          {isCpuWarn && (
            <span className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
              <AlertTriangle className="w-3 h-3" /> Elevated (&gt;80%)
            </span>
          )}
          {!isCpuCrit && !isCpuWarn && (
            <span className="text-emerald-600 font-semibold text-[10px]">Healthy</span>
          )}
        </div>
      </div>

      {/* Memory Graph Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col justify-between space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${
              isRamCrit
                ? 'bg-red-100 text-red-600'
                : isRamWarn
                ? 'bg-amber-100 text-amber-600'
                : 'bg-indigo-50 text-indigo-600'
            }`}>
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#1a1522]">Memory (RAM)</div>
              <div className="text-[11px] text-[#1a1522]/50">Pterodactyl limit format</div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-base font-bold ${
              isRamCrit
                ? 'text-red-600'
                : isRamWarn
                ? 'text-amber-600'
                : 'text-[#1a1522]'
            }`}>
              {currentUsedRam.toLocaleString()} <span className="text-xs font-normal text-[#1a1522]/60">MiB</span>
            </div>
            <div className="text-[10px] text-[#1a1522]/50">
              {ramPercent.toFixed(1)}% of {totalRam.toLocaleString()} MiB
            </div>
          </div>
        </div>

        {/* SVG Sparkline */}
        <div className="h-20 w-full relative">
          <Sparkline
            data={points.map((p) => p.memoryMb)}
            max={totalRam}
            color={isRamCrit ? '#ef4444' : isRamWarn ? '#f59e0b' : '#6366f1'}
            gradientId="ramGradient"
          />
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1a1522]/5">
          <span className="text-[#1a1522]/50">
            {currentUsedRam} MiB / {totalRam} MiB
          </span>
          {isRamCrit && (
            <span className="flex items-center gap-1 text-red-600 font-bold text-[10px]">
              <AlertTriangle className="w-3 h-3" /> OOM Risk (&gt;90%)
            </span>
          )}
          {isRamWarn && (
            <span className="flex items-center gap-1 text-amber-600 font-bold text-[10px]">
              <AlertTriangle className="w-3 h-3" /> High (&gt;80%)
            </span>
          )}
          {!isRamCrit && !isRamWarn && (
            <span className="text-emerald-600 font-semibold text-[10px]">Normal</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Lightweight, high-precision SVG Sparkline Component
function Sparkline({
  data,
  max,
  color,
  gradientId,
}: {
  data: number[];
  max: number;
  color: string;
  gradientId: string;
}) {
  const width = 300;
  const height = 80;
  const padding = 4;

  if (data.length < 2) return null;

  const pointsStr = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const normalized = Math.max(0, Math.min(1, val / (max || 1)));
      const y = height - padding - normalized * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const firstX = padding;
  const lastX = width - padding;
  const bottomY = height - padding;
  const areaPath = `M ${firstX},${bottomY} L ${pointsStr} L ${lastX},${bottomY} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* 80% and 90% threshold guide lines */}
      <line
        x1={padding}
        y1={height - padding - 0.8 * (height - padding * 2)}
        x2={width - padding}
        y2={height - padding - 0.8 * (height - padding * 2)}
        stroke="#e2e8f0"
        strokeDasharray="3 3"
        strokeWidth="0.8"
      />
      <line
        x1={padding}
        y1={height - padding - 0.9 * (height - padding * 2)}
        x2={width - padding}
        y2={height - padding - 0.9 * (height - padding * 2)}
        stroke="#fecaca"
        strokeDasharray="2 2"
        strokeWidth="0.8"
      />

      {/* Gradient Fill under the curve */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Line Curve */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pointsStr}
      />
    </svg>
  );
}
