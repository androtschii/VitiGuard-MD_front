import { Logo } from '@/components/atoms/Logo'
import { cn } from '@/lib/cn'

type WordmarkProps = {
  size?: 'sm' | 'lg'
  withTagline?: boolean
  className?: string
}

// Логотип целиком: эмблема и надпись «VitiGuard» как на макете — «Viti»
// жирным, «Guard» обычным. Надпись — текст, а не картинка: она остаётся
// чёткой и перекрашивается в тёмной теме
export function Wordmark({
  size = 'sm',
  withTagline = false,
  className,
}: WordmarkProps) {
  const large = size === 'lg'
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Logo
        className={cn(large ? 'size-20 motion-safe:animate-grow-in' : 'size-8')}
      />
      <span className="flex flex-col items-start leading-none">
        <span
          className={cn(
            'font-brand tracking-tight text-brand-ink',
            large ? 'text-5xl' : 'text-xl',
          )}
        >
          <span className="font-bold">Viti</span>
          <span className="font-medium">Guard</span>
        </span>
        {withTagline && (
          <span className="mt-2 font-brand text-[0.7rem] font-medium tracking-[0.08em] text-brand-500 uppercase">
            MD | Vineyard health monitoring system
          </span>
        )}
      </span>
    </span>
  )
}
