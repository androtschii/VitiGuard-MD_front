import emblem from '@/assets/emblem.png'
import { cn } from '@/lib/cn'

type LogoProps = {
  className?: string
}

// Эмблема из логотипа (лист, щит со стрелкой, гроздь) с прозрачным фоном.
// Название рядом пишется текстом (Wordmark), поэтому сама эмблема для
// экранных дикторов — украшение
export function Logo({ className }: LogoProps) {
  return (
    <img
      src={emblem}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn('object-contain select-none', className)}
    />
  )
}
