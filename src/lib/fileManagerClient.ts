import { requestJson } from './requestJson';
import { maxUploadBytes, uploadChunkBytes, validFileName } from './fileManagerLimits';

const endpoint = '/api/server/files';

export async function runFileCommand<T>(
  serverId: string,
  operation: { read: Record<string, string> } | { write: Record<string, unknown> },
  signal?: AbortSignal,
): Promise<T> {
  if (!serverId) throw new Error('Select a server first.');
  const start = 'read' in operation
    ? await requestJson(endpoint + '?' + new URLSearchParams({ ...operation.read, serverId }), 20_000, { signal })
    : await requestJson(endpoint, 20_000, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...operation.write, serverId }),
      signal,
    });

  const commandId = start.data?.command_id;
  if (!start.response.ok || typeof commandId !== 'string') {
    throw new Error(start.data?.error || 'Could not submit the file operation.');
  }

  const statusUrl = endpoint + '?' + new URLSearchParams({ action: 'status', serverId, commandId });
  const deadline = Date.now() + 35_000;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    signal?.throwIfAborted();

    const status = await requestJson(statusUrl, 5_000, { signal }).catch(() => null);
    if (!status || status.response.status === 502 || status.response.status === 202) continue;
    if (!status.response.ok || !status.data?.success) {
      throw new Error(status.data?.error || 'Could not check the file operation.');
    }
    return status.data.data as T;
  }
  throw new Error('The device did not confirm the operation. Refresh the folder to check the result.');
}

export async function uploadServerFile(
  serverId: string,
  directory: string,
  file: File,
  onProgress: (bytes: number) => void,
  signal: AbortSignal,
) {
  if (!validFileName(file.name)) throw new Error('Invalid file name.');
  if (file.size > maxUploadBytes) throw new Error('Files must be 64 MB or smaller.');

  const uploadId = crypto.randomUUID();
  let offset = 0;
  do {
    signal.throwIfAborted();
    const bytes = new Uint8Array(await file.slice(offset, offset + uploadChunkBytes).arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    const received = offset + bytes.length;
    const result = await runFileCommand<{ received?: number; complete?: boolean }>(serverId, {
      write: { action: 'upload_chunk', directory, name: file.name, uploadId, offset, size: file.size, chunk: btoa(binary) },
    }, signal);
    if (result?.received !== received || result.complete !== (received === file.size)) {
      throw new Error('The device did not confirm the upload. Check that the node agent is up to date.');
    }
    offset = received;
    onProgress(offset);
  } while (offset < file.size);
}
