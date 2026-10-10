import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { BASEMAPS, type Basemap } from '@/lib/basemaps'
import { cn } from '@/lib/cn'

type BasemapSwitcherProps = {
  value: Basemap
  onChange: (basemap: Basemap) => void
  className?: string
}

// Группа радиокнопок, оформленная как переключатель: стрелки клавиатуры
// и озвучивание «выбрано, 1 из 3» браузер даёт сам
export function BasemapSwitcher({
  value,
  onChange,
  className,
}: BasemapSwitcherProps) {
  const { t } = useTranslation()
  const name = useId()

  return (
    <fieldset
      className={cn(
        'flex rounded-md border border-line bg-surface p-0.5 shadow-sm',
        className,
      )}
    >
      <legend className="sr-only">{t('map.basemap.label')}</legend>
      {BASEMAPS.map((basemap) => (
        <label
          key={basemap}
          className={cn(
            'cursor-pointer rounded px-2.5 py-1 text-sm font-medium transition-colors',
            'has-focus-visible:outline-2 has-focus-visible:outline-emerald-600',
            value === basemap
              ? 'bg-emerald-700 text-white'
              : 'text-ink-soft hover:bg-muted',
          )}
        >
          <input
            type="radio"
            name={name}
            value={basemap}
            checked={value === basemap}
            onChange={() => onChange(basemap)}
            className="sr-only"
          />
          {t(`map.basemap.${basemap}`)}
        </label>
      ))}
    </fieldset>
  )
}
