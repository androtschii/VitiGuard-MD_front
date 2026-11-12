import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useVegetation } from '@/api/vegetation'
import { useVineyards } from '@/api/vineyards'
import { Select } from '@/components/atoms/Select'
import { VegetationChart } from '@/components/organisms/VegetationChart'

// NDVI и NDRE участка за сезон по снимкам Sentinel-2 — тот же график, что в
// карточке участка на карте, но сразу на главной
export function NdviSeason() {
  const { t } = useTranslation()
  const selectId = useId()
  const vineyards = useVineyards()
  const plots = vineyards.data ?? []
  const [chosen, setChosen] = useState<string | undefined>()
  const plotId = chosen ?? plots[0]?.id ?? ''
  const vegetation = useVegetation(plotId)

  if (plots.length === 0) return null
  const observations = vegetation.data ?? []

  return (
    <section
      aria-labelledby="ndvi-season"
      className="stagger flex min-w-0 flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-sm [--i:4] motion-safe:animate-rise"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="ndvi-season" className="text-sm font-medium text-ink">
          {t('ndviSeason.title')}
        </h2>
        {plots.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor={selectId} className="sr-only">
              {t('ndviSeason.plot')}
            </label>
            <Select
              id={selectId}
              className="max-w-80 min-w-56"
              value={plotId}
              onChange={(event) => setChosen(event.target.value)}
            >
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>
      {vegetation.isPending ? (
        <p className="text-sm text-ink-muted">{t('common.loading')}</p>
      ) : vegetation.isError ? (
        <p role="alert" className="text-sm text-danger">
          {vegetation.error.message}
        </p>
      ) : observations.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('ndviSeason.empty')}</p>
      ) : (
        <VegetationChart observations={observations} />
      )}
    </section>
  )
}
