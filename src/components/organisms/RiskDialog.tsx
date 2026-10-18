import { useTranslation } from 'react-i18next'
import { useRefreshRisks, useRisks, type RiskEntry } from '@/api/risks'
import { Button } from '@/components/atoms/Button'
import { RiskBadge } from '@/components/molecules/RiskBadge'
import { Modal } from '@/components/organisms/Modal'
import { TimeSeriesChart } from '@/components/organisms/TimeSeriesChart'
import {
  dailyRisk,
  dayTime,
  infectionDays,
  localToday,
  methodSeries,
  niceRange,
  weatherSeries,
  type IndexPoint,
  type WeatherPoint,
} from '@/lib/riskSeries'
import { timeScales } from '@/lib/timeSeriesChart'

type RiskDialogProps = {
  vineyardId: string
  vineyardName: string
  open: boolean
  onClose: () => void
}

// Высота каждого из двух графиков: их два, друг под другом
const CHART_HEIGHT = 180
const WEEK = 7

function SeasonChart({
  points,
  label,
  lineLabel,
  today,
  todayLabel,
  markers,
}: {
  points: IndexPoint[]
  label: string
  lineLabel: string
  today: number
  todayLabel: string
  markers?: { time: number; label: string }[]
}) {
  if (points.length === 0) return null
  return (
    <TimeSeriesChart<IndexPoint>
      points={points}
      scales={timeScales(
        points.map((point) => point.time),
        { min: 0, max: 100, step: 25 },
        CHART_HEIGHT,
      )}
      label={label}
      formatValue={(value) => String(Math.round(value))}
      today={today}
      todayLabel={todayLabel}
      markers={markers}
      series={[
        {
          key: 'value',
          label: lineLabel,
          color: 'var(--chart-ndvi)',
          value: (point) => point.value,
        },
      ]}
    />
  )
}

// Погода сезона (pr-057): температура и осадки на двух графиках, а не
// на одном с двумя осями. Дни заражения отмечены на обоих
function WeatherCharts({
  points,
  today,
  markers,
}: {
  points: WeatherPoint[]
  today: number
  markers: { time: number; label: string }[]
}) {
  const { t } = useTranslation()
  if (points.length === 0) return null
  const times = points.map((point) => point.time)
  const rain = points.filter((point) => point.precipitation !== null)
  const rainValues = rain.map((point) => point.precipitation ?? 0)
  return (
    <section className="flex flex-col gap-1">
      <h3 className="font-semibold text-ink">{t('risk.weatherChart')}</h3>
      <TimeSeriesChart<WeatherPoint>
        points={points}
        scales={timeScales(
          times,
          niceRange(
            points.map((point) => point.temperature),
            10,
            0,
          ),
          CHART_HEIGHT,
        )}
        label={t('risk.temperatureChartLabel')}
        formatValue={(value) => `${Math.round(value)} °C`}
        today={today}
        todayLabel={t('risk.todayMark')}
        markers={markers}
        series={[
          {
            key: 'temperature',
            label: t('risk.temperatureShort'),
            legend: t('risk.temperatureLegend'),
            color: 'var(--chart-ndvi)',
            value: (point) => point.temperature,
          },
        ]}
      />
      {rain.length > 0 && (
        <TimeSeriesChart<WeatherPoint>
          points={rain}
          scales={timeScales(
            rain.map((point) => point.time),
            niceRange(rainValues, 10, 0),
            CHART_HEIGHT,
          )}
          label={t('risk.precipitationChartLabel')}
          formatValue={(value) =>
            t('risk.precipitationValue', { value: Math.round(value) })
          }
          today={today}
          markers={markers}
          series={[
            {
              key: 'precipitation',
              kind: 'bar',
              label: t('risk.precipitationShort'),
              legend: t('risk.precipitationLegend'),
              color: 'var(--chart-ndre)',
              value: (point) => point.precipitation ?? 0,
            },
          ]}
        />
      )}
      <p className="text-xs text-ink-subtle">{t('risk.weatherHint')}</p>
    </section>
  )
}

function factor(entry: RiskEntry | undefined, key: string) {
  return entry?.factors?.[key]
}

