import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useMapStore } from '@/store/map'

export function OsmToggle() {
  const { t } = useTranslation()
  const id = useId()
  const isEnabled = useMapStore((state) => state.showOsm)
  const setShowOsm = useMapStore((state) => state.setShowOsm)
  const isTooFar = useMapStore((state) => state.osmTooFar)

  return (
    <div className="flex flex-col gap-1 rounded-md border border-line bg-surface p-3 text-sm shadow-sm">
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center gap-2 text-ink"
      >
        <input
          id={id}
          type="checkbox"
          checked={isEnabled}
          onChange={(event) => setShowOsm(event.target.checked)}
          className="size-4 accent-brand-700"
        />
        {t('osm.toggle')}
      </label>
      {/* Подсказка озвучивается, когда слой включён, но масштаб слишком мелкий */}
      <p aria-live="polite" className="text-ink-muted">
        {isEnabled && isTooFar ? t('osm.zoomIn') : ''}
      </p>
    </div>
  )
}
