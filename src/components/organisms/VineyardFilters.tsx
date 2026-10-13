import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVineyards } from '@/api/vineyards'
import { Button } from '@/components/atoms/Button'
import { Input } from '@/components/atoms/Input'
import { Select } from '@/components/atoms/Select'
import { filterVineyards, isFiltered, NO_FILTER } from '@/lib/vineyardFilter'
import { useMapStore } from '@/store/map'

// Пустое поле — граница не задана; отрицательную площадь не набрать
function parseArea(value: string) {
  const area = Number(value.replace(',', '.'))
  return value.trim() === '' || Number.isNaN(area) ? null : Math.max(0, area)
}

export function VineyardFilters() {
  const { t } = useTranslation()
  const { data: vineyards = [] } = useVineyards()
  const filter = useMapStore((state) => state.filter)
  const setFilter = useMapStore((state) => state.setFilter)
  const ids = { variety: useId(), min: useId(), max: useId() }
  // Текст полей хранится как набран: иначе «1,» сразу превращалось бы в «1»
  const [minText, setMinText] = useState(filter.minArea?.toString() ?? '')
  const [maxText, setMaxText] = useState(filter.maxArea?.toString() ?? '')

  // Фильтровать нечего, пока участков нет
  if (vineyards.length === 0) return null

  // В списке — только сорта, которые есть у участков пользователя
  const varieties = [
    ...new Map(
      vineyards.flatMap((vineyard) =>
        vineyard.variety ? [[vineyard.variety.id, vineyard.variety]] : [],
      ),
    ).values(),
  ].sort((a, b) => a.name.localeCompare(b.name))
  const shown = filterVineyards(vineyards, filter).length

  return (
    <fieldset className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3 text-sm shadow-sm">
      <legend className="sr-only">{t('filter.label')}</legend>
      <label htmlFor={ids.variety} className="font-medium text-ink">
        {t('filter.variety')}
      </label>
      <Select
        id={ids.variety}
        value={filter.variety}
        onChange={(event) =>
          setFilter({ ...filter, variety: event.target.value })
        }
      >
        <option value="all">{t('filter.all')}</option>
        {varieties.map((variety) => (
          <option key={variety.id} value={variety.id}>
            {variety.name}
          </option>
        ))}
        <option value="none">{t('filter.none')}</option>
      </Select>
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={ids.min} className="font-medium text-ink">
            {t('filter.minArea')}
          </label>
          <Input
            id={ids.min}
            inputMode="decimal"
            value={minText}
            onChange={(event) => {
              setMinText(event.target.value)
              setFilter({ ...filter, minArea: parseArea(event.target.value) })
            }}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={ids.max} className="font-medium text-ink">
            {t('filter.maxArea')}
          </label>
          <Input
            id={ids.max}
            inputMode="decimal"
            value={maxText}
            onChange={(event) => {
              setMaxText(event.target.value)
              setFilter({ ...filter, maxArea: parseArea(event.target.value) })
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        {/* Число найденных участков озвучивается при каждом изменении фильтра */}
        <p aria-live="polite" className="text-ink-muted">
          {t('filter.shown', { shown, total: vineyards.length })}
        </p>
        <Button
          size="sm"
          variant="secondary"
          disabled={!isFiltered(filter)}
          onClick={() => {
            setMinText('')
            setMaxText('')
            setFilter(NO_FILTER)
          }}
        >
          {t('filter.reset')}
        </Button>
      </div>
    </fieldset>
  )
}
