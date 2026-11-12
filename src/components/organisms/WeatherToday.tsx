import { useTranslation } from 'react-i18next'
import { useCurrentWeather } from '@/api/weather'
import { useVineyards } from '@/api/vineyards'
import { vineyardPoint } from '@/lib/vineyardPoint'

// Влажный тёплый воздух — главное условие заражения милдью: при таких
// значениях подсказка советует посмотреть риск по дням
const WET_HUMIDITY = 85
const WARM_ENOUGH_C = 10

// Погода сейчас у первого участка хозяйства (Open-Meteo через сервер)
export function WeatherToday() {
  const { t, i18n } = useTranslation()
  const vineyards = useVineyards()
  const first = vineyards.data?.[0]
  const weather = useCurrentWeather(first ? vineyardPoint(first) : null)

  if (!first) return null
  const number = new Intl.NumberFormat(i18n.resolvedLanguage, {
    maximumFractionDigits: 1,
  })
  const wet =
    weather.data &&
    weather.data.relative_humidity >= WET_HUMIDITY &&
    weather.data.temperature_c >= WARM_ENOUGH_C

  return (
    <section
      aria-labelledby="weather-today"
      className="stagger rounded-lg border border-line bg-surface p-4 shadow-sm [--i:2] motion-safe:animate-rise"
    >
      <h2 id="weather-today" className="text-sm text-ink-muted">
        {t('weatherToday.title', { name: first.name })}
      </h2>
      {weather.isPending ? (
        <p className="mt-2 text-sm text-ink-muted">{t('common.loading')}</p>
      ) : weather.isError ? (
        <p className="mt-2 text-sm text-ink-muted">
          {t('weatherToday.unavailable')}
        </p>
      ) : (
        <>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-3xl font-semibold text-ink">
              {number.format(weather.data.temperature_c)} °C
            </span>
            <span className="text-sm text-ink-soft">
              {t('weatherToday.humidity', {
                value: Math.round(weather.data.relative_humidity),
              })}
            </span>
            <span className="text-sm text-ink-soft">
              {t('weatherToday.rain', {
                value: number.format(weather.data.precipitation_mm),
              })}
            </span>
          </p>
          <p className="mt-2 text-xs text-ink-muted">
            {wet ? t('weatherToday.wet') : t('weatherToday.calm')}
          </p>
        </>
      )}
    </section>
  )
}
