import { useTranslation } from 'react-i18next'
import {
  usePhenologyEstimate,
  useTerroirIndices,
  type PhenologyEstimate,
  type TerroirBioclimaticProfile,
} from '@/api/bioclimatic'
import { Button } from '@/components/atoms/Button'

type PhenologyPanelProps = {
  vineyardId: string
}

function isNoWeatherData(
  estimate: PhenologyEstimate,
  indices: TerroirBioclimaticProfile,
) {
  return (
    estimate.accumulated_gdd === 0 &&
    estimate.current_bbch === 0 &&
    indices.winkler.gdd_sum === 0 &&
    indices.huglin.hi_value === 0 &&
    indices.selyaninov.moisture_class === 'Недостаточно активных дней'
  )
}

// Панель фенологической фазы BBCH и агроклиматических индексов в карточке участка
export function PhenologyPanel({ vineyardId }: PhenologyPanelProps) {
  const { t, i18n } = useTranslation()
  const phenology = usePhenologyEstimate(vineyardId)
  const indices = useTerroirIndices(vineyardId)

  const number = (val: number, digits = 1) =>
    new Intl.NumberFormat(i18n.resolvedLanguage, {
      maximumFractionDigits: digits,
    }).format(val)

  const translateStage = (bbch: number | null, fallback: string | null) => {
    if (bbch === null) return fallback ?? ''
    const key = `bbch.${bbch}`
    return i18n.exists(key) ? t(key) : (fallback ?? '')
  }

  const translateClass = (text: string) => {
    const key = `bioclimatic.classes.${text}`
    return i18n.exists(key) ? t(key) : text
  }

  if (phenology.isPending || indices.isPending) {
    return (
      <section
        aria-label={t('bioclimatic.panelTitle')}
        className="flex flex-col gap-1 text-sm"
      >
        <h3 className="text-xs font-semibold text-ink-subtle uppercase">
          {t('bioclimatic.panelTitle')}
        </h3>
        <p className="text-ink-muted">{t('common.loading')}</p>
      </section>
    )
  }

  const isWeatherError =
    phenology.error?.message?.toLowerCase().includes('метео') ||
    indices.error?.message?.toLowerCase().includes('метео')

  if (isWeatherError) {
    return (
      <section
        aria-label={t('bioclimatic.panelTitle')}
        className="flex flex-col gap-1 text-sm"
      >
        <h3 className="text-xs font-semibold text-ink-subtle uppercase">
          {t('bioclimatic.panelTitle')}
        </h3>
        <p className="text-ink-muted">{t('bioclimatic.noWeatherData')}</p>
      </section>
    )
  }

  if (phenology.isError || indices.isError) {
    const errorMsg =
      phenology.error?.message ||
      indices.error?.message ||
      t('bioclimatic.loadFailed')
    return (
      <section
        aria-label={t('bioclimatic.panelTitle')}
        className="flex flex-col gap-1.5 text-sm"
      >
        <h3 className="text-xs font-semibold text-ink-subtle uppercase">
          {t('bioclimatic.panelTitle')}
        </h3>
        <p role="alert" className="text-danger">
          {errorMsg}
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="self-start"
          onClick={() => {
            void phenology.refetch()
            void indices.refetch()
          }}
        >
          {t('bioclimatic.retry')}
        </Button>
      </section>
    )
  }

  const est = phenology.data
  const ind = indices.data

  if (isNoWeatherData(est, ind)) {
    return (
      <section
        aria-label={t('bioclimatic.panelTitle')}
        className="flex flex-col gap-1 text-sm"
      >
        <h3 className="text-xs font-semibold text-ink-subtle uppercase">
          {t('bioclimatic.panelTitle')}
        </h3>
        <p className="text-ink-muted">{t('bioclimatic.noWeatherData')}</p>
      </section>
    )
  }

  const currentStageName = translateStage(
    est.current_bbch,
    est.current_stage_name,
  )
  const nextStageName = translateStage(est.next_bbch, est.next_stage_name)

  return (
    <section
      aria-label={t('bioclimatic.panelTitle')}
      className="flex flex-col gap-2.5 text-sm"
    >
      <h3 className="text-xs font-semibold text-ink-subtle uppercase">
        {t('bioclimatic.panelTitle')}
      </h3>

      <div className="flex flex-col gap-1.5 rounded-lg border border-line bg-muted/20 p-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-1">
          <span className="font-semibold text-ink">
            BBCH {est.current_bbch} · {currentStageName}
          </span>
          {est.is_season_complete && (
            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              {t('bioclimatic.seasonComplete')}
            </span>
          )}
        </div>

        {est.is_season_complete ? (
          <div className="flex flex-col gap-1">
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-muted-strong"
              role="progressbar"
              aria-valuenow={100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('bioclimatic.seasonComplete')}
            >
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-xs text-ink-muted">
              {t('bioclimatic.accumulatedGdd', {
                gdd: number(est.accumulated_gdd),
              })}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>
                {t('bioclimatic.progressToNext', {
                  stage: est.next_bbch !== null ? `BBCH ${est.next_bbch}` : '',
                })}
              </span>
              <span className="font-semibold text-ink tabular-nums">
                {number(est.progress_percentage)} %
              </span>
            </div>
            <div
              className="relative h-2 w-full overflow-hidden rounded-full bg-muted-strong"
              role="progressbar"
              aria-valuenow={est.progress_percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('bioclimatic.progressToNext', {
                stage: est.next_bbch !== null ? `BBCH ${est.next_bbch}` : '',
              })}
            >
              <div
                className="h-full rounded-full bg-brand-600 transition-all"
                style={{
                  width: `${Math.min(100, Math.max(0, est.progress_percentage))}%`,
                }}
              />
            </div>
            <div className="flex flex-col gap-0.5 pt-0.5 text-xs">
              <p className="text-ink-soft">
                {t('bioclimatic.gddToNext', {
                  gdd: number(est.gdd_to_next),
                })}
                {nextStageName && ` (${nextStageName})`}
              </p>
              <p className="text-ink-muted">
                {t('bioclimatic.accumulatedGdd', {
                  gdd: number(est.accumulated_gdd),
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-semibold text-ink-subtle">
          {t('bioclimatic.indicesTitle')}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full rounded border border-line text-left text-xs">
            <thead className="bg-muted/40 text-ink-subtle">
              <tr>
                <th className="p-1.5 font-medium">
                  {t('bioclimatic.table.index')}
                </th>
                <th className="p-1.5 font-medium">
                  {t('bioclimatic.table.value')}
                </th>
                <th className="p-1.5 font-medium">
                  {t('bioclimatic.table.description')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              <tr>
                <td className="p-1.5 font-medium whitespace-nowrap text-ink">
                  {t('bioclimatic.indices.winkler')}
                </td>
                <td className="p-1.5 whitespace-nowrap text-ink">
                  {t('bioclimatic.gddValue', {
                    value: number(ind.winkler.gdd_sum),
                  })}{' '}
                  · {ind.winkler.region_class} (
                  {translateClass(ind.winkler.region_title)})
                </td>
                <td className="p-1.5 text-ink-muted">
                  {ind.winkler.suitable_varieties.join(', ')}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 font-medium whitespace-nowrap text-ink">
                  {t('bioclimatic.indices.huglin')}
                </td>
                <td className="p-1.5 whitespace-nowrap text-ink">
                  {number(ind.huglin.hi_value)} ·{' '}
                  {translateClass(ind.huglin.thermal_class)}
                </td>
                <td className="p-1.5 text-ink-muted">
                  {translateClass(ind.huglin.thermal_description)}
                </td>
              </tr>
              <tr>
                <td className="p-1.5 font-medium whitespace-nowrap text-ink">
                  {t('bioclimatic.indices.selyaninov')}
                </td>
                <td className="p-1.5 whitespace-nowrap text-ink">
                  {number(ind.selyaninov.htc_value, 2)} ·{' '}
                  {translateClass(ind.selyaninov.moisture_class)}
                </td>
                <td className="p-1.5 text-ink-muted">
                  {translateClass(ind.selyaninov.irrigation_need)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
