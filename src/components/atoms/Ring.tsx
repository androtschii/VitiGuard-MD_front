import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type RingSegment = {
  // Доля окружности в процентах
  percent: number
  className: string
}

type RingProps = {
  segments: RingSegment[]
  className?: string
  children?: ReactNode
}

// Длина окружности с таким радиусом равна 100: штрих задаётся прямо в процентах
const RADIUS = 15.915

// Кольцо с долями. Смысл передают подписи рядом, поэтому само кольцо скрыто
// от экранного диктора
export function Ring({ segments, className, children }: RingProps) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <svg
        viewBox="0 0 36 36"
        aria-hidden="true"
        className="size-full -rotate-90"
      >
        <circle
          cx="18"
          cy="18"
          r={RADIUS}
          fill="none"
          strokeWidth="3.5"
          className="stroke-muted-strong"
        />
        {segments.map(({ percent, className: tone }, index) => {
          const dashOffset = -segments
            .slice(0, index)
            .reduce((sum, segment) => sum + segment.percent, 0)
          return (
            <circle
              key={tone}
              cx="18"
              cy="18"
              r={RADIUS}
              fill="none"
              strokeWidth="3.5"
              pathLength="100"
              strokeDasharray={`${percent} ${100 - percent}`}
              strokeDashoffset={dashOffset}
              className={cn('ring-segment', tone)}
              style={{ '--ring-percent': percent } as React.CSSProperties}
            />
          )
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
