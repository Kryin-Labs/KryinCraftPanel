'use client';

import { useEffect, useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { uploadServerFile } from '@/lib/fileManagerClient';
import { maxUploadBytes } from '@/lib/fileManagerLimits';

type Upload = {
  id: number;
  file: File;
  directory: string;
  uploaded: number;
  status: 'queued' | 'uploading' | 'done' | 'failed';
  error?: string;
};

export function useUploadQueue(serverId: string, refreshDirectory: (directory: string) => void) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const nextId = useRef(0);
  const active = useRef<AbortController | null>(null);

  useEffect(() => () => {
    active.current?.abort();
    active.current = null;
  }, []);

  const next = uploads.find((item) => item.status === 'queued');
  useEffect(() => {
    if (!next || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    const update = (patch: Partial<Upload>) => {
      if (!controller.signal.aborted) {
        setUploads((items) => items.map((item) => item.id === next.id ? { ...item, ...patch } : item));
      }
    };

    update({ status: 'uploading' });
    uploadServerFile(serverId, next.directory, next.file, (uploaded) => update({ uploaded }), controller.signal)
      .then(() => {
        if (controller.signal.aborted) return;
        active.current = null;
        refreshDirectory(next.directory);
        update({ status: 'done' });
      })
      .catch((error: unknown) => {
        if (active.current === controller) active.current = null;
        update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Upload could not be completed.',
        });
      });
  }, [next, serverId, refreshDirectory]);

  return {
    uploads,
    enqueue(files: File[], directory: string) {
      const additions = files.map((file): Upload => ({
        id: nextId.current++,
        file,
        directory,
        uploaded: 0,
        status: file.size > maxUploadBytes ? 'failed' : 'queued',
        error: file.size > maxUploadBytes ? 'Files must be 64 MB or smaller.' : undefined,
      }));
      setUploads((items) => [...items, ...additions]);
    },
    retry(id: number) {
      setUploads((items) => items.map((item) =>
        item.id === id && item.status === 'failed' ? { ...item, uploaded: 0, status: 'queued', error: undefined } : item,
      ));
    },
    remove(id: number) {
      setUploads((items) => items.filter((item) => item.id !== id || item.status === 'uploading'));
    },
    clearDone() {
      setUploads((items) => items.filter((item) => item.status !== 'done'));
    },
  };
}

export function UploadQueue({ uploads, retry, remove, clearDone }: ReturnType<typeof useUploadQueue>) {
  if (!uploads.length) return null;
  const completed = uploads.filter((item) => item.status === 'done').length;
  const failed = uploads.filter((item) => item.status === 'failed').length;

  return (
    <section aria-label="Upload queue" className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-bold text-sm"><UploadCloud className="h-4 w-4 text-blue-600" /> Upload queue</h2>
          <p role="status" className="mt-1 text-xs text-slate-600">
            {completed} of {uploads.length} uploaded{failed > 0 && ` · ${failed} failed`}
          </p>
        </div>
        {completed > 0 && <button onClick={clearDone} className="text-xs font-semibold text-blue-700 hover:underline">Clear completed</button>}
      </div>
      <ul className="max-h-80 overflow-auto divide-y divide-slate-100">
        {uploads.map((item) => {
          const percent = item.status === 'done' ? 100 : Math.floor(100 * item.uploaded / (item.file.size || 1));
          return (
            <li key={item.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-all text-sm font-semibold">{item.file.name}</p>
                  <p className="break-all text-xs text-slate-600">{item.directory}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs">
                  {item.status === 'uploading' && <span className="font-bold text-blue-700">Uploading {percent}%</span>}
                  {item.status === 'queued' && <span className="text-slate-600">Queued</span>}
                  {item.status === 'done' && <span className="font-bold text-emerald-700">Uploaded</span>}
                  {item.status === 'failed' && item.file.size <= maxUploadBytes && (
                    <button onClick={() => retry(item.id)} aria-label={`Retry ${item.file.name}`} className="font-bold text-blue-700 hover:underline">Retry</button>
                  )}
                  {(item.status === 'queued' || item.status === 'failed') && (
                    <button onClick={() => remove(item.id)} aria-label={`Remove ${item.file.name} from queue`} className="text-slate-600 hover:underline">Remove</button>
                  )}
                </div>
              </div>
              {item.error && <p className="mt-1 text-xs text-red-700">{item.error}</p>}
              {(item.status === 'uploading' || item.status === 'done') && (
                <progress
                  className={`mt-2 block h-2 w-full overflow-hidden rounded bg-slate-100 accent-blue-600 ${item.status === 'done' ? 'accent-emerald-600' : ''}`}
                  aria-label={`Upload progress for ${item.file.name}`}
                  value={percent || undefined}
                  max={100}
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
