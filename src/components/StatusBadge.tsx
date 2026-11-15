import React from 'react';
import { ServerStatus } from '@/types';
import { Power, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface StatusBadgeProps {
  status: ServerStatus | 'crashed';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const getDetails = () => {
    switch (status) {
      case 'online':
        return {
          label: 'ONLINE',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'offline':
        return {
          label: 'OFFLINE',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
        };
      case 'crashed':
        return {
          label: 'CRASHED',
          bg: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500',
        };
      case 'hibernating':
        return {
          label: 'HIBERNATE',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'starting':
        return {
          label: 'STARTING...',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'stopping':
        return {
          label: 'STOPPING...',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500 animate-pulse',
        };
      default:
        return {
          label: 'UNKNOWN',
          bg: 'bg-slate-50 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const { label, bg, dot } = getDetails();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase rounded-full border ${bg} ${sizeClasses[size]} select-none`}
    >
      {showDot && (
        <span
          className={`w-2 h-2 rounded-full ${dot} ${status === 'online' ? 'animate-pulse' : ''}`}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
