import { deviceStateAt, deviceWindowMs } from '@/lib/deviceStatus';
import type { ServerStatus } from '@/types';
import { requestJson } from '@/lib/requestJson';

export const powerActions = ['START', 'STOP', 'RESTART', 'KILL'] as const;
export type PowerAction = typeof powerActions[number];

export interface CommandReceipt {
  command_id: string;
  status: 'PENDING' | 'FETCHED' | 'EXECUTED' | 'FAILED' | 'EXPIRED';
  created_at: string;
  expires_at: string;
  server_time: string;
  message?: string;
  minecraft?: { status: ServerStatus; pid: number | null; last_heartbeat: string | null };
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const delivered = (receipt: CommandReceipt) =>
  receipt.status === 'FETCHED' || receipt.status === 'EXECUTED' || receipt.status === 'FAILED';

class CommandRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function commandRequest(url: string, timeout: number, init?: RequestInit) {
  const { response, data } = await requestJson(url, timeout, init);
  if (!response.ok) throw new CommandRequestError(data?.error || 'Could not reach the command service.', response.status);
  if (!data?.command_id) throw new Error('Command response is unavailable.');
  return data as CommandReceipt;
}

function finalClientError(error: unknown) {
  return error instanceof CommandRequestError && [400, 401, 403, 409].includes(error.status);
}

export function checkCommand(serverId: string, commandId: string, timeout = 3_000) {
  const query = new URLSearchParams({ serverId, commandId });
  return commandRequest('/api/server/command?' + query, timeout);
}

export async function deliverPanelCommand(
  serverId: string, commandType: string, payload: object, onStage?: (message: string) => void
) {
  const id = crypto.randomUUID();
  const started = Date.now();
  for (let attempt = 1; attempt <= 2; attempt++) {
    if (attempt === 2 && Date.now() - started >= deviceWindowMs * 2) break;
    onStage?.(attempt === 1 ? 'Waiting for the device…' : 'Retrying device connection (2 of 2)…');
    let deadline = Date.now() + deviceWindowMs;
    try {
      const receipt = await commandRequest('/api/server/command', 4_000, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_id: serverId, command_type: commandType, payload,
          request_id: id, retry_window: attempt === 2,
        }),
      });
      if (delivered(receipt)) return receipt;
      const remaining = Date.parse(receipt.expires_at) - Date.parse(receipt.server_time);
      if (remaining > 0) deadline = Date.now() + Math.min(remaining, deviceWindowMs);
    } catch (error) {
      if (finalClientError(error)) throw error;
    }

    while (Date.now() < deadline) {
      await delay(Math.min(550, Math.max(0, deadline - Date.now())));
      try {
        const receipt = await checkCommand(serverId, id, Math.max(150, Math.min(1_500, deadline - Date.now())));
        if (delivered(receipt)) return receipt;
        if (receipt.status === 'EXPIRED') break;
      } catch (error) {
        if (finalClientError(error)) throw error;
      }
    }
  }

  // A claim at the edge of the second window can arrive after the last poll.
  try {
    const receipt = await checkCommand(serverId, id, 1_200);
    if (delivered(receipt)) return receipt;
  } catch (error) {
    if (finalClientError(error)) throw error;
  }
  throw new Error('Failed to connect to the device after two attempts. Check the agent on the Minecraft device.');
}

export async function confirmPowerAction(
  action: PowerAction, serverId: string, receipt: CommandReceipt, previousPid: number | null | undefined,
  onStage: (message: string) => void
) {
  if (receipt.status === 'FAILED') throw new Error('The device reported that the ' + action.toLowerCase() + ' command failed. Check the device logs.');
  const start = Date.now();
  const until = start + deviceWindowMs * 2;
  let rechecked = false;
  onStage(action === 'START' || action === 'RESTART' ? 'Device acknowledged. Waiting for Minecraft…' : 'Device acknowledged. Waiting for shutdown…');

  while (Date.now() < until) {
    if (!rechecked && Date.now() - start >= deviceWindowMs) {
      onStage('Checking Minecraft status again…');
      rechecked = true;
    }
    let latest: CommandReceipt | undefined;
    try {
      latest = await checkCommand(serverId, receipt.command_id, Math.min(2_000, Math.max(1, until - Date.now())));
    } catch (error) {
      if (finalClientError(error)) throw error;
    }

    if (latest?.status === 'FAILED') throw new Error('The device reported that the ' + action.toLowerCase() + ' command failed. Check the device logs.');
    if (latest?.minecraft) {
      const state = latest.minecraft;
      const fresh = deviceStateAt(state.last_heartbeat, Date.parse(latest.server_time)) === 'connected';
      const afterCommand = Date.parse(state.last_heartbeat ?? '') >= Date.parse(latest.created_at);
      const target = action === 'STOP' || action === 'KILL' ? 'offline' : 'online';
      const restarted = action !== 'RESTART' || (latest.status === 'EXECUTED' && state.pid !== previousPid);
      if (fresh && afterCommand && state.status === target && restarted) return;
    }
    if (Date.now() < until) await delay(Math.min(750, until - Date.now()));
  }

  throw new Error('The device received the command. Minecraft did not confirm the ' +
    (action === 'START' ? 'startup' : action === 'RESTART' ? 'restart' : 'shutdown') +
    ' after two checks. Open Logs to see what happened.');
}
