import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRefreshVegetation, useVegetation } from '@/api/vegetation'
import { Button } from '@/components/atoms/Button'
import { PeriodFilter } from '@/components/molecules/PeriodFilter'
import { Modal } from '@/components/organisms/Modal'
import { VegetationChart } from '@/components/organisms/VegetationChart'
import { inPeriod, periodRange, SEASON, type Period } from '@/lib/period'

type VegetationDialogProps = {
  vineyardId: string
  vineyardName: string
  open: boolean
  onClose: () => void
}

// Окно «Динамика вегетации»: график NDVI и NDRE за сезон, таблица значений и
// запуск расчёта по новым снимкам Sentinel-2
export function VegetationDialog({
  vineyardId,
  vineyardName,
  open,
  onClose,
}: VegetationDialogProps) {
  const { t, i18n } = useTranslation()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [period, setPeriod] = useState<Period>(SEASON)
  const history = useVegetation(vineyardId, isRefreshing)
  const refresh = useRefreshVegetation(vineyardId)

  const language = i18n.resolvedLanguage
  const day = new Intl.DateTimeFormat(language, { dateStyle: 'medium' })
  const value = new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const observations = history.data ?? []
  const clear = observations.filter((item) => item.ndvi)
  const latest = clear.at(-1)
  // Сводка — по всем снимкам, график и таблица — за выбранный период до
  // последнего снимка
  const lastDay = observations.at(-1)?.acquired_at.slice(0, 10)
  const shown = lastDay
    ? inPeriod(
        observations,
        (item) => Date.parse(item.acquired_at),
        periodRange(period, lastDay),
      )
    : observations

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('vegetation.title', { name: vineyardName })}
      description={t('vegetation.description')}
      footer={
        <Button
          isLoading={refresh.isPending}
          onClick={() =>
            refresh.mutate(undefined, {
              onSuccess: () => setIsRefreshing(true),
            })
          }
        >
          {t('vegetation.refresh')}
        </Button>
      }
    >
      <div aria-live="polite" className="flex flex-col gap-3 text-sm">
        {isRefreshing && (
          <p className="rounded-md bg-accent-soft p-3 text-ink">
            {t('vegetation.refreshing')}
          </p>
        )}
        {refresh.isError && (
          <p role="alert" className="text-danger">
            {refresh.error.message}
          </p>
        )}
        {history.isPending ? (
          <p className="text-ink-muted">{t('common.loading')}</p>
        ) : history.isError ? (
          <p role="alert" className="text-danger">
            {history.error.message}
          </p>
        ) : clear.length === 0 ? (
          <p className="text-ink-muted">{t('vegetation.empty')}</p>
        ) : (
          <>
            <p className="text-ink-soft">
              {t('vegetation.summary', {
                ndvi: latest ? value.format(latest.ndvi?.mean ?? 0) : '',
                date: latest ? day.format(new Date(latest.acquired_at)) : '',
                clear: clear.length,
                cloudy: observations.length - clear.length,
              })}
            </p>
            <PeriodFilter value={period} onChange={setPeriod} />
            {shown.some((item) => item.ndvi) ? (
              <VegetationChart observations={shown} />
            ) : (
              <p className="text-ink-muted">{t('period.empty')}</p>
            )}
            <details>
              <summary className="cursor-pointer font-medium text-accent">
                {t('vegetation.table')}
              </summary>
              <div className="mt-2 max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">{t('vegetation.table')}</caption>
                  <thead className="text-ink-muted">
                    <tr>
                      <th scope="col" className="py-1">
                        {t('vegetation.columns.date')}
                      </th>
                      <th scope="col" className="py-1 text-right">
                        NDVI
                      </th>
                      <th scope="col" className="py-1 text-right">
                        NDRE
                      </th>
                      <th scope="col" className="py-1 text-right">
                        {t('vegetation.columns.cloud')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {shown.map((item) => (
                      <tr key={`${item.acquired_at}-${item.platform}`}>
                        <td className="py-1">
                          {day.format(new Date(item.acquired_at))}
                        </td>
                        <td className="py-1 text-right tabular-nums">
                          {item.ndvi ? value.format(item.ndvi.mean) : '—'}
                        </td>
                        <td className="py-1 text-right tabular-nums">
                          {item.ndre ? value.format(item.ndre.mean) : '—'}
                        </td>
                        <td className="py-1 text-right tabular-nums">
                          {item.parcel_cloud_cover === null
                            ? '—'
                            : `${Math.round(item.parcel_cloud_cover)} %`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </>
        )}
      </div>
    </Modal>
  )
}
