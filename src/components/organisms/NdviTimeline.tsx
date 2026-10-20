import { useQueries } from '@tanstack/react-query'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchVegetation, vegetationKey } from '@/api/vegetation'
import { useVineyards } from '@/api/vineyards'
import { ndviDays } from '@/lib/ndviLayer'
import { filterVineyards } from '@/lib/vineyardFilter'
import { useMapStore } from '@/store/map'

// Шкала дат снимков: перемещение ползунка показывает на карте картограммы на
// выбранный день — у каждого участка последний снимок без облаков не позже него
export function NdviTimeline() {
  const { t, i18n } = useTranslation()
  const id = useId()
  const isEnabled = useMapStore((state) => state.showNdvi)
  const filter = useMapStore((state) => state.filter)
  const selected = useMapStore((state) => state.ndviDay)
  const setDay = useMapStore((state) => state.setNdviDay)
  const { data: vineyards } = useVineyards()
  const ids = isEnabled
    ? filterVineyards(vineyards ?? [], filter).map((vineyard) => vineyard.id)
    : []
  const days = useQueries({
    queries: ids.map((vineyardId) => ({
      queryKey: vegetationKey(vineyardId),
      queryFn: () => fetchVegetation(vineyardId),
    })),
    combine: (results) => ndviDays(results.map((result) => result.data)),
  })

  if (!isEnabled || days.length < 2) return null

  const last = days.length - 1
  const found = selected === null ? -1 : days.indexOf(selected)
  const index = found === -1 ? last : found
  const format = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const label = (day: string) => format.format(new Date(`${day}T00:00:00Z`))

  return (
    <div className="flex flex-col gap-1 rounded-md border border-line bg-surface p-3 text-sm shadow-sm">
      <label htmlFor={id} className="flex justify-between gap-2 text-ink">
        {t('ndvi.date')}
        <span className="text-ink-muted">
          {index === last ? t('ndvi.latest') : label(days[index])}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={last}
        step={1}
        value={index}
        aria-valuetext={label(days[index])}
        onChange={(event) => {
          const next = Number(event.target.value)
          setDay(next === last ? null : days[next])
        }}
        className="accent-brand-700"
      />
      <div className="flex justify-between text-xs text-ink-muted">
        <span>{label(days[0])}</span>
        <span>{label(days[last])}</span>
      </div>
    </div>
  )
}
