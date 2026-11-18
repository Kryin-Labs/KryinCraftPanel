import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Pencil, Save, Upload } from 'lucide-react';
import { motdColors, motdRuns } from '@/lib/motd';

const formats = [
  ['l', 'Bold'], ['o', 'Italic'], ['n', 'Underline'], ['m', 'Strikethrough'],
  ['k', 'Obfuscated'], ['r', 'Reset formatting'],
] as const;

async function prepareIcon(file: File) {
  if (file.size > 5_000_000) throw new Error('Choose an image under 5 MB.');
  const image = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process the image.');
    const size = Math.min(image.width, image.height);
    context.drawImage(image, (image.width - size) / 2, (image.height - size) / 2, size, size, 0, 0, 64, 64);
    return canvas.toDataURL('image/png').split(',')[1];
  } finally {
    image.close();
  }
}

export function MotdEditor({ serverId, serverName, value, busy, onChange, onSave, dirty }: {
  serverId: string; serverName: string; value: string; busy: boolean; dirty: boolean;
  onChange: (value: string) => void; onSave: () => Promise<boolean>;
}) {
  const [editing, setEditing] = useState(false);
  const [icon, setIcon] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hexColor, setHexColor] = useState('#55ff55');
  const [feedback, setFeedback] = useState('');
  const text = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/server/properties?asset=icon&serverId=' + encodeURIComponent(serverId), { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!controller.signal.aborted && data?.icon) setIcon(data.icon); })
      .catch(() => {});
    return () => controller.abort();
  }, [serverId]);

  function insert(code: string) {
    const field = text.current;
    if (!field) return;
    const start = field.selectionStart;
    const next = value.slice(0, start) + code + value.slice(start);
    if (next.length > 512) return;
    onChange(next);
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + code.length, start + code.length);
    });
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setFeedback('');
    try {
      const image = await prepareIcon(file);
      const response = await fetch('/api/server/properties', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId, icon: image }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setIcon(image);
      setFeedback('Saved as server-icon.png. Minecraft loads the icon on startup.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not upload the server icon.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="space-y-3 border-b border-slate-200 pb-5">
      <h2 className="font-semibold">Minecraft server list preview</h2>
      <div className="flex items-start gap-3 rounded-xl border border-stone-700 bg-stone-950 p-4 font-mono text-white">
        <input ref={picker} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={upload} />
        <button type="button" disabled={uploading || busy} aria-label="Upload server icon" title="Upload server icon"
          onClick={() => picker.current?.click()}
          className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border border-white/25 bg-lime-950 sm:size-16">
          {icon ? <img src={'data:image/png;base64,' + icon} alt="Server icon" width={64} height={64} />
            : <span aria-hidden className="size-9 rotate-12 border-4 border-lime-500 bg-lime-800 shadow-[4px_4px_0_#433422]" />}
          <span className="absolute bottom-0 right-0 rounded-tl bg-stone-800 p-1"><Upload size={13} /></span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{serverName}</p>
          <p className="mt-1 min-h-6 whitespace-pre-wrap break-words text-sm">
            {value ? motdRuns(value).map((run, index) => (
              <span key={index} title={run.obfuscated ? 'Obfuscated in Minecraft' : undefined}
                style={{ color: run.color, fontWeight: run.bold ? 'bold' : undefined,
                  fontStyle: run.italic ? 'italic' : undefined,
                  textDecoration: [run.underline && 'underline', run.strike && 'line-through'].filter(Boolean).join(' '),
                  filter: run.obfuscated ? 'blur(1px)' : undefined }}>{run.text}</span>
            )) : <span className="text-slate-400">No message set</span>}
          </p>
        </div>
        <button type="button" disabled={busy} className="rounded-md border border-white/25 p-2 hover:bg-white/15"
          aria-label={editing ? 'Save MOTD' : 'Edit MOTD'} title={editing ? 'Save MOTD' : 'Edit MOTD'}
          onClick={async () => {
            if (!editing) { setEditing(true); return; }
            if (!dirty || await onSave()) setEditing(false);
          }}>
          {editing ? <Save size={16} /> : <Pencil size={16} />}
        </button>
      </div>
      {editing && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            MOTD
            <textarea ref={text} rows={2} maxLength={512} value={value} onChange={(event) => onChange(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm" />
          </label>
          <div aria-label="MOTD formatting" className="flex flex-wrap gap-1 font-mono text-xs">
            {motdColors.map(([code, color]) => (
              <button key={code} type="button" onClick={() => insert('§' + code)} aria-label={'Insert color code ' + code}
                className="size-7 rounded border border-slate-500 bg-stone-950" style={{ color: code === '0' ? '#bbbbbb' : color }}>{code}</button>
            ))}
            {formats.map(([code, label]) => (
              <button key={code} type="button" onClick={() => insert('§' + code)} aria-label={label} title={label}
                className="size-7 rounded border border-slate-300 bg-white text-slate-900">{code}</button>
            ))}
            <label className="flex items-center gap-1 pl-1">
              Hex
              <input type="color" value={hexColor} aria-label="Custom MOTD color"
                onChange={(event) => setHexColor(event.target.value)} />
            </label>
            <button type="button" onClick={() => insert('&#' + hexColor.slice(1))}
              className="rounded border border-slate-300 px-2">Insert hex</button>
          </div>
          <p className="text-xs text-slate-600">Use § or &amp; color codes and up to two lines for the server list.</p>
        </div>
      )}
      {(uploading || feedback) && <p role="status" className="text-sm text-slate-700">{uploading ? 'Uploading server icon…' : feedback}</p>}
    </section>
  );
}
