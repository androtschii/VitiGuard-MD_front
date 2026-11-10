import { useTranslation } from 'react-i18next'
import type { VineDetection } from '@/api/vine'
import { cn } from '@/lib/cn'
import { VINE_COLORS } from '@/lib/vineColors'

// Доля → проценты без хвоста плавающей точки (0,14 × 100 = 14,000000000000002)
const percentOf = (share: number) => `${Number((share * 100).toFixed(2))}%`

type VineOverlayProps = {
  photoUrl: string
  detections: VineDetection[]
}

// Рамки — в долях снимка, поэтому лежат на месте при любом размере фото.
// Ключ — класс и рамка: при фильтрации оставшиеся рамки не появляются заново
export function VineOverlay({ photoUrl, detections }: VineOverlayProps) {
  const { t } = useTranslation()
  return (
    <figure className="relative overflow-hidden rounded-md bg-muted">
      <img
        src={photoUrl}
        alt={t('vine.photoAlt')}
        className="block h-auto w-full"
      />
      <div
        aria-hidden="true"
        className="vine-scan pointer-events-none absolute inset-x-0 top-full h-0.5 bg-linear-to-r from-transparent via-accent to-transparent opacity-0 shadow-[0_0_12px_2px] shadow-accent/60"
      />
      {detections.map((item) => {
        const [x1, y1, x2, y2] = item.box
        const name = t(`vine.labels.${item.label}`)
        const percent = Math.round(item.confidence * 100)
        return (
          <div
            key={`${item.label}-${item.box.join()}`}
            data-testid="vine-box"
            title={`${name}, ${percent} %`}
            className={cn(
              'vine-box pointer-events-none absolute rounded-sm border-2',
              VINE_COLORS[item.label].box,
            )}
            style={{
              left: percentOf(x1),
              top: percentOf(y1),
              width: percentOf(x2 - x1),
              height: percentOf(y2 - y1),
              ['--vine-delay' as string]: y1.toFixed(3),
            }}
          >
            <span
              className={cn(
                'absolute top-0 left-0 rounded-br-sm px-1 text-[10px] leading-4 font-semibold whitespace-nowrap',
                VINE_COLORS[item.label].chip,
              )}
            >
              {percent}
            </span>
          </div>
        )
      })}
    </figure>
  )
}
