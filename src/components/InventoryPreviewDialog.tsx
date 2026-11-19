'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { InventoryPreview } from '@/lib/inventoryPreview';

export function InventoryPreviewDialog({
  preview, depth, parentTitle, close, children,
}: {
  preview: InventoryPreview;
  depth: number;
  parentTitle?: string;
  close: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const layer = dialog.current;
    if (layer && !layer.open) layer.showModal();
  }, []);

  return (
    <dialog ref={dialog} onClose={close} aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      style={{ top: 'min(' + (depth * 96) + 'px, 25dvh)' }}
      className={'m-auto max-h-[82dvh] max-w-[calc(100vw_-_1rem)] overflow-visible rounded-xl border border-[#3a475a] bg-[#1b232f] text-slate-100 shadow-2xl ' +
        (depth === 0 ? 'backdrop:bg-black/60' : 'backdrop:bg-black/15')}>
      <div className="space-y-3 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-sm font-bold">{preview.title}</h2>
          <form method="dialog">
            <button type="submit" aria-label={'Close ' + preview.title} className="grid size-9 place-items-center rounded-lg hover:bg-slate-700">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </form>
        </div>
        {parentTitle && (
          <form method="dialog">
            <button type="submit" className="text-xs font-semibold text-sky-300 underline">Back to {parentTitle}</button>
          </form>
        )}
        {children}
      </div>
    </dialog>
  );
}
