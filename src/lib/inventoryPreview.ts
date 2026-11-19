import type { InventoryItem } from '@/types';
import { isShulkerBox } from '@/lib/minecraftAssets';

export interface InventoryPreview {
  title: string;
  slots?: (InventoryItem | null)[];
  partial?: boolean;
}

export function itemContainerKind(id: string): 'bundle' | 'grid' | null {
  const name = id.startsWith('minecraft:') ? id.slice('minecraft:'.length) : id;
  if (/^(?:[a-z_]+_)?bundle$/.test(name)) return 'bundle';
  return isShulkerBox(name) || name === 'chest' || name === 'trapped_chest' || name === 'barrel' ? 'grid' : null;
}

export function itemInventoryPreview(item: InventoryItem): InventoryPreview | null {
  const kind = itemContainerKind(item.id);
  if (!kind) return null;
  const preview: InventoryPreview = { title: item.displayName, partial: item.containerPartial };
  if (!Array.isArray(item.container)) return preview;

  if (kind === 'bundle') {
    preview.slots = [...item.container].filter(Boolean).sort((left, right) => left.slot - right.slot).slice(0, 64);
  } else {
    const slots = Array<InventoryItem | null>(27).fill(null);
    for (const child of item.container) {
      if (child && Number.isInteger(child.slot) && child.slot >= 0 && child.slot < slots.length) {
        slots[child.slot] = child;
      }
    }
    preview.slots = slots;
  }
  return preview;
}
