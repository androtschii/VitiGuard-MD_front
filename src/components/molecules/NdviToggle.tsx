import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { NDVI_GRADIENT } from '@/lib/ndviLayer'
import { useMapStore } from '@/store/map'

export function NdviToggle() {
  const { t } = useTranslation()
  const id = useId()
  const sliderId = useId()
  const isEnabled = useMapStore((state) => state.showNdvi)
  const setShowNdvi = useMapStore((state) => state.setShowNdvi)
  const opacity = useMapStore((state) => state.ndviOpacity)
  const setOpacity = useMapStore((state) => state.setNdviOpacity)
  const transparency = Math.round((1 - opacity) * 100)

  return (
    <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 text-sm shadow-sm">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 text-ink"
      >
        <input
          id={id}
          type="checkbox"
          checked={isEnabled}
          onChange={(event) => setShowNdvi(event.target.checked)}
          className="size-4 accent-brand-700"
        />
        {t('ndvi.toggle')}
      </label>
      {isEnabled && (
        <>
          <div>
            <div
              aria-hidden="true"
              className="h-2 rounded-sm"
              style={{ background: NDVI_GRADIENT }}
            />
            <div className="mt-1 flex justify-between text-xs text-ink-muted">
              <span>0 · {t('ndvi.low')}</span>
              <span>1 · {t('ndvi.high')}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor={sliderId}
              className="flex justify-between text-xs text-ink"
            >
              {t('ndvi.transparency')}
              <span className="text-ink-muted">{transparency} %</span>
            </label>
            <input
              id={sliderId}
              type="range"
              min={0}
              max={90}
              step={5}
              value={transparency}
              onChange={(event) =>
                setOpacity(1 - Number(event.target.value) / 100)
              }
              className="accent-brand-700"
            />
          </div>
          <p className="text-xs text-ink-muted">{t('ndvi.hint')}</p>
        </>
      )}
    </div>
  )
}
