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

// Рамки — в долях снимка, поэтому лежат на месте при любом размере фото
export function VineOverlay({ photoUrl, detections }: VineOverlayProps) {
  const { t } = useTranslation()
  return (
    <figure className="relative overflow-hidden rounded-md bg-muted">
      <img
        src={photoUrl}
        alt={t('vine.photoAlt')}
        className="block h-auto w-full"
      />
      {detections.map((item, index) => {
        const [x1, y1, x2, y2] = item.box
        const name = t(`vine.labels.${item.label}`)
        const percent = Math.round(item.confidence * 100)
        return (
          <div
            key={index}
            data-testid="vine-box"
            title={`${name}, ${percent} %`}
            className={cn(
              'pointer-events-none absolute rounded-sm border-2',
              VINE_COLORS[item.label].box,
            )}
            style={{
              left: percentOf(x1),
              top: percentOf(y1),
              width: percentOf(x2 - x1),
              height: percentOf(y2 - y1),
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
