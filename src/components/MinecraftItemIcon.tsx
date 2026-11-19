'use client';

import { useState } from 'react';
import { itemTextureSources } from '@/lib/minecraftAssets';

function Texture({ id, alt, className }: { id: string; alt: string; className: string }) {
  const [index, setIndex] = useState(0);
  const source = itemTextureSources(id)[index];
  if (!source) {
    return (
      <span aria-label={alt + ' texture unavailable'} role="img"
        className={className + ' grid place-items-center rounded-sm bg-slate-600 text-center text-[9px] font-bold text-white'}>
        {alt.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return <img src={source} alt={alt} className={className} referrerPolicy="no-referrer" style={{ imageRendering: 'pixelated' }}
    onError={() => setIndex((value) => value + 1)} />;
}

export function MinecraftItemIcon({ id, alt, className }: { id: string; alt: string; className: string }) {
  return <Texture key={id} id={id} alt={alt} className={className} />;
}
