import type { ServerStatus } from '@/types';

export const deviceWindowMs = 10_000;
export type DeviceState = 'checking' | 'connected' | 'reconnecting' | 'disconnected' | 'unavailable';

export const deviceStatusLabel: Record<DeviceState, string> = {
  checking: 'Checking…',
  connected: 'Connected',
  reconnecting: 'Reconnecting…',
  disconnected: 'Not connected',
  unavailable: 'Status unavailable',
};

export function deviceStateAt(heartbeat: string | null | undefined, now = Date.now()): DeviceState {
  const elapsed = now - Date.parse(heartbeat ?? '');
  if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed >= deviceWindowMs * 2) return 'disconnected';
  return elapsed < deviceWindowMs ? 'connected' : 'reconnecting';
}

export function minecraftStateAt(status: string | null | undefined, heartbeat: string | null | undefined, now = Date.now()): ServerStatus {
  if (deviceStateAt(heartbeat, now) !== 'connected') return 'unknown';
  switch (status) {
    case 'online':
    case 'offline':
    case 'starting':
    case 'stopping':
    case 'crashed':
    case 'hibernating':
      return status;
    default:
      return 'unknown';
  }
}
