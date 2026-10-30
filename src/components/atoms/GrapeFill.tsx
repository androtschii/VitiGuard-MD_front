import { cn } from '@/lib/cn'

// Ягоды расположены как на эмблеме: ряды 4-3-2-1
const BERRIES = [
  [17, 34],
  [39, 34],
  [61, 34],
  [83, 34],
  [28, 53],
  [50, 53],
  [72, 53],
  [39, 72],
  [61, 72],
  [50, 91],
] as const

const BUBBLES = [
  [24, 2.5, 0],
  [44, 1.8, 0.7],
  [58, 2.8, 1.4],
  [76, 2, 0.4],
  [50, 2.2, 1.9],
] as const

const CLIP_ID = 'grape-fill-clip'
const GRADIENT_ID = 'grape-fill-juice'

// Индикатор загрузки: гроздь из логотипа заполняется соком с пузырьками.
// Без анимации (prefers-reduced-motion) гроздь заполнена наполовину
export function GrapeFill({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 106"
      aria-hidden="true"
      className={cn('grape-fill', className)}
    >
      <defs>
        <clipPath id={CLIP_ID}>
          {BERRIES.map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="10.5" />
          ))}
        </clipPath>
        <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-400)" />
          <stop offset="1" stopColor="var(--color-brand-700)" />
        </linearGradient>
      </defs>

      <path
        d="M50 22C50 14 54 8 62 5M50 16C42 16 36 12 33 5c8-2 15 2 17 11z"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {BERRIES.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="10.5"
          fill="var(--accent-soft)"
        />
      ))}

      <g clipPath={`url(#${CLIP_ID})`}>
        <g className="grape-fill-level">
          <path
            className="grape-fill-wave"
            fill={`url(#${GRADIENT_ID})`}
            d="M0 26q12.5-6 25 0t25 0 25 0 25 0 25 0 25 0 25 0 25 0V140H0z"
          />
          {BUBBLES.map(([cx, r, delay]) => (
            <circle
              key={cx}
              className="grape-fill-bubble"
              cx={cx}
              cy="104"
              r={r}
              fill="var(--color-brand-100)"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </g>
      </g>

      {BERRIES.map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="10.5"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}
