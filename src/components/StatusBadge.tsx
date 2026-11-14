import React from 'react';
import { ServerStatus } from '@/types';

interface StatusBadgeProps {
  status: ServerStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const getColors = () => {
    switch (status) {
      case 'online':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
        };
      case 'offline':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
        };
      case 'starting':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400 animate-pulse',
        };
      case 'stopping':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400 animate-pulse',
        };
      default:
        return {
          bg: 'bg-slate-700/20 border-slate-700 text-slate-400',
          dot: 'bg-slate-400',
        };
    }
  };

  const { bg, dot } = getColors();

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium uppercase tracking-wider ${bg} ${sizeClasses}`}
    >
      {showDot && (
        <span
          className={`w-2 h-2 rounded-full ${dot} ${
            status === 'online' ? 'animate-pulse' : ''
          }`}
        />
      )}
      {status}
    </span>
  );
};
