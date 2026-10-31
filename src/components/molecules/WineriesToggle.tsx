import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useMapStore } from '@/store/map'

export function WineriesToggle() {
  const { t } = useTranslation()
  const id = useId()
  const isEnabled = useMapStore((state) => state.showWineries)
  const setShowWineries = useMapStore((state) => state.setShowWineries)

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
          onChange={(event) => setShowWineries(event.target.checked)}
          className="size-4 accent-brand-700"
        />
        {t('wineries.toggle')}
      </label>
      {isEnabled && (
        <ul className="flex gap-3 text-xs text-ink-muted">
          <li className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-brand-700"
            />
            {t('wineries.kinds.winery')}
          </li>
          <li className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full bg-fuchsia-600"
            />
            {t('wineries.kinds.shop')}
          </li>
        </ul>
      )}
    </div>
  )
}
