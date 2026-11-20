'use client';

import { useState } from 'react';
import { itemTextureSources } from '@/lib/minecraftAssets';

type ItemIconProps = { id: string; alt: string; className: string; glint?: boolean };

function Texture({ id, alt, className, glint }: ItemIconProps) {
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
  const icon = <img src={source} alt={alt} className={glint ? 'size-full object-contain' : className}
    referrerPolicy="no-referrer" style={{ imageRendering: 'pixelated' }}
    onError={() => setIndex((value) => value + 1)} />;

  return glint ? (
    <span className={className + ' relative isolate inline-grid'}>
      {icon}
      <span aria-hidden="true" className="minecraft-item-glint" style={{ maskImage: `url("${source}")` }} />
    </span>
  ) : icon;
}

export function MinecraftItemIcon(props: ItemIconProps) {
  return <Texture key={props.id} {...props} />;
}
