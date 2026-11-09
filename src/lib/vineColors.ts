import type { VineLabel } from '@/api/vine'

// Цвета рамок и меток: ствол — янтарный, гроздь — фуксия; видны и на зелени
export const VINE_COLORS: Record<VineLabel, { box: string; chip: string }> = {
  trunk: { box: 'border-amber-400', chip: 'bg-amber-400 text-stone-950' },
  bunch: { box: 'border-fuchsia-400', chip: 'bg-fuchsia-400 text-stone-950' },
}
