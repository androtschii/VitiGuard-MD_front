import { useTranslation } from 'react-i18next'
import {
  useDeleteModel,
  useDownloadModel,
  useServerModel,
  useStoredModel,
} from '@/api/offlineModel'
import { Button } from '@/components/atoms/Button'
import { DownloadButton } from '@/components/molecules/DownloadButton'
import { useOnlineStatus } from '@/lib/useOnlineStatus'

// Модель для диагностики без сети (pr-072): скачать, обновить или удалить
export function OfflineModelCard() {
  const { t, i18n } = useTranslation()
  const isOnline = useOnlineStatus()
  const stored = useStoredModel()
  const server = useServerModel(isOnline)
  const download = useDownloadModel()
  const remove = useDeleteModel()

  const megabytes = (bytes: number) =>
    new Intl.NumberFormat(i18n.resolvedLanguage, {
      maximumFractionDigits: 1,
    }).format(bytes / 1024 / 1024)
  const percent = new Intl.NumberFormat(i18n.resolvedLanguage, {
    style: 'percent',
  })
  const model = stored.data
  const isOutdated =
    model && server.data && server.data.version !== model.version
  // Скачивать нечего: на сервере нет файла модели (ответ 503) или он недоступен
  const isUnavailable = isOnline && !model && server.isError

  return (
    <section
      aria-labelledby="offline-model"
      className="flex flex-col gap-2 rounded-lg border border-line bg-surface p-4 text-sm shadow-sm"
    >
      <h2 id="offline-model" className="font-semibold text-ink">
        {t('offlineModel.title')}
      </h2>
      <p aria-live="polite" className="text-ink-muted">
        {download.isPending
          ? t('offlineModel.downloading', {
              progress: percent.format(download.progress),
            })
          : model
            ? isOutdated
              ? t('offlineModel.outdated')
              : t('offlineModel.ready', {
                  version: model.version.slice(0, 8),
                  size: megabytes(model.size_bytes),
                })
            : isUnavailable
              ? t('offlineModel.unavailable')
              : t('offlineModel.missing', {
                  size: server.data ? megabytes(server.data.size_bytes) : '16',
                })}
      </p>
      {(download.isError || remove.isError) && (
        <p role="alert" className="text-danger">
          {t('offlineModel.failed')}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {(!model || isOutdated) && (
          <DownloadButton
            size="sm"
            isLoading={download.isPending}
            failed={download.isError}
            disabled={!isOnline || isUnavailable}
            onClick={() => download.mutate()}
          >
            {model ? t('offlineModel.update') : t('offlineModel.download')}
          </DownloadButton>
        )}
        {model && (
          <Button
            size="sm"
            variant="secondary"
            disabled={download.isPending}
            onClick={() => remove.mutate()}
          >
            {t('offlineModel.remove')}
          </Button>
        )}
      </div>
    </section>
  )
}