// Риск милдью и оидиума по агромоделям: сегодня, неделя вперёд по прогнозу
// погоды и весь сезон на двух графиках (у моделей разные шкалы — две оси)
export function RiskDialog({
  vineyardId,
  vineyardName,
  open,
  onClose,
}: RiskDialogProps) {
  const { t, i18n } = useTranslation()
  const risks = useRisks(vineyardId)
  const refresh = useRefreshRisks(vineyardId)
  const day = new Intl.DateTimeFormat(i18n.resolvedLanguage, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  })
  const entries = risks.data ?? []
  const today = localToday()
  const days = dailyRisk(entries)
  const now = days.find((item) => item.day === today)
  const week = days.filter((item) => item.day > today).slice(0, WEEK)
  const todayEntries = entries.filter((entry) => entry.target_date === today)
  const incubation = todayEntries.find((entry) => entry.method === 'goidanich')
  const gubler = todayEntries.find((entry) => entry.method === 'gubler_thomas')
  const infectionDay = factor(incubation, 'infection_day')
  const format = (date: string) => day.format(dayTime(date))
  const infections = infectionDays(entries).map((date) => ({
    time: dayTime(date),
    label: t('risk.infectionMark', { date: format(date) }),
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={t('risk.title', { name: vineyardName })}
      description={t('risk.description')}
      footer={
        <Button isLoading={refresh.isPending} onClick={() => refresh.mutate()}>
          {t('risk.refresh')}
        </Button>
      }
    >
      <div aria-live="polite" className="flex flex-col gap-4 text-sm">
        {refresh.isError && (
          <p role="alert" className="text-danger">
            {refresh.error.message}
          </p>
        )}
        {risks.isPending ? (
          <p className="text-ink-muted">{t('common.loading')}</p>
        ) : risks.isError ? (
          <p role="alert" className="text-danger">
            {risks.error.message}
          </p>
        ) : entries.length === 0 ? (
          <p className="text-ink-muted">{t('risk.empty')}</p>
        ) : (
          <>
            <section className="flex flex-col gap-1.5">
              <h3 className="font-semibold text-ink">{t('risk.today')}</h3>
              {now ? (
                <>
                  <p className="flex flex-wrap items-center gap-2">
                    <RiskBadge level={now.downy} label={t('risk.downy')} />
                    <RiskBadge level={now.powdery} label={t('risk.powdery')} />
                  </p>
                  <p className="text-ink-soft">
                    {factor(incubation, 'symptoms_expected') === true
                      ? t('risk.symptoms', {
                          date: format(String(infectionDay)),
                        })
                      : typeof infectionDay === 'string'
                        ? t('risk.incubation', {
                            date: format(infectionDay),
                            progress: Math.round(
                              Number(factor(incubation, 'progress')),
                            ),
                          })
                        : t('risk.noIncubation')}{' '}
                    {t('risk.gublerToday', {
                      index: Number(factor(gubler, 'index') ?? 0),
                    })}
                  </p>
                </>
              ) : (
                <p className="text-ink-muted">{t('risk.offSeason')}</p>
              )}
            </section>

            {week.length > 0 && (
              <section className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-ink">{t('risk.week')}</h3>
                <table className="w-full text-left text-xs">
                  <caption className="sr-only">{t('risk.week')}</caption>
                  <thead className="text-ink-muted">
                    <tr>
                      <th scope="col" className="py-1">
                        {t('risk.columns.date')}
                      </th>
                      <th scope="col" className="py-1">
                        {t('risk.downy')}
                      </th>
                      <th scope="col" className="py-1">
                        {t('risk.powdery')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {week.map((item) => (
                      <tr key={item.day}>
                        <td className="py-1">{format(item.day)}</td>
                        <td className="py-1">
                          <RiskBadge level={item.downy} />
                        </td>
                        <td className="py-1">
                          <RiskBadge level={item.powdery} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            <section className="flex flex-col gap-1">
              <h3 className="font-semibold text-ink">
                {t('risk.powderyChart')}
              </h3>
              <SeasonChart
                points={methodSeries(entries, 'gubler_thomas')}
                label={t('risk.powderyChartLabel')}
                lineLabel={t('risk.gublerShort')}
                today={dayTime(today)}
                todayLabel={t('risk.todayMark')}
              />
            </section>
            <section className="flex flex-col gap-1">
              <h3 className="font-semibold text-ink">{t('risk.downyChart')}</h3>
              <SeasonChart
                points={methodSeries(entries, 'goidanich')}
                label={t('risk.downyChartLabel')}
                lineLabel={t('risk.incubationShort')}
                today={dayTime(today)}
                todayLabel={t('risk.todayMark')}
                markers={infections}
              />
              <p className="text-xs text-ink-subtle">{t('risk.markersHint')}</p>
            </section>
            <WeatherCharts
              points={weatherSeries(entries)}
              today={dayTime(today)}
              markers={infections}
            />
            <p className="text-xs text-ink-subtle">{t('risk.disclaimer')}</p>
          </>
        )}
      </div>
    </Modal>
  )
}
