import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  downloadVineyard,
  useDeleteVineyard,
  useVineyardContext,
  type ExportFormat,
  type Vineyard,
} from '@/api/vineyards'
import { useCurrentWeather } from '@/api/weather'
import { Button } from '@/components/atoms/Button'
import { RiskSummary } from '@/components/organisms/RiskSummary'
import { VegetationDialog } from '@/components/organisms/VegetationDialog'

type VineyardCardProps = {
  vineyard: Vineyard
  // Точка клика по участку: погода берётся в ней
  point: [number, number]
  onDeleted: () => void
}

// Содержимое попапа участка: паспорт участка, местность и погода, действия
export function VineyardCard({
  vineyard,
  point,
  onDeleted,
}: VineyardCardProps) {
  const { t, i18n } = useTranslation()
  const context = useVineyardContext(vineyard.id)
  const weather = useCurrentWeather(point)
  const remove = useDeleteVineyard()
  const [isConfirming, setIsConfirming] = useState(false)
  const [downloadError, setDownloadError] = useState(false)
  const [isVegetationOpen, setIsVegetationOpen] = useState(false)

  const language = i18n.resolvedLanguage
  const number = (value: number, digits = 1) =>
    new Intl.NumberFormat(language, { maximumFractionDigits: digits }).format(
      value,
    )
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(
    new Date(vineyard.created_at),
  )

  const download = (format: ExportFormat) => {
    setDownloadError(false)
    downloadVineyard(vineyard.id, format).catch(() => setDownloadError(true))
  }

  return (
    <div className="flex flex-col gap-2 pr-4 text-sm">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-semibold text-ink">{vineyard.name}</h2>
        <p>{t('vineyard.area', { area: number(vineyard.area_ha, 2) })}</p>
        {vineyard.variety && (
          <p>{t('vineyard.varietyLine', { name: vineyard.variety.name })}</p>
        )}
        {vineyard.planting_year && (
          <p>{t('vineyard.plantedLine', { year: vineyard.planting_year })}</p>
        )}
        {context.data?.district && (
          <p>
            {t('vineyard.card.district', {
              name: context.data.district.name,
            })}
          </p>
        )}
        <p className="text-ink-muted">{t('vineyard.addedOn', { date })}</p>
      </div>

      <RiskSummary vineyardId={vineyard.id} vineyardName={vineyard.name} />

      <section aria-label={t('vineyard.card.weather')}>
        <h3 className="text-xs font-semibold text-ink-subtle uppercase">
          {t('vineyard.card.weather')}
        </h3>
        {weather.isPending ? (
          <p className="text-ink-muted">{t('common.loading')}</p>
        ) : weather.isError ? (
          <p className="text-ink-muted">{t('vineyard.card.weatherFailed')}</p>
        ) : (
          <p>
            {t('vineyard.card.weatherNow', {
              temperature: number(weather.data.temperature_c),
              humidity: number(weather.data.relative_humidity, 0),
              precipitation: number(weather.data.precipitation_mm),
            })}
          </p>
        )}
      </section>

      {context.data && (
        <section aria-label={t('vineyard.card.surroundings')}>
          <h3 className="text-xs font-semibold text-ink-subtle uppercase">
            {t('vineyard.card.surroundings')}
          </h3>
          <p>
            {t('vineyard.card.nearby', {
              count: context.data.osm_vineyards_within_1km,
            })}
          </p>
          {context.data.nearest_osm_distance_m !== null && (
            <p>
              {t('vineyard.card.nearest', {
                distance: number(context.data.nearest_osm_distance_m, 0),
              })}
            </p>
          )}
          {context.data.osm_overlap_ratio > 0 && (
            <p>
              {t('vineyard.card.overlap', {
                value: number(context.data.osm_overlap_ratio * 100, 0),
              })}
            </p>
          )}
        </section>
      )}

      <div className="flex flex-col gap-1.5 border-t border-line pt-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsVegetationOpen(true)}
        >
          {t('vegetation.open')}
        </Button>
        {/* Окно монтируется только открытым: иначе история индексов
            запрашивалась бы при каждом открытии карточки */}
        {isVegetationOpen && (
          <VegetationDialog
            vineyardId={vineyard.id}
            vineyardName={vineyard.name}
            open={isVegetationOpen}
            onClose={() => setIsVegetationOpen(false)}
          />
        )}
        <p className="flex flex-wrap items-center gap-x-2 text-ink-muted">
          {t('vineyard.card.download')}
          <button
            type="button"
            onClick={() => download('geojson')}
            className="font-medium text-accent underline"
          >
            GeoJSON
          </button>
          <button
            type="button"
            onClick={() => download('shapefile')}
            className="font-medium text-accent underline"
          >
            Shapefile
          </button>
        </p>
        {downloadError && (
          <p role="alert" className="text-danger">
            {t('vineyard.card.downloadFailed')}
          </p>
        )}
        {isConfirming ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-ink">{t('vineyard.card.confirmDelete')}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="danger"
                isLoading={remove.isPending}
                onClick={() =>
                  remove.mutate(vineyard.id, { onSuccess: onDeleted })
                }
              >
                {t('vineyard.card.delete')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsConfirming(false)}
              >
                {t('vineyard.card.cancel')}
              </Button>
            </div>
            {remove.isError && (
              <p role="alert" className="text-danger">
                {remove.error.message}
              </p>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="self-start text-danger"
            onClick={() => setIsConfirming(true)}
          >
            {t('vineyard.card.delete')}
          </Button>
        )}
      </div>
    </div>
  )
}
