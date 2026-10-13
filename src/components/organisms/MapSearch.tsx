import { Marker } from 'maplibre-gl'
import { useEffect, useId, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useVineyards, type Vineyard } from '@/api/vineyards'
import { cn } from '@/lib/cn'
import { parseCoordinates, type LatLon } from '@/lib/coordinates'
import { boundsOf } from '@/lib/geo'
import { useMap } from '@/lib/mapContext'
import { useMapStore } from '@/store/map'

type Option =
  { kind: 'point'; point: LatLon } | { kind: 'vineyard'; vineyard: Vineyard }

// Больше в выпадающем списке не прочитать без прокрутки
const MAX_RESULTS = 8

// Поиск по своим участкам (название) и переход к координатам.
// Комбобокс по шаблону WAI-ARIA: фокус остаётся в поле, а выбранный вариант
// диктор узнаёт из aria-activedescendant
export function MapSearch() {
  const { t, i18n } = useTranslation()
  const map = useMap()
  const { data: vineyards = [] } = useVineyards()
  const select = useMapStore((state) => state.select)
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [marker] = useState(() => new Marker({ color: '#047857' }))
  const inputId = useId()
  const listId = useId()

  useEffect(() => () => void marker.remove(), [marker])

  if (!map) return null

  const needle = query.trim().toLocaleLowerCase()
  const point = parseCoordinates(query)
  const options: Option[] = [
    ...(point ? [{ kind: 'point' as const, point }] : []),
    ...(needle
      ? vineyards
          .filter((vineyard) =>
            vineyard.name.toLocaleLowerCase().includes(needle),
          )
          .slice(0, MAX_RESULTS)
          .map((vineyard) => ({ kind: 'vineyard' as const, vineyard }))
      : []),
  ]
  const showList = isOpen && needle !== ''
  const optionId = (index: number) => `${listId}-${index}`
  const area = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 2,
  })

  const choose = (option: Option) => {
    marker.remove()
    if (option.kind === 'point') {
      const { lat, lon } = option.point
      marker.setLngLat([lon, lat]).addTo(map)
      map.flyTo({ center: [lon, lat], zoom: 15 })
      select(null)
    } else {
      const { vineyard } = option
      const bounds = boundsOf([vineyard.geometry])
      if (bounds) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 16 })
        const [[west, south], [east, north]] = bounds
        select({
          id: vineyard.id,
          lngLat: [(west + east) / 2, (south + north) / 2],
        })
      }
      setQuery(vineyard.name)
    }
    setIsOpen(false)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!options.length) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setIsOpen(true)
      setActive((index) => (index + step + options.length) % options.length)
    } else if (event.key === 'Enter') {
      const option = options[active]
      if (showList && option) {
        event.preventDefault()
        choose(option)
      }
    } else if (event.key === 'Escape') {
      // Первый Esc закрывает список, второй очищает поле
      if (showList) setIsOpen(false)
      else setQuery('')
    }
  }

  return (
    <div className="relative">
      <label htmlFor={inputId} className="sr-only">
        {t('search.label')}
      </label>
      <input
        id={inputId}
        type="search"
        role="combobox"
        autoComplete="off"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && options.length ? optionId(active) : undefined
        }
        value={query}
        placeholder={t('search.placeholder')}
        onChange={(event) => {
          setQuery(event.target.value)
          setActive(0)
          setIsOpen(true)
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setIsOpen(false)}
        className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:border-brand-500 focus:outline-2 focus:outline-brand-500/25"
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('search.label')}
          className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-md border border-line bg-surface py-1 text-sm shadow-lg"
        >
          {options.length === 0 && (
            <li
              role="option"
              aria-selected={false}
              aria-disabled="true"
              className="px-3 py-2 text-ink-muted"
            >
              {t('search.nothing')}
            </li>
          )}
          {options.map((option, index) => (
            // Клавиатура остаётся в поле ввода (aria-activedescendant), поэтому
            // у вариантов нет своих обработчиков клавиш
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <li
              key={option.kind === 'point' ? 'point' : option.vineyard.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === active}
              // Клик не должен снимать фокус с поля раньше, чем выбор сработает
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
              onMouseEnter={() => setActive(index)}
              className={cn(
                'flex cursor-pointer justify-between gap-3 px-3 py-2 text-ink',
                index === active && 'bg-muted',
              )}
            >
              {option.kind === 'point' ? (
                t('search.point', option.point)
              ) : (
                <>
                  <span className="truncate">{option.vineyard.name}</span>
                  <span className="shrink-0 text-ink-muted">
                    {area.format(option.vineyard.area_ha)}{' '}
                    {t('search.hectares')}
                  </span>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
